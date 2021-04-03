import { AppBar, Button, Tab, Tabs } from '@material-ui/core';
import axios from 'axios';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Modal,

    ModalBody, ModalHeader, Table
} from 'reactstrap';
import Upload from '../Common/Upload';
import { context_path, defaultDateFilter, server_url } from '../../Common/constants';
import CustomPagination from '../../Common/CustomPagination';
import Sorter from '../../Common/Sorter';
import TabPanel from '../../Common/TabPanel';
import Add from './Add';




// import AddSub from './AddSub';

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
        this.props.onRef(this);
    }

    updateObj() {
        this.setState({ editFlag: true }, () => {
            this.addTemplateRef.updateObj(this.props.currentId);
        })
    }

    saveSuccess(id) {
        this.setState({ editFlag: false });
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
                {!this.props.repository &&
                <div className="content-heading">Followups </div>}
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-12">
                            <AppBar position="static" className="d-none">
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
                                    <Tab label="Subs" />
                                    <Tab label="Documents" />
                                </Tabs>
                            </AppBar>
                            {this.state.obj &&
                            <TabPanel value={this.state.activeTab} index={0}>
                                <div className="card b">
                                    <div className="card-header">
                                        <div className="float-right mt-2">
                                            <Button variant="contained" color="warning" size="xs" onClick={() => this.props.viewAll()}>View All</Button>
                                            {!this.props.readOnly && <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Edit</Button>}
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
                                                        <strong>Status</strong>
                                                    </td>
                                                    <td>{this.state.obj.status==='A'?'Approved':this.state.obj.status==='A'?'Rejected':'New'}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Request Message</strong>
                                                    </td>
                                                    <td>{this.state.obj.description}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Created Date</strong>
                                                    </td>
                                                    <td><Moment format="DD MMM YY">{this.state.obj.creationDate}</Moment></td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <strong>Response Message</strong>
                                                    </td>
                                                    <td>{this.state.obj.response}</td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <strong>Response Date</strong>
                                                    </td>
                                                    <td><Moment format="DD MMM YY">{this.state.obj.responseDate}</Moment></td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </TabPanel>}
                            <TabPanel value={this.state.activeTab} index={1}>
                                <Modal isOpen={this.state.modal} toggle={this.toggleModal} size={'lg'}>
                                    <ModalHeader toggle={this.toggleModal}>
                                        {this.state.editSubFlag && <span>Edit </span>}
                                        {!this.state.editSubFlag && <span>Add </span>} Sub
                                </ModalHeader>
                                    <ModalBody>
                                        {/* <AddSub baseUrl="branches" branchId={this.state.subId} subId={this.state.obj.id} onRef={ref => (this.addTemplateRef = ref)}
                                            onSave={(id) => this.saveObjSuccess(id)}></AddSub> */}
                                    </ModalBody>
                                </Modal>
                                <div className="card b">
                                    <div className="card-header">
                                        <div className="float-right mt-2">
                                            <Button variant="contained" color="warning" size="xs" onClick={() => this.addSubObj()}>Add</Button>
                                        </div>
                                        <h4 className="my-2">
                                            <span>Subs</span>
                                        </h4>
                                    </div>
                                    <div className="card-body bb bt">
                                        <Table hover responsive>
                                            <thead>
                                                <Sorter columns={[
                                                    { name: '#', sortable: false },
                                                    { name: 'Name', sortable: true, param: 'name' },
                                                    { name: 'Type', sortable: false, param: 'type' },
                                                    { name: 'City', sortable: true, param: 'city' },
                                                    { name: 'Created On', sortable: true, param: 'creationDate' },
                                                    { name: 'Action', sortable: false }]}
                                                    onSort={this.onSort.bind(this)} />
                                            </thead>
                                            <tbody>
                                                {this.state.subObjs.map((obj, i) => {
                                                    return (
                                                        <tr key={obj.id}>
                                                            <td>{i + 1}</td>
                                                            <td>
                                                                <Link to={`/${this.props.baseUrl}/${obj.id}`}>
                                                                    {obj.name}
                                                                </Link>
                                                            </td>
                                                            <td>
                                                                {obj.type}
                                                            </td>
                                                            <td>
                                                                {obj.city}
                                                            </td>

                                                            <td>
                                                                <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                            </td>
                                                            <td>
                                                                <Button variant="contained" color="warning" size="xs" onClick={() => this.editSubObj(i)}>Edit</Button>
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
                                reference="0" repository={this.props.repository} 
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