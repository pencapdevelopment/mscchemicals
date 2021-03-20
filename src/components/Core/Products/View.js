import React, { Component } from 'react';
// import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
// import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
// import PageLoader from '../../Common/PageLoader';
import {  Modal,
    ModalHeader,
    ModalBody } from 'reactstrap';
import Sorter from '../../Common/Sorter';

import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path, defaultDateFilter } from '../../Common/constants';
import { Button,  Tab, Tabs, AppBar } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';

import TabPanel from '../../Common/TabPanel';

import Add from './Add';
import Upload from '../Common/Upload';
 import AddFlow from './AddFlow';

// const json2csv = require('json2csv').parse;

class View extends Component {
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
        orderBy:'id,desc',
        fileTypes: [{label:  'MOA', expiryDate: false }]
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
        var url = server_url + context_path + "api/product-flow?projection=product_flow_list&&page=" + (offset - 1);
        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }
        url += "&product.id=" + this.props.currentId;
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
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + id).then(res => {
            this.setState({ obj: res.data });
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        console.log('view component did mount');
        console.log(this.props.currentId);

        this.loadObj(this.props.currentId);
        this.loadSubObjs();
        this.props.onRef(this);
    }

    updateObj() {
        this.setState({ editFlag: true }, () => {
            this.addTemplateRef.updateObj(this.props.currentId);
        })
    }

    saveSuccess(id) {
        this.setState({ editFlag: false },function(){
            this.loadObj(this.props.currentId)
        });
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
                <div className="content-heading">Product</div>
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-12">
                            <AppBar position="static" >
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
                                    <Tab label="Product Flow"  />
                                    <Tab label="Documents"  />
                                </Tabs>
                            </AppBar>
                            {this.state.obj &&
                            <TabPanel value={this.state.activeTab} index={0}>
                                <div className="card b">
                                    <div className="card-header">
                                        <div className="float-right mt-2">
                                            <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Edit</Button>
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
                                                        <strong>Code</strong>
                                                    </td>
                                                    <td>{this.state.obj.code?this.state.obj.code:"-NA-"}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Categories</strong>
                                                    </td>
                                                    <td>{this.state.obj.category?this.state.obj.category:"-NA-"}</td>
                                                </tr>
                                                {this.state.obj.subCategory &&
                                                <tr>
                                                    <td>
                                                        <strong>Sub Categories</strong>
                                                    </td>
                                                    <td>{this.state.obj.subCategory?this.state.obj.subCategory:"-NA-"}</td>
                                                </tr>}
                                                {this.state.obj.type==='Registered' && this.state.obj.specification &&
                                                <tr>
                                                    <td>
                                                        <strong>Specification</strong>
                                                    </td>
                                                    <td>{this.state.obj.specification?this.state.obj.specification:"-NA-"}</td>
                                                </tr>}
                                                {this.state.obj.type==='Registered' && this.state.obj.make &&
                                                <tr>
                                                    <td>
                                                        <strong>Makes</strong>
                                                    </td>
                                                    <td>{this.state.obj.make?this.state.obj.make:"-NA-"}</td>
                                                </tr>}
                                                <tr>
                                                    <td>
                                                        <strong>Types</strong>
                                                    </td>
                                                    <td>{this.state.obj.type}</td>
                                                </tr>
                                                {this.state.obj.type==='Food grade' && this.state.obj.countryOfOrigin &&
                                                <tr>
                                                    <td>
                                                        <strong>Country Of Origin</strong>
                                                    </td>
                                                    <td>{this.state.obj.countryOfOrigin?this.state.obj.countryOfOrigin:"--NA"}</td>
                                                </tr>}
                                                {/* <tr>
                                                    <td>
                                                        <strong>HSN Code</strong>
                                                    </td>
                                                    <td>{this.state.obj.hsnCode}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Packaging Type</strong>
                                                    </td>
                                                    <td>{this.state.obj.packagingType}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>UOM</strong>
                                                    </td>
                                                    <td>{this.state.obj.uom}</td>
                                                </tr> */}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </TabPanel>}
                            <TabPanel value={this.state.activeTab} index={1}>
                                <Modal isOpen={this.state.modal} toggle={this.toggleModal} size={'lg'}
                                backdrop="static">
                                    <ModalHeader toggle={this.toggleModal}>
                                        {this.state.editSubFlag && <span>Edit </span>}
                                        {!this.state.editSubFlag && <span>Add </span>} Flow
                                </ModalHeader>
                                    <ModalBody>
                                        { <AddFlow baseUrl="product-flow" branchId={this.state.subId} subId={this.state.obj.id} onRef={ref => (this.addTemplateRef = ref)}
                                            onSave={(id) => this.saveObjSuccess(id)}></AddFlow> }
                                    </ModalBody>
                                </Modal>
                                <div className="card b">
                                    <div className="card-header">
                                        {/*<div className="float-right mt-2">
                                            <Button variant="contained" color="warning" size="xs" onClick={() => this.addSubObj()}>Add</Button>
                                        </div>*/}
                                        <h4 className="my-2">
                                            <span>Available Stock is {this.state.obj.quantity} items</span>
                                        </h4>
                                    </div>
                                    <div className="card-body bb bt">
                                        <Table hover responsive>
                                            <thead>
                                                <Sorter columns={[
                                                    { name: '#', sortable: false },
                                                    { name: 'Type', sortable: true, param: 'type' },
                                                    { name: 'Reference', sortable: true, param: 'refType' },
                                                    { name: 'Quantity', sortable: true, param: 'quantity' },
                                                    { name: 'Created By', sortable: false, param: 'createdBy' },
                                                    { name: 'Created On', sortable: true, param: 'creationDate' },
                                                    ]}
                                                    onSort={this.onSort.bind(this)} />
                                            </thead>
                                            <tbody>
                                                {this.state.subObjs.map((obj, i) => {
                                                    return (
                                                        <tr key={obj.id}>
                                                            <td>{i + 1}</td>
                                                            <td>
                                                                {obj.type}
                                                            </td>
                                                            <td>
                                                                {obj.refType === 'ORDER' &&
                                                                <Link to={`/orders/${obj.reference}`}>Order</Link>}
                                                                {obj.refType !== 'ORDER' &&
                                                                <span>{obj.refType}</span>
                                                                }
                                                            </td>
                                                            <td>
                                                                {obj.quantity}
                                                            </td>
                                                            <td>
                                                                <Link to={`/users/${obj.createdBy.id}`}>
                                                                    {obj.createdBy.name}
                                                                </Link>
                                                            </td>
                                                            <td>
                                                                <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>

                                        <CustomPagination page={this.state.subPage} onChange={(x) => this.loadSubObjs(x)} />
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={2}>
                                <Upload onRef={ref => (this.uploadRef = ref)} fileFrom={this.props.baseUrl} currentId={this.props.currentId} fileTypes={this.state.fileTypes}></Upload>
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