import { AppBar, Button, Tab, Tabs } from '@material-ui/core';
import axios from 'axios';
import queryString from 'query-string';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import * as Const from '../../Common/constants';
import Moment from 'react-moment';
import TabPanel from '../../Common/TabPanel';
import PageLoader from '../../Common/PageLoader';
import Sorter from '../../Common/Sorter';
import Image from '../Common/Image';
import Upload from '../Common/Upload';
import CompanyContacts from '../CompanyContacts/CompanyContacts';
import Add from './Add1';
import Branches from './Branches';
// import SalesList from './SalesList';
import Products from './Products';
import EditIcon from '@material-ui/icons/Edit';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar';
// const json2csv = require('json2csv').parse;
class View extends Component {
    state = {
        loading:false,
        purchasesobj:[],
        activeTab: 0,
        editFlag: false,
        salesobj:[],
        all:[],
        editSubFlag: false,
        modal: false,
        newObj: '',
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
        fileTypes1: [
            { label: 'GSTIN', expiryDate: true },
            { label: 'PAN', expiryDate: true },
            { label: 'FSSAI NO', noshow: false, expiryDate: true },
            { label: 'Drug License', noshow: false, expiryDate: true },
            { label: 'Customer Declaration', noshow: true, expiryDate: true },
            { label: 'Manufacture License', expiryDate: true },
            { label: 'MSME', expiryDate: true },
            { label: 'Others ', expiryDate: true },
        ],
        fileTypes2: [
            { label: 'Sample with Coa', expiryDate: true },
            { label: 'working Standard with coa', expiryDate: true },
            { label: 'Process Flow Chart', expiryDate: true },
            { label: 'Specifications', expiryDate: true },
            { label: 'Method of analysis', expiryDate: true },
            { label: 'Declaration on material origin', expiryDate: true },
            { label: 'Stability study Data', expiryDate: true },
            { label: 'Shelf Life', expiryDate: true },
            { label: 'Residual Solvents', expiryDate: true },
            { label: 'Heavy Metals', expiryDate: true },
            { label: 'NOTS (Naturally Occurring Toxic Substances)', expiryDate: true },
            { label: 'Aflatoxins', expiryDate: true },
            { label: 'Residual Pesticides', expiryDate: true },
            { label: 'Functional Trial by R&D', expiryDate: true },
            { label: 'TSE/BSE declaration', expiryDate: true },
            { label: 'Gluten Free Certificate', expiryDate: true },
            { label: 'GMO Certificate', expiryDate: true },
            { label: 'Dioxin Certificate', expiryDate: true },
            { label: 'Melanin', expiryDate: true },
            { label: 'MSDS', expiryDate: true },
            { label: 'DMF', expiryDate: true },
        ],
        terms: [
            { label: 'Advance', value: 'ADV' },
            { label: 'PDC 30 days', value: 'PDC-30' },
            { label: 'PDC 60 days', value: 'PDC-60' },
            { label: 'PDC 90 days ', value: 'PDC-90' },
            { label: '45 days from date of invoice', value: 'DI-45' },
            { label: '60 days from date of invoice', value: 'DI-60' },
            { label: '75 days from date of invoice', value: 'DI-75' },
            { label: '90 days from date of invoice', value: 'DI-90' }
        ],
        status: [
            { label: 'On going', value: 'On going', badge: 'info' },
            { label: 'Rejected', value: 'Rejected', badge: 'danger' },
            { label: 'Partially Rejected', value: 'Partially Rejected', badge: 'warning' },
            { label: 'Converted', value: 'Converted', badge: 'success' },
        ]
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
    searchSubObj = e => {
        var str = e.target.value;
        var filters = this.state.filters;
        filters.search = str;
        this.setState({ filters }, o => { this.loadSubObjs() });
    }
    filterByDate(e, field) {
        var filters = this.state.filters;
        if (e) {
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
        var url = Const.server_url + Const.context_path + "api/branches?projection=branch_details&page=" + (offset - 1);
        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }
        url += "&company=" + this.props.currentId;
        if (this.state.filters.search) {
            url += "&name=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }
        url = Const.defaultDateFilter(this.state, url);
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
    loadSales = (offset) => {
        if (!offset) offset = 1;

        var url = Const.server_url + Const.context_path + "api/sales?projection=sales_list&page="+(offset - 1)+"&company="+(this.state.newObj.id);


        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }
        axios.get(url)
        .then(res => {
            this.setState({salesobj: res.data._embedded[Object.keys(res.data._embedded)[0]],
                page: res.data.page
            });
        })
    }
    loadPurchases(offset) {
        if (!offset) offset = 1;

        var urls = Const.server_url + Const.context_path + "api/purchases?projection=purchases_list&page=" + (offset - 1)+"&company="+(this.state.newObj.id);


        if (this.state.orderBy) {
            urls += '&sort=' + this.state.orderBy;
        }
        axios.get(urls)
            .then(res => {  this.setState({
                purchasesobj: res.data._embedded[Object.keys(res.data._embedded)[0]],
                page: res.data.page
            }); 
            
            })
    }
    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
        if(tab=== 4){
            this.loadSales();
        }
        if(tab=== 5){
            this.loadPurchases();
        }
    }
    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    loadObj() {
        axios.get(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "/" + this.props.currentId).then(res => {
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
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.loadObj();
        this.props.onRef(this);
        this.setState({loading:true})
    }
    updateObj() {
        this.setState({ editFlag: true }, () => {
            this.addTemplateRef.updateObj(this.props.currentId);
        })
    }
    saveSuccess(id) {
        this.setState({ editFlag: false });
        this.loadObj();
    }
    cancelSave = () => {
        this.setState({ editFlag: false });
        this.loadObj();
    }
    render() {
        return (
            <div>
                 {this.state.loading && <PageLoader />}
                <div className="content-heading">Company</div>
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
                                    <Tab label="Branches" />
                                    <Tab label="Contacts" />
                                    <Tab label="Documents" />
                                    <Tab label="Sales" />
                                    <Tab label="Purchase" />
                                </Tabs>
                            </AppBar>
                            {this.state.newObj &&
                                <TabPanel value={this.state.activeTab} index={0}>
                                <div>
                                    <div className="card b" style={{padding: 0}}>
                                        <div className="card-header" style={{padding: 0}}>
                                            <div className="row">
                                                <div className="col-sm-2">
                                                     <Image onRef={ref => (this.imgRef = ref)} baseUrl={this.props.baseUrl} parentObj={this.state.newObj}></Image>
                                                </div>
                                                <div className="col-sm-9">
                                                     <h6 className="mt-3">
                                                        <span>{this.state.newObj.name}</span> 
                                                    </h6>
                                                </div>
                                                {this.props.user.role === 'ROLE_ADMIN' &&
                                                <div className="col-sm-1">
                                                     <div className=" mt-2">                                                              
                                                           <button  title="Company Details" style={{ backgroundColor: "#2b3db6", border:"1px solid  #2b3db6", borderRadius: "5px" }} color="primary" variant="contained" onClick={() => this.updateObj()}> <EditIcon  style={{ color: '#fff', }} fontSize="small" /></button>
                                                    </div>
                                                </div>} 
                                            </div>
                                            <div className="" style={{top: -90}}></div>
                                            {/* {/* <Image  onRef={ref => (this.imgRef = ref)} baseUrl={this.props.baseUrl}
                                                                parentObj={this.state.newObj}></Image>
                                            <h6 className="my-2">
                                           <span>{this.state.newObj.name}</span> 
                                            </h6> */}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-8">
                                            <div className="card-body bb bt">
                                                <table className="table">
                                                 <tbody>
                                                    <tr>
                                                        {/* <td className="va-middle">
                                                            <strong>Logo</strong>
                                                        </td>
                                                        <td>
                                                            <Image onRef={ref => (this.imgRef = ref)} baseUrl={this.props.baseUrl}
                                                                parentObj={this.state.newObj}></Image>
                                                        </td> */}
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Code</strong>
                                                        </td>
                                                        <td>{this.state.newObj.name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Type</strong>
                                                        </td>
                                                        <td>{this.state.newObj.type === 'B' ? 'Buyer' : 'Seller'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Location</strong>
                                                        </td>
                                                        <td>{this.state.newObj.locationType === 'I' ? 'International' : 'National'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Date Of Incorporation</strong>
                                                        </td>
                                                        <td>
                                                            <Moment format="DD MMM YY">{this.state.newObj.dateOfIncorporation}</Moment>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Email</strong>
                                                        </td>
                                                        <td>{this.state.newObj.email}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Phone</strong>
                                                        </td>
                                                        <td>{this.state.newObj.phone}</td>
                                                    </tr>
                                                </tbody>

                                                {(this.state.newObj.type === 'V' && this.state.newObj.locationType === 'N') &&
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <strong>Location</strong>
                                                            </td>
                                                            <td>{this.state.newObj.city}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <strong>Pincode</strong>
                                                            </td>
                                                            <td>{this.state.newObj.pincode}</td>
                                                        </tr>
                                                    </tbody>}

                                                {(this.state.newObj.type === 'V' && this.state.newObj.locationType === 'I') &&
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <strong>Country</strong>
                                                            </td>
                                                            <td>{this.state.newObj.country?this.state.newObj.country:"-NA-"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <strong>Province</strong>
                                                            </td>
                                                            <td>{this.state.newObj.province?this.state.newObj.province:"-NA-"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <strong>City</strong>
                                                            </td>
                                                            <td>{this.state.newObj.city?this.state.newObj.city:"-NA-"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <strong>Zipcode</strong>
                                                            </td>
                                                            <td>{this.state.newObj.zipcode?this.state.newObj.zipcode:"-NA-"}</td>
                                                        </tr>
                                                    </tbody>}

                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <strong>Customer Types</strong>
                                                        </td>
                                                        <td>{this.state.newObj.customerType?this.state.newObj.customerType:"-NA-"}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Turn Over</strong>
                                                        </td>
                                                        <td>{this.state.newObj.turnOver?this.state.newObj.turnOver:"-NA-"}</td>
                                                    </tr>

                                                    <tr>
                                                        <td>
                                                            <strong>Rating</strong>
                                                        </td>
                                                        <td>{this.state.newObj.rating?this.state.newObj.rating:"-NA-"}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Associated Organizations</strong>
                                                        </td>
                                                        <td>{this.state.newObj.organizations?this.state.newObj.organizations:"-NA-"}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Payment Terms</strong>
                                                        </td>
                                                        <td>{this.state.newObj.paymentTerms?this.state.newObj.paymentTerms:"-NA-"}</td>
                                                    </tr>


                                                    <tr>
                                                        <td>
                                                            <strong>Categories</strong>
                                                        </td>
                                                        <td>{this.state.newObj.categories?this.state.newObj.categories:"-NA-"}</td>
                                                    </tr>

                                                    <tr>
                                                        <td>
                                                            <strong>Categories Interested</strong>
                                                        </td>
                                                        <td>{this.state.newObj.categoriesInterested?this.state.newObj.categoriesInterested:"-NA-"}</td>
                                                    </tr>

                                                    {this.state.newObj.type === 'B' &&
                                                        <tr>
                                                            <td>
                                                                <strong>Agent</strong>
                                                            </td>
                                                            <td>{this.state.newObj.agent === 'N' ? '-NA-' : 'Yes'}</td>
                                                        </tr>}
                                                </tbody>

                                                {(this.state.newObj.type === 'B' || this.state.newObj.location === 'N') &&
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <strong>GST IN</strong>
                                                            </td>
                                                            <td>{this.state.newObj.gstin?this.state.newObj.gstin:"-NA-"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <strong>PAN</strong>
                                                            </td>
                                                            <td>{this.state.newObj.pan?this.state.newObj.pan:"-NA-"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <strong>FSSAI NO</strong>
                                                            </td>
                                                            <td>{this.state.newObj.fssai?this.state.newObj.fssai:"-NA-"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <strong>Drug License No</strong>
                                                            </td>
                                                            <td>{this.state.newObj.drugLicense?this.state.newObj.drugLicense:"-NA-"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <strong>Manufacture license no</strong>
                                                            </td>
                                                            <td>{this.state.newObj.others?this.state.newObj.others:"-NA-"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <strong>MSME</strong>
                                                            </td>
                                                            <td>{this.state.newObj.msme === 'N' ? '-NA-' : 'Yes'}</td>
                                                        </tr>
                                                        {this.state.newObj.msme === 'Y' && <tr>
                                                            <td>
                                                                <strong>MSME Id</strong>
                                                            </td>
                                                            <td>{this.state.newObj.msmeId?this.state.newObj.msmeId:"-NA-"}</td>
                                                        </tr>}
                                                    </tbody>}
                                                </table>
                                             </div>
                                             </div>
                                             </div>
                                            {this.state.newObj.type === 'B' ?
                                            <div>
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <Products  baseUrl={this.props.baseUrl} onRef={ref => (this.productTemplateRef = ref)}
                                                            currentId={this.props.currentId} type="interested" parentObj={this.state.newObj}>
                                                        </Products>  
                                                    </div>
                                                </div>
                                                <Divider />
                                            </div>:
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <Products baseUrl={this.props.baseUrl} onRef={ref => (this.productTemplateRef = ref)}
                                                        currentId={this.props.currentId} type="focused" parentObj={this.state.newObj}>
                                                    </Products>
                                                </div>
                                            </div>}
                                </div>
                                </TabPanel>}
                            <TabPanel value={this.state.activeTab} index={1}>
                                <Branches baseUrl={this.props.baseUrl} onRef={ref => (this.branchTemplateRef = ref)}
                                    currentId={this.props.currentId} location={this.props.location}></Branches>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={2}>
                                <CompanyContacts company={this.state.newObj} onRef={ref => (this.contactsTemplateRef = ref)}></CompanyContacts>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={3}>
                                <Upload onRef={ref => (this.uploadRef = ref)} fileFrom={this.props.baseUrl} currentId={this.props.currentId}
                                    fileTypes={this.state.newObj.locationType === 'I' ? this.state.fileTypes2 : this.state.fileTypes1}></Upload>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={4}>
                            <Table hover responsive>
                                <thead>
                                    <Sorter columns={[
                                        { name: '#', sortable: false },
                                        { name: 'Code', sortable: true, param: 'code' },
                                        { name: 'Company', sortable: false},
                                        { name: 'Status', sortable: true, param: 'status' },
                                        { name: 'Created On', sortable: true, param: 'creationDate' },
                                    ]}
                                        onSort={this.onSort.bind(this)} />
                                </thead>
                                <tbody>
                    {this.state.salesobj.map((obj, i) => {
                        return (
                            <tr key={obj.id}>
                                <td>{i + 1}</td>
                                <td>
                                    <Link to={`/sales/${obj.id}`}>
                                        {obj.code}
                                    </Link>
                                </td>
                                <td>
                                    <Link to={`/companies/${obj.company.id}`}>
                                        {obj.company.name}
                                    </Link>
                                </td>
                                <td>                                    
                                    <span className={Const.getStatusBadge(obj.status, this.state.status)}>{obj.status}</span>
                                </td>
                                <td>
                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                </td>
                                {/* <td>
                        {  this.props.user.permissions.indexOf(Const.MG_SE_E) >=0 && <Button variant="contained" color="inverse" size="xs" onClick={() => this.editObj(i)}>Edit</Button> }
                                    <Button className="d-none" variant="contained" color="warning" size="xs" onClick={() => this.patchObj(i)}>{obj.active ? 'InActivate' : 'Activate'}</Button>
                                    {obj.order && 
                                    <Link to={`/orders/${obj.order}`}>
                                        <Button variant="contained" color="inverse" size="xs">Order</Button>
                                    </Link>}
                                </td> */}
                            </tr>
                        )
                    })}
                </tbody>
                          </Table>

                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={5}>
                            <Table hover responsive>
                <thead>
                    <Sorter columns={[
                        { name: '#', sortable: false },
                        { name: 'Code', sortable: true, param: 'code' },
                        { name: 'Company', sortable: false},
                        { name: 'Status', sortable: true, param: 'status' },
                        { name: 'Created On', sortable: true, param: 'creationDate' },
                        ]}
                        onSort={this.onSort.bind(this)} />
                </thead>
                <tbody>
                    {this.state.purchasesobj.map((obj, i) => {
                        return (
                            <tr key={obj.id}>
                                <td>{i + 1}</td>
                                <td>
                                    <Link to={`/purchases/${obj.id}`}>
                                        {obj.code}
                                    </Link>
                                </td>
                                <td>
                                    <Link to={`/companies/${obj.company.id}`}>
                                        {obj.company.name}
                                    </Link>
                                </td>
                                <td>
                                    <span className={Const.getStatusBadge(obj.status, this.state.status)}>{obj.status}</span>
                                </td>
                                <td>
                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>


                            </TabPanel>
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
