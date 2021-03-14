import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import AutoSuggest from '../../Common/AutoSuggest';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { server_url, context_path, } from '../../Common/constants';
import { Button, TextField, Input, FormControl,Radio,  } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Divider from '@material-ui/core/Divider'
import 'react-datetime/css/react-datetime.css';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import MomentUtils from '@date-io/moment';
import {
    Modal,
    ModalBody, ModalHeader,
} from 'reactstrap';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';


import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

// const json2csv = require('json2csv').parse;



class CheckList extends Component {

    state = {
        editFlag: false,
        // status: [],
        formWizard: {
            globalErrors: [],
            msg: '',
            errors: {},

            obj: {
                invoiceNo: '', 
                // type: this.props.parentObj.type === 'Sales' ? 'Outgoing' : 'Incoming',
                type:"blt",
                types:"blts",
                courierNo: '',  
                docketNo : '',
                courierCompany : '',
                coa:[],
                blText : '',
                phase: '',
                batchNo: '',
                origin: '', //address/city/state/country/ pin code
                destination: '', //address/city/state/country/ pin code
                eta: '',
                lastLocation: '',
                packagingType: '',
                packageCount: '',
                transporter: '',
                lrDate: null,
                manufacturingDate: null,
                expiryDate: null,
                lrDetails: '',
                transportationCharges: '',
                loadingUnloadingCharges: '',
                proofOfDelivery: '',
                status: '',
                company: '',
                order: '',
                products: [],
            }
        },
        status: [
            { label: 'On going', value: 'On going' },
            { label: 'Completed', value: 'Completed' },
        ],
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=order_inventory_edit')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj = res.data;

                formWizard.obj.order = formWizard.obj.order.id;

                formWizard.obj.selectedCompany = res.data.company;
                formWizard.obj.company = res.data.company.id;
                this.companyASRef.setInitialField(formWizard.obj.selectedCompany);



                this.setState({ formWizard });
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
    }
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
    closetoggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    };
    toggleModal = (label) => {
        this.setState({
            modal: !this.state.modal,
            label: label
        });
    };
    updateObj(id) {
        var formWizard = this.state.formWizard;
        formWizard.obj.id = id;
        formWizard.editFlag = true;

        this.setState({ formWizard }, this.loadData);
    }

    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;

        var input = e.target;
        formWizard.obj[field] = e.target.value;
        this.setState({ formWizard });

        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({
                formWizard
            });
        }
    }

    setSelectField(field, e) {
        this.setField(field, e, true);
    }

    setDateField(field, e) {
        var formWizard = this.state.formWizard;

        if(e) {
            formWizard.obj[field] = e.format();
        } else {
            formWizard.obj[field] = null;
        }

        this.setState({ formWizard });
    }

    setAutoSuggest(field, val) {
        var formWizard = this.state.formWizard;
        formWizard.obj[field] = val;
        formWizard['selected' + field] = val;
        this.setState({ formWizard });
    }

    checkForError() {
        // const form = this.formWizardRef;

        const tabPane = document.getElementById('orderQuoteForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        var formWizard = this.state.formWizard;
        formWizard.errors = errors;
        this.setState({ formWizard });
        console.log(errors);

        return hasError;
    }

    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
            var newObj = this.state.formWizard.obj;
            newObj.company = '/companies/' + newObj.company;
            newObj.order = '/orders/' + newObj.order;
            
            var promise = undefined;

            if (!this.state.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }

            promise.then(res => {
                var formw = this.state.formWizard;
                formw.obj.id = res.data.id;
                formw.msg = 'successfully Saved';

                this.props.onSave(res.data.id);
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                // this.toggleTab(0);
                //this.setState({ addError: err.response.data.globalErrors[0] });
                var formWizard = this.state.formWizard;
                formWizard.globalErrors = [];
                if (err.response.data.globalErrors) {
                    err.response.data.fieldError.forEach(e => {
                        formWizard.globalErrors.push(e);
                    });
                }

                var errors = {};
                if (err.response.data.fieldError) {
                    err.response.data.fieldError.forEach(e => {
                        if (errors[e.field]) {
                            errors[e.field].push(e.errorMessage);
                        } else {
                            errors[e.field] = [];
                            errors[e.field].push(e.errorMessage);
                        }
                    });
                }
                var errorMessage="";
                if (err.response.data.globalErrors) {
                    err.response.data.globalErrors.forEach(e => {
                        errorMessage+=e+""
                    });
                }
                formWizard.errors = errors;
                this.setState({ formWizard });
                if(!errorMessage) errorMessage = "Please resolve the errors";
                swal("Unable to Save!", errorMessage, "error");
            })
        }
        return true;
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.props.onRef(this);
        this.setState({ loding: false })

        
        if(!this.props.currentId && this.props.parentObj) {
            var formWizard = this.state.formWizard;

            formWizard.obj.order = this.props.parentObj.id;

            formWizard.obj.selectedCompany = this.props.parentObj.company;
            formWizard.obj.company = this.props.parentObj.company.id;
            this.companyASRef.setInitialField(formWizard.obj.selectedCompany);

            

            this.setState({ formWizard });
        } 
    }

    render() {
        const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="orderQuoteForm">
                <Modal isOpen={this.state.modal} backdrop="static" toggle={this.closetoggleModal} size={'md'}>
                    <ModalHeader toggle={this.closetoggleModal}>
                        Upload - {this.state.label}
                    </ModalHeader>
                    <ModalBody>
                    <div className="row">
                        <div className="col-sm-12 ">
                        
                                <FormControl>
                                    <RadioGroup aria-label="type" name="types" row>
                                        <FormControlLabel 
                                            value="blts" checked={this.state.formWizard.obj.types === 'blts'}
                                            label=" Draft"
                                            onChange={e => this.setField("types", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                            value="blnts" checked={this.state.formWizard.obj.types === 'blnts'}
                                            label="original"
                                            onChange={e => this.setField("types", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                        </div>
                    </div>
                        <fieldset>
                            <Button
                               
                                variant="contained"
                                component="label"> Upload File
                                    <input type="file" id="fileUpload"
                                    name="fileUpload" accept='.doc,.docx,.pdf,.jpg,.png'
                                    onChange={e => this.fileSelected('fileUpload', e)}
                                    style={{ display: "none" }} />
                            </Button>
                          
                        </fieldset>
                        <div className="col-sm-12 " style={{marginBottom: 20, marginLeft: -15 }}>
                            <TextField
                            
                           value={this.state.name}
                            >
                           </TextField>
                        </div>
                      
                        <span>*Please upload .doc,.docx,.pdf,.jpg,.png files only</span>
                        {/* {this.state.formWizard.obj.enableExpiryDate &&  */}
                       {/*  } */}
                        <div className="text-center">
                            <Button variant="contained" color="primary" onClick={e => this.uploadFiles()} style={{marginTop: 20}}>Save</Button>
                        </div>
                    </ModalBody> 
                </Modal>
                {this.props.user.role !== 'ROLE_PURCHASES' && this.props.user.role !== 'ROLE_INVENTORY'&& this.props.user.role !== 'ROLE_ACCOUNTS'&&
                <div>
                    <div className="row">
                        <div className="col-md-4 offset-md-3" >
                        <fieldset >
                                <TextField type="text" name="lable" label="lable" required={true} fullWidth={true}
                                    inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.lable?.length > 0 ? errors?.lable[0]?.msg : ""}
                                    error={errors?.lable?.length > 0}
                                    value={this.state.formWizard.obj.lable} onChange={e => this.setField("lable", e)} />                         
                                </fieldset>
                        </div>   
                        <div >
                        <Button variant="contained"
                                component="label" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />} >Upload</Button>
                        </div>   
                    </div>
                    <div className="row">
                        <div className="col-md-4  offset-md-3">
                            <fieldset >
                                <TextField type="text" name="coa" label="COA" required={true} fullWidth={true}
                                    inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.coa?.length > 0 ? errors?.coa[0]?.msg : ""}
                                    error={errors?.coa?.length > 0}
                                    value={this.state.formWizard.obj.coa} onChange={e => this.setField("coa", e)} />                         
                                </fieldset>
                            </div>   
                        <div >
                        <Button variant="contained"
                                component="label"  color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />} >Upload
                        <input type="file" id="fileUpload"
                                    name="coa" accept='.doc,.docx,.pdf,.jpg,.png'
                                    onChange={e => this.fileSelected('coa', e)}
                                    style={{ display: "none" }} />
                        </Button>{this.state.formWizard.obj.coa}
                        
                        </div>  
                    </div>
                    <div className="row">
                    <div className="col-md-4  offset-md-3">
                        <fieldset>
                                <TextField type="text" name="packging" label="Packing List" required={true} fullWidth={true}
                                    inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.packging?.length > 0 ? errors?.packging[0]?.msg : ""}
                                    error={errors?.packging?.length > 0}
                                    value={this.state.formWizard.obj.packging} onChange={e => this.setField("packging", e)} />
                            </fieldset>
                            </div>   
                            <div >
                            <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />} >Upload</Button>
                            </div>  
                    </div>
                    <div className="row">
                        <div className="col-md-4  offset-md-3">
                        <fieldset>
                                <TextField type="text" name="coo" label="Coo" required={true} fullWidth={true}
                                    inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.coo?.length > 0 ? errors?.coo[0]?.msg : ""}
                                    error={errors?.coo?.length > 0}
                                    value={this.state.formWizard.obj.coo} onChange={e => this.setField("coo", e)} />
                            </fieldset>
                        </div>   
                        <div >
                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />} >Upload</Button>
                        </div>   
                    </div>
                    <div className="row">
                        <div className="col-sm-4 offset-sm-3">
                        <FormLabel component="legend">BL</FormLabel> 
                                <FormControl>
                                    <RadioGroup aria-label="type" name="type" row>
                                        <FormControlLabel 
                                            value="blt" checked={this.state.formWizard.obj.type === 'blt'}
                                            label=" Telex"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                            value="blnt" checked={this.state.formWizard.obj.type === 'blnt'}
                                            label="NonTelex"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                        </div>
                    </div>
                    {this.state.formWizard.obj.type === 'blt' &&
                            <div className="col-md-5 offset-sm-3 " style={{marginBottom: "10px"}} >
                                <TextField type="text" name="TextType" label="Bl Text"
                                    required={true} fullWidth={true}
                                    // value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.blText?.length > 0 ? errors?.blText[0]?.msg : ""}
                                    error={errors?.blText?.length > 0}
                                    value={this.state.formWizard.obj.blText} onChange={e => this.setField("blText", e)} />                            
                            </div>      
                            }
                            {this.state.formWizard.obj.type === 'blnt' &&
                            <div>
                                <div className="row">
                               
                                    <div className="col-md-5 offset-sm-3">
                                        <TextField type="text" name="courierNo" label="Courier No"
                                            required={true} fullWidth={true}
                                            // value={this.state.formWizard.obj.subCategory}
                                            inputProps={{ maxLength: 50, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"50"}]' }}
                                            helperText={errors?.courierNo?.length > 0 ? errors?.courierNo[0]?.msg : ""}
                                            error={errors?.courierNo?.length > 0}

                                            value={this.state.formWizard.obj.countryOfOrigin} onChange={e => this.setField("courierNo", e)} />
                                    </div>
                                </div> 
                                <div className="row">
                                    <div className="col-md-5 offset-sm-3" >
                                    <fieldset>
                                <TextField type="text" name="docketNo" label="Docket No" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 13, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"10"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.docketNo?.length > 0 ? errors?.docketNo[0]?.msg : ""}
                                    error={errors?.docketNo?.length > 0}
                                    value={this.state.formWizard.obj.docketNo} onChange={e => this.setField("docketNo", e)} />
                            </fieldset>
                                    </div>
                                </div> 
                                <div className="row" style={{marginTop: -15}}>
                                    <div className="col-md-5 offset-md-3"  style={{marginBottom: "10px"}} >
                                    <fieldset>
                                    <TextField type="text" name="courierCompany" label="Courier Company"
                                    required={true} fullWidth={true}
                                    // value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 50, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"50"}]' }}
                                    helperText={errors?.courierCompany?.length > 0 ? errors?.courierCompany[0]?.msg : ""}
                                    error={errors?.courierCompany?.length > 0}
                                    value={this.state.formWizard.obj.courierCompany} onChange={e => this.setField("courierCompany", e)} />
                            </fieldset>
                                    </div>
                                </div> 
                            </div>                        
                        }
                        <Divider/>
                    </div>}
                        {((this.props.user.role === 'ROLE_ACCOUNTS' || this.props.user.role === 'ROLE_ADMIN') &&
                            <div>
                                <div className="row">
                                    <div className="col-md-4  offset-md-3">
                                        <fieldset>
                                            <TextField type="text" name="invoiceNo" label="Invoice No" required={true} fullWidth={true}
                                                inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.invoiceNo?.length > 0 ? errors?.invoiceNo[0]?.msg : ""}
                                                error={errors?.invoiceNo?.length > 0}
                                                value={this.state.formWizard.obj.invoiceNo} onChange={e => this.setField("invoiceNo", e)} />
                                        </fieldset>
                                    </div>   
                                    <div >
                                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />}  onClick={e => this.toggleModal('Invoice No')}>Upload</Button>
                                    </div>                        
                                </div>
                                <div className="row" >
                                    <div className="col-md-5 offset-md-3" >
                                        <fieldset>
                                            <TextField type="number" name="batchNo" label="Batch No" required={true} fullWidth={true}
                                                value={this.state.formWizard.obj.batchNo} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                helperText={errors?.batchNo?.length > 0 ? errors?.batchNo[0]?.msg : ""}
                                                error={errors?.batchNo?.length > 0}
                                                onChange={e => this.setField("batchNo", e)} />
                                        </fieldset>
                                    </div> 
                                </div>         
                                <div className="row" >
                                    <div className="col-md-5 offset-md-3" >
                                        <fieldset>
                                            <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                                value={this.state.formWizard.obj.quantity} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                helperText={errors?.quantity?.length > 0 ? errors?.quantity[0]?.msg : ""}
                                                error={errors?.quantity?.length > 0}
                                                onChange={e => this.setField("quantity", e)} />
                                        </fieldset>
                                    </div> 
                                </div>         
                                <div className="row" >
                                    <div className="col-md-5 offset-md-3" >
                                        <fieldset>
                                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                                <DatePicker 
                                                autoOk
                                                clearable
                                                disableFuture
                                                label="Manufacturing  Date"
                                                format="DD/MM/YYYY"
                                                value={this.state.formWizard.obj.manufacturingDate} 
                                                onChange={e => this.setDateField('manufacturingDate', e)} 
                                                TextFieldComponent={(props) => (
                                                    <TextField
                                                    type="text"
                                                    name="manufacturingDate"
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
                                    </div> 
                                </div>         
                                <div className="row" >
                                    <div className="col-md-5 offset-md-3" >
                                        <fieldset>
                                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                                <DatePicker 
                                                autoOk
                                                clearable
                                                disableFuture
                                                label="Expiry Date"
                                                format="DD/MM/YYYY"
                                                value={this.state.formWizard.obj.expiryDate} 
                                                onChange={e => this.setDateField('expiryDate', e)} 
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
                                    </div> 
                                </div>         
                                <Divider/>
                                <div className="row">
                                    <div className="col-md-4  offset-md-3">
                                    <fieldset>
                                            <TextField type="text" name="boeNO" label="BOE No" required={true} fullWidth={true}
                                                inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.boeNO?.length > 0 ? errors?.boeNO[0]?.msg : ""}
                                                error={errors?.boeNO?.length > 0}
                                                value={this.state.formWizard.obj.boeNO} onChange={e => this.setField("boeNO", e)} />
                                        </fieldset>
                                    </div>   
                                    <div >
                                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />} >Upload</Button>
                                    </div>                        
                                </div>
                                <div className="row">
                                    <div className="col-md-4  offset-md-3">
                                        <fieldset>
                                            <TextField type="text" name="dutypaymentNo" label="Duty Payment  No" required={true} fullWidth={true}
                                                inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.dutypaymentNo?.length > 0 ? errors?.dutypaymentNo[0]?.msg : ""}
                                                error={errors?.dutypaymentNo?.length > 0}
                                                value={this.state.formWizard.obj.dutypaymentNo} onChange={e => this.setField("dutypaymentNo", e)} />
                                        </fieldset>
                                    </div>   
                                    <div>
                                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />}>Upload</Button>
                                    </div>                        
                                </div>
                                { (this.props.user.role === 'ROLE_ACCOUNTS' &&<div>
                                 <div className="row">
                                    <div className="col-md-4  offset-md-3">
                                        <fieldset>
                                            <TextField type="text" name="uploadChallan" label="upload Challan" required={true} fullWidth={true}
                                                inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.uploadChallan?.length > 0 ? errors?.uploadChallan[0]?.msg : ""}
                                                error={errors?.uploadChallan?.length > 0}
                                                value={this.state.formWizard.obj.uploadChallan} onChange={e => this.setField("uploadChallan", e)} />
                                        </fieldset>
                                    </div>   
                                    <div>
                                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />}>Upload</Button>
                                    </div>                        
                                </div>
                            </div> )}
                          
                                <div className="row" >
                                    <div className=" col-md-12 text-center mt-3" >
                                        <Button style={{backgroundColor:"red"}} variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                        <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        { (this.props.user.role === 'ROLE_PURCHASES' &&<div>
                                 <div className="row">
                                    <div className="col-md-4  offset-md-3">
                                        <fieldset>
                                            <TextField type="text" name="lrno" label="LR No" required={true} fullWidth={true}
                                                inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.uploadChallan?.length > 0 ? errors?.uploadChallan[0]?.msg : ""}
                                                error={errors?.uploadChallan?.length > 0}
                                                value={this.state.formWizard.obj.uploadChallan} onChange={e => this.setField("uploadChallan", e)} />
                                        </fieldset>
                                    </div>   
                                    <div>
                                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px" }}   startIcon={<CloudUploadIcon />}>Upload</Button>
                                    </div>                        
                                </div>
                                <div className="row">
                                    <div className="col-md-4  offset-md-3">
                                        <fieldset>
                                            <TextField type="text" name="transporter" label="Transporter" required={true} fullWidth={true}
                                                inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.transporter?.length > 0 ? errors?.transporter[0]?.msg : ""}
                                                error={errors?.transporter?.length > 0}
                                                value={this.state.formWizard.obj.transporter} onChange={e => this.setField("transporter", e)} />
                                        </fieldset>
                                    </div>   
                                    <div>
                                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />}>Upload</Button>
                                    </div>                        
                                </div>
                                <div className="row" >
                                    <div className="col-md-5 offset-md-3" >
                                        <fieldset>
                                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                                <DatePicker 
                                                autoOk
                                                clearable
                                                disableFuture
                                                label="Expiry Date"
                                                format="DD/MM/YYYY"
                                                value={this.state.formWizard.obj.expiryDate} 
                                                onChange={e => this.setDateField('expiryDate', e)} 
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
                                    </div> 
                                </div>         
                     
                            </div> )}
                            {(this.props.user.role === 'ROLE_INVENTORY' &&       
                    <div>
                        <div className="row">
                                    <div className="col-md-4  offset-md-3">
                                        <fieldset>
                                            <TextField type="text" name="lrno" label="LR No" required={true} fullWidth={true}
                                                inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.uploadChallan?.length > 0 ? errors?.uploadChallan[0]?.msg : ""}
                                                error={errors?.uploadChallan?.length > 0}
                                                value={this.state.formWizard.obj.uploadChallan} onChange={e => this.setField("uploadChallan", e)} />
                                        </fieldset>
                                    </div>   
                                    <div>
                                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px" }}   startIcon={<CloudUploadIcon />}>Upload</Button>
                                    </div>                        
                                </div>
                  <div className="row">
                                    <div className="col-md-4  offset-md-3">
                                        <fieldset>
                                            <TextField type="text" name="transporter" label="Transporter" required={true} fullWidth={true}
                                                inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.transporter?.length > 0 ? errors?.transporter[0]?.msg : ""}
                                                error={errors?.transporter?.length > 0}
                                                value={this.state.formWizard.obj.transporter} onChange={e => this.setField("transporter", e)} />
                                        </fieldset>
                                    </div>   
                                    <div>
                                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />}>Upload</Button>
                                    </div>                        
                                </div>     
                                <div className="row">
                                    <div className="col-md-4  offset-md-3">
                                        <fieldset >
                                            <TextField type="text" name="coa" label="COA" required={true} fullWidth={true}
                                                inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.coa?.length > 0 ? errors?.coa[0]?.msg : ""}
                                                error={errors?.coa?.length > 0}
                                                value={this.state.formWizard.obj.coa} onChange={e => this.setField("coa", e)} />                         
                                            </fieldset>
                                    </div>   
                                    <div >
                                        <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px",textTransform :"none", }}   startIcon={<CloudUploadIcon />} >Upload</Button>
                                    </div>  
                                </div>
                                <div className="row" >
                                    <div className="col-md-5 offset-md-3" >
                                        <fieldset>
                                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                                <DatePicker 
                                                autoOk
                                                clearable
                                                disableFuture
                                                label="LR Date"
                                                format="DD/MM/YYYY"
                                                value={this.state.formWizard.obj.lrdate} 
                                                onChange={e => this.setDateField('lrdate', e)} 
                                                TextFieldComponent={(props) => (
                                                    <TextField
                                                    type="text"
                                                    name="lrdate"
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
                                    </div> 
                                </div>    
                              
                                <div className="row" >
                                        <div className="col-md-5 offset-md-3" >
                                            <fieldset>
                                                <TextField type="number" name="product" label="Product" required={true} fullWidth={true}
                                                    value={this.state.formWizard.obj.product} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                    helperText={errors?.product?.length > 0 ? errors?.product[0]?.msg : ""}
                                                    error={errors?.product?.length > 0}
                                                    onChange={e => this.setField("product", e)} />
                                             </fieldset>
                                         </div> 
                                </div>         
                                <div className="row" >
                                    <div className="col-md-5 offset-md-3" >
                                        <fieldset>
                                            <TextField type="number" name="batchNo" label="Batch No" required={true} fullWidth={true}
                                                value={this.state.formWizard.obj.batchNo} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                helperText={errors?.batchNo?.length > 0 ? errors?.batchNo[0]?.msg : ""}
                                                error={errors?.batchNo?.length > 0}
                                                onChange={e => this.setField("batchNo", e)} />
                                        </fieldset>
                                    </div> 
                                </div>         
                                <div className="row" >
                                    <div className="col-md-5 offset-md-3" >
                                        <fieldset>
                                            <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                                value={this.state.formWizard.obj.quantity} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                helperText={errors?.quantity?.length > 0 ? errors?.quantity[0]?.msg : ""}
                                                error={errors?.quantity?.length > 0}
                                                onChange={e => this.setField("quantity", e)} />
                                        </fieldset>
                                    </div> 
                                    </div>
                                    <div className="row" >
                                        <div className="col-md-5 offset-md-3" >
                                            <fieldset>
                                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                                    <DatePicker 
                                                    autoOk
                                                    clearable
                                                    disableFuture
                                                    label="Received Date"
                                                    format="DD/MM/YYYY"
                                                    value={this.state.formWizard.obj.receivedDate} 
                                                    onChange={e => this.setDateField('receivedDate', e)} 
                                                    TextFieldComponent={(props) => (
                                                        <TextField
                                                        type="text"
                                                        name="receivedDate"
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
                                        </div> 
                                    </div>    
                     </div>       )  }
                     </Form>
            </ContentWrapper>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(CheckList);