import React, { Component } from 'react';
// import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import axios from 'axios';
import swal from 'sweetalert';
// import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Moment from 'react-moment';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { Table } from 'reactstrap';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import {
     Modal,
    ModalHeader,
    ModalBody
} from 'reactstrap';
import {DatePicker,MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import Event from '@material-ui/icons/Event';
import SalesInventory from './SalesInventory';
// import Sorter from '../../Common/Sorter';
// import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path, defaultDateFilter,  } from '../../Common/constants';
import { Button,  Tab, Tabs, AppBar,  TextField,InputLabel  } from '@material-ui/core';
// import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
import TabPanel from '../../Common/TabPanel';
import PageLoader from '../../Common/PageLoader';
// import AddInventory from './AddInventory';
import Add from './Add';
import Upload from '../Common/Upload';
// import Status from '../Common/Status';
import Followups from '../Followups/Followups';
import CheckList from './CheckList';
import { mockActivity } from '../../Timeline';
import { ActivityStream } from '../../Timeline';
import Accounts from './Accounts';
// import PurchaseDocs from './PurchaseDocs';
import Approval from '../Approvals/Approval';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
// import CardMedia from '@material-ui/core/CardMedia';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider'
import { Form } from 'reactstrap';
import FormValidator from '../../Forms/FormValidator';
// const json2csv = require('json2csv').parse;
class View extends Component {
    state = {
        loading:false,
        accApprBtnDisable:false,
        activeTab: 0,
        editFlag: false,
        editSubFlag: false,
        modal1: false,
        modal2: false,
        modal: false,
        modalSales: false,
        modalDocs: false,
        upoloadDocsModal:false,
        upoloadDocLabal:'',
        uplodDocName:'',
        uploadDocBtnDisable:false,
        uploadDocBtnText:'Save',
        uplodDocErr:[],
        obj: '',
        inventoryObj: {},
        inventoryEditFlag: false,
        inventoryFormErrs: {},
        globalErrors: [],
        user:"",
        subObjs: [],
        newSubObj: {},
        orderBy:'id,desc',
        currentProd:{},
        currentProdId:'',
        subPage: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        users: [],
        filters: {
            search: '',
            fromDate: null,
            toDate: null,
        },
        status: [
            { label: 'On going', value: 'On going', badge: 'info' },
            { label: 'Completed', value: 'Completed', badge: 'success' },
        ],
        purchaseFiles:[  
            {label: 'COA', expiryDate: true },
            {label: 'Sales COA', expiryDate: true }
        ],
        shippingFileTypes: [ 
            {label: 'Commercial Invoice', expiryDate: true },
            {label: 'Packing Slip', expiryDate: true },
            {label: 'COA', expiryDate: true },
            {label: 'Certificate of Origin', expiryDate: true },
            {label: 'Insurance Copy', expiryDate: true },
            {label: 'Bill of lading', expiryDate: true },
            {label: 'Manufacture declaration', expiryDate: true },
        ],
        bankingFileTypes: [
            {label: 'Commercial Invoice', expiryDate: true },
            {label: 'Packing Slip', expiryDate: true },
            {label: 'Bill of Lading', expiryDate: true },
            {label: 'Direct Remittance request', expiryDate: true },
            {label: 'Declaration Cum identity', expiryDate: true },
            {label: 'Advance Remittance request', expiryDate: true },
            {label: 'PDC', expiryDate: true },
        ],
        orderDocs:[],
        exts: {
            'doc': 'application/msword',
            'docx': 'application/msword',
            'pdf': 'application/pdf',
            'csv':'text/csv',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'txt':'text/plain'
        }
    }
    getFileName = (type,defaultName) => {
        var doc = this.state.orderDocs.find(g => g.fileType === type);
        if (doc) {
            // return doc.fileName;
            return <a href="javascript:void(0);" style={{marginTop:"38px",display:"block"}} title={type} className="btn-link" onClick={(e) => this.downloadFile(e, type)}>
                        {doc.fileName}
                    </a>
        }
        else { return defaultName}
    }
    toggleModalUploadDocs = (label) => {
        this.setState({
            upoloadDocsModal: !this.state.upoloadDocsModal,
            label: label,
            uplodDocName: ''
        });
    };
    fileSelected(name, e) {
        let file = e.target.files[0];
        let sizeinMb = file.size / (1024 * 1024);
        if (sizeinMb > 3) {
            var uplodDocErr = this.state.uplodDocErr;
            uplodDocErr[name] = 'File is > 3MB'
            this.setState({ uplodDocErr });
        }
        this.setState({ uplodDocName: file.name });
    }
    closetoggleModalUploadDocs = () => {
        this.setState({
            upoloadDocsModal: !this.state.upoloadDocsModal
        });
    };
    uploadDocs() {
        var imagefile = document.querySelector('#uploadDoc');
        if(imagefile.files.length){
            this.setState({uploadDocBtnDisable:true,uploadDocBtnText:"Please Wait..."});
            var formData = new FormData();
            formData.append("file", imagefile.files[0]);
            formData.append("from", "orders");
            formData.append("parent", this.props.currentId);
            formData.append("fileType", this.state.upoloadDocLabal);
            axios.post(server_url + context_path + 'docs/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                this.setState({uploadDocBtnDisable:false,uploadDocBtnText:"Save"});
                if (res.data.uploaded === 1) {
                    this.closetoggleModalUploadDocs();
                    this.loadOrderDocs();                    
                    swal("Uploaded!", "File Uploaded", "success");
                } else {
                    swal("Unable to Upload!", "Upload Failed", "error");
                }
            }).catch(err => {
                this.setState({uploadDocBtnDisable:false,uploadDocBtnText:"Save"});
                this.closetoggleModalUploadDocs();
                var msg = "Select a File";
                console.log("error is", err);
                if (err?.response?.data?.globalErrors && err?.response?.data?.globalErrors[0]) {
                    msg = err.response.data.globalErrors[0];
                }
                swal("Unable to Upload!", msg, "error");
            })
        }
        else{
            swal("Unable to Upload!", "Select a File", "error");
        }
    }
    loadOrderDocs = () => {
        axios.get(server_url + context_path + "api/docs?parent=" + this.props.currentId + "&active=true&fileFrom=orders").then(res => {
            var orderDocs = this.state.orderDocs;
            orderDocs = res.data._embedded.docs;
            this.setState({ orderDocs });
        });
    }
    downloadFile = (e, type) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        // var doc = this.state.docs[idx];
        var doc = this.state.orderDocs.find(g => g.fileType === type);
        axios({
            url: server_url + context_path + "docs/" + doc.id,
            method: 'GET',
            responseType: 'blob',
        }).then(response => {
            let fileExts = doc.fileName.substr(doc.fileName.lastIndexOf('.') + 1);
            let fileType = this.state.exts[fileExts];
            const url = window.URL.createObjectURL(new Blob([response.data], { type: fileType }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.fileName);
            document.body.appendChild(link);
            link.click();
        });
    }
    setField(field, e) {
        var obj = this.state.obj;
        obj[field] = e.target.value;
        this.setState({ obj });
    }
    accountsApproval = (accApproval,e) => {
        let odrObj = {...this.state.obj};
        let updateOdrObj = new Object();
        updateOdrObj.id = odrObj.id;
        updateOdrObj.accountsApproval = accApproval;
        if(odrObj.accountsRemark !== ''){
            updateOdrObj.accountsRemark = odrObj.accountsRemark;
        }
        this.setState({loading:true,accApprBtnDisable:true});
        axios.patch(server_url+context_path+"api/orders/"+odrObj.id,updateOdrObj).then(res =>{
            this.setState({loading:false,accApprBtnDisable:false,modal: false});
            this.loadObj(this.props.currentId);
            swal("Updated!", "Status has been updated successfully", "success");
        })
    }
    setEstdDispatchDateField(field, e) {
        var obj = this.state.obj;
        if (e) {
            obj[field] = e.format();
        } else {
            obj[field] = null;
        }
        this.setState({ obj });
    }
    saveEstDispatchDate = ()=>{
        let obj = this.state.obj;
        if(obj.estdTimeOfDispatch){
            this.setState({loading:true});
            axios.patch(server_url+context_path+"api/orders/"+obj.id,{id:obj.id,estdTimeOfDispatch:obj.estdTimeOfDispatch}).then(res =>{
                this.setState({loading:false});
                swal("Saved!", "Estd Time of dispatch has been saved successfully", "success");
            })
            .catch(err => {
                this.setState({loading:false});
                swal("Unable to Save!", "Please try again", "error");                
            });
        }
        else{
            swal("Unable to Save!", "Please Select Estd Time of dispatch", "error");
        }
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
    toggleModalSale = (label) => {
        this.setState({
            modal: !this.state.modal,
            label: label
        });
    };
    toggleTab = (tab) => {
        if(tab===4){
            this.state.obj.products.map((product, i) => {
                return (
                    {label: 'COA for ', expiryDate: false }
                     )
                })
            let shippingFileTypes= [
                {label: 'Commercial Invoice', expiryDate: false },
                {label: 'Packing Slip', expiryDate: false },
                {label: 'COA', expiryDate: false },
                {label: 'Certificate of Origin', expiryDate: false },
                {label: 'Insurance Copy', expiryDate: false },
                {label: 'Bill of lading', expiryDate: false },
                {label: 'Manufacture declaration', expiryDate: false },
            ];
            this.setState({
                shippingFileTypes
            });
        }
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
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
    loadSubObjs(offset, callBack) {
        if (!offset) offset = 1;
        var url = server_url + context_path + "api/order-followup?order.id="+this.props.currentId+"&page=" + (offset - 1);
        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }
        url += "&company=" + this.props.currentId;
        if (this.state.filters.search) {
            url += "&name=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }
        url = defaultDateFilter(this.state, url);
        axios.get(url)
        .then(res => {
            this.setState({
                subObjs: res.data._embedded[Object.keys(res.data._embedded)[0]],
                subPage: res.data.page
            });
            if (callBack) {
                callBack();
            }
        })
    }
    cancelOrder = ()=>{
        swal({
            title: "Are you sure?",
            text: "Are you sure to cancell this order",
            icon: "warning",
            button: {
                text: "Yes, Cancell!",
                closeModal: true,
            }
        })
        .then(willCancell => {
            if (willCancell) {
                axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.props.currentId,{id:this.props.currentId,status:'Cancelled'})
                .then(res => {this.loadObj(this.props.currentId)});
            }
        });   
    }
    loadObj = (id,callBack) => {
        if(this.props.user.role === 'ROLE_INVENTORY'){
            this.loadOrderInventoryObj(id);
        }
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + id + '?projection=order_edit').then(res => {
            this.setState({ obj: res.data,loading:false},()=>{
                if(callBack){callBack()}
            });
        });
    }
    loadOrderInventoryObj = (orderId) => {
        axios.get(server_url + context_path + "api/inventory/?order.id="+orderId+"&projection=order_inventory_edit").then(res => {
            let inventoryList = res.data._embedded[Object.keys(res.data._embedded)[0]];
            if(inventoryList.length) {
                let inventoryEditFlag = this.state.inventoryEditFlag;
                if(inventoryList[0].id){
                    inventoryEditFlag = true;
                }
                this.setState({inventoryObj: inventoryList[0],inventoryEditFlag,loading:false});
            }
        });
    }
    orderUser(id) {
        axios.get(server_url + context_path + "api/"+this.props.baseUrl+"-user?reference.id="+id+"&projection=orders-user")
        .then(res => {
            this.setState({
                users:res?.data?._embedded[Object.keys(res?.data?._embedded)[0]],
                loading:false
             });
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.orderUser(this.props.currentId);
        this.loadOrderDocs();
        this.loadObj(this.props.currentId,()=>{
            if(this.props.user.role === 'ROLE_ACCOUNTS'||this.props.user.role === 'ROLE_INVENTORY'){
                this.state.obj.type=== 'Sales'?this.toggleTab(0):this.toggleTab(1)
            }
        });
        // this.loadSubObjs();
        this.props.onRef(this);
        this.setState({loading:true})
    }
    updateStatus = (status) => {
        var obj = this.state.obj;
        obj.status = status;
        this.setState({ obj });
    }
    updateObj() {
        this.setState({ editFlag: true }, () => {
            this.addTemplateRef.updateObj(this.props.currentId);
        })
    }
    saveSuccess(id) {
        this.setState({ editFlag: false },function(){
            this.loadObj(this.props.currentId);
        });
    }
    cancelSave = () => {
        this.setState({ editFlag: false });
    }
    toggleModal1 = () => {
        this.setState({
            modal1: !this.state.modal1
        });
    }
    addSubObj = () => {
        this.setState({ editSubFlag: false });
        this.toggleModal1();
    }
    editSubObj = (i) => {
        var obj = this.state.subObjs[i].id;
        this.setState({ editSubFlag: true, subId: obj }, this.toggleModal1);
    }
    saveObjSuccess(id) {
        this.setState({ editSubFlag: true });
        this.toggleModal1();
        this.loadSubObjs();
    }
    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    toggleModalDocs = () => {
        this.setState({modalDocs: !this.state.modalDocs});
    }
    toggleModalSales = () => {
        this.setState({
            modalSales: !this.state.modalSales
        });
    }
    toggleModalSale = () => {
        this.setState({
            modalSales: !this.state.modalSales
        });
    }
    editInventory = (i) => {
        var prod = this.state.obj.products[i];
        
        if(this.state.obj.type==='Sales'){
            this.setState({ editSubFlag: true,currentProdId:prod.id,currentProd:prod  }, this.toggleModalSales);
          
        }else{
            this.setState({ editSubFlag: true,currentProdId:prod.id,currentProd:prod  }, this.toggleModal);
        }
    }
    editDocuments = (i) => {
        var prod = this.state.obj.products[i];
        this.setState({ editSubFlag: true,currentProdId:prod.id,currentProd:prod  }, this.toggleModalDocs);
    }
    downloadInvoice() {
        axios({
            url: server_url + context_path + "invoices/" + this.state.obj.id + ".pdf",
            method: 'GET',
            responseType: 'blob',
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', this.state.obj.code + ".pdf");
            document.body.appendChild(link);
            link.click();
        });
    }
    setInvFormField(field, e, noValidate) {
        let inventoryObj = this.state.inventoryObj;
        let inventoryFormErrs = this.state.inventoryFormErrs;
        let input = e.target;
        inventoryObj[field] = e.target.value;
        this.setState({ inventoryObj });
        if(!noValidate) {
            const result = FormValidator.validate(input);
            inventoryFormErrs[input.name] = result;
            this.setState({inventoryFormErrs});
        }
    }
    setInvFormDateField(field, e) {
        let inventoryObj = this.state.inventoryObj;
        if (e) {
            inventoryObj[field] = e.format();
        } else {
            inventoryObj[field] = null;
        }
        this.setState({ inventoryObj });
    }
    checkForError() {
        const tabPane = document.getElementById('salesInventoryForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        let inventoryFormErrs = this.state.inventoryFormErrs;
        inventoryFormErrs = errors;
        this.setState({ inventoryFormErrs });
        console.log(errors);
        return hasError;
    }
    saveInventory = () => {
        let hasError = this.checkForError();
        if (!hasError) {
            let inventoryObj = {...this.state.inventoryObj};
            inventoryObj.company = '/companies/'+this.state.obj.company.id;
            inventoryObj.order = '/orders/'+this.state.obj.id;
            this.setState({ loading: true });
            let promise = undefined;
            if (!this.state.inventoryEditFlag) {
                promise = axios.post(server_url + context_path + "api/inventory", inventoryObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/inventory" + "/" + inventoryObj.id, inventoryObj)
            }
            promise.then(res => {
                this.loadOrderInventoryObj(this.state.obj.id);
                swal("Success", "Saved Successfully", "success");
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                let globalErrors = this.state.globalErrors;
                globalErrors = [];
                if (err.response.data.globalErrors) {
                    err.response.data.fieldError.forEach(e => {
                        globalErrors.push(e);
                    });
                }
                let inventoryFormErrs = {};
                if (err.response.data.fieldError) {
                    err.response.data.fieldError.forEach(e => {
                        if (inventoryFormErrs[e.field]) {
                            inventoryFormErrs[e.field].push(e.errorMessage);
                        } else {
                            inventoryFormErrs[e.field] = [];
                            inventoryFormErrs[e.field].push(e.errorMessage);
                        }
                    });
                }
                this.setState({ inventoryFormErrs, globalErrors });
                swal("Unable to Save!", "Please resolve the errors", "error");
            });
        }
    }
    render() {
        const inventoryFormErrs = this.state.inventoryFormErrs;
        return (
            <div>
                 {this.state.loading && <PageLoader />}
                <div className="content-heading">Order</div>
                {/* <Modal isOpen={this.state.modal} backdrop="static" toggle={this.toggleModal} size={'lg'}>
                    <ModalHeader toggle={this.toggleModal}>
                            Add inventory - {this.state.currentProd.product?.name}
                    </ModalHeader>
                    <ModalBody>
                            <AddInventory orderProduct={this.state.currentProd} orderStatus={this.state.obj.status} orderType={this.state.obj.type} orderId={this.state.obj.id} onRef={ref => (this.addInventoryRef = ref)} onCancel={e=> this.toggleModal(e)} baseUrl='product-flow'></AddInventory>
                    </ModalBody>
                </Modal> */}
                <Modal isOpen={this.state.upoloadDocsModal} backdrop="static" toggle={this.closetoggleModalUploadDocs} size={'md'}>
                    <ModalHeader toggle={this.closetoggleModalUploadDocs}>
                        Upload {this.state.upoloadDocLabal}
                    </ModalHeader>
                    <ModalBody>
                        <fieldset>
                            <Button
                                variant="contained"
                                component="label" color="primary"> Select File
                                    <input type="file" id="uploadDoc"
                                    name="uploadDoc" accept='.doc,.docx,.pdf,.png,.jpg'
                                    onChange={e => this.fileSelected('uploadDoc', e)}
                                    style={{ display: "none" }} />
                            </Button><span>{this.state.uplodDocName}</span>
                        </fieldset>
                        <span><strong>Note:-</strong>*Please upload .doc,.docx,.pdf,.png,.jpg files only</span>
                        {/* {this.state.formWizard.obj.enableExpiryDate &&  */}
                        {/*  } */}
                        <div className="text-center">
                            <Button variant="contained" color="primary" disabled={this.state.uploadDocBtnDisable} 
                                onClick={e => this.uploadDocs()}>{this.state.uploadDocBtnText}</Button>
                        </div>
                    </ModalBody>
                </Modal>
                <Modal isOpen={this.state.modalSales} backdrop="static" toggle={this.toggleModalSales} size={'lg'}>
                    <ModalHeader toggle={this.toggleModalSale}>
                        Add inventory - {this.state.currentProd.product?.name}
                    </ModalHeader>
                    <ModalBody>
                        <SalesInventory orderProduct={this.state.currentProd} orderStatus={this.state.obj.status} orderType={this.state.obj.type} orderId={this.state.obj.id} onRef={ref => (this.addInventoryRef = ref)} onCancel={e=> this.toggleModalSales()} baseUrl='product-flow'></SalesInventory>
                    </ModalBody>
                </Modal>
                <Modal isOpen={this.state.modal} backdrop="static" toggle={this.toggleModal} size={'md'}>
                    <ModalHeader toggle={this.toggleModal}></ModalHeader>
                    <ModalBody>
                        <fieldset>
                            <TextareaAutosize placeholder="Remarks" fullWidth={true} rowsMin={3} name="accountsRemark"
                                style={{padding: 10}}
                                inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                // helperText={errors?.description?.length > 0 ? errors?.description[0]?.msg : ""}
                                // error={errors?.description?.length > 0}
                                value={this.state.obj.accountsRemark} onChange={e => this.setField("accountsRemark", e)} 
                                />
                        </fieldset>
                        <div className="text-center">
                            <Button variant="contained" color="primary" disabled={this.state.accApprBtnDisable || this.state.obj.accountsApproval === 'A'} onClick={e => this.accountsApproval('H')}>Submit</Button>
                        </div>
                    </ModalBody>
                </Modal>
                <Modal isOpen={this.state.modalDocs} backdrop="static" toggle={this.toggleModalDocs} size={'lg'}>
                    <ModalHeader toggle={this.toggleModalDocs}>
                            Add Documents - {this.state.currentProd.product?.name}
                    </ModalHeader>
                    <ModalBody>
                        <Upload onRef={ref => (this.shippinguploadRef = ref)} disabled={this.state.obj.status ==='Completed'} fileFrom={this.props.baseUrl + '_Purchase_docs'} 
                            currentId={this.state.currentProd.id} fileTypes={this.state.purchaseFiles}></Upload>
                    </ModalBody>
                </Modal>
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-12">
                            <AppBar position="static">
                                  {(this.props.user.role !== 'ROLE_ACCOUNTS' && this.props.user.role !== 'ROLE_INVENTORY'&& 
                                    <div>
                                        <Tabs
                                            className="bg-white"
                                            indicatorColor="primary"
                                            textColor="primary"
                                            variant="scrollable"
                                            scrollButtons="auto"
                                            aria-label="scrollable auto tabs example"
                                            value={this.state.activeTab}
                                            onChange={(e, i) => this.toggleTab(i)} >
                                                <Tab  label="Details"   />  
                                                {(this.state.obj.type === "Sales" ?
                                                    <Tab label="Shipping Method" /> 
                                                : 
                                                    <Tab label="CheckList" /> )
                                                }                                
                                                <Tab label="CHA Documents" />
                                                <Tab label="Accounts" />
                                                <Tab label="Followups" />
                                                <Tab label="Shipping Documents" />
                                                <Tab label="Banking Documents" />
                                                <Tab label="Approvals" /> 
                                        </Tabs>
                                    </div>)}
                            </AppBar>
                        </div>   
                    </div>}
                    {this.state.obj &&  (this.state.obj.type === "Sales" ? 
                        <TabPanel value={this.state.activeTab} index={0}>     
                            <div className="card b">
                                <div className="card-header">     
                                    <div className=" mt-2">
                                        <div className="row" >
                                            <div className="col-sm-2"><button style={{backgroundColor: "#2b3db6", border:"1px solid #2b3db6", borderRadius: 5}} title="Order Status" size="small" variant="contained"><span style={{color:"#fff"}}>{this.state.obj.status}</span></button></div>
                                            <div className="col-sm-9"></div>
                                            {(this.props.user.role !== 'ROLE_ACCOUNTS'&& this.props.user.role !== 'ROLE_INVENTORY' &&
                                                <div className="col-sm-1" >
                                                    <button onClick={this.cancelOrder} disabled={this.state.obj.status==='Cancelled' || this.state.obj.status==='Completed'} title="Cancell the Order" style={{backgroundColor: "#2b3db6", border:"1px solid #2b3db6", borderRadius: 5}} variant="contained" size="small">
                                                        <CloseSharpIcon style={{color:"#fff"}} fontSize="small" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="my-2"><span>{this.state.obj.name}</span></h4>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className={(this.props.user.role ==='ROLE_ACCOUNTS' || this.props.user.role === 'ROLE_INVENTORY')?"col-sm-12": "col-sm-8 "}>
                                    <div className="card b">
                                        <div className="card-header">
                                        {(this.props.user.role === 'ROLE_ACCOUNTS') &&
                                        <div >
                                            <table>
                                                <thead>
                                                    <tr >
                                                        <th>Sales rep :</th>
                                                        <th>
                                                            {this.state.users.map((obj, i) => {
                                                                return (
                                                                    <Chip
                                                                        style={{color: "#000",backgroundColor: "#eee342", marginLeft: "5px"}}
                                                                        avatar={
                                                                            // <Avatar>
                                                                                {/* <AssignmentIndIcon /> */}
                                                                            // </Avatar>
                                                                        }
                                                                        label={obj.user.name}
                                                                    />
                                                                )
                                                            })}
                                                        </th>
                                                        <th><Button variant="contained" color="primary" size="small">Credit Limit</Button></th>
                                                        <th><Button variant="contained" color="primary" size="small"> Bills Overdue</Button></th>
                                                        <th><Button variant="contained" color="primary" size="small">Total O/S</Button></th>
                                                    </tr>
                                                </thead>
                                            </table>
                                        </div>}
                                    </div>                               
                                    <div className="card-body bb bt" style={{fontSize: 14,}}>
                                        <div className="row" >
                                            <div className="col-sm-2" style={{marginTop: 15}}>Company</div>
                                            <div className="col-sm-10">
                                                <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6">
                                                    <Link to={`/companies/${this.state.obj.company.id}`}>
                                                        {this.state.obj.company.name}
                                                    </Link>
                                                </Box>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-2" style={{marginTop: 15}}>Products</div>
                                            <div className="col-sm-10">
                                                <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6" >
                                                    {
                                                        this.state.obj.products.map((prod) => {
                                                            return (<Chip size="small" label="product" bgcolor="#fff" label={<Link to={`/products/${prod.product.id}`}>{ prod.product.name}</Link>}/>);
                                                        })
                                                    }
                                                </Box>
                                            </div>
                                        </div>
                                        <div className="row"  >
                                            <div className="col-sm-5">
                                                <div className="row">
                                                    <div className="col-sm-5"style={{marginTop: 15}}>Po Number</div> 
                                                    <div className="col-sm-6" style={{marginLeft: -5}}>                                                                                                           
                                                <Box width="150%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6" >{this.state.obj.poNumber}</Box>
                                                    </div> 
                                                </div>
                                             </div>
                                             <div className="col-sm-1"></div>
                                             <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-5" style={{marginTop: 15}}>                                                
                                                        <span style={{marginLeft: 41}}>Po Date</span>  
                                                    </div> 
                                                    <div className="col-sm-7" >                                                                                                           
                                                        <Box  width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6"><Moment format="DD MMM YYYY">{this.state.obj.poDate}</Moment></Box>
                                                    </div>
                                                </div>
                                             </div>
                                         </div>
                                         <div className="row">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-4" style={{marginTop: 15}}>Quantity</div> 
                                                    <div className="col-sm-6">                                                                                                           
                                                <Box width="120%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6">{this.state.obj.products.reduce((tot,prod)=>{return tot+prod.quantity},0)}</Box>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-5" style={{marginTop: 15}}>                                                
                                                        <span style={{marginLeft: 41}}>Price</span>  
                                                    </div> 
                                                    <div className="col-sm-7">                                                                                                           
                                                        <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6">{this.state.obj.products.reduce((tot,prod)=>{return tot+prod.amount},0)}</Box>
                                                    </div> 
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-4" style={{marginTop: 15}}>Payment terms</div> 
                                                    <div className="col-sm-6">                                                                           
                                                <Box width="120%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6">{this.state.obj.company.paymentTerms}</Box>
                                                    </div>
                                                </div>
                                            </div>
                                             <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-5" style={{marginTop: 15}}>                                                
                                                        <span style={{marginLeft: 41}}>Freight</span> 
                                                    </div> 
                                                    <div className="col-sm-7">                                                                                                           
                                                        <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6">444</Box>
                                                    </div> 
                                                </div>
                                            </div>
                                        </div>
                                         <div className="row">
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-4" style={{marginTop: 15}}>Transports</div> 
                                                    <div className="col-sm-6">                                                                                                           
                                                        <Box width="120%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6">add Transports</Box>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-5" style={{marginTop: 15}}>
                                                        <span style={{marginLeft: 41}}>Instruction</span> 
                                                    </div> 
                                                    <div className="col-sm-7">                                                                                                           
                                                <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6" >{this.state.obj.instructions}</Box>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>     
                                        <span  style={{fontSize: 14, margin: "40px"}}></span>
                                        {(this.props.user.role === 'ROLE_ACCOUNTS'&&
                                        <div>
                                            <Divider />
                                            <div className="row" style={{marginTop: 10, marginLeft: 2}}>
                                                <div className="col-sm-3"><Button variant="contained" disabled={this.state.accApprBtnDisable || this.state.obj.accountsApproval === 'A'} color="primary" size="xs" onClick={e => this.accountsApproval('A',e)}>Approve</Button></div>
                                                <div className="col-sm-3"></div>
                                                <div className="col-sm-3"></div>
                                                <div className="col-sm-3"><Button variant="contained" disabled={this.state.accApprBtnDisable || this.state.obj.accountsApproval === 'A'} color="primary" size="xs" onClick={e => this.toggleModal()}  >Hold</Button></div>
                                            </div>
                                        </div>)}
                                        {((this.props.user.role === 'ROLE_INVENTORY' && this.state.inventoryObj) && 
                                        <div>
                                            <Divider/>
                                            <Form className="form-horizontal" innerRef={this.formRef} name="inventoryObj" id="salesInventoryForm">
                                                <div className="row" style={{marginTop: "8px"}}>
                                                    <div className="col-sm-12">
                                                        <h4 style={{fontSize: "16px"}}>Invoice Details</h4>                                
                                                    </div>
                                                </div> 
                                                <Divider />
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="text" name="invoiceNo" label="Invoice No" required={true} fullWidth={true} onChange={e => this.setInvFormField('invoiceNo', e)}
                                                                value={this.state.inventoryObj.invoiceNo} inputProps={{"data-validate": '[{ "key":"required","msg":"Invoice No is required"}]' }}
                                                                helperText={inventoryFormErrs?.invoiceNo?.length > 0 ? inventoryFormErrs?.invoiceNo[0]?.msg : ""}
                                                                error={inventoryFormErrs?.invoiceNo?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                                                <DatePicker
                                                                    autoOk
                                                                    clearable
                                                                    label="Invoice Date"
                                                                    format="DD/MM/YYYY"
                                                                    value={this.state.inventoryObj.invoiceDate?this.state.inventoryObj.invoiceDate:null}
                                                                    onChange={e => this.setInvFormDateField('invoiceDate', e)}
                                                                    TextFieldComponent={(props) => (
                                                                        <TextField
                                                                            type="text"
                                                                            name="invoiceDate"
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
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="text" name="billedQuantity" label="Billed Quantity" required={true} fullWidth={true} onChange={e => this.setInvFormField('billedQuantity', e)}
                                                                value={this.state.inventoryObj.billedQuantity} inputProps={{"data-validate": '[{ "key":"required","msg":"Billed Quantity is required"}]' }}
                                                                helperText={inventoryFormErrs?.billedQuantity?.length > 0 ? inventoryFormErrs?.billedQuantity[0]?.msg : ""}
                                                                error={inventoryFormErrs?.billedQuantity?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="text" name="balanceQuantity" label="Balance Quantity" required={true} fullWidth={true} onChange={e => this.setInvFormField('balanceQuantity', e)}
                                                                value={this.state.inventoryObj.balanceQuantity} inputProps={{"data-validate": '[{ "key":"required","msg":"Balance Quantity is required"}]' }}
                                                                helperText={inventoryFormErrs?.balanceQuantity?.length > 0 ? inventoryFormErrs?.balanceQuantity[0]?.msg : ""}
                                                                error={inventoryFormErrs?.balanceQuantity?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="number" name="taxableVaue" label="Taxable Value" required={true} fullWidth={true} onChange={e => this.setInvFormField('taxableVaue', e)}
                                                                value={this.state.inventoryObj.taxableVaue} inputProps={{"data-validate": '[{ "key":"required","msg":"Taxable value is required"}]' }}
                                                                helperText={inventoryFormErrs?.taxableVaue?.length > 0 ? inventoryFormErrs?.taxableVaue[0]?.msg : ""}
                                                                error={inventoryFormErrs?.taxableVaue?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="number" name="freightCharges" label="Freight Charges" required={true} fullWidth={true} onChange={e => this.setInvFormField('freightCharges', e)}
                                                                value={this.state.inventoryObj.freightCharges} inputProps={{"data-validate": '[{ "key":"required","msg":"Freight Charges are required"}]' }}
                                                                helperText={inventoryFormErrs?.freightCharges?.length > 0 ? inventoryFormErrs?.freightCharges[0]?.msg : ""}
                                                                error={inventoryFormErrs?.freightCharges?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="number" name="gst" label="GST" required={true} fullWidth={true} onChange={e => this.setInvFormField('gst', e)}
                                                                value={this.state.inventoryObj.gst} inputProps={{"data-validate": '[{ "key":"required","msg":"GST is required"}]' }}
                                                                helperText={inventoryFormErrs?.gst?.length > 0 ? inventoryFormErrs?.gst[0]?.msg : ""}
                                                                error={inventoryFormErrs?.gst?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="text" name="placeOfDelivery" label="Place Of Delivery" required={true} fullWidth={true} onChange={e => this.setInvFormField('placeOfDelivery', e)}
                                                                value={this.state.inventoryObj.placeOfDelivery} inputProps={{"data-validate": '[{ "key":"required","msg":"Place of Delivery is required"}]' }}
                                                                helperText={inventoryFormErrs?.placeOfDelivery?.length > 0 ? inventoryFormErrs?.placeOfDelivery[0]?.msg : ""}
                                                                error={inventoryFormErrs?.placeOfDelivery?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="number" name="total" label="Total" required={true} fullWidth={true} onChange={e => this.setInvFormField('total', e)}
                                                                value={this.state.inventoryObj.total} inputProps={{"data-validate": '[{ "key":"required","msg":"Total is required"}]' }}
                                                                helperText={inventoryFormErrs?.total?.length > 0 ? inventoryFormErrs?.total[0]?.msg : ""}
                                                                error={inventoryFormErrs?.total?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                </div>
                                                <span  style={{fontSize: 14, margin: "40px"}}></span>
                                                <Divider />
                                                <div className="row"  style={{marginTop: "8px"}}>
                                                    <div className="col-sm-12">
                                                        <h4 style={{fontSize: "16px"}}>Dispatch</h4>
                                                    </div>
                                                </div>
                                                <Divider />
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="text" name="lrNumber" label="LR Number" required={true} fullWidth={true} onChange={e => this.setInvFormField('lrNumber', e)}
                                                                value={this.state.inventoryObj.lrNumber} inputProps={{"data-validate": '[{ "key":"required","msg":"LR Number is required"}]' }}
                                                                helperText={inventoryFormErrs?.lrNumber?.length > 0 ? inventoryFormErrs?.lrNumber[0]?.msg : ""}
                                                                error={inventoryFormErrs?.lrNumber?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                                                <DatePicker
                                                                    autoOk
                                                                    clearable
                                                                    label="LR Date"
                                                                    format="DD/MM/YYYY"
                                                                    value={this.state.inventoryObj.lrDate?this.state.inventoryObj.lrDate:null}
                                                                    onChange={e => this.setInvFormDateField('lrDate', e)}
                                                                    TextFieldComponent={(props) => (
                                                                        <TextField
                                                                            type="text"
                                                                            name="lrDate"
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
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="text" name="transporter" label="Transporter" required={true} fullWidth={true} onChange={e => this.setInvFormField('transporter', e)}
                                                                value={this.state.inventoryObj.transporter} inputProps={{"data-validate": '[{ "key":"required","msg":"Transporter is required"}]' }}
                                                                helperText={inventoryFormErrs?.transporter?.length > 0 ? inventoryFormErrs?.transporter[0]?.msg : ""}
                                                                error={inventoryFormErrs?.transporter?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <fieldset>
                                                            <TextField type="number" name="numberOfBoxes" label="Number of boxes/drums" required={true} onChange={e => this.setInvFormField('numberOfBoxes', e)}
                                                                value={this.state.inventoryObj.numberOfBoxes} inputProps={{"data-validate": '[{ "key":"required","msg":"Number of boxes/drums is required"}]' }}
                                                                helperText={inventoryFormErrs?.numberOfBoxes?.length > 0 ? inventoryFormErrs?.numberOfBoxes[0]?.msg : ""}
                                                                error={inventoryFormErrs?.numberOfBoxes?.length > 0}
                                                            />
                                                        </fieldset>
                                                    </div>
                                                </div>
                                                <div className="text-center" style={{marginTop: -40,marginBottom:" 10px"}}  >
                                                    <Button Size="small" variant="contained" color="primary" onClick={e => this.saveInventory()} style={{marginTop: "30px",left: "-15px" }}>Save</Button>
                                                </div>
                                            </Form>
                                            <div>
                                                <span style={{fontSize: 14, margin: "40px"}}></span>
                                                <Divider/>
                                                <div className="row"  style={{marginTop: "8px"}}>
                                                    <div className="col-sm-12">
                                                        <h4 style={{fontSize: "16px"}}>Upload Documents</h4>                                
                                                    </div>
                                                </div> 
                                                <Divider />
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        {this.getFileName('LR',<span style={{marginTop:"38px",display:"block"}}>Upload LR</span>)}
                                                    </div>   
                                                    <div >
                                                        <Button Size="small" onClick={e =>{this.setState({upoloadDocLabal:'LR'}); this.toggleModalUploadDocs();}} variant="contained" color="primary" style={{marginTop: "30px",left: "-15px", width: "183px" }} startIcon={<CloudUploadIcon />} >LR Document</Button>
                                                    </div>  
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        {this.getFileName('Invoice',<span style={{marginTop:"38px",display:"block"}}>Upload Invoice</span>)}
                                                    </div>   
                                                    <div >
                                                        <Button Size="small" onClick={e =>{this.setState({upoloadDocLabal:'Invoice'}); this.toggleModalUploadDocs();}} variant="contained" color="primary" style={{marginTop: "30px",left: "-15px", width: "183px"}} startIcon={<CloudUploadIcon />} >Invoice</Button>
                                                    </div>  
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        {this.getFileName('EWAY Bill',<span style={{marginTop:"38px",display:"block"}}>Upload EWAY Bill</span>)}
                                                    </div>   
                                                    <div >
                                                        <Button Size="small" onClick={e =>{this.setState({upoloadDocLabal:'EWAY Bill'}); this.toggleModalUploadDocs();}} variant="contained" color="primary" style={{marginTop: "30px",left: "-15px", width: "183px"}} startIcon={<CloudUploadIcon />} >EWAY Bill</Button>
                                                    </div>  
                                                </div>
                                            </div>
                                        </div>)}
                                    </div>
                                </div>
                            </div>
                            {(this.props.user.role !== 'ROLE_ACCOUNTS' && this.props.user.role !== 'ROLE_INVENTORY') &&
                            <div className="col-md-4" >
                                <div className="row">    
                                    <div className="col-sm-12">
                                        <Card style={{backgroundColor: "#fff", marginLeft: 41}}>
                                            <CardActionArea>
                                                <Typography style={{margin: 15}}  gutterBottom variant="h5" component="h2">
                                                    <div className="row ">
                                                        <div className="col-sm-2">
                                                            <Avatar />
                                                        </div>
                                                        <div className="col-sm-10 "  style={{fontSize: 18, marginTop: 2 }}>
                                                            {this.state.users.map((obj, i) => {
                                                                return (
                                                                    <Chip
                                                                        style={{color: "#000",backgroundColor: "#e8cd0b", margin: "3px"}}
                                                                        avatar={
                                                                            // <Avatar>
                                                                                {/* <AssignmentIndIcon /> */}
                                                                            // </Avatar>
                                                                        }
                                                                        label={this.props.user.role === 'ROLE_ADMIN'?<Link style={{color: "#000"}} to={`/users/${obj.user.id}`}>
                                                                            {obj.user.name}
                                                                        </Link>:obj.user.name}
                                                                    />
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                    {/* <tr >
                                                        <td>  <Avatar /> </td>   
                                                        <td><span>Assign User</span></td>
                                                    </tr>  */}
                                                </Typography>
                                                {/* <CardMedia
                                                    component="img"
                                                    alt="Contemplative Reptile"
                                                    height="60"
                                                    image="/static/images/cards/contemplative-reptile.jpg"
                                                    title="Contemplative Reptile"
                                                /> */}
                                                <CardContent>
                                                    {/*   <Typography variant="body2" color="textSecondary" component="p"> */}
                                                        {/* Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
                                                        across all continents except Antarctica */}
                                                    {/* </Typography> */}
                                                </CardContent>
                                            </CardActionArea>
                                            {/* <CardActions>
                                                <Button size="small" color="primary">
                                                    Share
                                                </Button>
                                                <Button size="small" color="primary">
                                                    Read More
                                                </Button> 
                                            </CardActions> */}
                                        </Card>
                                    </div>
                                </div>
                                <div className="row" style={{marginTop: 5}}>
                                    <div className="col-sm-12">
                                        <ActivityStream
                                            title="Activity"
                                            stream={mockActivity}
                                        />
                                    </div>
                                </div>           
                            </div>}
                        </div>            
                    </TabPanel>:
                    <TabPanel value={this.state.activeTab} index={0}>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="card">
                                    <div className="card-header">            
                                    </div>
                                </div>
                            </div>
                        </div> 
                        <div className="row">
                            <div className="col-md-8">        
                                    <div className="card b">
                                        <div className="card-body bb bt">
                                            <table className="table" style={{marginBottom: 7}}>
                                                <tbody>
                                                    <tr>
                                                        <td><strong>Order No</strong></td>
                                                        <td>{this.state.obj.code}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Order Date</strong></td>
                                                        <td><Moment format="DD MMM YY">{this.state.obj.enquiryDate}</Moment></td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Port of Landing</strong></td>
                                                        <td>{this.state.obj.portOfLanding}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Dispatch</strong></td>
                                                        <td>{this.state.obj.dispatch}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>FOB</strong></td>
                                                        <td>{this.state.obj.fob}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>CIF</strong></td>
                                                        <td>{this.state.obj.cif}</td>
                                                    </tr>   
                                                    <tr>
                                                        <td><strong>Payment Terms</strong></td>
                                                        <td>{this.state.obj.company.paymentTerms}</td>
                                                    </tr>                                            
                                                    <tr>
                                                        <td><strong>Currency</strong></td>
                                                        <td>{this.state.obj.currency}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Description</strong></td>
                                                        <td>{this.state.obj.description}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <Divider/>
                                            <div className=" mt-2 row" >
                                                <h4 className="col-md-9" style={{fontSize:18}}>Products</h4>
                                            </div>
                                            <Divider/>
                                            <Table hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Name</th>
                                                        <th>Quantity</th>
                                                        <th>Amount</th>
                                                        <th>Specification</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.obj.products.map((product, i) => {
                                                        return (
                                                            <tr key={i}>
                                                                <td className="va-middle">{i + 1}</td>
                                                                <td>
                                                                    <Link to={`/products/${product.product.id}`}>
                                                                        {product.product.name}
                                                                    </Link>
                                                                </td>
                                                                <td>{product.quantity} {product.uom}</td>
                                                                <td>{product.amount}</td>
                                                                <td></td>
                                                                {/* <td><Button variant="contained" color="warning" size="xs" onClick={() => this.editInventory(i)}>Inventory & Docs</Button> </td> */}
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </Table>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-4 offset-md-1">
                                                {this.getFileName('Sales Contract',<span style={{marginTop:"38px",display:"block"}}>Upload Sales Contract</span>)}
                                            </div>   
                                        <div>
                                            <Button Size="small" onClick={e =>{this.setState({upoloadDocLabal:'Sales Contract'});this.toggleModalUploadDocs();}} variant="contained" color="primary" style={{marginTop: "30px",left: "-15px" }} startIcon={<CloudUploadIcon />} >Sales Contract</Button>
                                        </div>  
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 offset-md-1">
                                            {this.getFileName('Proforma Invoice',<span style={{marginTop:"38px",display:"block"}}>Upload Proforma Invoice</span>)}
                                        </div>   
                                        <div >
                                            <Button Size="small" onClick={e =>{this.setState({upoloadDocLabal:'Proforma Invoice'}); this.toggleModalUploadDocs();}} variant="contained" color="primary" style={{marginTop: "30px",left: "-15px" }} startIcon={<CloudUploadIcon />} >Proforma Invoice</Button>
                                        </div>  
                                    </div> 
                                    <div className="row  ml-4 p-2" >
                                        <div className="col-md-4 offset-md-1">
                                            {/* <InputLabel  className=" col-md-4 mt-3 " style={{left:"30px"}}>Est.Time of Dispatch :</InputLabel> 
                                            <TextField
                                                name="customerDeclaration"
                                                type="text"   
                                                style={{left:"-30px"}}                                                        
                                                className="col-md-4"                                                             
                                            /> */}
                                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                                <DatePicker
                                                    autoOk
                                                    clearable
                                                    disablePast
                                                    label="Est.Time of Dispatch"
                                                    format="DD/MM/YYYY"
                                                    value={this.state.obj.estdTimeOfDispatch}
                                                    onChange={e => this.setEstdDispatchDateField('estdTimeOfDispatch', e)}
                                                    TextFieldComponent={(props) => (
                                                        <TextField
                                                            type="text"
                                                            name="estdTimeOfDispatch"
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
                                        </div>
                                    </div>
                                    <div className="text-center" style={{marginTop: -40,marginBottom:" 10px"}}  >
                                        <Button Size="small" variant="contained" color="primary" onClick={this.saveEstDispatchDate} style={{marginTop: "30px",left: "-15px" }}>Save</Button>
                                    </div> 
                                </div>
                            </div>
                            {(this.props.user.role !== 'ROLE_ACCOUNTS' && this.props.user.role !== 'ROLE_INVENTORY') &&
                                <div className="col-md-4" >
                                    <div className="row">        
                                        <div className="col-sm-12">
                                        <Card style={{backgroundColor: "#fff", marginLeft: 41}}>
                                            <CardActionArea>
                                                <Typography style={{margin: 15}}  gutterBottom variant="h5" component="h2">
                                                    <div className="row ">
                                                        <div className="col-sm-2">
                                                            <Avatar />
                                                        </div>
                                                        <div className="col-sm-10 "  style={{fontSize: 18, marginTop: 2 }}>                                                             
                                                            {this.state.users.map((obj, i) => {
                                                                return (
                                                                    <Chip
                                                                        style={{color: "#000",backgroundColor: "#e8cd0b", margin: "3px"}}
                                                                        avatar={
                                                                            // <Avatar>
                                                                                {/* <AssignmentIndIcon /> */}
                                                                            // </Avatar>
                                                                        }
                                                                        label={this.props.user.role === 'ROLE_ADMIN'?
                                                                            <Link style={{color: "#000"}} to={`/users/${ obj.user.id}`}>{obj.user.name}</Link>:
                                                                            obj.user.name}
                                                                    />
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                    {/*<tr>
                                                        <td>  <Avatar /> </td>   
                                                        <td><span>Assign User</span></td>
                                                
                                                    </tr>*/}
                                                </Typography>
                                                {/* <CardMedia
                                                component="img"
                                                alt="Contemplative Reptile"
                                                height="60"
                                                image="/static/images/cards/contemplative-reptile.jpg"
                                                title="Contemplative Reptile"
                                                /> */}
                                                <CardContent>
                                                    {/*   <Typography variant="body2" color="textSecondary" component="p"> */}
                                                    {/* </Typography> */}
                                                </CardContent>
                                            </CardActionArea>
                                            {/* <CardActions>
                                            </CardActions> */}
                                        </Card>
                                    </div>
                                </div>
                                <div className="row" style={{marginTop: 5}}>
                                    <div className="col-sm-12">
                                        <ActivityStream
                                            title="Activity"
                                            stream={mockActivity}
                                        />
                                    </div>
                                </div> 
                            </div>}
                        </div>
                    </TabPanel>)}
                    {this.state.obj &&  (this.state.obj.type === "Sales" ? 
                        <TabPanel value={this.state.activeTab} index={1}>
                        </TabPanel>: 
                        <TabPanel value={this.state.activeTab} index={1}>
                            <CheckList baseUrl={this.props.baseUrl} onRef={ref => (this.quotationTemplateRef = ref)} 
                            currentId={this.props.currentId} parentObj={this.state.obj}></CheckList>
                        </TabPanel>
                    )}
                    {this.state.obj &&
                    (this.state.obj.type === "Sales" ?
                        <TabPanel value={this.state.activeTab} index={2}></TabPanel>:
                        <TabPanel value={this.state.activeTab} index={2}>
                            <div className="row">
                                <div className="col-md-8  offset-md-2">
                                    <table className="table" >
                                        <tbody>
                                            <tr>
                                                <td><InputLabel>Invoice No</InputLabel></td>
                                                <td></td>                                          
                                            </tr>
                                            <tr>
                                                <td><InputLabel>Packing List</InputLabel></td>
                                                <td></td>                                          
                                            </tr>
                                            <tr>
                                                <td><InputLabel>Coo</InputLabel></td>
                                                <td></td>                                          
                                            </tr>
                                            <tr>
                                                <td><InputLabel>Bill of Landing </InputLabel></td>
                                                <td></td>                                          
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabPanel>
                    )}
                    <TabPanel value={this.state.activeTab} index={3}>
                        <Accounts baseUrl={this.props.baseUrl} onRef={ref => (this.quotationTemplateRef = ref)} 
                            currentId={this.props.currentId}  parentObj={this.state.obj}></Accounts>
                    </TabPanel>
                    <TabPanel value={this.state.activeTab} index={4}>
                        <Followups repository={this.props.baseUrl} reference={this.state.obj.id} onRef={ref => (this.followupsTemplateRef = ref)}></Followups> 
                    </TabPanel>
                        <TabPanel value={this.state.activeTab} index={5}>
                        <Upload onRef={ref => (this.shippinguploadRef = ref)} fileFrom={this.props.baseUrl + '_Shipping'} 
                        currentId={this.props.currentId} fileTypes={this.state.shippingFileTypes}></Upload>
                    </TabPanel>
                    <TabPanel value={this.state.activeTab} index={6}>
                        <Upload onRef={ref => (this.bankinguploadRef = ref)} fileFrom={this.props.baseUrl + '_Banking'} 
                        currentId={this.props.currentId} fileTypes={this.state.bankingFileTypes}></Upload>
                    </TabPanel>
                    <TabPanel value={this.state.activeTab} index={7}>
                        <Approval repository={this.props.baseUrl} reference={this.state.obj.id} onRef={ref => (this.followupsTemplateRef = ref)}></Approval> 
                    </TabPanel>
                    {/*  <TabPanel value={this.state.activeTab} index={7}>
                        <PurchaseDocs onRef={ref => (this.bankinguploadRef = ref)} fileFrom={this.props.baseUrl + '_Banking'} 
                        currentId={this.props.currentId} parentObj={this.state.obj} fileTypes={this.state.bankingFileTypes}></PurchaseDocs>
                    </TabPanel>*/}
                    {this.state.editFlag &&
                        <div className="card b">
                            <div className="card-body bb bt">
                                <Add baseUrl={this.props.baseUrl} onRef={ref => (this.addTemplateRef = ref)}
                                    onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}></Add>
                            </div>
                        </div>
                    }
            </div>)
        }
    }
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(View);