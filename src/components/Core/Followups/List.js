import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
// import PageLoader from '../../Common/PageLoader';
import Sorter from '../../Common/Sorter';
import FileDownload from '../../Common/FileDownload';

import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path, defaultDateFilter,  } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl,  } from '@material-ui/core';
// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';

const json2csv = require('json2csv').parse;

class List extends Component {

    state = {
        activeStep: 0,
        loading: true,
        objects: [],
        all: [],
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            search: '',
            category: '',
            fromDate: null,
            toDate: null,
        },
        filterCategories: [
            { label: 'All', value: '' },
        ],
        orderBy: 'id,desc',
        patchError: '',
    }

    searchObject = e => {
        var str = e.target.value;
        var filters = this.state.filters;

        filters.search = str;
        this.setState({ filters }, o => { this.loadObjects() });
    }

    searchCategory(e) {
        var filters = this.state.filters;
        filters.category = e.target.value;
        this.setState({ filters }, o => {
            this.loadObjects();
        });
    };

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
            this.setState({ orderBy: 'id,desc' }, this.loadObjects)
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            this.setState({ orderBy: col.param + ',' + direction }, this.loadObjects);
        }
    }

    loadObjects(offset, all, callBack) {
        if (!offset) offset = 1;

        var url = server_url + context_path + "api/" + this.props.baseUrl + "?projection=followup_details&page=" + (offset - 1);


        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }

        if(this.props.reference) {
            url += "&reference=" + this.props.reference;

            if(this.props.repository) {
                url += "&repository=" + this.props.repository;
            }
        }

        if(this.props.user.role !== 'ROLE_ADMIN') {
            url += "&uid=" + this.props.user.id;
        }

        if (this.state.filters.search) {
            url += "&contact=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }

        if (this.state.filters.category) {
            url += "&category=" + this.state.filters.category;
        }

        url = defaultDateFilter(this.state, url);

        if (all) {
            url += "&size=100000";
        }

        axios.get(url)
            .then(res => {
                if (all) {
                    this.setState({
                        all: res.data._embedded[Object.keys(res.data._embedded)[0]]
                    });
                } else {
                    this.setState({
                        objects: res.data._embedded[Object.keys(res.data._embedded)[0]],
                        page: res.data.page
                    });
                }

                if (callBack) {
                    callBack();
                }
            })
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.props.onRef(this);
        this.loadObjects();
        this.setState({ loading: true });
    }

    viewObj = (i) => {
        var obj = this.state.objects[i];
        this.props.onView(obj.id);
    }

    editObj(idx) {
        var obj = this.state.objects[idx];
        this.props.onUpdateRequest(obj.id);
    }

    patchObj(idx) {
        var obj = this.state.objects[idx];

        axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + obj.id)
            .then(res => {
                var objects = this.state.objects;
                objects[idx].active = !objects[idx].active;
                this.setState({ objects });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }

    printReport() {
        this.loadObjects(this.state.offset, true, () => {
            window.print();
        });
    }

    downloadReport = () => {
        const fields = ['id', 'name', 'email', 'mobile', 'creationDate'];
        const opts = { fields };

        this.loadObjects(this.state.offset, true, () => {
            var csv = json2csv(this.state.all, opts);
            FileDownload.download(csv, 'reports.csv', 'text/csv');
        });
    }

    render() {
        return (<ContentWrapper>
            <div className="row">
                <div className="col-md-2">
                    <h4 className="float-right">Filters : </h4>
                </div>
                <div className="col-md-2 form-group">
                    <TextField
                        type="text"
                        label="Search .."
                        fullWidth={true}
                        value={this.state.filters.search}
                        onChange={this.searchObject} />
                </div>
                {this.state.filterCategories.length > 1 &&
                <div className="col-md-2">
                    <FormControl>
                        <InputLabel>Select Category</InputLabel>
                        <Select
                            name="category"
                            value={this.state.filters.category}
                            onChange={e => this.searchCategory(e)}
                        >
                            {this.state.filterCategories.map((e, keyIndex) => {
                                return (
                                    <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </div>}
                <div className="col-md-2">
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <DatePicker 
                        autoOk
                        clearable
                        disableFuture
                        label="From Date"
                        format="DD/MM/YYYY"
                        value={this.state.filters.fromDate} 
                        onChange={e => this.filterByDate(e, 'from')} 
                                        TextFieldComponent={(props) => (
                                            <TextField
                                            type="text"
                                            name="from"
                                            id={props.id}
                                            label={props.label}
                                            onClick={props.onClick}
                                            value={props.value}
                                            disabled={props.disabled}
                                            {...props.inputProps}
                                            InputProps={{
                                                endAdornment: (
                                                    <Event />
                                                ),
                                            }}
                                            />
                                        )} />
                    </MuiPickersUtilsProvider>
                </div>
                <div className="col-md-2">
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <DatePicker 
                        autoOk
                        clearable
                        disableFuture
                        label="To Date"
                        format="DD/MM/YYYY"
                        value={this.state.filters.toDate} 
                        onChange={e => this.filterByDate(e, 'to')} 
                                        TextFieldComponent={(props) => (
                                            <TextField
                                            type="text"
                                            name="to"
                                            id={props.id}
                                            label={props.label}
                                            onClick={props.onClick}
                                            value={props.value}
                                            disabled={props.disabled}
                                            {...props.inputProps}
                                            InputProps={{
                                                endAdornment: (
                                                    <Event />
                                                ),
                                            }}
                                            />
                                        )} />
                    </MuiPickersUtilsProvider>
                </div>
                <div className="col-md-3">
                    <div className="float-right">
                        <Button className="d-none" variant="contained" color="secondary" size="small" onClick={() => this.printReport()}>Print</Button>
                        <Button className="d-none" variant="contained" color="secondary" size="small" onClick={() => this.downloadReport()}>Download</Button>
                    </div>
                </div>
            </div>
            <Table hover responsive>
                <thead>
                    <Sorter columns={[
                        { name: '#', sortable: false },
                        { name: 'Contact', sortable: true, param: 'contact'  },
                        { name: 'Followup Date', sortable: true, param: 'date' },
                        { name: 'For', sortable: true, param: 'repository' },
                        { name: 'Type', sortable: false, param: 'type' },
                        { name: 'Stage', sortable: true, param: 'stage' },
                        { name: 'Next Followup Date', sortable: true, param: 'creationDate' },
                        { name: 'Action', sortable: false }]}
                        onSort={this.onSort.bind(this)} />
                </thead>
                <tbody>
                    {this.state.objects.map((obj, i) => {
                        return (
                            <tr key={obj.id}>
                                <td>{i + 1}</td>
                                <td>
                                    <a href="javascript:void(0);" className="btn-link" onClick={() => this.viewObj(i)}>
                                        {obj.contact}
                                    </a>
                                </td>
                                <td>
                                    <Moment format="DD MMM YY">{obj.followUpDate}</Moment>
                                </td>
                                <td>
                                    <Link to={`/${obj.repository}/${obj.reference}`}>
                                        {obj.repository}
                                    </Link>
                                </td>
                                <td>
                                    {obj.type}
                                </td>
                                <td>
                                    {obj.stage}
                                </td>
                                <td>
                                    <Moment format="DD MMM YY">{obj.nextFollowUpDate}</Moment>
                                </td>
                                <td>
                                { !this.props.readOnly && <Button variant="contained" color="warning" size="xs" onClick={() => this.editObj(i)}>Edit</Button>}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>

            <CustomPagination page={this.state.page} onChange={(x) => this.loadObjects(x)} />

            <Table id="printSection" responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Contact</th>
                        <th>Created On</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.all.map((obj, i) => {
                        return (
                            <tr key={obj.id}>
                                <td>{i + 1}</td>
                                <td>{obj.contact}</td>
                                <td>
                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </ContentWrapper>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(List);