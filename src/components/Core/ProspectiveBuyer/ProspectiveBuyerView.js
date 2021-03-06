import React, { Component } from 'react';
// import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
// import swal from 'sweetalert';
import axios from 'axios';
import swal from 'sweetalert';
import Chip from '@material-ui/core/Chip';
import EmailIcon from '@material-ui/icons/Email';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import moment from 'moment/moment.js';
// import Moment from 'react-moment';
// import { Link } from 'react-router-dom';
// import { Table } from 'reactstrap';
// import PageLoader from '../../Common/PageLoader';
// import { Row, Col, Modal,
//     ModalHeader,
//     ModalBody } from 'reactstrap';
// import Sorter from '../../Common/Sorter';
import Followups from '../Followups/Followups';
import Quotation from './Quotation'
import Negotiation from './Negotiation'
import Approval from '../Approvals/Approval';
import AssignmentSharpIcon from '@material-ui/icons/AssignmentSharp';
// import CustomPagination from '../../Common/CustomPagination';
import EditIcon from '@material-ui/icons/Edit';
import * as Const from '../../Common/constants';
import { server_url, context_path, defaultDateFilter } from '../../Common/constants';
import { Button,  Tab, Tabs, AppBar,FormControl,TextField} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import { mockActivity } from '../../Timeline';
import { ActivityStream } from '../../Timeline';
import { Modal, ModalBody, ModalHeader} from 'reactstrap';
import UOM from '../Common/UOM';
import AutoSuggest from '../../Common/AutoSuggest';

import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
import TabPanel from '../../Common/TabPanel';
//import Add from './Add';
import ProspectiveBuyerAdd from './ProspectiveBuyerAdd'
// import Upload from '../Common/Upload';
// import AddSub from './AddSub';

// const json2csv = require('json2csv').parse;


