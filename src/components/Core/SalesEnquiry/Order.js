import { Button } from '@material-ui/core';
import axios from 'axios';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import MomentUtils from '@date-io/moment';
import * as Const from '../../Common/constants';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import {  FormControl, TextField} from '@material-ui/core';
import {
     Modal,
    ModalBody, ModalHeader,
} from 'reactstrap';
import Event from '@material-ui/icons/Event';
import swal from 'sweetalert';
import { context_path, getUniqueCode, server_url  } from '../../Common/constants';
import {
    DatePicker,
    MuiPickersUtilsProvider
} from '@material-ui/pickers';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import AddQuotation from './AddQuotation';
import { createOrder } from '../Orders/Create';
// const json2csv = require('json2csv').parse;
class Order extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        modal: false,
        orderData:{
            poNumber:'',
            instructions:'',
            poDate:''
        },
        prodData:'',
        obj: '',
        baseUrl: 'sales-quotation',
        currentId: '',
        uploadedFiles: [],
        formWizard: {
            docs: [],
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                id: '',
                code: getUniqueCode('CM'),
                name: '',
                type: 'B',
                locationType: 'I',
                categories: '',
                customerType: '',
                phone: '',
                email: '',
                country: '',
                province: '',
                city: '',
                location: '',
                zipcode: '',
                pincode: '',
                rating: '',
                agent: 'N',
                paymentTerms: '',
                categoriesInterested: '',
                gstin: '',
                credit: '',
                product: '',
                pan: '',
                fssai: '',
                drugLicense: '',
                others: '',
                msme: 'N',
                turnOver: '',
                international: '',
                selectedInterests: [],
                selectedCategories: [],
                selectedCustomerTypes: [],
                selectedorganizations: [],
                msmeId: '',
            },
            tempproduct: {
                code: getUniqueCode('PD'),
                name: '',
                category: '',
                type: '',
                subCategory: '',
                specification: '',
                make: '',
                batch: '',
                mfgDate: null,
                expDate: null,
                shelfLife: '',
                deliveryPeriod: '',
                hsnCode: '',
                packagingType: '',
                quantity: '',
                incoming: '',
                outgoing: '',
                selectedMakes: [],
                selectedTypes: [],
            },

            tempbranch: {
                name: getUniqueCode('CB'),
                type: '',
                street: '',
                landmark: '',
                selectedcountry: '',
                state: '',
                city: '',
                pincode: ''
            },
            tempcontact: {
                name: '',
                pic: '',
                type: 'C',
                branch: '',
                status: '',
                email: '',
                phone: '',
                company: '',
                department: '',
                gender: '',
                pan: '',
                gstin: '',
                aboutWork: '',
                reportsTo: '',
                firstMet: '',
                whatsapp: '',
                linkedin: '',
                wechat: '',
                qq: '',
                dob: null,
                anniversary: null,
                previousCompany: '',
                selectedcompany: '',
                selectedbranch: '',
            }
        },
    }
    closetoggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    };
    closetoggleModalProduct = () => {
        this.setState({
            modalproduct: !this.state.modalproduct
        });
    };
    toggleModal = (label) => {
        this.setState({
            modal: !this.state.modal,
            label: label
        });
    };
    fileSelected(name, e) {
        var file = e.target.files[0];
        var sizeinMb = file.size / (1024 * 1024);
        if (sizeinMb > 3) {
            var error = this.state.error;
            error[name] = 'File is > 3MB'
            this.setState({ error });
        }
        this.setState({ name: file.name });
    }
    
    setDateField(field, e) {
        var formWizard = this.state.formWizard;

        if (e) {
            formWizard.obj[field] = e.format();
        } else {
            formWizard.obj[field] = null;
        }

        this.setState({ formWizard });
    }
    componentDidUpdate(){}
    componentDidMount(){
        axios.get(server_url + context_path + "api/sales/" + this.props.parentObj.id+ '?projection=sales_edit').then(res => {
            this.setState({ prodData: res.data });
        });
    }
    setDateField(field, e) {
        var orderData = this.state.orderData;
        if (e) {
            orderData[field] = e.format().toLocaleString();
        } else {
            orderData[field] = null;
        }
        this.setState({ orderData });
    }
    Instructions=(e)=>{
        var orderData=this.state.orderData;
        var input=e.target;
        orderData.instructions=input.value ;
        this.setState({
            orderData
        });
    }
    poNumber=(e)=>{
        var orderData=this.state.orderData;
        var input=e.target;
        orderData.poNumber=input.value ;
        this.setState({
            orderData
        });
    }
    uploadFiles() {
        var formData = new FormData();
        var imagefile = document.querySelector('#fileUpload');
        formData.append("file", imagefile.files[0]);
        formData.append("from", "companies");
        // formData.append("parent", '');
        formData.append("fileType", this.state.label);
        // if (this.state.formWizard.obj.enableExpiryDate && this.state.formWizard.obj.expiryDate) {
        //     formData.append("expiryDate", this.state.formWizard.obj.expiryDate);
        // }
        axios.post(server_url + context_path + 'docs/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            if (res.data.uploaded === 1) {
                // this.toggleModal(this.state.label);
                var joined = this.state.uploadedFiles.concat(res.data);
                this.setState({ uploadedFiles: joined });
                this.closetoggleModal();
                swal("Uploaded!", "File Uploaded", "success");
            } else {
                swal("Unable to Upload!", "Upload Failed", "error");
            }
        }).catch(err => {
            var msg = "Select File";

            if (err.response.data.globalErrors && err.response.data.globalErrors[0]) {
                msg = err.response.data.globalErrors[0];
            }
            swal("Unable to Upload!", msg, "error");
        })
        this.convertToOrder();
    }
    convertToOrder = () => {
        if (this.props.parentObj.adminApproval !== 'Y' && this.props.user.role !== 'ROLE_ADMIN') {
            swal("Unable to Convert!", "Please get Admin approval", "error");
            return;
        }
        if (this.props.parentObj.products.length === 0) {
       
            swal("Unable to Convert!", "Please add atleast one product", "error");
            return;
        }
        var orderData=this.state.orderData;
        var orderData1=this.props.parentObj;
        orderData1.poNumber=orderData.poNumber;
        orderData1.instructions=orderData.instructions;
        orderData1.poDate=orderData.poDate;
        createOrder('Sales', orderData1, this.props.baseUrl);
    }
    render() {
        return (
            <div>
                 <Modal isOpen={this.state.modal} backdrop="static" toggle={this.closetoggleModal} size={'md'}>
                    <ModalHeader toggle={this.closetoggleModal}>
                        Upload - Po
                        {/* {this.state.label} */}
                    </ModalHeader>
                    <ModalBody>
                        <fieldset>
                            <Button
                                variant="contained"
                                component="label" color="primary"> Select File
                                    <input type="file" id="fileUpload"
                                    name="fileUpload" accept='.doc,.docx,.pdf,.png,.jpg'
                                    onChange={e => this.fileSelected('fileUpload', e)}
                                    style={{ display: "none" }} />
                            </Button>{this.state.name}
                        </fieldset>
                        <span>*Please upload .doc,.docx,.pdf,.png,.jpg files only</span>
                        {/* {this.state.formWizard.obj.enableExpiryDate &&  */}
                        <fieldset>
                                <FormControl>
                                    <TextField id="Po Number" name="Po Number" label="Po Number" type="text"
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
                                        // helperText={errors?.contactName?.length > 0 ? errors?.contactName[0]?.msg : ""}
                                        // error={errors?.contactName?.length > 0} value={this.state.formWizard.obj.contactName}
                                        // defaultValue={this.state.formWizard.obj.contactName} onChange={e => this.setField("contactName", e)}
                                        value={this.state.orderData.poNumber} onChange={this.poNumber}
                                         />
                                </FormControl>
                            </fieldset>
                        <fieldset>
                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                <DatePicker
                                    autoOk
                                    clearable
                                    // variant="inline"
                                    label="Po Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.orderData.poDate}
                                    onChange={e => this.setDateField('poDate', e)}
                                    TextFieldComponent={(props) => (
                                        <TextField
                                            type="text"
                                            name="expiryDate"
                                            id={props.id}
                                            label={props.label}
                                            onClick={props.onClick}
                                            value={props.value}
                                            disabled={props.disabled}
                                            {...props.inputProps}
                                            InputProps={{
                                                endAdornment: (
                                                    <Event />
                                                ),
                                            }}
                                        />
                                    )} />
                            </MuiPickersUtilsProvider>
                        </fieldset>
                        <fieldset>
                                <TextareaAutosize placeholder="Instructions" fullWidth={true} rowsMin={3} name="Instructions"
                                   style={{padding: 10}}
                                   inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                    // helperText={errors?.description?.length > 0 ? errors?.description[0]?.msg : ""}
                                    // error={errors?.description?.length > 0}
                                    // value={this.state.formWizard.obj.description} onChange={e => this.setField("description", e)} 
                                    value={this.state.orderData.instructions} onChange={this.Instructions}
                                    />
                            </fieldset>
                        {/*  } */}
                        <div className="text-center">
                            <Button variant="contained" color="primary" onClick={e => this.uploadFiles()}>Submit</Button>
                        </div>
                    </ModalBody>
                </Modal>
                <div className="row">
                    <div className="col-sm-8">
                    <div className="card b">
                      
                    <Table className="card-header" hover responsive>
                         <thead>
                                            <tr>
                                                <th>Company Name</th>
                                                <th>Status of Order</th>
                                                <th>Action</th>
                                              
                                                
                                            </tr>
                        </thead>
                  
                                
                         <tbody className="card-body bb bt" hover responsive>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td>   
                                    <Button  title="upload Po" variant="contained" color="primary" onClick={e => this.toggleModal('GST')} startIcon={<CloudUploadIcon />} style={{textTransform :"none", marginLeft: -30}}>Upload Po</Button>
                                    </td>
                                </tr>      
                                       
                        </tbody>           
                    </Table>
                            </div>    
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-8">
                    <div className="card b">
                      
                    <Table className="card-header" hover responsive>
                         <thead>
                                            <tr>
                                                <th>File Name</th>
                                                <th>Po Number</th>
                                                <th>Po Date </th>
                                                <th>Instructons</th>
                                              
                                                
                                            </tr>
                        </thead>
                  
                                
                         <tbody className="card-body bb bt" hover responsive>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>      
                                       
                        </tbody>           
                    </Table>
                            </div>    
                    </div>
                </div>
               
                {this.state.editFlag &&
                    <div className="card b">
                        <div className="card-body bb bt">
                            <AddQuotation baseUrl={this.state.baseUrl} currentId={this.state.currentId} parentObj={this.props.parentObj}
                            onRef={ref => (this.addTemplateRef = ref)} onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}></AddQuotation>
                        </div>
                    </div>}
            </div>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(Order);