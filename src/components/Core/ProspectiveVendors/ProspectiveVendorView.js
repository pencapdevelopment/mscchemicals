import React, { Component } from 'react';
// import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
// import swal from 'sweetalert';
import axios from 'axios';
import EditIcon from '@material-ui/icons/Edit';
// import Moment from 'react-moment';
// import { Link } from 'react-router-dom';
// import { Table } from 'reactstrap';
// import PageLoader from '../../Common/PageLoader';
// import { Row, Col, Modal,
//     ModalHeader,
//     ModalBody } from 'reactstrap';
// import Sorter from '../../Common/Sorter';
import Followups from '../Followups/Followups';
import Divider from '@material-ui/core/Divider';
// import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path, defaultDateFilter } from '../../Common/constants';
import { Button,  Tab, Tabs, AppBar } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
import TabPanel from '../../Common/TabPanel';
//import Add from './Add';
import ProspectiveVendorAdd from './ProspectiveVendorAdd';
// import Upload from '../Common/Upload';
// import AddSub from './AddSub';
// const json2csv = require('json2csv').parse;
class ProspectiveVendorView extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        editSubFlag: false,
        modal: false,
        obj: '',
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
            })
    }
    loadObj(id) {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + id + '?projection=prospective_vendor_edit').then(res => {
            this.setState({ obj: res.data });
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
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
                <div className="content-heading">Vendors</div>
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-10">
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
                                    {/* <Tab label="Details" />
                                    <Tab label="Followups" /> */}
                                  
                                </Tabs>
                            </AppBar>
                            {this.state.obj &&
                            <TabPanel value={this.state.activeTab} index={0}>
                                <div className="card b">
                                    <div className="card-header">
                                        <div className="float-right mt-2">
                                          <button style={{ backgroundColor: "#2b3db6", border:"1px solid #2b3db6", borderRadius:"5px"}} color="primary" variant="contained" onClick={() => this.updateObj()}> <EditIcon  style={{ color: '#fff', }} fontSize="small" /></button>
                                        </div>
                                      
                                    </div>

                                    <div className="card-body bb bt">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <strong>Name</strong>
                                                    </td>
                                                    <td>{this.state.obj.name?this.state.obj.name:"-NA-"}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Company Name</strong>
                                                    </td>
                                                    <td>{this.state.obj.companyName?this.state.obj.companyName:"-NA-"}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Department</strong>
                                                    </td>
                                                    <td>{this.state.obj.department?this.state.obj.department:"-NA-"}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Designation</strong>
                                                    </td>
                                                    <td>{this.state.obj.designation?this.state.obj.designation:"-NA-"}</td>
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
                                                    <td>{this.state.obj.phone?this.state.obj.phone:"-NA-"}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Country</strong>
                                                    </td>
                                                    <td>{this.state.obj.country?this.state.obj.country:"-NA-"}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Province</strong>
                                                    </td>
                                                    <td>{this.state.obj.province?this.state.obj.province:"-NA-"}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Category</strong>
                                                    </td>
                                                    <td>{this.state.obj.categories?this.state.obj.categories:"-NA-"}</td>
                                                </tr>
                                                  
                                                <tr>
                                                    <td>
                                                        <strong>Products Offered</strong>
                                                    </td>
                                                    <td>
                                                    {this.state.obj.vendorProduct.map((obj, i) => {
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
                                                        <strong>Remarks</strong>
                                                    </td>
                                                    <td>{this.state.obj.remarks?this.state.obj.remarks:"--"}</td>
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
                                    </div>
                                </div>
                            </TabPanel>}
                            
                            <TabPanel value={this.state.activeTab} index={1}>
                                <Followups repository={this.props.baseUrl} reference={this.state.obj.id} onRef={ref => (this.followupsTemplateRef = ref)} readOnly={this.state.obj.status ==='Converted'}></Followups> 
                            </TabPanel>
                        </div>
                    </div>}
                {this.state.editFlag &&
                    <div className="card b">
                        <div className="card-body bb bt">
                            <ProspectiveVendorAdd baseUrl={this.props.baseUrl} onRef={ref => (this.addTemplateRef = ref)}
                                onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}></ProspectiveVendorAdd>
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
)(ProspectiveVendorView);