import { server_url, context_path, defaultDateFilter} from '../Common/constants';
import React, { Component } from 'react';
import PageLoader from '../Common/PageLoader';
import ContentWrapper from '../Layout/ContentWrapper';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
import {
    Col,
    Card,
    CardBody,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    Input
} from 'reactstrap';

import swal from 'sweetalert';
import axios from 'axios';
import { connect } from 'react-redux';
import Moment from 'react-moment';
import CustomPagination from '../Common/CustomPagination';
import FileDownload from '../Common/FileDownload';

// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';
import { Button, } from '@material-ui/core';


const json2csv = require('json2csv').parse;

class Feedbacks extends Component {
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
        feedbacks: [],
        all: [],
        editFlag: false,
        newFeedback: {
            type: 'Query',
            description: '',
            response: ''
        },
        filters: {
            search: '',
            fromDate:'',
            toDate:''
        },
        addError: '',
        deleteError: '',
        updateError: ''
    };

    handleDateChange(e,field){
        var filters = this.state.filters;
        if(field==='from'){
        filters[field+'Date'] = e.startOf('day').utc().format('YYYY/MM/DD HH:mm:ss');
        }else{
            filters[field+'Date'] = e.endOf('day').utc().format('YYYY/MM/DD HH:mm:ss');
        }
        this.setState({ filters: filters },g=>{this.loadFeedbacks();});
    }
    loadFeedbacks(offset, all, callBack) {
        if (!offset) offset = 1;

        var url = server_url + context_path + "api/feedbacks?projection=feedback_details&sort=creationDate,desc&page=" + (offset - 1);

        if (this.state.filters.search) {
            url += "&email=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }
        url=defaultDateFilter(this.state,url);

        if (all) {
            url += "&size=100000";
        }

        axios.get(url)
            .then(res => {
                if (all) {
                    this.setState({
                        all: res.data._embedded.feedbacks
                    });
                } else {
                    this.setState({
                        feedbacks: res.data._embedded.feedbacks,
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

    updateDescription = e => {
        var newFeedback = this.state.newFeedback;
        newFeedback.description = e.target.value;
        this.setState({ newFeedback });
    }

    updateResponse = e => {
        var newFeedback = this.state.newFeedback;
        newFeedback.response = e.target.value;
        this.setState({ newFeedback });
    }

    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }


    resetFeedback() {
        var newFeedback = {
            type: 'Query',
            description: '',
            response: ''
        }

        this.setState({ newFeedback });
    }

    addFeedback = () => {
        this.resetFeedback();
        this.setState({ editFlag: false });

        this.toggleModal();
    }

    editFeedback = (i) => {
        var feedback = this.state.feedbacks[i];

        this.setState({ newFeedback: feedback });
        this.setState({ editFlag: true });

        this.toggleModal();
    }

    onSubmit = e => {
        e.preventDefault();

        var url = server_url + context_path + "api/feedbacks/";
        var newFeedback = this.state.newFeedback;

        this.setState({ loading: true });

        if (this.state.editFlag) {
            url += this.state.newFeedback.id;

            axios.patch(url, { response: newFeedback.response })
                .then(res => {
                    this.toggleModal();

                    if (res.status === 200) {
                        newFeedback.updationDate = new Date();

                        var feedbacks = this.state.feedbacks;
                        feedbacks[newFeedback.index] = newFeedback;

                        this.setState({ feedbacks });
                    } else {
                        this.setState({ addError: res.response.data.globalErrors[0] });
                        swal("Unable to Edit!", res.response.data.globalErrors[0], "error");
                    }
                }).finally(() => {
                    this.setState({ loading: false });
                })
        } else {
            newFeedback.user = '/user/' + this.props.user.id;

            axios.post(url, newFeedback)
                .then(res => {
                    this.toggleModal();

                    var feedbacks = this.state.feedbacks;
                    newFeedback = this.state.newFeedback;
                    newFeedback.creationDate = new Date();
                    newFeedback.updationDate = new Date();
                    feedbacks.push(newFeedback);

                    this.setState({ feedbacks });
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    this.toggleModal();
                    this.setState({ addError: err.response.data.globalErrors[0] });
                    swal("Unable to Add!", err.response.data.globalErrors[0], "error");
                })
        }
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
        const fields = ['id', 'type', 'email', 'location', 'description', 'response', 'creationDate'];
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
                        Feedbacks
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
                                {this.props.user.role !== 'ROLE_ADMIN' &&
                                    <Button variant="contained" color="primary" size="xs" className="float-right" onClick={() => this.addFeedback()}>Add Query</Button>}
                                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                                    <ModalHeader toggle={this.toggleModal}>
                                        {this.state.editFlag && <span>Respond to </span>}
                                        {!this.state.editFlag && <span>Add </span>}
                                        Query
                                    </ModalHeader>
                                    <ModalBody>
                                        <form className="form-horizontal" onSubmit={this.onSubmit}>
                                            {!this.state.editFlag &&
                                                <fieldset>
                                                    <div className="form-group row mb">
                                                        <label className="col-md-2 col-form-label">Query</label>
                                                        <Col md={10}>
                                                            <textarea className="form-control" rows="5" onChange={this.updateDescription}
                                                                value={this.state.newFeedback.description} required ></textarea>
                                                        </Col>
                                                    </div>
                                                </fieldset>}

                                            {this.state.editFlag &&
                                                <div>
                                                    <fieldset>
                                                        <div className="form-group row mb">
                                                            <label className="col-md-2 col-form-label">Query</label>
                                                            <Col md={10}>{this.state.newFeedback.description}</Col>
                                                        </div>
                                                    </fieldset>
                                                    <fieldset>
                                                        <div className="form-group row mb">
                                                            <label className="col-md-2 col-form-label">Response</label>
                                                            <Col md={10}>
                                                                <textarea className="form-control" rows="5" onChange={this.updateResponse}
                                                                    value={this.state.newFeedback.response} required ></textarea>
                                                            </Col>
                                                        </div>
                                                    </fieldset>
                                                </div>}

                                            <fieldset>
                                                <div className="form-group row">
                                                    <div className="col-12 text-center mt-3">
                                                        <button type="submit" className="btn btn-raised btn-primary">Save Query</button>
                                                    </div>
                                                </div>
                                            </fieldset>
                                        </form>
                                    </ModalBody>
                                </Modal>
                                <Table hover responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Type</th>
                                            <th>Email</th>
                                            <th>Mobile</th>
                                            <th>Location</th>
                                            <th>Query</th>
                                            <th>Created On</th>
                                            <th>Response</th>
                                            <th>Updated On</th>
                                            {this.props.user.role === 'ROLE_ADMIN' &&
                                                <th>Actions</th>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.feedbacks.map((feed, i) => {
                                            return (
                                                <tr key={feed.id}>
                                                    <td>{i + 1}</td>
                                                    <td>
                                                        {feed.type}
                                                    </td>
                                                    <td>
                                                        {feed.email}
                                                    </td>
                                                    <td>
                                                        {feed.phone}
                                                    </td>
                                                    <td>
                                                        {feed.location}
                                                    </td>
                                                    <td>
                                                        {feed.description}
                                                    </td>
                                                    <td>
                                                        <Moment format="DD MMM YY HH:mm">{feed.creationDate}</Moment>
                                                    </td>
                                                    <td>
                                                        {feed.response}
                                                        {!feed.response &&
                                                            <span>-Not Responded-</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <Moment format="DD MMM YY HH:mm">{feed.updationDate}</Moment>
                                                    </td>
                                                    {this.props.user.role === 'ROLE_ADMIN' &&
                                                        <td>
                                                            {!feed.response &&
                                                                <Button variant="contained" color="inverse" size="xs" onClick={() => this.editFeedback(i)}>Respond</Button>
                                                            }
                                                        </td>
                                                    }
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
                                            <th>Type</th>
                                            <th>Email</th>
                                            <th>Query</th>
                                            <th>Created On</th>
                                            <th>Response</th>
                                            <th>Updated On</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.all.map((feed, i) => {
                                            return (
                                                <tr key={feed.id}>
                                                    <td>{i + 1}</td>
                                                    <td>
                                                        {feed.type}
                                                    </td>
                                                    <td>
                                                        {feed.email}
                                                    </td>
                                                    <td>
                                                        {feed.description}
                                                    </td>
                                                    <td>
                                                        <Moment format="DD MMM YY HH:mm">{feed.creationDate}</Moment>
                                                    </td>
                                                    <td>
                                                        {feed.response}
                                                        {!feed.response &&
                                                            <span>-Not Responded-</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <Moment format="DD MMM YY HH:mm">{feed.updationDate}</Moment>
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
)(Feedbacks);
