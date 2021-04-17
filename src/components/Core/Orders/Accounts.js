import React, { Component } from 'react';
// import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
// import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
// import { Table } from 'reactstrap';
import PageLoader from '../../Common/PageLoader';
// import { Row, Col, Modal,
//     ModalHeader,
//     ModalBody } from 'reactstrap';
// import Sorter from '../../Common/Sorter';
// import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path,  getStatusBadge } from '../../Common/constants';
import { Button } from '@material-ui/core';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
// import TabPanel from '../../Common/TabPanel';
import InvoiceHistory from './InvoiceHistory';
import AddAccounts from './AddAccounts';
// const json2csv = require('json2csv').parse;
class Accounts extends Component {
    state = {
        activeTab: 0,
        loading:false,
        editFlag: false,
        modal: false,
        obj: '',
        baseUrl: 'accounts',
        currentId: '',
        status: [
            { label: 'Pending Payment', value: 'Pending Payment' },
            { label: 'Patial Payment', value: 'Patial Payment' },
            { label: 'Completed', value: 'Completed' },
        ],
    }
    loadObj(id) {
        this.setState({loading:true});
        axios.get(server_url + context_path + "api/" + this.state.baseUrl + "?order.id=" + id + '&projection=order_accounts_edit').then(res => {
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];
            if(list.length) {
                this.setState({ obj: list[0], currentId: list[0].id });
            }
            this.setState({loading:false});
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        // console.log('accounts component did mount');
        // console.log(this.props.currentId);
        this.loadObj(this.props.currentId);
        this.props.onRef(this);
    }
    updateObj() {
        if(this.state.obj) {
            this.setState({ editFlag: true }, () => {
                this.addTemplateRef.updateObj(this.state.currentId);
            })
        } else {
            this.setState({ editFlag: true });
        }
    }
    saveSuccess(id) {
        this.setState({ editFlag: false });
        this.loadObj(this.props.currentId);
    }
    cancelSave = () => {
        this.setState({ editFlag: false });
    }
    updateStatus = (status) => {
        var obj = this.state.obj;
        obj.status = status;
        this.setState({ obj });
    }
    render() {
        return (
            <div>
                {this.state.loading && <PageLoader />}
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-12">
                            {this.state.obj &&
                            <div className="card b">
                                <div className="card-header">
                                    <div className="float-right mt-2">
                                        <InvoiceHistory onRef={ref => (this.statusRef = ref)} baseUrl={this.state.baseUrl} currentId={this.state.currentId}
                                            onUpdate={(id) => this.updateStatus(id)} statusList={this.state.status} status={this.state.obj.status}
                                            statusType="Payment">
                                        </InvoiceHistory>
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
                                                    <strong>Type</strong>
                                                </td>
                                                <td>{this.state.obj.type}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Invoice No</strong>
                                                </td>
                                                <td>{this.state.obj.invoiceNo}</td>
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
                                                    <strong>Bank Name</strong>
                                                </td>
                                                <td>{this.state.obj.bankName}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Account No</strong>
                                                </td>
                                                <td>{this.state.obj.accountNo}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Payment Type</strong>
                                                </td>
                                                <td>{this.state.obj.paymentType}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Reference No</strong>
                                                </td>
                                                <td>{this.state.obj.referenceNo}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Payment Terms</strong>
                                                </td>
                                                <td>{this.state.obj.paymentTerm}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Amount Paid</strong>
                                                </td>
                                                <td>{this.state.obj.amountPaid}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Payment Status</strong>
                                                </td>
                                                <td><span className={getStatusBadge(this.state.obj.status, this.state.status)}>{this.state.obj.status}</span></td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Description</strong>
                                                </td>
                                                <td>{this.state.obj.description}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Due Date</strong>
                                                </td>
                                                <td><Moment format="DD MMM YY">{this.state.obj.dueDate}</Moment></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>}
                            {!this.state.obj &&
                            <div className="text-center">
                                <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Add Accounts</Button>
                            </div>}
                        </div>
                    </div>}
                {this.state.editFlag &&
                    <div className="card b">
                        <div className="card-body bb bt">
                            <AddAccounts baseUrl={this.state.baseUrl} currentId={this.state.currentId} 
                            onRef={ref => (this.addTemplateRef = ref)} onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}
                            parentObj={this.props.parentObj}></AddAccounts>
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
)(Accounts);