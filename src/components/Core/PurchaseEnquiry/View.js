import React, { Component } from 'react';
// import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import { Modal, ModalBody, ModalHeader} from 'reactstrap';
import AutoSuggest from '../../Common/AutoSuggest';
import { mockActivity } from '../../Timeline';
import { ActivityStream } from '../../Timeline';
import UOM from '../Common/UOM';
import AddInventory from './AddInventory';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

// import PageLoader from '../../Common/PageLoader';
// import {
//     Row, Col, Modal,
//     ModalHeader,
//     ModalBody
// } from 'reactstrap';
// import Sorter from '../../Common/Sorter';
// import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path, defaultDateFilter,  getStatusBadge } from '../../Common/constants';
import { Button,  Tab, Tabs, AppBar, FormControl, TextField} from '@material-ui/core';

import * as Const from '../../Common/constants';

import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';

import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
import TabPanel from '../../Common/TabPanel';
import Approval from '../Approvals/Approval';
import Add from './Add1';
// import Upload from '../Common/Upload';
import Status from '../Common/Status';
//import Assign from '../Common/Assign';
import Followups from '../Followups/Followups';
import Quotation from './Quotation';

import { createOrder } from '../Orders/Create';

// const json2csv = require('json2csv').parse;

class View extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        editSubFlag: false,
        modal1: false,
        modal2: false,
        modal: false,
        modalassign: false,
        modalnegatation: false,
        obj: '',
        subObjs: [],
        newSubObj: {},
        orderBy:'id,desc',
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
        currentProd: {},
        currentProdId: '',
        status: [
            { label: 'On going', value: 'On going', badge: 'info' },
            { label: 'Rejected', value: 'Rejected', badge: 'danger' },
            { label: 'Partially Rejected', value: 'Partially Rejected', badge: 'warning' },
            { label: 'Converted', value: 'Converted', badge: 'success' },
        ],
        pharmaFileTypes: [
            {label: 'Sample with COA', expiryDate: false },
            {label: 'Working standard with COA', expiryDate: false },
            {label: 'Process Flow Chart', expiryDate: false },
            {label: 'Specifications', expiryDate: false },
            {label: 'MOA', expiryDate: false },
            {label: 'Declaration of Material origin', expiryDate: false },
            {label: 'Stability Study Data', expiryDate: false },
            {label: 'Shelf LifeResidual Solvents', expiryDate: false },
            {label: 'Heavy Metals', expiryDate: false },
            {label: 'NOTS', expiryDate: false },
            {label: 'Aflatoxins', expiryDate: false },
            {label: 'Residual Pesticides', expiryDate: false },
            {label: 'Functional Trial by R&D', expiryDate: false },
            {label: 'TSE/BE Declaration', expiryDate: false },
            {label: 'Gluten free Certificate', expiryDate: false },
            {label: 'GMO Certificate', expiryDate: false },
            {label: 'Dioxin Certificate', expiryDate: false },
            {label: 'Melanin', expiryDate: false },
            {label: 'MSDS', expiryDate: false },
            {label: 'GMP certificate', expiryDate: false },
            {label: 'Chromatograph', expiryDate: false },
            {label: 'ISO', expiryDate: false },
        ],
        foodFileTypes: [
            {label: 'Sample with COA', expiryDate: false },
            {label: 'Working standard with COA', expiryDate: false },
            {label: 'Process Flow Chart', expiryDate: false },
            {label: 'Specifications', expiryDate: false },
            {label: 'MOA', expiryDate: false },
            {label: 'Declaration on Material Origin', expiryDate: false },
            {label: 'Stability study Data', expiryDate: false },
            {label: 'Shelf life', expiryDate: false },
            {label: 'Residual solvents', expiryDate: false },
            {label: 'Heavy Metals', expiryDate: false },
            {label: 'NOTS', expiryDate: false },
            {label: 'Aflatoxins', expiryDate: false },
            {label: 'Residual Pesticides', expiryDate: false },
            {label: 'Functional Trial by R&D', expiryDate: false },
            {label: 'TSE/BSE Certificate', expiryDate: false },
            {label: 'Gluten Free Certificate', expiryDate: false },
            {label: 'GMO Certificate', expiryDate: false },
            {label: 'GMP certificate', expiryDate: false },
            {label: 'Dioxin certificate', expiryDate: false },
            {label: 'Melanin Certificate', expiryDate: false },
            {label: 'MSDS', expiryDate: false },
            {label: 'Kosher Certificate', expiryDate: false },
            {label: 'Halal Certificate', expiryDate: false },
            {label: 'ISOUSFDA', expiryDate: false },
            {label: 'Other Country certificate', expiryDate: false },
        ],
        objects: [],
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        user: '',
        selectedUser: '',
    }
    setProductField(i, field, e, noValidate) {
        var obj = this.state.obj;
        console.log(e.target.value)
        // var input = e.target;
        obj.products[i][field] = e.target.value;
        this.setState({ obj });

        // if (!noValidate) {
        //     const result = FormValidator.validate(input);
        //     formWizard.errors[input.name] = result;
        //     this.setState({
        //         formWizard
        //     });
        // }
    }

    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    handleDelete = (i) => {
        console.log('You clicked the delete icon.', i); // eslint-disable-line no-alert
        var user = this.state.objects[i];

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this user assignment!",
            icon: "warning",
            dangerMode: true,
            button: {
                text: "Yes, delete it!",
                closeModal: true,
            }
        })
            .then(willDelete => {
                if (willDelete) {
                    axios.delete(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "-user/" + user.id)
                        .then(res => {
                            var objects = this.state.objects;

                            objects.splice(i, 1);

                            this.setState({ objects });
                        }).finally(() => {
                            this.setState({ loading: false });
                        }).catch(err => {
                            this.setState({ deleteError: err.response.data.globalErrors[0] });
                            swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                        })
                }
            });
    }
    saveUser() {
        var user = {
            active: true,
            user: '/users/' + this.state.user,
            reference: "/" + this.props.baseUrl + "/" + this.props.currentId
        };

        this.setState({ loading: true });
        axios.post(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "-user", user)
            .then(res => {
                this.loadObjects();
            }).finally(() => {
                this.setState({ loading: false });
                this.toggleModal();
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }
    setAutoSuggest(field, val) {
        this.setState({ user: val });
    }
    handleClick = (i) => {
        console.log('You clicked the Chip.', i); // eslint-disable-line no-alert
        window.location.href = '/users/' + i.user.id;
        // this.props.history.push('/users/'+i.id);
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

        var url = server_url + context_path + "api/purchase-followup?enquiry.id="+this.props.currentId+"&page=" + (offset - 1);


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
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + id + '?projection=purchases_edit').then(res => {
            this.setState({ obj: res.data});
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    // componentDidMount() {
    //     console.log('view component did mount');
    //     console.log(this.props.currentId);

    //     this.loadObj(this.props.currentId);
    //     // this.loadSubObjs();
    //     this.props.onRef(this);
    // }


    componentDidMount() {

        this.loadObj(this.props.currentId);
        // this.loadSubObjs();
        this.props.onRef(this);
        axios.get(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "-user?projection=" +
            this.props.baseUrl + "-user&reference=" + this.props.currentId).then(res => {
                this.setState({
                    objects: res.data._embedded[Object.keys(res.data._embedded)[0]],
                    page: res.data.page
                });
            });
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
    // sendEmail = (i) => {
    //     var obj = this.state.obj;
    //     var prod = obj.products[i];

    //     axios.patch(server_url + context_path + "purchase-enquiry/" + obj.id + "/products/" + prod.id)
    //         .then(res => {
    //             prod.status = 'Email Sent';
    //             this.setState({ obj });
    //             swal("Sent Enquiry!", 'Succesfully sent enquiry mail.', "success");
    //         }).finally(() => {
    //             this.setState({ loading: false });
    //         }).catch(err => {
    //             swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
    //         })
    // }
    saveSuccess(id) {
        this.setState({ editFlag: false },function(){
            this.loadObj(this.props.currentId)
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

    toggleModal2 = () => {
        this.setState({
            modal2: !this.state.modal2
        });
    }
    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    toggleModalAssign = () => {
        this.setState({
            modalassign: !this.state.modalassign
        });
    }
    toggleModalNegotation = () => {
        this.setState({
            modalnegatation: !this.state.modalnegatation
        });
    }
    editInventory = (i) => {
        var prod = this.state.obj.products[i];


        this.setState({ editSubFlag: true, currentProdId: prod.id, currentProd: prod }, this.toggleModal);
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

    convertToOrder = () => {
        if(this.state.obj.adminApproval!=='Y' && this.props.user.role !== 'ROLE_ADMIN'){
            swal("Unable to Convert!", "Please get Admin approval", "error");
            return ;
        }
        if(this.state.obj.products.length===0){
            swal("Unable to Convert!", "Please add atleast one product", "error");
            return ;
        }
        createOrder('Purchase', this.state.obj, this.props.baseUrl);
    }

    render() {
        return (
            <div>
                <div className="content-heading">Purchase Enquiry</div>

                <Modal isOpen={this.state.modal} backdrop="static" toggle={this.toggleModal} size={'lg'}>
                    <ModalHeader toggle={this.toggleModal}>
                        Add inventory - {this.state.currentProd.product?.name}
                    </ModalHeader>
                    <ModalBody>
                        <AddInventory orderProduct={this.state.currentProd} onRef={ref => (this.addInventoryRef = ref)} onCancel={e => this.toggleModal(e)} baseUrl='product-flow'></AddInventory>
                    </ModalBody>
                </Modal>

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

                                                                <UOM required={true}
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
                            </div>}
                        <div className="text-center">
                            <Button variant="contained" color="primary" >Save</Button>
                        </div>
                    </ModalBody>
                </Modal>

                <Modal isOpen={this.state.modalassign} toggle={this.toggleModalAssign} size={'md'}>
                    <ModalHeader toggle={this.toggleModalAssign}>
                        Assign User
                        </ModalHeader>
                    <ModalBody>
                        <fieldset>
                            <AutoSuggest url="users"
                                name="userName"
                                displayColumns="name"
                                label="User"
                                placeholder="Search User by name"
                                arrayName="users"
                                inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                onRef={ref => {(this.userASRef = ref) 
                                    if (ref) {
                                    this.userASRef.load();
                                }}}
                                projection="user_details_mini"
                                value={this.state.selectedUser}
                                onSelect={e => this.setAutoSuggest('user', e?.id)}
                                queryString="&name" ></AutoSuggest>
                        </fieldset>
                        <div className="text-center">
                            <Button variant="contained" color="primary" onClick={e => this.saveUser()}>Save</Button>
                        </div>
                    </ModalBody>
                </Modal>
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
                                    <Tab label="Details" />
                                    <Tab label="Quotation" />
                                    <Tab label="Followups" />
                                  
                                    <Tab label="Approvals" />
                                    <Tab label="Order" />
                                   {/* <Tab label="Pharma Documents" />
                                    <Tab label="Food Documents" />*/}
                                </Tabs>
                            </AppBar>
                            {this.state.obj &&
                                <TabPanel value={this.state.activeTab} index={0}>                          
                                    <div className="row">
                                       
                                        <div className="col-md-8">
                                            <div className="card b">
                                                <div className="card-header">
                                                  {/* <Chip   size="small" 
                                                        stylee={{fontSize: 80}} 
                                                        label="On going" 
                                                       color="primary"
                                
                 

                                  
                                                        
                                                        /> */}
                                                        <table>
                                                            <tbody>
                                                            <tr style={{marginTop: 70, marginLeft: 10}}>
                                                                {/* <td style={{backgroundColor:'rgba(0, 0, 0, 0.04);'}}>
                                                                    <span ><ArrowDropDownIcon/></span>
                                                                </td> */}
                                                                <td ><span  style={{ marginLeft: 20}} className={Const.getStatusBadge(this.state.obj.status, this.state.status)}>{this.state.obj.status}</span></td>
                                                            </tr>
                                                             </tbody>
                                                        </table>
                                                   
                                                 {(this.props.user.role === 'ROLE_ADMIN' ||this.props.user.permissions.indexOf(Const.MG_SE_E) >= 0) && <Status onRef={ref => (this.statusRef = ref)} baseUrl={this.props.baseUrl} currentId={this.props.currentId}
                                                            showNotes={true}
                                                            onUpdate={(id) => this.updateStatus(id)}
                                                            //style={{marginLeft:' -50'}}
                                                            color="primary"
                                                            statusList={this.state.status}  status={this.state.obj.status}
                                                            statusType="Enquiry"></Status>} 
                                                    <div className="float-right ">
                                                

                                                        {/* <div>
                                                            <span className={Const.getStatusBadge(this.state.obj.status, this.state.status)}>{this.state.obj.status}</span>
                                                        </div> */}
                                                      
                                                            
                                                        {(this.props.user.role === 'ROLE_ADMIN' && this.props.user.permissions.indexOf(Const.MG_SE_E) >= 0) &&   
                                                        <Button title="Edit"  size="small" onClick={() => this.updateObj()}> < EditIcon style={{color: "#000"}} size="xs" /></Button>}
                                                        {this.state.isQuoteExists < 1 ? <img title="Quotation icon" onClick={() => this.handleGenerateQuote()} style={{width:25, height:30}} src="img/quotei.png" />:'' }
                                                             {/* <Fab   variant="contained"  aria-label="edit" size='small'>
                                                        {(this.props.user.role === 'ROLE_ADMIN' ||this.props.user.permissions.indexOf(Const.MG_SE_E) >= 0) && 
                                                       
                                                            <Button variant="contained" color="primary"  size="xs" onClick={() => this.updateObj()}> <EditIcon style={{color: '#fff'}} size="large" /></Button>}
                                                            </Fab> */}
                                                        
                                                        {/* {!this.state.obj.order && (this.props.user.role === 'ROLE_ADMIN' ||this.props.user.permissions.indexOf(Const.MG_SE_E) >= 0) &&
                                                            <Button  variant="contained" color="primary" size="small" onClick={this.convertToOrder}>Convert To Order</Button>}
                                                        {this.state.obj.order &&
                                                            <Link to={`/orders/${this.state.obj.order}`}>
                                                                <Button title="Convert to order" variant="contained" color="white" size="small"><span style={{  textTransform: 'none', fontWeight: 'normal'}}>Convert Order</span></Button>
                                                            </Link>} */}
                                                    </div>
                                                    <h4 className="my-2">
                                                        <span>{this.state.obj.name}</span>
                                                    </h4>
                                                </div>
                                                <div className="card-body bb bt">
                                                    <table className="table">
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <strong>Assigned To</strong>
                                                                </td>
                                                                <td>
                                                                    {this.state.objects.map((obj, i) => {
                                                                        return (
                                                                            <Chip
                                                                                avatar={
                                                                                    <Avatar>
                                                                                        <AssignmentIndIcon />
                                                                                    </Avatar>
                                                                                }
                                                                                label={obj.user.name}

                                                                                onClick={() => this.handleClick(obj)}
                                                                                onDelete={() => this.handleDelete(i)}
                                                                            // className={classes.chip}
                                                                            />
                                                                        )
                                                                    })}
                                                                </td>
                                                             
                                                                <td style={{marginRight: -170}}>
                                                            
                                                                    { this.props.user.role === 'ROLE_ADMIN' &&
                                                                   
                                                                        <Button  title="Assigned To" color="primary"  size="small" onClick={this.toggleModalAssign}>   < AddIcon  style={{color: '#000'}} fontSize="small" /></Button>}
                                                           
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Code</strong>
                                                                </td>
                                                                <td>{this.state.obj.code}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Enquiry Date</strong>
                                                                </td>
                                                                <td><Moment format="DD MMM YY">{this.state.obj.enquiryDate}</Moment></td>
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
                                                                    <strong>Contact Name</strong>
                                                                </td>
                                                                <td>{this.state.obj.contactName}</td>
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
                                                                    <strong>Source</strong>
                                                                </td>
                                                                <td>{this.state.obj.source}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Enquiry Status</strong>
                                                                </td>
                                                                <td><span className={Const.getStatusBadge(this.state.obj.status, this.state.status)}>{this.state.obj.status}</span></td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Status Notes</strong>
                                                                </td>
                                                                <td>{this.state.obj.statusNotes}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Description</strong>
                                                                </td>
                                                                <td>{this.state.obj.description}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div className=" mt-4 row">
                                                        <h4 className="col-md-9" style={{fontSize:18}}>Products</h4>
                                                        {/* <Button className="col-md-3" variant="contained" color="warning" size="xs" onClick={this.toggleModalNegotation}>Negotation</Button>
                                                     */}</div>
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
                                                                        <td><Button variant="contained" color="warning" size="xs" onClick={() => this.editInventory(i)}>Inventory & Docs</Button> </td>
                                                                    </tr>)
                                                            })}
                                                        </tbody>
                                                    </Table>
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
                                                    title="Time Line"
                                                    stream={mockActivity}
                                                    
                                                />
                                            </div>}
                                    </div>
                                </TabPanel>
                            }  
                               <TabPanel value={this.state.activeTab} index={1}>
                                <Quotation baseUrl={this.props.baseUrl} onRef={ref => (this.quotationTemplateRef = ref)}
                                    currentId={this.props.currentId} parentObj={this.state.obj}></Quotation>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={2}>
                                <Followups repository={this.props.baseUrl} reference={this.state.obj.id} onRef={ref => (this.followupsTemplateRef = ref)} readOnly={this.state.obj.status ==='Converted'}></Followups> 
                            </TabPanel>

                          
                            <TabPanel value={this.state.activeTab} index={3}>
                                <Approval repository={this.props.baseUrl} reference={this.state.obj.id} onRef={ref => (this.followupsTemplateRef = ref)} readOnly={this.state.obj.status ==='Converted'}></Approval> 
                            </TabPanel>
                            <TabPanel  index={4}>
                          </TabPanel>
                            {/*<TabPanel value={this.state.activeTab} index={3}>
                                <Upload onRef={ref => (this.pharmauploadRef = ref)} fileFrom={this.props.baseUrl + '_Pharma'} currentId={this.props.currentId} fileTypes={this.state.pharmaFileTypes}></Upload>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={4}>
                                <Upload onRef={ref => (this.fooduploadRef = ref)} fileFrom={this.props.baseUrl + '_Food'} currentId={this.props.currentId} fileTypes={this.state.foodFileTypes}></Upload>
                            </TabPanel>*/}
                        </div>
                    </div>}
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