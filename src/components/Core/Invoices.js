import React, { Component } from 'react';
import ContentWrapper from '../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import PageLoader from '../Common/PageLoader';
import Sorter from '../Common/Sorter';
import FileDownload from '../Common/FileDownload';
import CustomPagination from '../Common/CustomPagination';
import { server_url, context_path, defaultDateFilter, getStatusBadge } from '../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl,  } from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';

const json2csv = require('json2csv').parse;

class Invoices extends Component {

    state = {
        activeStep: 0,
        loading: false  ,
        objects: [],
        all: [],
        baseUrl: 'accounts',
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
        orderBy:'id,desc',
        patchError: '',
        status: [
            { label: 'On going', value: 'On going', badge: 'info' },
            { label: 'Completed', value: 'Completed', badge: 'success' },
        ],
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

        var url = server_url + context_path + "api/" + this.state.baseUrl + "?projection=order_accounts_edit&page=" + (offset - 1);


        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }

        url += "&uid=" + this.props.user.id;

        if (this.state.filters.search) {
            url += "&orderId=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }

        if (this.state.filters.category) {
            url += "&type=" + this.state.filters.category;
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
                        page: res.data.page,
                        loading:false
                    });
                }

                if (callBack) {
                    callBack();
                }
            })
    }

    componentDidMount() {
        this.loadObjects();
        this.setState({ loading: true });
    }

    patchObj(idx) {
        var obj = this.state.objects[idx];

        axios.patch(server_url + context_path + "api/" + this.state.baseUrl + "/" + obj.id)
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
            {this.state.loading && <PageLoader />}
            <div className="card b">
                <div className="card-body bb bt">
                    <div className="content-heading">Invoices</div>
                    <div className="row">
                        <div className="col-md-12">
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
                                        <InputLabel>Select Type</InputLabel>
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
                                <div className="col-md-2">
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
                                        { name: 'Invoice #', sortable: false},
                                        { name: 'Order', sortable: false},
                                        { name: 'Company', sortable: false},
                                        { name: 'Amount', sortable: false},
                                        { name: 'Due date', sortable: false},
                                        {name: 'Status', sortable: false},
                                        { name: 'Created On', sortable: true, param: 'creationDate' }]}
                                        onSort={this.onSort.bind(this)} />
                                </thead>
                                <tbody>
                                    {this.state.objects.map((obj, i) => {
                                        return (
                                            <tr key={obj.id}>
                                                <td>{i + 1}</td>
                                                <td>
                                                     {obj.invoiceNo}
                                                </td>
                                                <td>
                                                    <Link to={`/orders/${obj.order.id}`}>
                                                        Order
                                                    </Link>
                                                </td>
                                                <td>
                                                    <Link to={`/companies/${obj.company.id}`}>
                                                        {obj.company.name}
                                                    </Link>
                                                </td>
                                                <td>
                                                   {obj.amountPaid}
                                                </td>
                                                <td>
                                                    <Moment format="DD MMM YY">{obj.dueDate}</Moment>
                                                </td>
                                                <td>
                                                    <span className={getStatusBadge(obj.status, this.state.status)}>{obj.status}</span>
                                                </td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
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
                                        <th>Name</th>
                                        <th>Created On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.all.map((obj, i) => {
                                        return (
                                            <tr key={obj.id}>
                                                <td>{i + 1}</td>
                                                <td>{obj.name}</td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </ContentWrapper>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(Invoices);