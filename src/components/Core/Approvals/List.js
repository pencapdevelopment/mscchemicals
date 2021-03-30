import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
// import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
// import PageLoader from '../../Common/PageLoader';
import Sorter from '../../Common/Sorter';
import FileDownload from '../../Common/FileDownload';
import {
    Modal,
    ModalBody, ModalHeader,
} from 'reactstrap';
import EditIcon from '@material-ui/icons/Edit';
import {  Select, MenuItem, InputLabel } from '@material-ui/core';
import FormValidator from '../../Forms/FormValidator';
import AutoSuggest from '../../Common/AutoSuggest';
import UOM from '../Common/UOM';
import {FormControl, TextField } from '@material-ui/core';
import { Link } from 'react-router-dom';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path, defaultDateFilter } from '../../Common/constants';
// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import { Button } from '@material-ui/core';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
const json2csv = require('json2csv').parse;
class List extends Component {
    state = {
        activeStep: 0,
        loading: true,
        objects: [],
        all: [],
        toggleres:-1,
        modalEdit : false,
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            search: '',
            category: '',
            fromDate: null,
            toDate: null,
        },
        filterCategories: [
            { label: 'All', value: '' },
        ],
        orderBy: 'id,desc',
        patchError: '',
        formWizard: {
            editFlag: false,
            readOnly:false,
            obj: {
                status:'',
                remark:''
            }
        },
        status: [
            { label: 'Accept', value: 'A' },
            { label: 'Reject', value: 'R' },
        ], 
    }
    searchObject = e => {
        var str = e.target.value;
        var filters = this.state.filters;
        filters.search = str;
        this.setState({ filters }, o => { this.loadObjects() });
    }
    searchCategory(e) {
        var filters = this.state.filters;
        filters.category = e.target.value;
        this.setState({ filters }, o => {
            this.loadObjects();
        });
    };
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
            this.setState({ orderBy: 'id,desc' }, this.loadObjects)
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            this.setState({ orderBy: col.param + ',' + direction }, this.loadObjects);
        }
    }
    loadObjects(offset, all, callBack) {
        if (!offset) offset = 1;
        var url = server_url + context_path + "api/" + this.props.baseUrl + "?projection=approvals";
        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }
        if(this.props.reference) {
            url += "&reference=" + this.props.reference;
            if(this.props.repository) {
                url += "&repository=" + this.props.repository;
            }
        }
        if(this.props.user.role !== 'ROLE_ADMIN') {
            url += "&uid=" + this.props.user.id;
        }
        if (this.state.filters.search) {
            url += "&contact=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }
        if (this.state.filters.category) {
            url += "&category=" + this.state.filters.category;
        }
        url = defaultDateFilter(this.state, url);
        if (all) {
            url += "&size=100000";
        }
        axios.get(url)
        .then(res => {
            if (all) {
                this.setState({
                    all: res.data._embedded[Object.keys(res.data._embedded)[0]]
                });
            } else {
                this.setState({
                    objects: res.data._embedded[Object.keys(res.data._embedded)[0]],
                    page: res.data.page
                });
            }
            if (callBack) {
                callBack();
            }
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.props.onRef(this);
        this.loadObjects();
        this.setState({ loading: true });
    }
    viewObj = (i) => {
        var obj = this.state.objects[i];
        this.props.onView(obj.id);
    }
    editObj(idx) {
        var obj = this.state.objects[idx];
        this.props.onUpdateRequest(obj.id);
    }
    patchObj(idx) {
        var obj = this.state.objects[idx];
        axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + obj.id)
        .then(res => {
            var objects = this.state.objects;
            objects[idx].active = !objects[idx].active;
            this.setState({ objects });
        }).finally(() => {
            this.setState({ loading: false });
        }).catch(err => {
            this.setState({ patchError: err.response.data.globalErrors[0] });
            swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
        });
    }
    printReport() {
        this.loadObjects(this.state.offset, true, () => {
            window.print();
        });
    }
    downloadReport = () => {
        const fields = ['id', 'name', 'email', 'mobile', 'creationDate'];
        const opts = { fields };
        this.loadObjects(this.state.offset, true, () => {
            var csv = json2csv(this.state.all, opts);
            FileDownload.download(csv, 'reports.csv', 'text/csv');
        });
    }
    toggleEditclick = (idx) => {
        if(this.state.objects[idx].repository === 'sales'){
            this.getSalesNGT(idx);
        }
        else{
            this.getPurchaseNGT(idx);
        }
    }
    getSalesNGT = (idx) => {
        axios.get( server_url + context_path + "api/sales-negotiation-tracking?salesProduct="+this.state.objects[idx].salesNegotiationTracking.salesProduct.id+"&page=0&sort=id,desc&projection=sales-negotiation-tracking")
        .then(res => {
            //var ngList = res.data._embedded[Object.keys(res.data._embedded)[0]];
            let stage1Status = null;
            let stage2Status = null;
            let stage3Status = null; 
            let prodId = this.state.objects[idx].salesNegotiationTracking.product.id;
            var ngList=res.data._embedded[Object.keys(res.data._embedded)[0]];
            if (ngList.length) {
                let stage1Index = ngList.findIndex(el=>el.product.id===prodId && el.negotiation_stage1 !==0 && el.negotiation_stage2 === 0 && el.negotiation_stage3 === 0)
                stage1Status = stage1Index > -1 ?ngList[stage1Index].status:null;
                let stage2Index=ngList.findIndex(el=>el.product.id===prodId && el.negotiation_stage1 !==0 && el.negotiation_stage2 !== 0 && el.negotiation_stage3 === 0)
                stage2Status = stage2Index > -1 ?ngList[stage2Index].status:null;
                let stage3Index=ngList.findIndex(el=>el.product.id===prodId && el.negotiation_stage1 !==0 && el.negotiation_stage2 !== 0 && el.negotiation_stage3 !== 0)
                stage3Status = stage3Index > -1 ?ngList[stage3Index].status:null;
            }
            let objects = this.state.objects;
            objects[idx].stage1Status = stage1Status;
            objects[idx].stage2Status = stage2Status;
            objects[idx].stage3Status = stage3Status;
            this.setState({ toggleres:idx,objects, modalEdit:!this.state.modalEdit });
        });
    }
    getPurchaseNGT = (idx) => {
        axios.get( server_url + context_path + "api/purchase-negotiation-tracking?purchaseProduct="+this.state.objects[idx].purchaseNegotiationTracking.purchaseProduct.id+"&page=0&sort=id,desc&projection=purchase-negotiation-tracking")
        .then(res => {
            //var ngList = res.data._embedded[Object.keys(res.data._embedded)[0]];
            let stage1Status = null;
            let stage2Status = null;
            let stage3Status = null; 
            let prodId = this.state.objects[idx].purchaseNegotiationTracking.product.id;
            var ngList=res.data._embedded[Object.keys(res.data._embedded)[0]];
            if (ngList.length) {
                let stage1Index = ngList.findIndex(el=>el.product.id===prodId && el.negotiation_stage1 !==0 && el.negotiation_stage2 === 0 && el.negotiation_stage3 === 0)
                stage1Status = stage1Index > -1 ?ngList[stage1Index].status:null;
                let stage2Index=ngList.findIndex(el=>el.product.id===prodId && el.negotiation_stage1 !==0 && el.negotiation_stage2 !== 0 && el.negotiation_stage3 === 0)
                stage2Status = stage2Index > -1 ?ngList[stage2Index].status:null;
                let stage3Index=ngList.findIndex(el=>el.product.id===prodId && el.negotiation_stage1 !==0 && el.negotiation_stage2 !== 0 && el.negotiation_stage3 !== 0)
                stage3Status = stage3Index > -1 ?ngList[stage3Index].status:null;
            }
            let objects = this.state.objects;
            objects[idx].stage1Status = stage1Status;
            objects[idx].stage2Status = stage2Status;
            objects[idx].stage3Status = stage3Status;
            this.setState({ toggleres:idx,objects, modalEdit:!this.state.modalEdit });
        });
    }
    getStatus(stage,idx,readOnly,errors){
        let status = null;
        if(stage === 'stg1'){
            status = this.state.objects[idx].stage1Status;
        }
        if(stage === 'stg2'){
            status = this.state.objects[idx].stage2Status;
        }
        if(stage === 'stg3'){
            status = this.state.objects[idx].stage3Status;
        }
        if(status === null){
            return (<div>
                {(this.props.user.role === 'ROLE_ADMIN' || readOnly || (this.props.user.permissions.indexOf("MG_AC")>=0) ) &&  
                    <FormControl>
                        <InputLabel>Status*</InputLabel>
                        <Select name="status" label="Status" value={this.state.formWizard.obj.status}
                            disabled={readOnly}
                            helperText={errors?.status?.length > 0 ? errors?.status[0]?.msg : ""}
                            error={errors?.status?.length > 0}
                            onChange={e => this.setSelectField('status', e)}> {this.state.status.map((e, keyIndex) => {
                                return (
                                    <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    }
                </div>);
        }
        else{
            if(status===null){
                return <div><span className="badge badge-secondary">Pending</span></div>;
            }
            else if(status === 'Rejected'){
                return <div><span className="badge badge-danger">{status}</span></div>;
            }
            else{
                return <div><span className="badge badge-success">{status}</span></div>;
            }
        }
    }
    giveApproval = () => {
        let approvalObj = this.state.objects[this.state.toggleres];
        let status = this.state.formWizard.obj.status;
        let remark = this.state.formWizard.obj.remark;
        axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + approvalObj.id,{id:approvalObj.id,status:status,remark:remark})
        .then(apprRes =>{
            let ngtStatus = status === 'A'?'Approved':'Rejected';
            if(approvalObj.repository === 'sales'){
                axios.patch(server_url + context_path + "api/sales-negotiation-tracking/" + approvalObj.salesNegotiationTracking.id,{id:approvalObj.salesNegotiationTracking.id,status:ngtStatus});
                axios.patch(server_url + context_path + "api/sales-products/" + approvalObj.salesNegotiationTracking.salesProduct.id,{id:approvalObj.salesNegotiationTracking.salesProduct.id,status:ngtStatus});
            }
            if(approvalObj.repository === 'purchase'){
                axios.patch(server_url + context_path + "api/purchase-negotiation-tracking/" + approvalObj.purchaseNegotiationTracking.id,{id:approvalObj.purchaseNegotiationTracking.id,status:ngtStatus});
                axios.patch(server_url + context_path + "api/purchase-products/" + approvalObj.purchaseNegotiationTracking.purchaseProduct.id,{id:approvalObj.purchaseNegotiationTracking.purchaseProduct.id,status:ngtStatus});
            }
        }); 
        this.setState({
            modalEdit: false
         });     
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
    toggleEdit= () => {
        this.setState({modalEdit: false});
    }
    getSalesModalBody = (toggleres,errors,readOnly)=>{
        return <div>
        <div className="row">
            <div className="col-md-12">
                <Table hover responsive>
                    <tbody>
                        <tr>
                            <td className="va-middle">
                                <fieldset>
                                    <FormControl>
                                        <Link to={'/products/'+this.state.objects[toggleres].salesNegotiationTracking.product.id}>
                                            {this.state.objects[toggleres].salesNegotiationTracking.product.name}
                                        </Link>
                                    </FormControl>
                                </fieldset>
                            </td>
                            <td>
                                <fieldset>
                                    <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                        //inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                        inputProps={{ readOnly: true }}
                                        // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                        // error={errors?.quantity?.length > 0}
                                        value={this.state.objects[toggleres].salesNegotiationTracking.salesProduct.quantity} 
                                        onChange={(e)=>this.saveQuantity(e)}
                                        //onChange={e => this.setProductField(i, "quantity", e)}
                                    />
                                </fieldset>
                            </td>
                            <td>
                                <fieldset>
                                    <UOM required={true}
                                        value={this.state.objects[toggleres].salesNegotiationTracking.salesProduct.uom} onChange={(e)=>this.saveUom(e)} isReadOnly={true}
                                        //onChange={e => this.setProductField(i, "uom", e, true)}
                                    />
                                </fieldset>
                            </td>
                            <td>
                                <fieldset>
                                    <TextField type="number" name="amount" label="Amount" required={true}
                                        inputProps={{ readOnly: true }}
                                        //inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                        // helperText={errors?.amount?.length > 0 ? errors?.amount[i]?.msg : ""}
                                        // error={errors?.amount?.length > 0}
                                        value={this.state.objects[toggleres].salesNegotiationTracking.salesProduct.amount} onChange={(e)=>this.saveProduct(e)} />
                                </fieldset>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        </div>  
        <div className="row">  
            <div className="col-md-4">
                <strong>Negotiation Stage1 :</strong>
            </div>
            <div className="col-md-4">  
                    <TextField type="number" name="negotiation_stage1" label="Amount" required={true}  style={{width:"150px"}}
                        value={this.state.objects[toggleres].salesNegotiationTracking.negotiation_stage1}  inputProps={{ readOnly: true }} />
            </div>
            <div className="col-md-4">  
                {this.getStatus('stg1',toggleres,readOnly,errors)} 
            </div>
        </div>
        {(this.state.objects[toggleres].salesNegotiationTracking.negotiation_stage2 !==0 && 
        (this.state.objects[toggleres].salesNegotiationTracking.status === null ||
        this.state.objects[toggleres].salesNegotiationTracking.status === 'R')) &&
        <div className="row">  
            <div className="col-md-4">
                <strong>Negotiation Stage2 :</strong>
            </div>
            <div className="col-md-4">  
                <TextField type="number" name="negotiation_stage1" label="Amount" required={true}  style={{width:"150px"}}
                value={this.state.objects[toggleres].salesNegotiationTracking.negotiation_stage2}  inputProps={{ readOnly: true }} />
            </div>  
            <div className="col-md-4">  
                {this.getStatus('stg2',toggleres,readOnly,errors)} 
            </div>     
        </div>}
        {((this.state.objects[toggleres].salesNegotiationTracking.negotiation_stage2 !==0 && 
        this.state.objects[toggleres].salesNegotiationTracking.negotiation_stage3 !==0) &&
        (this.state.objects[toggleres].salesNegotiationTracking.status === null ||
        this.state.objects[toggleres].salesNegotiationTracking.status === 'R')) &&
        <div className="row">  
            <div className="col-md-4">
                <strong>Negotiation Stage3 :</strong>
            </div>
            <div className="col-md-4">  
                 <TextField type="number" name="negotiation_stage1" label="Amount" required={true}  style={{width:"150px"}}
                 value={this.state.objects[toggleres].salesNegotiationTracking.negotiation_stage3}  inputProps={{ readOnly: true }} />
            </div>
            <div className="col-md-4">  
                {this.getStatus('stg3',toggleres,readOnly,errors)} 
            </div>
        </div>}
        <div className="col-md-5  offset-md-3 " style={{marginTop:"30px",marginBottom:"3px"}}>
            <fieldset>
                <TextareaAutosize placeholder="Response" fullWidth={true} rowsMin={3} name="response"
                   style={{padding: 10}} value={this.state.formWizard.obj.remark} onChange={e => this.setField('remark', e, true)}
                />
            </fieldset>
        </div>
        <div className="text-center">
            <Button variant="contained" color="primary" onClick={this.giveApproval} >Save</Button>
        </div>
        </div>
    }
    getPurchaseModalBody = (toggleres,errors,readOnly)=>{
        return <div>
        <div className="row">
            <div className="col-md-12">
                <Table hover responsive>
                    <tbody>
                        <tr>
                            <td className="va-middle">
                                <fieldset>
                                    <FormControl>
                                        <Link to={'/products/'+this.state.objects[toggleres].purchaseNegotiationTracking.product.id}>
                                            {this.state.objects[toggleres].purchaseNegotiationTracking.product.name}
                                        </Link>
                                    </FormControl>
                                </fieldset>
                            </td>
                            <td>
                                <fieldset>
                                    <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                        //inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                        inputProps={{ readOnly: true }}
                                        // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                        // error={errors?.quantity?.length > 0}
                                        value={this.state.objects[toggleres].purchaseNegotiationTracking.purchaseProduct.quantity} 
                                        onChange={(e)=>this.saveQuantity(e)}
                                        //onChange={e => this.setProductField(i, "quantity", e)}
                                    />
                                </fieldset>
                            </td>
                            <td>
                                <fieldset>
                                    <UOM required={true}
                                        value={this.state.objects[toggleres].purchaseNegotiationTracking.purchaseProduct.uom} onChange={(e)=>this.saveUom(e)} isReadOnly={true}
                                        //onChange={e => this.setProductField(i, "uom", e, true)}
                                    />
                                </fieldset>
                            </td>
                            <td>
                                <fieldset>
                                    <TextField type="number" name="amount" label="Amount" required={true}
                                        inputProps={{ readOnly: true }}
                                        //inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                        // helperText={errors?.amount?.length > 0 ? errors?.amount[i]?.msg : ""}
                                        // error={errors?.amount?.length > 0}
                                        value={this.state.objects[toggleres].purchaseNegotiationTracking.purchaseProduct.amount} onChange={(e)=>this.saveProduct(e)} />
                                </fieldset>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        </div>  
        <div className="row">  
            <div className="col-md-4">
                <strong>Negotiation Stage1 :</strong>
            </div>
            <div className="col-md-4">  
                    <TextField type="number" name="negotiation_stage1" label="Amount" required={true}  style={{width:"150px"}}
                        value={this.state.objects[toggleres].purchaseNegotiationTracking.negotiation_stage1}  inputProps={{ readOnly: true }} />
            </div>
            <div className="col-md-4">  
                {this.getStatus('stg1',toggleres,readOnly,errors)} 
            </div>
        </div>
        {(this.state.objects[toggleres].purchaseNegotiationTracking.negotiation_stage2 !==0 && 
        (this.state.objects[toggleres].purchaseNegotiationTracking.status === null ||
        this.state.objects[toggleres].purchaseNegotiationTracking.status === 'R')) &&
        <div className="row">  
            <div className="col-md-4">
                <strong>Negotiation Stage2 :</strong>
            </div>
            <div className="col-md-4">  
                <TextField type="number" name="negotiation_stage1" label="Amount" required={true}  style={{width:"150px"}}
                value={this.state.objects[toggleres].purchaseNegotiationTracking.negotiation_stage2}  inputProps={{ readOnly: true }} />
            </div>  
            <div className="col-md-4">  
                {this.getStatus('stg2',toggleres,readOnly,errors)} 
            </div>     
        </div>}
        {((this.state.objects[toggleres].purchaseNegotiationTracking.negotiation_stage2 !==0 && 
        this.state.objects[toggleres].purchaseNegotiationTracking.negotiation_stage3 !==0) &&
        (this.state.objects[toggleres].purchaseNegotiationTracking.status === null ||
        this.state.objects[toggleres].purchaseNegotiationTracking.status === 'R')) &&
        <div className="row">  
            <div className="col-md-4">
                <strong>Negotiation Stage3 :</strong>
            </div>
            <div className="col-md-4">  
                 <TextField type="number" name="negotiation_stage1" label="Amount" required={true}  style={{width:"150px"}}
                 value={this.state.objects[toggleres].purchaseNegotiationTracking.negotiation_stage3}  inputProps={{ readOnly: true }} />
            </div>
            <div className="col-md-4">  
                {this.getStatus('stg3',toggleres,readOnly,errors)} 
            </div>
        </div>}
        <div className="col-md-5  offset-md-3 " style={{marginTop:"30px",marginBottom:"3px"}}>
            <fieldset>
                <TextareaAutosize placeholder="Response" fullWidth={true} rowsMin={3} name="response"
                   style={{padding: 10}} value={this.state.formWizard.obj.remark} onChange={e => this.setField('remark', e, true)}
                />
            </fieldset>
        </div>
        <div className="text-center">
            <Button variant="contained" color="primary" onClick={this.giveApproval} >Save</Button>
        </div>
        </div>
    } 
    render() {
        const errors = this.state.formWizard.errors;
        const readOnly=this.state.readOnly;
        return (<ContentWrapper>
            <Modal isOpen={this.state.modalEdit} backdrop="static" toggle={this.toggleEdit} size={'lg'}>
                <ModalHeader toggle={this.toggleEdit}>
                    <h4>Sales Product Approval</h4>
                </ModalHeader>
                <ModalBody>
                    {this.state.toggleres > -1 &&
                        (this.state.objects[this.state.toggleres].repository === 'sales'?
                            this.getSalesModalBody(this.state.toggleres,errors,readOnly):
                            this.getPurchaseModalBody(this.state.toggleres,errors,readOnly))
                    }
                </ModalBody>
            </Modal>
            <Table hover responsive>
            <thead>
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Creation</th>
                        <th>status</th>
                        <th>Response Date</th>
                    </tr>
                </thead>  
                <tbody>   
                {this.state.objects.map((obj,i) => {
                        // let aprrovals = this.state.objects.find(ap => {ap.reference === obj.});
                        if(obj.status === null){
                            return (
                                <tr key={obj.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                        <a href="#s" className="btn-link" onClick={() => this.viewObj(i)}>
                                            {obj.repository === 'sales'?obj.salesNegotiationTracking.product.name:obj.purchaseNegotiationTracking.product.name}
                                        </a>
                                    </td>
                                    <td>
                                        <Moment format="DD MMM YY">{obj.creationDate}</Moment>
                                    </td>
                                    <td>
                                        { obj.status==='A'?'Approved':obj.status==='R'?'Rejected':'New'}
                                        { this.props.user.role === 'ROLE_ADMIN' &&
                                        <EditIcon onClick={()=>this.toggleEditclick(i)}  style={{color: "#000" ,cursor :"pointer" ,position:"relative" ,left:"6px" }} size="small"  fontSize="small" />
                                        }
                                    </td>
                                    <td>      
                                        <Moment format="DD MMM YY">{obj.updationDate}</Moment>
                                    </td>
                                </tr>
                            )
                        }
                        else{
                            return null;
                        }
                    })}
                </tbody>
            </Table>
            <CustomPagination page={this.state.page} onChange={(x) => this.loadObjects(x)} />
            <Table id="printSection" responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Contact</th>
                        <th>Created On</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.all.map((obj, i) => {
                        return (
                            <tr key={obj.id}>
                                <td>{i + 1}</td>
                                <td>{obj.contact}</td>
                                <td>
                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </ContentWrapper>)
    }
}
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(List);