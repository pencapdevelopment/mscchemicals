import {Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import axios from 'axios';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import moment from 'moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import QuoteStatus from '../Common/QuoteStatus';
import { Table } from 'reactstrap';
import swal from 'sweetalert';
import * as Const from '../../Common/constants';
import Uploadp from './Uploadp';
import AddQuotation from './AddQuotation';
import EditIcon from '@material-ui/icons/Edit';
import EmailIcon from '@material-ui/icons/Email';
import { saveProducts } from '../Common/AddProducts1';
import Divider from '@material-ui/core/Divider';
import PageLoader from '../../Common/PageLoader';
import { createOrder } from '../Orders/Create';
import AssignmentSharpIcon from '@material-ui/icons/AssignmentSharp';
// const json2csv = require('json2csv').parse;
class Quotation extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        modal: false,
        obj: '',
        baseUrl: 'purchase-quotation',
        currentId: '',
        ngTracking : [],
        fileTypes2: [
            { label: 'Quotation', expiryDate: true },
            { label: 'COA', expiryDate: true }
        ],
        status: [
            { label: 'Approved', value: 'Approved', badge: 'success'},
            { label: 'Rejected', value: 'Rejected', badge: 'danger'},
            { label: 'Pending', value: 'Pending', badge: 'secondary'}
        ],
        purchaseProdStatus: [
            { label: 'Approve', value: 'Approved', badge: 'success'},
            { label: 'Reject', value: 'Rejected', badge: 'danger'}
        ]
    }
    loadObj(id) {
        axios.get(Const.server_url + Const.context_path + "api/purchase-quotation?enquiry.id=" + id + '&projection=purchase_quotation_edit&sort=id,desc').then(res => {
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];
            if(list.length) {
                this.setState({ obj: list[0], currentId: list[0].id },this.negotiationTraking);
            }
        });
    }
    negotiationTraking(){
        axios.get( Const.server_url + Const.context_path + "api/purchase-negotiation-tracking?reference.id="+this.props.currentId+"&sort=id,desc&projection=purchase-negotiation-tracking").then(res => {
            let ngList1 = res.data._embedded[Object.keys(res.data._embedded)[0]];
            let ngList =  [];
            ngList1.map((ngt1,idx1)=>{
                if(idx1===0){
                    ngList.push(ngt1);
                }
                else{
                    if(ngList.findIndex(nt=> nt.product.id === ngt1.product.id)===-1){
                        ngList.push(ngt1);
                    }
                }
                return null;
            });
            if(ngList.length>0){
                this.setState({
                    ngTracking:ngList, 
                    trackingData:ngList1,
                    page:''
                });
            }
        });   
    }
    updatePurchaseProdStatus = (e,purchaseProd) => {
        swal({
            title: "Are you sure?",
            text: "Are you sure to change the status of product",
            icon: "info",
            button: {
                text: "Yes, Change it!",
                closeModal: true,
            }
        })
        .then(willChange => {
            if (willChange) {
                axios.patch(Const.server_url + Const.context_path + "api/purchase-products/"+purchaseProd.id,{id:purchaseProd.id,status:e.target.value})
                .then(res => {this.loadObj(this.props.currentId)});
            }
        });
    }
    getPurchaseProdStatus = (purchaseProd) => {
        let ngt = this.state.ngTracking;
        if((ngt.length < 1 && purchaseProd.status === null) ||
        (ngt.length > 0 && !ngt.some(p => p.product.id === purchaseProd.product.id) && purchaseProd.status === null)){
            return this.props.user.role !== 'ROLE_ADMIN'?null:<FormControl>
            <InputLabel >Status</InputLabel>
            <Select
                name="purchaseProdStatus"
                onChange={e => this.updatePurchaseProdStatus(e,purchaseProd)}
            >
                {this.state.purchaseProdStatus.map((e, keyIndex) => {
                    return (<MenuItem key={keyIndex} value={e.value}> {e.label} </MenuItem>)
                })}
            </Select>
            </FormControl>;
        }
        else{
            return purchaseProd.status === null?<span className="badge badge-secondary">Pending</span>:
            purchaseProd.status === 'Rejected'?<span className="badge badge-danger">{purchaseProd.status}</span>:
            <span className="badge badge-success">{purchaseProd.status}</span>;
        }
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.loadObj(this.props.currentId);
        this.props.onRef(this);
    }
    updateObj() {
        if(this.state.obj) {
            this.setState({ editFlag: true }, () => {
                this.addTemplateRef.updateObj(this.state.currentId);
            })
        } else {
            this.setState({ editFlag: true });
        }
    }
    updateStatus = (status) => {
        var statusObj = this.state.obj;
        statusObj.status = status;
        this.setState({ statusObj });
    }
    saveSuccess(id) {
        this.setState({ editFlag: false });
        this.loadObj(this.props.currentId);
    }
    dateFormatter = (date) => {
        if (date) {
            return moment(date).format("DD MMM YYYY");
        } else {
            return "-NA-";
        }
    }
    cancelSave = () => {
        this.setState({ editFlag: false });
    }
    sendEmail = (i) => {
        var obj = this.state.obj;
        // var prod = this.props.parentObj.products[i];
        axios.patch(Const.server_url + Const.context_path + "quotations/" + obj.id)
        .then(res => {
            // prod.status = 'Email Sent';
            this.setState({ obj });
            swal("Sent Quotation!", 'Succesfully sent quotation mail.', "success");
        }).finally(() => {
            this.setState({ loading: false });
        }).catch(err => {
            swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
        })
    }
    generateQuote = (expiryDate,products)=>{
        this.setState({loading:true});
        let pe = this.props.parentObj;
        axios.get(Const.server_url+Const.context_path+'api/companies/'+pe.company.id).then(compRes => {
            let promise = undefined;
            if(this.state.obj.id){
                let purQuote = {...this.state.obj};
                purQuote.company = '/companies/'+purQuote.company.id;
                purQuote.enquiry = '/purchase/'+purQuote.enquiry.id;
                promise = axios.patch(Const.server_url + Const.context_path + "api/purchase-quotation/"+purQuote.id, purQuote);
            }
            else{
                let purQuote = {
                    code: Const.getUniqueCode('PQ'),
                    company: "/companies/"+compRes.data.id,
                    gst: '',
                    amount: '',
                    transportationCharges: '',
                    terms: compRes.data.paymentTerms,
                    deliveryPeriod: '',
                    enquiry: '/purchase/'+pe.id,
                    validTill: expiryDate,
                };
                promise = axios.post(Const.server_url + Const.context_path + "api/purchase-quotation", purQuote);
            }
            promise.then(res =>{
                saveProducts(this.props.baseUrl, pe.id, products, () => {});
                this.loadObj(pe.id);
                this.setState({loading: false });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                this.setState({ loading: false });
                swal("Upload Quotation Error!", "Unable to Upload Quotation!", "error");
            });
        }).finally(()=>{
            this.setState({ loading: false });
        }).catch(err =>{
            this.setState({ loading: false });
            swal("Company Not found!", "Unable to find the selected Company", "error");
        });
    }
    convertToOrder = () => {
        swal({
            title: "Are you Sure?",
            text: "Are you sure to convert to order",
            icon: "info",
            button: {
                text: "Yes, Convert!",
                closeModal: true,
            }
        })
        .then(willConvert => {
            if (willConvert) {
                if(this.state.obj.enquiry.adminApproval!=='Y' && this.props.user.role !== 'ROLE_ADMIN'){
                    swal("Unable to Convert!", "Please get Admin approval of purchase enquiry", "error");
                    return ;
                }
                if(this.state.obj.status!=='Approved'){
                    swal("Unable to Convert!", "Please get Quotation Approval", "error");
                    return ;
                }
                if(this.state.obj.enquiry.products.length===0){
                    swal("Unable to Convert!", "Please add atleast one product", "error");
                    return ;
                }
                if(this.state.obj.enquiry.products.length>0 && !this.state.obj.enquiry.products.some(p => p.status === 'Approved')){
                    swal("Unable to Convert!", "Please get Approval of atleast one product", "error");
                    return ;
                }
                createOrder('Purchase', this.state.obj.enquiry, this.props.baseUrl);
            }
        });
    }
    render() {
        return (
            <div>
                {this.state.loading && <PageLoader />}
                {!this.state.editFlag &&            
                    <div className="row">
                        <div className="col-md-12">
                            <Uploadp onRef={ref => (this.uploadRef = ref)} fileFrom={this.props.baseUrl} currentId={this.props.currentId} quoteObj={this.state.obj}
                                fileTypes={this.state.fileTypes2} products={this.props.parentObj.products} generateQuote={(expiryDate,products) => this.generateQuote(expiryDate,products)}></Uploadp>
                            {this.state.obj &&
                            <div className="card b">
                                <div className="card-header">
                                    <div className="row">
                                        <div className="col-sm-10">
                                            <table>
                                                <tbody>
                                                    <tr style={{marginTop: 70, marginLeft: 10}}>
                                                    <span  style={{ marginLeft: 20,fontSize: 12}} className={Const.getStatusBadge(this.state.obj.status?this.state.obj.status:'Pending', this.state.status)}>{this.state.obj.status?this.state.obj.status:'Pending'}</span> 
                                                    </tr>
                                                </tbody>
                                            </table>
                                            {(this.props.user.role === 'ROLE_ADMIN'  && 
                                            <QuoteStatus onRef={ref => (this.statusRef = ref)} baseUrl={this.state.baseUrl} currentId={this.props.currentId}
                                                projection="purchase_quotation_edit"
                                                showNotes={true}
                                                onUpdate={(id) => this.updateStatus(id)}
                                                color="primary"
                                                statusList={this.state.status}  status={this.state.statusObj}
                                                statusType="Enquiry">
                                            </QuoteStatus>)}
                                        </div>
                                        <div className="col-sm-2"  >
                                            <buttonGroup>
                                            {(this.props.user.role === 'ROLE_ADMIN' && 
                                                <button title="Edit Quotation" disabled={this.state.obj.status === 'Approved' || this.state.obj.status === null || this.state.obj.status === 'Pending' || this.state.obj.status === 'Email Sent'} style={{ backgroundColor: "#2b3db6", border: "1px solid #2b3db6 ", borderRadius: "5px" }} color="primary" variant="contained" onClick={() => this.updateObj()}> <EditIcon style={{ color: '#fff', }} fontSize="small" /></button>)}
                                                <button title={this.state.obj.status !== 'Approved'?'Please Get Admin approval to send mail':'Send Mail'} disabled={this.state.obj.status !== 'Approved'} style={{ backgroundColor: "#2b3db6", border:"1px solid  #2b3db6",borderRadius:"5px" }} color="primary" variant="outlined" onClick={() => this.sendEmail()} ><EmailIcon  style={{ color: '#fff', }} fontSize="small" /></button>
                                                {!this.state.obj.enquiry.order && (this.props.user.role === 'ROLE_ADMIN' ||this.props.user.permissions.indexOf(Const.MG_PR_E) >= 0) &&
                                                    <button title={this.state.obj.status !== 'Approved'?'Please Get Admin approval to convert to order':'convert to Order'} 
                                                        disabled={this.state.obj.status !== 'Approved'} style={{ backgroundColor: "#2b3db6", border:"1px solid #2b3db6", borderRadius:"5px"}} variant="contained" color="primary" size="small" onClick={this.convertToOrder}><AssignmentSharpIcon   style={{ color: '#fff', }} fontSize="small"/></button>}
                                                {this.state.obj.enquiry.order &&
                                                <Link to={`/orders/${this.state.obj.enquiry.order}`} disabled={this.state.obj.status !== 'Approved'}>
                                                    <button title={this.state.obj.status !== 'Approved'?'Please Get Admin approval to convert to order':'convert to Order'}
                                                        disabled={this.state.obj.status !== 'Approved'} style={{ backgroundColor: "#2b3db6", border:"1px solid #2b3db6", borderRadius:"5px"}}><span style={{  textTransform: 'none', fontWeight: 'normal'}}> <AssignmentSharpIcon   style={{ color: '#fff', }} fontSize="small"/></span></button>
                                                </Link>}
                                            </buttonGroup>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body bb bt">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <strong>Code</strong>
                                                </td>
                                                <td>{this.state.obj.code}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Company</strong>
                                                </td>
                                                <td>
                                                    <Link to={`/companies/${this.state.obj.company.id}`}>
                                                        {this.state.obj.company.name}
                                                    </Link>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Specification</strong>
                                                </td>
                                                <td>{this.state.obj.specification?this.state.obj.specification:'-NA-'}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Makes</strong>
                                                </td>
                                                <td>{this.state.obj.make?this.state.obj.make:'-NA-'}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Payment Terms</strong>
                                                </td>
                                                <td>{this.state.obj.terms}</td>
                                            </tr>
                                             <tr>
                                                <td>
                                                    <strong>GST</strong>
                                                </td>
                                                <td>{this.state.obj.gst}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Valid Till</strong>
                                                </td>
                                                {/* <td>{this.state.obj.validTill?<Moment format="DD MMM YY">`{this.state.obj.validTill}`</Moment>:'-NA-'}</td> */}
                                                <td>{this.dateFormatter(this.state.obj.validTill)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className=" mt-4">
                                        <h4 style={{fontSize:"18px"}}>Products</h4>
                                    </div>
                                    <Divider />
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        {this.state?.obj?.enquiry?.products &&
                                        <tbody>
                                        {this.state.obj.enquiry.products.map((product, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td className="va-middle">{i + 1}</td>
                                                    <td>
                                                        <Link to={`/products/${product.product.id}`}>
                                                            {product.product.name}
                                                        </Link>
                                                    </td>
                                                    <td>{product.quantity}</td>
                                                    <td>{product.amount}</td>
                                                    <td>{this.getPurchaseProdStatus(product)}</td>
                                                </tr>)
                                            })}
                                        </tbody>}
                                    </Table>
                                </div>
                            </div>}
                            {/* {!this.state.obj &&
                            <div className="text-center">
                                {this.props.user.permissions.indexOf(Const.MG_PR_E) >=0 && <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Generate Quotation</Button>}
                            </div>} */}
                        </div>
                    </div>}
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
)(Quotation);