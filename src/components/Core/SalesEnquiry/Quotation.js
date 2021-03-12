import { Button, FormControl, InputLabel, MenuItem, Select, TextField  } from '@material-ui/core';
import axios from 'axios';
import queryString from 'query-string';
import { context_path, defaultDateFilter, server_url } from '../../Common/constants';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Status from '../Common/Status';
import { Table } from 'reactstrap';
import swal from 'sweetalert';
import * as Const from '../../Common/constants';
import AddQuotation from './AddQuotation';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import EmailIcon from '@material-ui/icons/Email';
import Divider from '@material-ui/core/Divider';
import EditLocationRoundedIcon from '@material-ui/icons/EditLocationRounded';
import AssignmentSharpIcon from '@material-ui/icons/AssignmentSharp';
import {
    Form, Modal,
    ModalBody, ModalHeader,
} from 'reactstrap';
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
        ngTracking : [],
        obj: '',
        newObj: '',
        baseUrl: 'sales-quotation',
        currentId: '',
        selectedStatus: '',
        error: {},
        selectedStatus: '',
        statusNotes:'',
        status: [
            { label: 'Approved', value: 'Approved', badge: 'success'},
            { label: 'Rejected', value: 'Rejected', badge: 'danger'},
            { label: 'Pending', value: 'Pending', badge: 'secondary'},
            { label: 'Email Sent', value: 'Email Sent', badge: 'info'}
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
            }, ()=>console.log("negotiationTraking second if setstate data", this.state.ngTracking, "current id", this.props.currentId));
            }else{
                
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
        var obj = this.state.obj;
        obj.status = status;
        this.setState({ obj });
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
    loadObj(id) {
        console.log("QUotation.js loadObj function")
        axios.get(Const.server_url + Const.context_path + "api/sales-quotation?enquiry.id=" + id + '&projection=sales_quotation_edit').then(res => {
            console.log("Quotation.js", list)
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];
            console.log("Quotation.js", list)
            if(list.length) {
                this.setState({ obj: list[0], currentId: list[0].id });
                console.log("setState")
            }
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.props.onRef(this);
        this.setState({
            selectedStatus: this.props.status,
            statusNotes: this.props.statusNotes
        })
        // console.log('quotation component did mount');
        console.log("componentDidMount", this.props.currentId);
        this.loadObj(this.props.currentId);
        this.props.onRef(this);
        this.negotiationTraking();
        
    }
    updateObj() {
        console.log("updateObj in Quotation.js")
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
    render() {   
        return (
            <div>  
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
                                        <FormControl    >
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
                            <Button variant="contained" color="primary" >Submit</Button>
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
                                            <div className="col-sm-9">
                                                <span  style={{ marginLeft: 20,fontSize: 12}} className={Const.getStatusBadge(this.state.obj.status?this.state.obj.status:'Pending', this.state.status)}>{this.state.obj.status?this.state.obj.status:'Pending'}</span>
                                            </div>
                                            <div className="col-sm-1">
                                                <span title="Edit"  onClick={() => this.updateObj()}>
                                                    <Avatar style={{left: 100}} size='extrasmall' fontSize="small">
                                                        <EditIcon style={{color: "#000",  }} size="extrasmall"  fontSize="small" />
                                                    </Avatar>    
                                                </span>
                                            </div>
                                                <div className="col-sm-1" style={{left: 60}}>                   
                                                <span  title=" SendEmail " onClick={() => this.sendEmail()}> 
                                                <Avatar fontSize="small">  <EmailIcon style={{ color: '#000' }} color="primary" size="small" fontSize="small" /> </Avatar>
                                                </span>
                                                </div>
                                                <div className="col-sm-1">
                                                <span title="Convert order"  color="#3f51b5"  > <Avatar  style={{left: 20}} fontSize="small"> <AssignmentSharpIcon style={{ color: '#000', }} size="small"  fontSize="small" /> </Avatar></span>                        
                                                </div>
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
                                                <td>{this.state.obj.specification}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Makes</strong></td>
                                                <td>{this.state.obj.make}</td>
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
                                                <td><Moment format="DD MMM YY">{this.state.obj.valiTill}</Moment></td>
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
                                            {this.state.obj.products &&
                                            <tbody>
                                            {this.props.parentObj.products.map((product, i) => {
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

                                                        {this.state.ngTracking.map((ng) => {
                                                        return (<div>
                                                            {product.product.id===ng.product.id && <div>
                                                       <td>
                                                       {ng.status===null ? <div>
                                                        <span className="badge badge-secondary">Pending</span></div> :<div>
                                                            {product.status === 'Rejected' ? <div>
                                                            <span className="badge badge-danger">{product.status}</span></div>:<div>
                                                            <span className="badge badge-success">{product.status}</span></div>
                                                    }
                                                    </div>
                                                    }                                                  
                                                    </td>
                                                    </div>}</div>)})}
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