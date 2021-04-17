import { Button,ButtonGroup, FormControl, InputLabel, MenuItem, Select} from '@material-ui/core';
import axios from 'axios';
import queryString from 'query-string';
import { context_path, defaultDateFilter, server_url } from '../../Common/constants';
import { makeStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import QuoteStatus from '../Common/QuoteStatus';
import { Table } from 'reactstrap';
import swal from 'sweetalert';
import * as Const from '../../Common/constants';
import AddQuotation from './AddQuotation';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import EmailIcon from '@material-ui/icons/Email';
// import AssignmentSharpIcon from '@material-ui/icons/AssignmentSharp';
// import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import Divider from '@material-ui/core/Divider';
import {
    Form, Modal,
    ModalBody, ModalHeader,
} from 'reactstrap';
import FormValidator from '../../Forms/FormValidator';
import { green, pink } from '@material-ui/core/colors';
import Avatar from '@material-ui/core/Avatar';
const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    pink: {
      color: theme.palette.getContrastText(pink[500]),
      backgroundColor: pink[500],
    },
    green: {
      color: '#fff',
      backgroundColor: green[500],
    },
  }));
// const json2csv = require('json2csv').parse;
class Quotation extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        modal: false,
        modalproduct: false,
        modalproduct1: false,
        ngTracking : [],
        statusObj:'',
        obj: '',
        newObj: '',
        baseUrl: 'sales-quotation',
        currentId: '',
        selectedStatus: '',
        error: {},
        selectedStatus: '',
        status: [
            { label: 'Approved', value: 'Approved', badge: 'success'},
            { label: 'Rejected', value: 'Rejected', badge: 'danger'},
            { label: 'Pending', value: 'Pending', badge: 'secondary'}
        ],
        formWizard: {
            editFlag: false,
            readOnly:false,
            obj: {
                status:'',
                remark:''
            }
        },
        saleProdStatus: [
            { label: 'Approve', value: 'Approved', badge: 'success'},
            { label: 'Reject', value: 'Rejected', badge: 'danger'}
        ]
    }
    loadObj() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.props.currentId).then(res => {
            if (res.data.paymentTerms) {
                res.data.paymentTerms = this.state.terms.find(g => g.value === res.data.paymentTerms).label;
            }
            this.setState({ newObj: res.data,
            loading:false
            });
            if (res.data.locationType !== 'I') {
                if (!res.data.fssai || !res.data.drugLicense || !res.data.others) {
                    var fileTypes1 = this.state.fileTypes1;
                    if (!res.data.fssai) {
                        fileTypes1[2].noshow = true;
                    }
                    if (!res.data.drugLicense) {
                        fileTypes1[3].noshow = true;
                    }
                    if (!res.data.fssai && !res.data.drugLicense) {
                        fileTypes1[4].noshow = false;
                    }

                    if (!res.data.others) {
                        fileTypes1[5].noshow = true;
                    }
                    this.setState({ fileTypes1 });
                }
            }
            // this.loadSubObjs();
            if (this.props.location.search) {
                let params = queryString.parse(this.props.location.search);
                if (params.branch) {
                    this.toggleTab(1);
                }
            }
        });
    }
    negotiationTraking(){
        axios.get( server_url + context_path + "api/sales-negotiation-tracking?reference.id="+this.props.currentId+"&sort=id,desc&projection=sales-negotiation-tracking").then(res => {
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
    updateStatus = (status) => {
        var statusObj = this.state.obj;
        statusObj.status = status;
        this.setState({ statusObj });
    }
    updateObj() {
        this.setState({ editFlag: true }, () => {
            this.addTemplateRef.updateObj(this.props.currentId);
        })
    }
    loadObj(id) {
        axios.get(Const.server_url + Const.context_path + "api/sales-quotation?enquiry.id=" + id + '&projection=sales_quotation_edit').then(res => {
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];
            if(list.length) {
                this.setState({ obj: list[0], currentId: list[0].id });
            }
        });
    }
    updateSaleProdStatus = (e,saleProd) => {
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
                axios.patch(Const.server_url + Const.context_path + "api/sales-products/"+saleProd.id,{id:saleProd.id,status:e.target.value})
                .then(res => {this.loadObj(this.props.currentId)});
            }
        });
    }
    getSaleProdStatus = (saleProd) => {
        let ngt = this.state.ngTracking;
        if((ngt.length < 1 && saleProd.status === null) ||
        (ngt.length > 0 && !ngt.some(p => p.product.id === saleProd.product.id) && saleProd.status === null)){
            return this.props.user.role !== 'ROLE_ADMIN'?null:<FormControl>
            <InputLabel >Status</InputLabel>
            <Select
                name="saleProdStatus"
                onChange={e => this.updateSaleProdStatus(e,saleProd)}
            >
                {this.state.saleProdStatus.map((e, keyIndex) => {
                    return (<MenuItem key={keyIndex} value={e.value}> {e.label} </MenuItem>)
                })}
            </Select>
            </FormControl>;
        }
        else{
            return saleProd.status === null?<span className="badge badge-secondary">Pending</span>:
            saleProd.status === 'Rejected'?<span className="badge badge-danger">{saleProd.status}</span>:
            <span className="badge badge-success">{saleProd.status}</span>;
        }
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.props.onRef(this);
        this.setState({
            selectedStatus: this.props.status,
            // statusNotes: this.props.statusNotes
        })
        this.loadObj(this.props.currentId);
        this.props.onRef(this);
        this.negotiationTraking();
        
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
    saveSuccess(id) {
        this.setState({ editFlag: false });
        this.loadObj(this.props.currentId);
    }
    cancelSave = () => {
        this.setState({ editFlag: false });
    }
    sendEmail = () => {
        if(this.state.ngTracking.findIndex(ngt => ngt.salesProduct.status === 'Approved')===-1){
            swal("Products not Approved!", 'Please get admin approval', "error");
        }
        else{
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

    cartEdit= () => {
        this.setState({modalproduct1: false});
    }

    cartEdit1 = () =>{
        this.setState({modalproduct1:!this.state.modalproduct1 });
    }

    render() { 
        const errors = this.state.formWizard.errors;
        const readOnly=this.state.readOnly;  
        return (
            <div>  
                <Modal isOpen={this.state.modalproduct1} backdrop="static" toggle={this.cartEdit} size={'md'}>
                    <ModalHeader toggle={this.cartEdit}>
                      <h3>Approved Products</h3>
                    </ModalHeader>
                    <ModalBody>
                        <div className="row">
                            <div className="col-sm-12">
                                <Table  hover responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Quantity</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {this.state?.obj?.enquiry?.products ? this.state.obj.enquiry.products.map((product,i) => {
                                        if(product.status === 'Approved'){
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
                                                    <td>{this.getSaleProdStatus(product)}</td>
                                                </tr> 
                                            )
                                        }
                                        else{ return null;  }
                                    }):null}
                                    </tbody>
                                </Table>
                                {this.state?.obj?.enquiry?.products ?this.state.obj.enquiry.products.some(prod => prod.status === 'Approved') &&
                                    <div style={{ textAlign: 'center',}} >
                                        <Button  variant="contained" color="primary" size="small" onClick={this.props.convertOrder}>Convert To Order</Button>
                                    </div>
                                :null}
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
               <Modal isOpen={this.state.modalproduct} backdrop="static" toggle={this.closetoggleModalProduct} size={'md'}>
                    <ModalHeader toggle={this.closetoggleModalProduct}>
                        Convert To Order
                    </ModalHeader>
                    <ModalBody>
                        <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">
                            <div className="row">
                                <div className="col-md-12 ">
                                    <div className="row" >
                                        <div className="col-md-5">
                                        Company Name
                                        </div>
                                        <div className="col-md-6">
                                        <span>{this.state.newObj.name}</span> 
                                        </div>
                                    </div>
                                    <div className="row" >
                                        <div className="col-md-5"  style={{marginTop: 20}}  >
                                        Status
                                        </div>
                                        <div className="col-md-6">
                                        <FormControl>
                                            <InputLabel> Status</InputLabel>
                                            <Select>
                                                <MenuItem value={0} >Open</MenuItem>
                                                <MenuItem value={10}>Pending</MenuItem>
                                                <MenuItem value={20}>Accepted</MenuItem>
                                                <MenuItem value={30}>Rejected</MenuItem>
                                            </Select>
                                        </FormControl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                        <div className="text-center">
                        {/* onClick={e => this.addProduct()} */}
                            <Button variant="contained" color="primary">Submit</Button>
                        </div>
                    </ModalBody>
                </Modal>
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-12">
                            {/* <Upload onRef={ref => (this.uploadRef = ref)} fileFrom={this.props.baseUrl + '-quotation'} 
                            currentId={this.props.currentId} fileTypes={[{label: 'Attachment', expiryDate: true }]}></Upload> */}
                            {this.state.obj &&
                            <div className="card b">
                                <div className="card-header">
                                    <div className="">
                                        <div className="row">
                                            <div className="col-sm-10">
                                                <table>
                                                    <tbody>
                                                        <tr style={{marginTop: 70, marginLeft: 10}}>
                                                            {/* <td style={{backgroundColor:'rgba(0, 0, 0, 0.04);'}}>
                                                                <span ><ArrowDropDownIcon/></span>
                                                            </td> */}
                                                        <span  style={{ marginLeft: 20,fontSize: 12}} className={Const.getStatusBadge(this.state.obj.status?this.state.obj.status:'Pending', this.state.status)}>{this.state.obj.status?this.state.obj.status:'Pending'}</span> 
                                                        {/* <span  style={{ marginLeft: 20,fontSize: 12}} className={Const.getStatusBadge(this.state.obj.status?this.state.obj.status:'Pending', this.state.status)}>{this.state.obj.status?this.state.obj.status:'Pending'}</span> */}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                 {(this.props.user.role === 'ROLE_ADMIN'  && 
                                                 <QuoteStatus onRef={ref => (this.statusRef = ref)} baseUrl={this.state.baseUrl} currentId={this.props.currentId}
                                                    projection="sales_quotation_edit"
                                                    showNotes={true}
                                                    onUpdate={(id) => this.updateStatus(id)}
                                                    color="primary"
                                                    statusList={this.state.status}  status={this.state.statusObj}
                                                    statusType="Enquiry">
                                                </QuoteStatus>)} 
                                            {/* {(this.props.user.role === 'ROLE_ADMIN' || readOnly || (this.props.user.permissions.indexOf("MG_AC") >= 0)) &&
                                                <FormControl>
                                                   
                                                    <Select name="status" style={{width:"0px"}} label="Status" value={this.state.formWizard.obj.status}
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
                                                <span  style={{ marginLeft: 20,fontSize: 12}} className={Const.getStatusBadge(this.state.obj.status?this.state.obj.status:'Pending', this.state.status)}>{this.state.obj.status?this.state.obj.status:'Pending'}</span> */}
                                            </div>
                                            <div className="col-sm-2"  >
                                                <buttonGroup>
                                                {(this.props.user.role === 'ROLE_ADMIN' && 
                                                <button disabled={this.state.obj.status === 'Approved' || this.state.obj.status === null || this.state.obj.status === 'Email Sent' }
                                                    style={{ backgroundColor: "#2b3db6", border: "1px solid #2b3db6 ", borderRadius: "5px" }}
                                                    color="primary" variant="contained" onClick={() => this.updateObj()}>
                                                    <EditIcon style={{ color: '#fff', }} fontSize="small" /></button>)}
                                                    <button style={{ backgroundColor: "#2b3db6", border:"1px solid  #2b3db6",borderRadius:"5px" }} color="primary" variant="outlined" onClick={() => this.sendEmail()} ><EmailIcon  style={{ color: '#fff', }} fontSize="small" /></button>
                                                    <button onClick={()=>this.cartEdit1()}  style={{ backgroundColor: "#2b3db6", border:"1px solid #2b3db6",borderRadius:"5px"}} color="primary" variant="contained"> <ShoppingCartIcon   style={{ color: '#fff', }} fontSize="small"/></button>
                                                </buttonGroup>
                                                   
                                             </div>
      
                                            {/* <div className="col-sm-1">                                  
                                                    <Button  style={{marginLeft: 27  }} fontSize="small" variant="contained" title="Edit"  onClick={() => this.updateObj()}>
                                                        <EditIcon style={{color: "#000",  }} fontSize="small"/>
                                                    </Button>    
                                            </div>
                                                <div className="col-sm-1" >                   
                                            
                                                <Button  variant="contained" style={{marginLeft: 15  }} fontSize="small"  title=" SendEmail " onClick={() => this.sendEmail()}><EmailIcon style={{ color: '#000' }} fontSize="small" /> </Button>
                                              
                                                </div>
                                                <div className="col-sm-1">
                                              <Button  variant="contained" fontSize="small" title="Convert order" > <AssignmentSharpIcon style={{ color: '#000', }} fontSize="small" /> </Button>                       
                                                </div> */}
                                        </div>
                                        {/* {this.props.parentObj.products.map((product, i) => {
                                            return (
                                                <Button key={i} variant="contained" color="primary" size="sm" onClick={() => this.sendEmail(i)}><EmailIcon fontSize="small"style={{color:'#fff'}}></EmailIcon> </Button>     
                                                )
                                            })
                                        }  */}
                                    {/* onClick={e => this.closetoggleModalProduct()} */}
                                          </div>
                                          <div className=" mt-2" style={{right: 1}}></div>
                                    <h4 className="my-2">
                                        <span>{this.state.obj.name}</span>
                                    </h4>
                                </div>
                                <div className="row  card-body bb bt">
                                    <table className="col-sm-7 table">
                                        <tbody>
                                            <tr>
                                                <td><strong>Code</strong></td>
                                                <td>{this.state.obj.code}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Company</strong></td>
                                                <td>
                                                    <Link to={`/companies/${this.state.obj.company.id}`}>
                                                        {this.state.obj.company.name}
                                                    </Link>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><strong>Specification</strong></td>
                                                <td>{this.state.obj.specification?this.state.obj.specification:'-NA-'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Make</strong></td>
                                                <td>{this.state.obj.make?this.state.obj.make:'-NA-'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Payment Terms</strong></td>
                                                <td>{this.state.obj.terms}</td>
                                            </tr>
                                           {/* <tr>
                                                <td><strong>Transportation Charger</strong></td>
                                                <td>{this.state.obj.transportationCharges}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Packing</strong></td>
                                                <td>{this.state.obj.packing}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Delivery Period</strong></td>
                                                <td>{this.state.obj.deliveryPeriod} days</td>
                                            </tr>*/}
                                             <tr>
                                                <td><strong>GST</strong></td>
                                                <td>{this.state.obj.gst}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Valid Till</strong></td>
                                                <td><Moment format="DD MMM YY">{this.state.obj.validTill}</Moment></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </div>
                                    <Divider />
                                    <div className=" row text-left mt-4">
                                        <div className="col-sm-12" >
                                            <h4 style={{fontSize: 18,flexDirection: 'row',marginLeft: 12}}>Products </h4>
                                        </div>
                                    </div>
                                    <Divider />
                                    <Divider />
                                    <div className="row">
                                        <div className="col-sm-12">
                                        <Table  hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Quantity</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    {/* <th>Actions</th> */}
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
                                                        <td>{this.getSaleProdStatus(product)}</td>
                                                        {/* <td>
                                                            <Button variant="contained" color="primary" size="sm" onClick={() => this.sendEmail(i)}><EmailIcon fontSize="small"style={{color:'#fff'}}></EmailIcon> </Button>
                                                        </td> */}
                                                    </tr>)
                                                })}
                                            </tbody>}
                                        </Table>
                                    </div>
                                </div>
                            </div>}
                            {/* {!this.state.obj &&
                            <div className="text-center">
                                {this.props.user.permissions.indexOf(Const.MG_SE_E) >=0 && <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Generate Quotation</Button>}
                            </div>} */}
                        </div>
                    </div>}
                {this.state.editFlag &&
                    <div className="card b">
                        <div className="card-body bb bt">
                            <AddQuotation baseUrl={this.state.baseUrl} saleId={this.props.currentId} currentId={this.state.currentId} parentObj={this.props.parentObj}
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