class ProspectiveBuyerView extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        editSubFlag: false,
        modal: false,
        obj: '',
        productsUrl: server_url + context_path + "api/buyer-product/",
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
        fileTypes: []
    }
    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    editInventory = (i) => {
        var prod = this.state.obj.products[i];
        this.setState({ editSubFlag: true, currentProdId: prod.id, currentProd: prod }, this.toggleModal);
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
//  prospectiveProduct(id) {
//      console.log("test", server_url + context_path + "api/buyer-product?projection=buyer_product")
//         axios.get(server_url + context_path + "api/buyer-product?projection=buyer_product&buyer="+id)
//         .then(res => {
//             console.log("order user response",res);
//             this.setState({
//                 products:res?.data?._embedded[Object.keys(res?.data?._embedded)[0]],
//                 loading:false
//              },()=>{console.log("after setting state is",this.state)});

//         });
//     }

    handleGenerateQuote(){
        swal({
            title: "Are you sure?",
            text: "You are going to generate quotation!",
            icon: "info",
            dangerMode: false,
            button: {
                text: "Yes, Generate!",
                closeModal: true,
            }
        }).then(generate => {
            if(generate){
                this.setState({ loading: true });
                axios.get(Const.server_url+Const.context_path+'api/companies/'+this.state.obj.company.id).then(compRes => {
                    console.log("company response",compRes);
                        var newObj = {
                        code: Const.getUniqueCode('SQ'),
                        company: "/companies/"+compRes.data.id,
                        specification: '',
                        make: '',
                        packing: '',
                        gst: '',
                        amount: '',
                        transportationCharges: '',
                        terms: compRes.data.paymentTerms,
                        deliveryPeriod: '',
                        validity: '',
                        enquiry: '/sales/'+this.state.obj.id,
                        validTill: moment(new Date()).add(5,'days').format(),
                        selectedProduct: '',
                        selectedCompany: '',
                        products: ''
                    };
                    axios.post(Const.server_url + Const.context_path + "api/sales-quotation", newObj).then(res =>{
                        this.setState({ loading: false });
                        this.toggleTab(1);
                    }).finally(() => {
                        this.setState({ loading: false });
                    }).catch(err => {
                        this.setState({ loading: false });
                        swal("Generate Quotation Error!", "Unable to Generate Quotation!", "error");
                    });
                }).finally(()=>{
                    this.setState({ loading: false });
                }).catch(err =>{
                    this.setState({ loading: false });
                    swal("Company Not found!", "Unable to find the selected Company", "error");
                });
            }
        }) 
    }
    loadAssignedUsers(id){
        axios.get(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "-products?projection=" +
            this.props.baseUrl + "-products&reference=" + id).then(res => {
            this.setState({
                products: res.data._embedded[Object.keys(res.data._embedded)[0]],
                page: res.data.page,
                loading: false
            });
        });
    }
    loadSubObjs(offset, callBack) {
        if (!offset) offset = 1;
        var url = server_url + context_path + "api/branches?projection=branch_details&page=" + (offset - 1);
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
        });
    }
    loadObj(id) {
        console.log("load obj called",id);
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + id+ '?projection=prospective_buyer_edit' )
        .then(res => {
            this.setState({ obj: res.data });
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        // this.prospectiveProduct(this.props.currentId);
        this.loadObj(this.props.currentId);
        this.props.onRef(this);
    }

    updateObj() {
        this.setState({ editFlag: true }, () => {
            this.addTemplateRef.updateObj(this.props.currentId);
        })
    }

    saveSuccess(id) {
        this.setState({ editFlag: false },this.loadObj(this.props.currentId));
    }

    cancelSave = () => {
        this.setState({ editFlag: false });
    }


    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }

    addSubObj = () => {
        this.setState({ editSubFlag: false });

        this.toggleModal();
    }

    editSubObj = (i) => {
        var obj = this.state.subObjs[i].id;

        this.setState({ editSubFlag: true, subId: obj }, this.toggleModal);
    }

    saveObjSuccess(id) {
        this.setState({ editSubFlag: true });
        this.toggleModal();
        this.loadSubObjs();
    }

    render() {
        return (
            <div>
                <Modal isOpen={this.state.modalnegatation} backdrop="static" toggle={this.toggleModalNegotation} size={'lg'}>
                    <ModalHeader toggle={this.toggleModalNegotation}>
                        Negotation Products
                    </ModalHeader>
                    <ModalBody>
                        {this.state.obj.products && this.state.obj.products.length > 0 &&
                            <div className="row">
                                <div className="col-md-12">
                                    <Table hover responsive>
                                        <tbody>
                                            {this.state.obj.products.map((prod, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td className="va-middle">{i + 1}</td>
                                                        <td className="va-middle">
                                                            <fieldset>
                                                                <FormControl>
                                                                    {prod.id &&
                                                                        <Link to={`/products/${prod.product.id}`}>
                                                                            {prod.product.name}
                                                                        </Link>
                                                                    }
                                                                    {!prod.id &&
                                                                        <AutoSuggest url="products"
                                                                            name="productName"
                                                                            fullWidth={true}
                                                                            displayColumns="name"
                                                                            label="Product"
                                                                            placeholder="Search product by name"
                                                                            arrayName="products"
                                                                            // helperText={errors?.productName_auto_suggest?.length > 0 ? errors?.productName_auto_suggest[i]?.msg : ""}
                                                                            // error={errors?.productName_auto_suggest?.length > 0}
                                                                            inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                                            onRef={ref => (this.productASRef[i] = ref)}

                                                                            projection="product_auto_suggest"
                                                                            value={this.state.formWizard.selectedProducts[i]}
                                                                            onSelect={e => this.setProductAutoSuggest(i, e?.id)}
                                                                            queryString="&name" ></AutoSuggest>}
                                                                </FormControl>
                                                            </fieldset>
                                                        </td>
                                                        <td>
                                                            <fieldset>

                                                                <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                                    // error={errors?.quantity?.length > 0}
                                                                    value={this.state.obj.products[i].quantity} onChange={e => this.setProductField(i, "quantity", e)} />
                                                            </fieldset>
                                                        </td>
                                                        <td>
                                                            <fieldset>

                                                                <UOM required={true} isReadOnly={false}
                                                                    value={this.state.obj.products[i].uom} onChange={e => this.setProductField(i, "uom", e, true)} />
                                                            </fieldset>
                                                        </td>
                                                        <td>
                                                            <fieldset>
                                                                <TextField type="number" name="amount" label="Amount" required={true}
                                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                    // helperText={errors?.amount?.length > 0 ? errors?.amount[i]?.msg : ""}
                                                                    // error={errors?.amount?.length > 0}
                                                                    value={this.state.obj.products[i].amount} onChange={e => this.setProductField(i, "amount", e)} />
                                                            </fieldset>
                                                        </td>
                                                        <td className="va-middle">
                                                            {/* <Button variant="outlined" color="secondary" size="sm" onClick={e => this.deleteProduct(i)} title="Delete Product">
                                                                <em className="fas fa-trash"></em>
                                                            </Button> */}
                                                        </td>
                                                    </tr>)
                                            })}
                                        </tbody>
                                    </Table>
                               
                                </div>
                            </div>
                        }
                        <div className="text-center">
                            <Button variant="contained" color="primary" >Save</Button>
                        </div>
                    </ModalBody>
                </Modal>
                <div className="content-heading">Buyer</div>
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-12">
                            <AppBar position="static">
                                <Tabs
                                    className="bg-white"
                                    indicatorColor="primary"
                                    textColor="primary"
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    aria-label="scrollable auto tabs example"
                                    value={this.state.activeTab}
                                    onChange={(e, i) => this.toggleTab(i)} >
                                    {/* <Tab label="Details" /> */}
                                    {/* <Tab label="Quotation" />
                                    <Tab label="Negotiation" />
                                    <Tab label="Followups" />
                                    <Tab label="Approvals" /> */}
                                    {/* <Tab label="Inventory & Docs" />
                                   <Tab label="Pharma Documents" />
                                    <Tab label="Food Documents" />*/}
                                </Tabs>
                            </AppBar>
                            {
                            // this.state.obj &&
                            <TabPanel value={this.state.activeTab} index={0}>
                                {this.state.obj &&
                                <div>
                                   
                                    <div className="row">
                                     <div className="col-sm-10">
                                     <div className="card b">
                                   

                                      <div className="card-body bb bt">
                                            <div className="card-header">
                                                      <div className="row">
                                                          <div className="col-sm-11">
                                                             {/* <button style={{ backgroundColor: "#2b3db6", border:"1px solid  #2b3db6" }}  > <span style={{fontSize: 11, textTransform : "none", color:"#fff"}}>Status</span></button> */}
                                                          </div>
                                                          <div className="col-sm-1" >
                                                          {(this.props.user.role === 'ROLE_ADMIN' && this.props.user.permissions.indexOf(Const.MG_SE_E) >= 0) &&   
                                                           <button style={{ backgroundColor: "#2b3db6", border:"1px solid #2b3db6", borderRadius:"5px"}} color="primary" variant="contained" onClick={() => this.updateObj()}> <EditIcon  style={{ color: '#fff', }} fontSize="small" /></button>}
                                                        {/* <button style={{ backgroundColor: "#2b3db6", border:"1px solid #2b3db6",borderRadius:"5px" }} color="primary" variant="outlined" onClick={() => this.sendEmail()} ><EmailIcon  style={{ color: '#fff', }} fontSize="small" /></button> */}
                                                           {/* {this.state.isQuoteExists < 1 ? */}
                                                             {/* <button  style={{ backgroundColor: "#2b3db6", border:"1px solid #2b3db6", borderRadius:"5px"}}   title=" Generate Quotation"  onClick={() => this.handleGenerateQuote()} > <img style={{width: "20px", height: "20px", color:"#fff" }} src="img/quotei.png" /></button> */}
                                                         {/* :'' } */}
                                                              </div>                                                            
                                            </div>
                                        </div>
                                          <table className="table">
                                              <tbody>
                                                  <tr>
                                                      <td>
                                                          <strong>Name</strong>
                                                      </td>
                                                      <td>{this.state.obj.name}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>Company Name</strong>
                                                      </td>
                                                      <td>{this.state.obj.companyName}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>Types of Company</strong>
                                                      </td>
                                                      <td>{this.state.obj.typeOfCompany}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>Department</strong>
                                                      </td>
                                                      <td>{this.state.obj.department }</td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>Designation</strong>
                                                      </td>
                                                      <td>{this.state.obj.designation}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>State</strong>
                                                      </td>
                                                      <td>{this.state.obj.state}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>City</strong>
                                                      </td>
                                                      <td>{this.state.obj.city}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>Email</strong>
                                                      </td>
                                                      <td>{this.state.obj.email}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>Phone</strong>
                                                      </td>
                                                      <td>{this.state.obj.phone}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>Products Interested</strong>
                                                      </td>
                                                      <td>  
                                                      {this.state.obj.buyerProduct.map((obj, i) => {
                                                                        return (
                                                                            <Chip
                                                                               style={{color: "#000",backgroundColor: "#eee342", marginLeft: "5px"}}

                                                                                avatar={
                                                                                    // <Avatar>
                                                                                        {/* <AssignmentIndIcon /> */}
                                                                                    // </Avatar>
                                                                                }
                                                                                label=  {obj.product.name}
                                                                              
                                                                           />
                                                                        )
                                                                    })} 
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <strong>Other</strong>
                                                      </td>
                                                      <td>{this.state.obj.other}</td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          <Divider />
                                          <div className="mt-2">
                                        <h4 style={{fontSize: 16}}>Contact Details</h4>
                                    </div>
                                    <Divider />
                                    <table className="table">
                                        <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Phone</th>
                                                    <th>Email</th>
                                                </tr>
                                            </thead>
                                    {this.state.obj.contact.map((cnt,i) =>{
                                      return(
                   
                                              <tbody>
                                                  <tr>
                                                      <td>{i+1}</td>
                                                      <td>
                                                          {cnt.name?cnt.name:"-NA-"}
                                                      </td>
                                                      <td>{cnt.phone?cnt.phone:"-NA-" }</td>
                                                      <td>{cnt.email?cnt.phone:"-NA-"}</td>
                                                  </tr>
                                                 
                                                 
                                              </tbody>
                                         
                                    )})}
                                     </table>
                                            <Divider />
                                          <div className="mt-2">
                                        <h4 style={{fontSize: 16}}>Products</h4>
                                    </div>
                                          <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                      <tbody>
                                      {                    
                                            <tr>
                                                <td className="va-middle"></td>
                                                <td>             </td>
                                                <td></td>
                                                <td></td>
                                                <td><Button variant="contained" color="warning" size="xs" onClick={() => this.editInventory()}>Inventory & Docs</Button> </td>
                                            </tr>
                                                            }
                                      </tbody>
                                    </Table>
                               
                                      </div>
                                  </div>
                                     </div>
                                     {
                                            // this.props.user.role === 'ROLE_ADMIN' &&
                                            // <div className="col-md-4" >
                                            //     <Assign onRef={ref => (this.assignRef = ref)} baseUrl={this.props.baseUrl}
                                            //         parentObj={this.state.obj} currentId={this.props.currentId}></Assign> 
                                            //      <Timeline
                                            //         title='Period ending 2017'
                                            //         timeline={mockTimeline}
                                            //     />
                                            //     <ActivityStream
                                            //         style={{marginLeft: 400,}}
                                            //         title="Activity"
                                            //         stream={mockActivity}
                                             
                                                   
                                            //     />
                                            // </div>
                                            }
                                    </div>
                                </div>}
                            </TabPanel>}
                            <TabPanel value={this.state.activeTab} index={1}>
                                <Quotation baseUrl={this.props.baseUrl} onRef={ref => (this.quotationTemplateRef = ref)} 
                                currentId={this.props.currentId} parentObj={this.state.obj}></Quotation>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={2}>
                                <Negotiation baseUrl={this.props.baseUrl} onRef={ref => (this.quotationTemplateRef = ref)} 
                                currentId={this.props.currentId} parentObj={this.state.obj}></Negotiation>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={3}>
                                <Followups repository={this.props.baseUrl} reference={this.state.obj.id} onRef={ref => (this.followupsTemplateRef = ref)} readOnly={this.state.obj.status ==='Converted'}></Followups> 
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={4}>
                                <Approval repository={this.props.baseUrl} reference={this.state.obj.id} onRef={ref => (this.followupsTemplateRef = ref)} readOnly={this.state.obj.status ==='Converted'}></Approval> 
                            </TabPanel>
                        </div>
                    </div>}
                {this.state.editFlag &&
                    <div className="card b">
                        <div className="card-body bb bt">
                            <ProspectiveBuyerAdd baseUrl={this.props.baseUrl} onRef={ref => (this.addTemplateRef = ref)}
                                onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}></ProspectiveBuyerAdd>
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
)(ProspectiveBuyerView);