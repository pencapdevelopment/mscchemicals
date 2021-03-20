import React, { Component } from 'react';
// import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
// import swal from 'sweetalert';
import axios from 'axios';
// import Moment from 'react-moment';
import { Link } from 'react-router-dom';
// import PageLoader from '../../Common/PageLoader';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Moment from 'react-moment';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import { Table } from 'reactstrap';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import {
     Modal,
    ModalHeader,
    ModalBody
} from 'reactstrap';

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
import AddInventory from './AddInventory';
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
// const json2csv = require('json2csv').parse;

class View extends Component {
    state = {
        loading:false,
        activeTab: 0,
        editFlag: false,
        editSubFlag: false,
        modal1: false,
        modal2: false,
        modal: false,
        modalSales: false,
        modalDocs: false,
        obj: '',
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
        purchaseFiles:[  {label: 'COA', expiryDate: false },
        {label: 'Sales COA', expiryDate: false }],
        shippingFileTypes: [ 
            {label: 'Commercial Invoice', expiryDate: false },
            {label: 'Packing Slip', expiryDate: false },
            {label: 'COA', expiryDate: false },
            {label: 'Certificate of Origin', expiryDate: false },
            {label: 'Insurance Copy', expiryDate: false },
            {label: 'Bill of lading', expiryDate: false },
            {label: 'Manufacture declaration', expiryDate: false },
        ],
        bankingFileTypes: [
            {label: 'Commercial Invoice', expiryDate: false },
            {label: 'Packing Slip', expiryDate: false },
            {label: 'Bill of Lading', expiryDate: false },
            {label: 'Direct Remittance request', expiryDate: false },
            {label: 'Declaration Cum identity', expiryDate: false },
            {label: 'Advance Remittance request', expiryDate: false },
            {label: 'PDC', expiryDate: false },
        ]
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



    loadObj(id) {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + id + '?projection=order_edit').then(res => {
            this.setState({ 
                obj: res.data,
                loading:false
             });

        });
    }
    orderUser(id) {
        axios.get(server_url + context_path + "api/"+this.props.baseUrl+"-user?reference.id="+id+"&projection=orders-user")
        .then(res => {
            console.log("order user response",res);
            this.setState({
                users:res?.data?._embedded[Object.keys(res?.data?._embedded)[0]],
                loading:false
             },()=>{console.log("after setting state is",this.state)});

        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        if(this.props.user.role === 'ROLE_ACCOUNTS'||this.props.user.role === 'ROLE_INVENTORY'){
            this.toggleTab(1);
        }
        console.log('view component did mount');
        console.log(this.props.currentId);
        this.orderUser(this.props.currentId);
        this.loadObj(this.props.currentId);
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
        this.setState({
            modalDocs: !this.state.modalDocs
        });
    }
    toggleModalSales = () => {
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

    render() {
        return (
            <div>
                 {this.state.loading && <PageLoader />}
                <div className="content-heading">Order</div>
                <Modal isOpen={this.state.modal} backdrop="static" toggle={this.toggleModal} size={'lg'}>
                            <ModalHeader toggle={this.toggleModal}>
                                 Add inventory - {this.state.currentProd.product?.name}
                            </ModalHeader>
                            <ModalBody>
                                 <AddInventory orderProduct={this.state.currentProd} orderStatus={this.state.obj.status} orderType={this.state.obj.type} orderId={this.state.obj.id} onRef={ref => (this.addInventoryRef = ref)} onCancel={e=> this.toggleModal(e)} baseUrl='product-flow'></AddInventory>
                            </ModalBody>
                        </Modal>
                        <Modal isOpen={this.state.modalSales} backdrop="static" toggle={this.toggleModalSales} size={'lg'}>
                            <ModalHeader toggle={this.toggleModal}>
                                 Add inventory - {this.state.currentProd.product?.name}
                            </ModalHeader>
                            <ModalBody>
                                 <SalesInventory orderProduct={this.state.currentProd} orderStatus={this.state.obj.status} orderType={this.state.obj.type} orderId={this.state.obj.id} onRef={ref => (this.addInventoryRef = ref)} onCancel={e=> this.toggleModalSales()} baseUrl='product-flow'></SalesInventory>
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
                                  {(this.props.user.role !== 'ROLE_ACCOUNTS'&& this.props.user.role !== 'ROLE_INVENTORY'&& 
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
                            {this.state.obj &&  
                            (this.state.obj.type === "Sales" ? 
                            <TabPanel value={this.state.activeTab} index={0}>
                             
                                  
                                        <div className="card b">
                                        <div className="card-header">
                                     
                                        <div className=" mt-2">
                                        <div className="row" >
                                       
                                        <div className="col-sm-2"><button style={{backgroundColor: "#2b3db6", border:"1px solid #2b3db6", borderRadius: 5}} title="status" size="small" variant="contained"><span style={{color:"#fff"}}>Status</span></button></div>
                                            <div className="col-sm-9"></div>
                                            {/* style={{ backgroundColor: "#2b3db6", border:"1px solid " }} */}
                                            {(this.props.user.role !== 'ROLE_ACCOUNTS'&& this.props.user.role !== 'ROLE_INVENTORY' &&
                                   <div className="col-sm-1" ><button style={{backgroundColor: "#2b3db6", border:"1px solid #2b3db6", borderRadius: 5}} variant="contained" size="small"><CloseSharpIcon style={{color:"#fff"}} fontSize="small" /></button></div>
                                   )}
                                           

                                        {/* {this.state.obj.type === 'Sales' && <Button variant="contained" color="warning" size="xs" onClick={() => this.downloadInvoice()}>Download Invoice</Button> }
                                              */}
                                       {/* {this.state.obj.status !=='Completed' &&  <Status onRef={ref => (this.statusRef = ref)} baseUrl={this.props.baseUrl} currentId={this.props.currentId}
                                                onUpdate={(id) => this.updateStatus(id)} statusList={this.state.status} status={this.state.obj.status}
                                                statusType="Order"></Status>} */}

                                        {/* {this.state.obj.status !=='Completed' &&   <Button  style={{}} variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Edit</Button> }
                                       */}
                                        </div>
                                        <h4 className="my-2">
                                            <span>{this.state.obj.name}</span>
                                        </h4>
                              
                                  
                                        </div>
                                     </div>
                                </div>
                                <div className="row">
                            <div className={(this.props.user.role === 'ROLE_ACCOUNTS' || this.props.user.role === 'ROLE_INVENTORY')?"col-sm-10": "col-sm-8 "}>
                                <div className="card b">
                                   <div className="card-header">
                                   {(this.props.user.role === 'ROLE_ACCOUNTS'&&<div>
                                   <table>
                                           <thead>
                                               <tr >
                                                    <th  >Sales rep :</th>
                                                    <th >
                                                    {this.state.users.map((obj, i) => {
                                                                        return (
                                                                            <Chip
                                                                               style={{color: "#000",backgroundColor: "#eee342", marginLeft: "5px"}}

                                                                                avatar={
                                                                                    // <Avatar>
                                                                                        {/* <AssignmentIndIcon /> */}
                                                                                    // </Avatar>
                                                                                }
                                                                                label={ <Link to={`/users/${ obj.user.id}`}>
                                                                                { obj.user.name}
                                                                            </Link>}                                                             
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
                                   </div>)}
                                       
                                   </div>                               
                                           <div className="card-body bb bt" style={{fontSize: 14,}}>
                                   
                                        <div className="row" >
                                            <div className="col-sm-2" style={{marginTop: 15}}>
                                                
                                            Company
                                            </div>
                                            <div className="col-sm-10">
                                    
                                            <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6"  >
                                            <Link to={`/companies/${this.state.obj.company.id}`}>
                                                                    {this.state.obj.company.name}
                                                                </Link>
                                            </Box>
                                            
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-2" style={{marginTop: 15}}>
                                                
                                            Products
                                            </div>
                                            <div className="col-sm-10">     
                                            <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6" >
                                            <Chip size="small" label="product"  bgcolor="#fff"/>
                                                        </Box>                                     
                                               
                                            </div>
                                        </div>
                                         <div className="row"  >
                                             <div className="col-sm-5">
                                                <div className="row">
                                                    <div className="col-sm-5"style={{marginTop: 15}} >                                                
                                                      Po Number
                                                    </div> 
                                                    <div className="col-sm-6" style={{marginLeft: -5}}>                                                                                                           
                                                        <Box width="150%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6" >
                                                        123345
                                                        </Box>
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
                                                        <Box  width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6"  >
                                                             02-03-2021
                                                        </Box>
                                                    </div> 
                                                </div>
                                             </div>
                                   
                                         </div>
                                         <div className="row">
                                             <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-4" style={{marginTop: 15}}>                                                
                                                    Quantity
                                                    </div> 
                                                    <div className="col-sm-6">                                                                                                           
                                                        <Box width="120%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6"  >
                                                        th
                                                        </Box>
                                                    </div> 
                                                </div>
                                             </div>
                                             <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-5" style={{marginTop: 15}}>                                                
                                                    <span style={{marginLeft: 41}}>Price</span>  
                                                    </div> 
                                                    <div className="col-sm-7">                                                                                                           
                                                        <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6" >
                                                        4
                                                        </Box>
                                                    </div> 
                                                </div>
                                             </div>
                                   
                                         </div>
                                         <div className="row">
                                             <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-4" style={{marginTop: 15}}>                                                
                                                        Payterms
                                                    </div> 
                                                    <div className="col-sm-6">                                                                                                           
                                                        <Box width="120%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6"  >
                                                        5990
                                                        </Box>
                                                    </div> 
                                                </div>
                                             </div>
                                             <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-5" style={{marginTop: 15}}>                                                
                                                    <span style={{marginLeft: 41}}>Freight</span> 
                                                    </div> 
                                                    <div className="col-sm-7">                                                                                                           
                                                        <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6"  >
                                                         444
                                                        </Box>
                                                    </div> 
                                                </div>
                                             </div>
                                   
                                         </div>
                                         <div className="row">
                                             <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-4" style={{marginTop: 15}}>                                                
                                                    Transports
                                                    </div> 
                                                    <div className="col-sm-6">                                                                                                           
                                                        <Box width="120%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6"  >
                                                        sddd   Transports
                                                        </Box>
                                                    </div> 
                                                </div>
                                             </div>
                                             <div className="col-sm-6">
                                                <div className="row">
                                                    <div className="col-sm-5" style={{marginTop: 15}} >                                                
                                                    <span style={{marginLeft: 41}}>Instruction</span> 
                                                    </div> 
                                                    <div className="col-sm-7">                                                                                                           
                                                        <Box width="100%" bgcolor="" p={1} my={0.5} border="0.5px solid #dee2e6" >
                                                        intruction
                                                        </Box>
                                                    </div> 
                                                </div>
                                             </div>
                                   
                                         </div>
                                        
                                             
<span  style={{fontSize: 14, margin: "40px"}}></span>
                                  

{(this.props.user.role === 'ROLE_ACCOUNTS'&&<div>
                                    <Divider />
                                        <div className="row" style={{marginTop: 10, marginLeft: 2}}>
                                        <div className="col-sm-3"><Button variant="contained" color="primary" size="xs" >Approve</Button></div>
                                        <div className="col-sm-3"></div>
                                        <div className="col-sm-3"></div>
                                        <div className="col-sm-3"><Button variant="contained" color="primary" size="xs" >Hold</Button></div>
                                        </div>
                                        </div>)}
                                  
                          
                           

                                     {(this.props.user.role === 'ROLE_INVENTORY'&& 
                                     <div>

<Divider />
                         
                   
                                            <div className="row" style={{marginTop: "8px"}}>
                                    <div className="col-sm-12">
                                                 <h4 style={{fontSize: "16px"}}>Invoice Details</h4>                                
                                    </div>
                                </div> 
                                <Divider />
                                <div className="row">
                                    <div className="col-sm-4">
                                        <fieldset>
                                            <TextField type="text" name="invoiceNo" label="Invoice No" required={true} fullWidth={true}
                                                inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                // error={errors?.quantity?.length > 0}
                                               />
                                        </fieldset>
                                     </div>
                                     <div className="col-sm-4">
                                        <fieldset>
                                                <TextField type="text" name="invoiceDate" label="Invoice Date" required={true} fullWidth={true}
                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                    // error={errors?.quantity?.length > 0}
                                                    />
                                            </fieldset>
                                     </div>
                                     <div className="col-sm-4">
                                        <fieldset>
                                                <TextField type="text" name="billQuantity" label="Bill Quantity" required={true} fullWidth={true}
                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                    // error={errors?.quantity?.length > 0}
                                                     />
                                            </fieldset>
                                     </div>
                                   
                                </div>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <fieldset>
                                            <TextField type="text" name="balanceQuantity" label="Balance Quantity" required={true} fullWidth={true}
                                                inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                // error={errors?.quantity?.length > 0}
                                               />
                                        </fieldset>
                                     </div>
                                     <div className="col-sm-4">
                                        <fieldset>
                                                <TextField type="text" name="taxable" label="Taxable Value" required={true} fullWidth={true}
                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                    // error={errors?.quantity?.length > 0}
                                                    />
                                            </fieldset>
                                     </div>
                                     <div className="col-sm-4">
                                        <fieldset>
                                                <TextField type="text" name="frightCharges" label="Fright Charges" required={true} fullWidth={true}
                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                    // error={errors?.quantity?.length > 0}
                                                     />
                                            </fieldset>
                                     </div>
                                   
                                </div>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <fieldset>
                                            <TextField type="text" name="gst" label="GST" required={true} fullWidth={true}
                                                inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                // error={errors?.quantity?.length > 0}
                                               />
                                        </fieldset>
                                     </div>
                                     <div className="col-sm-4">
                                        <fieldset>
                                                <TextField type="text" name="delivery" label="Delivery" required={true} fullWidth={true}
                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                    // error={errors?.quantity?.length > 0}
                                                    />
                                            </fieldset>
                                     </div>
                                     <div className="col-sm-4">
                                        <fieldset>
                                                <TextField type="text" name="total" label="Total" required={true} fullWidth={true}
                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                    // error={errors?.quantity?.length > 0}
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
                                            <TextField type="text" name="lrnumber" label="LR Number" required={true} fullWidth={true}
                                                inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                // error={errors?.quantity?.length > 0}
                                               />
                                        </fieldset>
                                     </div>
                                     <div className="col-sm-4">
                                        <fieldset>
                                                <TextField type="text" name="date" label="Date" required={true} fullWidth={true}
                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                    // error={errors?.quantity?.length > 0}
                                                    />
                                            </fieldset>
                                     </div>
                                     <div className="col-sm-4">
                                        <fieldset>
                                                <TextField type="text" name="transporter" label="Transporter" required={true} fullWidth={true}
                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                    // error={errors?.quantity?.length > 0}
                                                     />
                                            </fieldset>
                                     </div>
                                   
                                </div>
                               
                                <div className="row">
                                    <div className="col-sm-4">
                                        <fieldset>
                                            <TextField type="text" name="numberOfBox" label="Boxes Count " required={true} fullWidth={true}
                                                inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                // error={errors?.quantity?.length > 0}
                                               />
                                        </fieldset>
                                     </div>
                                    
                                </div>
                                <div>
                                <span  style={{fontSize: 14, margin: "40px"}}></span>
                                  <Divider />

                                                <div className="row"  style={{marginTop: "8px"}}>
                                                    <div className="col-sm-12">
                                                                <h4 style={{fontSize: "16px"}}>Upload Documents</h4>                                
                                                    </div>
                                                </div> 
                                                <Divider />

                                                     <div className="row m-0 p-2">
                                                            <TextField
                                                                name="customerDeclaration"
                                                                type="text"
                                                                label="LR"
                                                                // required={true}
                                                                // fullWidth={true}
                                                                // inputProps={{ "data-validate": '[{ "key":"required","msg":"Either of one FSSAI or Drug License or Customer Declaration is required"}]' }}
                                                                // helperText={errors?.customerDeclaration?.length > 0 ? errors?.customerDeclaration[0]?.msg : ''}
                                                                // error={errors?.customerDeclaration?.length > 0}
                                                                className="col-md-3"
                                                                // value={this.state.formWizard.obj.customerDeclaration}
                                                                // onBlur={e => this.optionalValidator('customerDeclaration', e)}
                                                                // onChange={e => this.setField('customerDeclaration', e)}
                                                                 />
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                // onClick={e => this.toggleModal('Customer Declaration')}
                                                                className= "col-md-2 p-2"
                                                                startIcon={<CloudUploadIcon />}
                                                            >
                                                                Upload </Button>
                                                                  {/* <img onClick={e => this.toggleModal('Customer Declaration')} className="col-sm-1 p-2"  src="img/upload.png" /> */}
                                                        </div>
                                                        <div className="row m-0 p-2">
                                                            <TextField
                                                                name="customerDeclaration"
                                                                type="text"
                                                                label="Invoice"                                                             
                                                                className="col-md-3"
                                                                 />
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                // onClick={e => this.toggleModal('Customer Declaration')}
                                                                className= "col-md-2 p-2"
                                                                startIcon={<CloudUploadIcon />}
                                                            >
                                                                Upload </Button>
                                                                  {/* <img onClick={e => this.toggleModal('Customer Declaration')} className="col-sm-1 p-2"  src="img/upload.png" /> */}
                                                        </div>
                                                        <div className="row m-0 p-2">
                                                            <TextField
                                                                name="customerDeclaration"
                                                                type="text"
                                                                label="EWAY Bill"
                                                                // required={true}
                                                                // fullWidth={true}
                                                                // inputProps={{ "data-validate": '[{ "key":"required","msg":"Either of one FSSAI or Drug License or Customer Declaration is required"}]' }}
                                                                // helperText={errors?.customerDeclaration?.length > 0 ? errors?.customerDeclaration[0]?.msg : ''}
                                                                // error={errors?.customerDeclaration?.length > 0}
                                                                className="col-md-3"
                                                                // value={this.state.formWizard.obj.customerDeclaration}
                                                                // onBlur={e => this.optionalValidator('customerDeclaration', e)}
                                                                // onChange={e => this.setField('customerDeclaration', e)}
                                                                 />
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                // onClick={e => this.toggleModal('Customer Declaration')}
                                                                className= "col-md-2 p-2"
                                                                startIcon={<CloudUploadIcon />}
                                                            >
                                                                Upload </Button>
                                                                  {/* <img onClick={e => this.toggleModal('Customer Declaration')} className="col-sm-1 p-2"  src="img/upload.png" /> */}
                                                        </div>
                                </div>
                                     </div>
                                     
                                     
                                     )}
                             
                                        {/* <div className=" mt-4">
                                            <h4 style={{fontSize: 14}}>Products</h4>
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
                                                       
                                                         <td><Button variant="contained" color="primary" size="xs" onClick={() => this.editInventory(i)}>Inventory</Button> </td>
                                                        
                                                        {this.state.obj.type !== 'Sales' && <td><Button variant="contained" color="warning" size="xs" onClick={() => this.editDocuments(i)}>Documents</Button> </td>
                                                          }
                                                    </tr>)
                                                })}
                                            </tbody>
                                        </Table>
                                    */}
                                    </div>
                                </div>
                              
                                        </div>

                                        {
                                          (this.props.user.role !== 'ROLE_ACCOUNTS' && this.props.user.role !== 'ROLE_INVENTORY') &&
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
                                                                                label={ <Link style={{color: "#000"}} to={`/users/${ obj.user.id}`}>
                                                                                { obj.user.name}
                                                                            </Link>}
                                                                               
                                                                                // onClick={() => this.handleClick(obj)}
                                                                                // onDelete={() => this.handleDelete(i)}
                                                                            // className={classes.chip}
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
                                    
                            </TabPanel>
                            :
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
                                                                <td>
                                                                    <strong>Order No</strong>
                                                                </td>
                                                                <td>{this.state.obj.code}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Order Date</strong>
                                                                </td>
                                                                <td><Moment format="DD MMM YY">{this.state.obj.enquiryDate}</Moment></td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Port of Landing</strong>
                                                                </td>
                                                                <td>{this.state.obj.portOfLanding}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Dispatch</strong>
                                                                </td>
                                                                <td>{this.state.obj.dispatch}</td>
                                                            </tr>
                                                          
                                                            <tr>
                                                                <td>
                                                                    <strong>FOB</strong>
                                                                </td>
                                                                <td>{this.state.obj.fob}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>CIF</strong>
                                                                </td>
                                                                <td>{this.state.obj.cif}</td>
                                                            </tr>   
                                                            <tr>
                                                                <td>
                                                                    <strong>Payment Terms</strong>
                                                                </td>
                                                                <td>{this.state.obj.paymentterms}</td>
                                                            </tr>                                            
                                                            <tr>
                                                                <td>
                                                                    <strong>Currency</strong>
                                                                </td>
                                                                <td>{this.state.obj.currency}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Description</strong>
                                                                </td>
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
                                                    <div className="col-md-5  offset-md-1">
                                                        <fieldset >
                                                            <TextField type="text" name="customerDeclaration" label="Sales Contract Upload" required={true} fullWidth={true}
                                                                // inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                                // helperText={errors?.coa?.length > 0 ? errors?.coa[0]?.msg : ""}
                                                                // error={errors?.coa?.length > 0}
                                                                // value={this.state.formWizard.obj.coa} onChange={e => this.setField("coa", e)} 
                                                                />                         
                                                            </fieldset>
                                                        </div>   
                                                    <div >
                                                    <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px" }}   startIcon={<CloudUploadIcon />} >Upload</Button>
                                                    </div>  
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-5  offset-md-1">
                                                        <fieldset >
                                                            <TextField type="text" name="customerDeclaration" label="performa Invoice Upload " required={true} fullWidth={true}
                                                                // inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                                // helperText={errors?.coa?.length > 0 ? errors?.coa[0]?.msg : ""}
                                                                // error={errors?.coa?.length > 0}
                                                                // value={this.state.formWizard.obj.coa} onChange={e => this.setField("coa", e)}
                                                                 />                         
                                                            </fieldset>
                                                        </div>   
                                                    <div >
                                                    <Button Size="small" variant="contained" color="primary" style={{marginTop: "30px",left: "-15px" }}   startIcon={<CloudUploadIcon />} >Upload</Button>
                                                    </div>  
                                                </div>
                                               
                                                        <div className="row  ml-4 p-2" >
                                                            <InputLabel  className=" col-md-4 mt-3 " style={{left:"30px"}}>Est.Time of Dispatch :</InputLabel> 
                                                            <TextField
                                                                name="customerDeclaration"
                                                                type="text"   
                                                                style={{left:"-30px"}}                                                        
                                                                className="col-md-4"                                                             
                                                                 />                                                   
                                                        </div>
                                            </div>
                                        </div>
                                        {
                                            // this.props.user.role === 'ROLE_ADMIN' &&
                                            <div className="col-md-4" >
                                                {/* <Assign onRef={ref => (this.assignRef = ref)} baseUrl={this.props.baseUrl}
                                                    parentObj={this.state.obj} currentId={this.props.currentId}></Assign> */}
                                                {/* <Timeline
                                                    title='Period ending 2017'
                                                    timeline={mockTimeline}
                                                /> */}
                                                <ActivityStream
                                                    title="Activity"
                                                    stream={mockActivity}
                                                    
                                                />
                                            </div>
                                            }
                                    </div>
                                
                            </TabPanel>
                            )
                            }
                             {this.state.obj &&  
                            (this.state.obj.type === "Sales" ? 
                            <TabPanel value={this.state.activeTab} index={1}>
                             
                            </TabPanel>: <TabPanel value={this.state.activeTab} index={1}>
                                <CheckList baseUrl={this.props.baseUrl} onRef={ref => (this.quotationTemplateRef = ref)} 
                                currentId={this.props.currentId} parentObj={this.state.obj}></CheckList>
                            </TabPanel>)}
                            {this.state.obj &&  
                            (this.state.obj.type === "Sales" ?
                            <TabPanel value={this.state.activeTab} index={2}>
                             </TabPanel>
                          :
                          <TabPanel value={this.state.activeTab} index={2}>
                          <div className="row">
                                  <div className="col-md-8  offset-md-2">
                                      <table className="table" >
                                          <tbody>
                                          <tr>
                                              <td>
                                              <InputLabel>Invoice No</InputLabel>
                                              </td>
                                              <td>
                                        
                                              </td>                                          
                                          </tr>
                                          <tr>
                                              <td>
                                              <InputLabel>Packing List</InputLabel>
                                              </td>
                                              <td>
                                        
                                              </td>                                          
                                          </tr>
                                          <tr>
                                              <td>
                                              <InputLabel>Coo</InputLabel>
                                              </td>
                                              <td>
                                        
                                              </td>                                          
                                          </tr>
                                          <tr>
                                              <td>
                                              <InputLabel>Bill of Landing </InputLabel>
                                              </td>
                                              <td>
                                        
                                              </td>                                          
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
)(View);