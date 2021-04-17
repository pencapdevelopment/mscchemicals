import { server_url, context_path, defaultDateFilter } from '../Common/constants';
import React, { Component } from 'react';
import PageLoader from '../Common/PageLoader';
import ContentWrapper from '../Layout/ContentWrapper';
import {
    Card,
    CardBody,
    Table,
    Input,
} from 'reactstrap';
// import {
//     Col,
//     Card,
//     CardBody,
//     Table,
//     Input,
//     Modal,
//     ModalHeader,
//     ModalBody
// } from 'reactstrap';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';



// import swal from 'sweetalert';
import axios from 'axios';
import { connect } from 'react-redux';
import Moment from 'react-moment';
import CustomPagination from '../Common/CustomPagination';
import FileDownload from '../Common/FileDownload';

import { Button, } from '@material-ui/core';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';

const json2csv = require('json2csv').parse;

class Subscribers extends Component {
    state = {
        loading: false,
        modal: false,
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        offset: 1,
        all: [],
        feedbacks: [],
        filters: {
            search: '',
            fromDate: '',
            toDate: ''
        },
        editFlag: false,
        addError: '',
        deleteError: '',
        updateError: ''
    };


    handleDateChange(e, field) {
        var filters = this.state.filters;
        if (field === 'from') {
            filters[field + 'Date'] = e.startOf('day').utc().format('YYYY/MM/DD HH:mm:ss');
        } else {
            filters[field + 'Date'] = e.endOf('day').utc().format('YYYY/MM/DD HH:mm:ss');
        }
        this.setState({ filters: filters }, g => { this.loadFeedbacks(); });
    }

    loadFeedbacks(offset, all, callBack) {
        if (!offset) offset = 1;

        var url = server_url + context_path + "api/subscribers?projection=feedback_details&sort=creationDate,desc&page=" + (offset - 1);

        if (this.state.filters.search) {
            url += "&email=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }
        url = defaultDateFilter(this.state, url);
        if (all) {
            url += "&size=100000";
        }

        axios.get(url)
            .then(res => {
                if (all) {
                    this.setState({
                        all: res.data._embedded.subscribers
                    });
                } else {
                    this.setState({
                        feedbacks: res.data._embedded.subscribers,
                        page: res.data.page
                    });
                }

                if (callBack) {
                    callBack();
                }
            });
    }

    componentDidMount() {
        this.loadFeedbacks();
    }


    searchUser = e => {
        var str = e.target.value;
        var filters = this.state.filters;

        filters.search = str;
        this.setState({ filters }, o => { this.loadFeedbacks() });
    }

    printReport() {
        this.loadFeedbacks(this.state.offset, true, () => {
            window.print();
        });
    }


    downloadReport = () => {
        const fields = ['id', 'email', 'creationDate'];
        const opts = { fields };

        this.loadFeedbacks(this.state.offset, true, () => {
            var csv = json2csv(this.state.all, opts);
            FileDownload.download(csv, 'reports.csv', 'text/csv');
        });
    }


    render() {
        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <div className="content-heading">
                    <div>
                        Subscribers
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <Card className="card-default">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col-md-2">
                                        <h4 className="float-right">Filters : </h4>
                                    </div>
                                    <div className="col-md-4">
                                        <Input type="text" onChange={this.searchUser} value={this.state.filters.search} placeholder="search email..." />
                                    </div>

                                    <div className="col-md-1">

                                        <Datetime
                                            dateFormat={'DD/MM/YYYY'}
                                            timeFormat={false}
                                            closeOnSelect={true}
                                            inputProps={{ className: 'form-control', readOnly: true }}
                                            onChange={e => this.handleDateChange(e, 'from')}
                                            defaultValue={this.state.filters.fromDate} />

                                    </div>
                                    <div className="col-md-1">

                                        <Datetime
                                            dateFormat={'DD/MM/YYYY'}
                                            timeFormat={false}
                                            closeOnSelect={true}
                                            inputProps={{ className: 'form-control', readOnly: true }}
                                            onChange={e => this.handleDateChange(e, 'to')}
                                            defaultValue={this.state.filters.toDate} />

                                    </div>

                                    <div className="col-md-2">
                                        <Button className="d-none" variant="contained" color="secondary" size="small" onClick={() => this.printReport()}>Print</Button>
                                        <Button className="d-none" variant="contained" color="secondary" size="small" onClick={() => this.downloadReport()}>Download</Button>
                                    </div>
                                </div>
                            </div>
                            <CardBody>
                                <Table hover responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Email</th>
                                            <th>Creation Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.feedbacks.map((feed, i) => {
                                            return (
                                                <tr key={feed.id}>
                                                    <td>{i + 1}</td>
                                                    <td>{feed.email}</td>
                                                    <td>
                                                        <Moment format="DD MMM YY HH:mm">{feed.creationDate}</Moment>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>

                                <CustomPagination page={this.state.page} onChange={(x) => this.loadFeedbacks(x)} />

                                <Table id="printSection" responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Email</th>
                                            <th>Creation Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.all.map((feed, i) => {
                                            return (
                                                <tr key={feed.id}>
                                                    <td>{i + 1}</td>
                                                    <td>{feed.email}</td>
                                                    <td>
                                                        <Moment format="DD MMM YY HH:mm">{feed.creationDate}</Moment>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </ContentWrapper>
        );
    }

}

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(Subscribers);
