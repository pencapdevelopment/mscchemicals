import MomentUtils from '@date-io/moment';
import { Button, TextField,FormControl } from '@material-ui/core';
import Event from '@material-ui/icons/Event';
import {
    DatePicker,
    MuiPickersUtilsProvider
} from '@material-ui/pickers';
import axios from 'axios';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import {
    Form, Modal,
    ModalBody, ModalHeader, Table
} from 'reactstrap';
import FormValidator from '../../Forms/FormValidator';
import swal from 'sweetalert';
import { context_path, server_url } from '../../Common/constants';
import Sorter from '../../Common/Sorter';
import ContentWrapper from '../../Layout/ContentWrapper';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import AutoSuggest from '../../Common/AutoSuggest';
import UOM from '../Common/UOM';
import { Link } from 'react-router-dom';
// const json2csv = require('json2csv').parse;
class Uploadp extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        editSubFlag: false,
        modal: false,
        error: {},
        formWizard: {
            docs: [],
            obj: {
                label: '',
                expiryDate: null,
            },
            products:[],
            errors:[]
        },
        subObjs: [],
        newSubObj: {},
        subPage: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            search: '',
            fromDate: null,
            toDate: null,
        },
        exts: {
            'doc': 'application/msword',
            'docx': 'application/msword',
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
        }
    }
    toggleModal = () => {
        this.setState({modal: !this.state.modal});
    }
    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({activeTab: tab});
        }
    }
    loadObj() {
        axios.get(server_url + context_path + "api/docs?parent=" + this.props.currentId + "&active=true&fileFrom=" + this.props.fileFrom).then(res => {
            var formWizard = this.state.formWizard;
            formWizard.docs = res.data._embedded.docs;
            this.setState({ formWizard });
        });
    }
    loadProducts = (enqId,callback) =>{
        axios.get(server_url + context_path + "api/purchases-products?reference.id=" + enqId+"&projection=purchases-product").then(res => {
            callback(res.data._embedded[Object.keys(res.data._embedded)[0]]);
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        // console.log('upload component did mount');
        // console.log(this.props.currentId);
        this.loadObj();
        this.props.onRef(this);
    }
    updateObj() {
        this.setState({ editFlag: true }, () => {
            this.addTemplateRef.updateObj(this.props.currentId);
        })
    }
    saveSuccess(id) {
        this.setState({ editFlag: false });
    }
    cancelSave = () => {
        this.setState({ editFlag: false });
    }
    addSubObj = () => {
        this.setState({ editSubFlag: false });
        this.toggleModal();
    }
    editSubObj =(i)=>{
        var files = this.props.fileTypes[i];
        var formWizard = this.state.formWizard;
        formWizard.obj = {};
        formWizard.obj.label = files.label;
        formWizard.obj.enableExpiryDate = files.expiryDate;
        formWizard.obj.expiryDate = null;
        if(files.label === 'Quotation'){
            this.loadProducts(this.props.currentId,(products)=>{
                formWizard.products = products;
                this.setState({ editSubFlag: true, formWizard: formWizard }, this.toggleModal);
            });
        }
        else{
            formWizard.products = [];
            this.setState({ editSubFlag: true, formWizard: formWizard }, this.toggleModal);
        }
    }
    saveObjSuccess(id) {
        this.setState({ editSubFlag: true });
        this.toggleModal();
        this.loadSubObjs();
    }
    searchSubObj = e => {
        var str = e.target.value;
        var filters = this.state.filters;
        filters.search = str;
        this.setState({ filters }, o => { this.loadSubObjs() });
    }
    filterByDate(e, field) {
        var filters = this.state.filters;
        if(e) {
            filters[field + 'Date'] = e.format();
        } else {
            filters[field + 'Date'] = null;
        }
        this.setState({ filters: filters }, g => { this.loadObjects(); });
    }
    onSort(e, col) {
        if (col.status === 0) {
            this.setState({ orderBy: 'id,desc' }, this.loadSubObjs)
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            this.setState({ orderBy: col.param + ',' + direction }, this.loadSubObjs);
        }
    }
    fileSelected(name, e, noValidate) {
        var file = e.target.files[0];
        if(file){
            var sizeinMb = file.size / (1024 * 1024);
            if (sizeinMb > 3) {
                var error = this.state.error;
                error[name] = 'File is > 3MB'
                this.setState({ error });
            }
            this.setState({ name: file.name });
        }
        else{
            this.setState({ name: '' });
        }
        if (!noValidate) {
            let input = e.target;
            let formWizard = this.state.formWizard;
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({formWizard});
        }
    }
    uploadFiles() {
        var hasError = this.checkForError();
        if (!hasError) {
            var formData = new FormData();
            var imagefile = document.querySelector('#fileUpload');
            formData.append("file", imagefile.files[0]);
            formData.append("from", this.props.fileFrom);
            formData.append("parent", this.props.currentId);
            formData.append("fileType", this.state.formWizard.obj.label);
            if (this.state.formWizard.obj.enableExpiryDate && this.state.formWizard.obj.expiryDate) {
                formData.append("expiryDate", this.state.formWizard.obj.expiryDate);
            }
            axios.post(server_url + context_path + 'docs/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                if (res.data.uploaded === 1) {
                    this.toggleModal();
                    this.loadObj();
                    if(this.state.formWizard.obj.label === 'Quotation'){
                        this.props.generateQuote(this.state.formWizard.obj.expiryDate,this.state.formWizard.products);
                    }                    
                    swal("Uploaded!", "File Uploaded", "success");
                } else {
                    swal("Unable to Upload!", "Upload Failed", "error");
                }
            }).catch(err => {
                var msg = "Select File";
                
                if(err.response.data.globalErrors && err.response.data.globalErrors[0]) {
                    msg = err.response.data.globalErrors[0];
                }

                swal("Unable to Upload!", msg, "error");
            })
        }
    }
    getFileName = (type) => {
        var doc = this.state.formWizard.docs.find(g => g.fileType === type);
        if (doc) {
            // return doc.fileName;
            return <a href="javascript:void(0);" className="btn-link" onClick={(e) => this.downloadFile(e, type)}>
                        {doc.fileName}
                    </a>
        } else {
            return "-NA-";
        }
    }
    isFileExists = (type) => {
        var doc = this.state.formWizard.docs.find(g => g.fileType === type);
        if(this.props.user.role === 'ROLE_ADMIN') return false;
        if (doc?.fileName) {
            return true;
        } else {
            return false;
        }
    }
    getExpiryDate = (type) => {
        var doc = this.state.formWizard.docs.find(g => g.fileType === type);
        if (doc && doc.expiryDate) {
            return moment(doc.expiryDate).format("DD MMM YYYY");
        } else {
            return "-NA-";
        }
    }
    getCreationDate = (type) => {
        var doc = this.state.formWizard.docs.find(g => g.fileType === type);
        if (doc && doc.creationDate) {
            return moment(doc.creationDate).format("DD MMM YYYY");
        } else {
            return "-NA-";
        }
    }
    setField(field, e) {
        var formWizard = this.state.formWizard;
        // var input = e.target;
        formWizard.obj[field] = e.target.value;
        this.setState({ formWizard });
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
    setProductField(i,field,e,noValidate){
        var formWizard = this.state.formWizard;
        let input = e.target;
        formWizard.products[i][field] = input.value;
        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({formWizard});
        }
        this.setState({formWizard});
    }
    checkForError() {
        // const form = this.formWizardRef;
        const tabPane = document.getElementById('saveForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        var formWizard = this.state.formWizard;
        console.log("form errors from add company are ",errors);
        formWizard.errors = errors;
        this.setState({ formWizard });
        return hasError;
    }
    downloadFile = (e, type) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        // var doc = this.state.docs[idx];
        var doc = this.state.formWizard.docs.find(g => g.fileType === type);
        axios({
            url: server_url + context_path + "docs/" + doc.id,
            method: 'GET',
            responseType: 'blob',
        }).then(response => {
            var fileType = doc.fileName.substr(doc.fileName.lastIndexOf('.') + 1);
            fileType = this.state.exts[fileType];
            const url = window.URL.createObjectURL(new Blob([response.data], { type: fileType }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.fileName);
            document.body.appendChild(link);
            link.click();
        });
    }
    render() {
        const errors = this.state.formWizard.errors;
        return (<ContentWrapper>
                <div className="row">
                    <div className="col-md-12">
                        <Modal isOpen={this.state.modal} backdrop="static" toggle={this.toggleModal} size={'md'}>
                            <ModalHeader toggle={this.toggleModal}>
                                <CloudUploadIcon /> - {this.state.formWizard.obj.label}
                            </ModalHeader>
                            <ModalBody>
                                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">
                                    <fieldset>
                                        <Button
                                            variant="contained"
                                            component="label" color="primary"> Select File
                                            <input type="file" id="fileUpload" name="fileUpload" accept='.doc,.docx,.pdf,.png,.jpg' required={true}
                                                helperText={errors?.fileUpload?.length > 0?errors["fileUpload"][0]["msg"]:""}
                                                error={errors?.fileUpload?.length > 0}
                                                onChange={e => this.fileSelected('fileUpload', e)}
                                                style={{ display: "none" }}
                                            />
                                            </Button>{this.state.name}<br/>
                                            <span style={{color:"red"}}>{errors?.fileUpload?.length > 0?errors["fileUpload"][0]["msg"]:""}</span>        
                                    </fieldset>
                                    <span>*Please upload .doc,.docx,.pdf,.png,.jpg files only</span>
                                    {this.state.formWizard.obj.enableExpiryDate && 
                                        <fieldset>
                                            <MuiPickersUtilsProvider utils={MomentUtils}
                                                className="col-md-6">
                                                <DatePicker 
                                                    autoOk
                                                    clearable
                                                    // variant="inline"
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
                                    }
                                    {this.state.formWizard.products.length>0 &&
                                    <Table style={{marginTop:"-40px"}}>
                                        <tbody>
                                            {this.state.formWizard.products.map((prod,i)=>{
                                                return (<tr>                                                  
                                                    <td className="">
                                                        <fieldset>
                                                            <FormControl style={{marginTop:"30px"}}>
                                                                <Link to={'/products/'+prod.product.id}>{prod.product.name}</Link>
                                                            </FormControl>
                                                        </fieldset>
                                                    </td>                                                
                                                    <td>
                                                        <fieldset >
                                                        <TextField type="number" name={"amount"+i} label="Amount" required={true} className="col-md-6"
                                                            inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required","msg":"Amount is required"},{"key":"maxlen","param":"10"}]' }}
                                                            helperText={errors && errors.hasOwnProperty("amount"+i) && errors["amount"+i].length > 0?errors["amount"+i][0]["msg"]:""}
                                                            error={errors && errors.hasOwnProperty("amount"+i) && errors["amount"+i].length > 0}
                                                            value={this.state.formWizard.products[i].amount} onChange={e => this.setProductField(i,"amount",e)}
                                                        />
                                                        </fieldset>
                                                    </td>
                                                </tr>)
                                            })}
                                        </tbody>
                                    </Table>}
                                    <div className="text-center">
                                        <Button variant="contained" color="primary" onClick={e => this.uploadFiles()}>Save</Button>
                                    </div>
                                </Form>
                            </ModalBody>
                        </Modal>
                        <div className="card-body bb bt">
                            <Table hover responsive>
                                <thead>
                                    <Sorter columns={[
                                        { name: 'File Type', sortable: false },
                                        // { name: 'File Type', sortable:true },
                                        { name: 'Action', sortable: false },
                                        { name: 'File Name', sortable: false },
                                        { name: 'Expiry Date', sortable: false },
                                        { name: 'Created On', sortable: false },
                                    ]}
                                    />
                                </thead>
                                <tbody>
                                    {this.props.fileTypes.map((obj, i) => {
                                        return (
                                            <tr key={obj.label} className={obj.noshow ? 'd-none' : ''}>
                                                <td>{obj.label}</td>                                                  
                                                {/* <td>
                                                    <Button fontSize="small" disabled={this.isFileExists(obj.label)} variant="contained" color="primary" style={{marginLeft: "-10px",textTransform :"none", }}   startIcon={<CloudUploadIcon />}  onClick={() => this.editSubObj(i)}>Upload COA</Button>
                                                </td>                                                */}
                                                <td>
                                                    <Button fontSize="small" disabled={this.isFileExists(obj.label)} variant="contained" color="primary" style={{marginLeft: "-10px",textTransform :"none", }} startIcon={<CloudUploadIcon />}  onClick={() => this.editSubObj(i)}>Upload</Button>
                                                </td>
                                                <td>
                                                    {this.getFileName(obj.label)}
                                                </td>
                                                <td>
                                                {/* this.state.formWizard.obj.enableExpiryDate ? : '-NA-' */}
                                                    { this.getExpiryDate(obj.label) }
                                                </td>
                                                <td>
                                                    {this.getCreationDate(obj.label)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
        </ContentWrapper>)
    }
}
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(Uploadp);