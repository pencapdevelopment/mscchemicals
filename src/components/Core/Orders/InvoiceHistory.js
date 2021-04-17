import { Button, FormControl, InputLabel, MenuItem, Select, TextareaAutosize,TextField } from '@material-ui/core';
import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Modal,
    ModalBody, ModalHeader
} from 'reactstrap';
import swal from 'sweetalert';
import { context_path, server_url } from '../../Common/constants';
class InvoiceHistory extends Component {
    state = {
        modal: false,
        loading: false,
        error: {},
        amount:0,
        selectedStatus: '',
        statusNotes:'',
        history:[],
        paymentType:[{value:'Cash',label:'Cash'},{value:'Cheque',label:'Cheque'},{value:'Bank Transfer',label:'Bank Transfer'}]
    }
    toggleModal = () => {
        if(!this.state.modal){this.loadInvoiceHistory()};
        this.setState({
            modal: !this.state.modal,
            amount:0,
            selectedStatus: '',
            statusNotes:'',
            selectedTypePayment:'',
            other:''
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        // console.log('status component did mount');
        // console.log(this.props.currentId);
        this.props.onRef(this);
        this.setState({
            selectedStatus: this.props.status,
            statusNotes: this.props.statusNotes
        })
        this.loadInvoiceHistory();
    }
    loadInvoiceHistory = () => {
        axios.get(server_url + context_path + "api/invoice-history?sort=creationDate,desc&invoice=" + this.props.currentId ).then(res=>{
            this.setState({history: res.data['_embedded']['invoice-history']})
        });
    }
    patchStatus = e => {
        e.preventDefault();
        var invoiceObj={};
        invoiceObj.invoice=this.props.currentId;
        invoiceObj.amount=this.state.amount;
        invoiceObj.paymentStatus=this.state.selectedStatus;
        invoiceObj.typeOfPayment=this.state.selectedTypePayment;
        invoiceObj.other=this.state.other;
        axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.props.currentId, { status: this.state.selectedStatus,statusNotes:this.state.statusNotes })
        .then(res => {
            axios.post(server_url + context_path + "api/invoice-history",invoiceObj ).then(g=>{
                this.props.onUpdate(this.state.selectedStatus);
            })
            }).finally(() => {
                this.setState({ loading: false });
                this.toggleModal();
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }
    render() {
        return (<span>
            <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                <ModalHeader toggle={this.toggleModal}>
                    Update {this.props.statusType} Status
                    </ModalHeader>
                <ModalBody>
                    <form className="form-horizontal" onSubmit={this.patchStatus}>
                        <fieldset>
                            <FormControl>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" name="status"
                                    value={this.state.selectedStatus}
                                    onChange={e => this.setState({ selectedStatus: e.target.value })}>
                                    {this.props.statusList.map((e, keyIndex) => {
                                        return (
                                            <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </fieldset>
                        <fieldset>
                            <FormControl>
                                <InputLabel>Type of Payment</InputLabel>
                                <Select label="Type" name="typeOfPayment"
                                    value={this.state.selectedTypePayment}
                                    onChange={e => this.setState({ selectedTypePayment: e.target.value })}>
                                    {this.state.paymentType.map((e, keyIndex) => {
                                        return (
                                            <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </fieldset>
                        <fieldset>
                        <TextField type="number" name="amount" label="Amount Paid" required={true} fullWidth={true}
                            value={this.state.amount} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                            onChange={e => this.setState({ amount: e.target.value })} />
                        </fieldset>
                         <fieldset>
                            <FormControl>
                                <TextareaAutosize
                                    label="Notes"
                                    placeholder="Notes"
                                    rowsMin={4}
                                    onChange={e => this.setState({ other: e.target.value })} 
                                    value={this.state.other}
                                    defaultValue={this.state.other}
                                />
                            </FormControl>
                        </fieldset>
                        <fieldset>
                            <div className="form-group text-center">
                                <Button variant="contained" color="primary" type="submit" className="btn btn-raised btn-primary">Save</Button>
                            </div>
                        </fieldset>
                        <fieldset>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <td>Payment Type</td>
                                        <td>Amount</td>
                                        <td>Other</td>
                                    </tr>
                                </thead>
                                {this.state.history.map(g=>{
                                    return (<tr>
                                        <td>{g.typeOfPayment}</td>
                                        <td>{g.amount}</td>
                                        <td>{g.other}</td>
                                    </tr>)})
                                }
                            </table>
                        </fieldset>
                    </form>
                </ModalBody>
            </Modal>
            <Button className="ml-2 mr-2" variant="contained" color="warning" size="xs" onClick={this.toggleModal}>Update {this.props.statusType} Status</Button>
        </span>)
    }
}
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(InvoiceHistory);