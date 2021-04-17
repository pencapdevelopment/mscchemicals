import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import AutoSuggest from '../../Common/AutoSuggest';
import { server_url, context_path,  } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl,  } from '@material-ui/core';
import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import PageLoader from '../../Common/PageLoader';
import Event from '@material-ui/icons/Event';
import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';
// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
// const json2csv = require('json2csv').parse;
class AddAccounts extends Component {
    state = {
        loading:false,
        editFlag: false,
        // status: [],
        formWizard: {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                invoiceNo: '', 
                type: this.props.parentObj.type === 'Sales' ? 'Outgoing' : 'Incoming',
                bankName: '',
                accountNo: '',
                paymentType: '',
                referenceNo: '',
                paymentTerm: '',
                amountPaid: '',
                dueDate: null,
                status: '',
                description: '',
                company: '',
                order: '',
                products: [],
            }
        },
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
            { label: 'Pending Payment', value: 'Pending Payment' },
            { label: 'Patial Payment', value: 'Patial Payment' },
            { label: 'Completed', value: 'Completed' },
        ],
    }
    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=order_accounts_edit')
        .then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj = res.data;
            formWizard.obj.order = formWizard.obj.order.id;
            formWizard.obj.selectedCompany = res.data.company;
            formWizard.obj.company = res.data.company.id;
            this.companyASRef.setInitialField(formWizard.obj.selectedCompany);
            this.setState({ formWizard,loading:false });
        });
    }
    updateObj(id) {
        var formWizard = this.state.formWizard;
        formWizard.obj.id = id;
        formWizard.editFlag = true;
        this.setState({ formWizard }, this.loadData);
    }
    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;
        var input = e.target;
        formWizard.obj[field] = e.target.value;
        this.setState({ formWizard });
        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({
                formWizard
            });
        }
    }
    setSelectField(field, e) {
        this.setField(field, e, true);
    }
    setDateField(field, e) {
        var formWizard = this.state.formWizard;
        if(e) {
            formWizard.obj[field] = e.format();
        } else {
            formWizard.obj[field] = null;
        }
        this.setState({ formWizard });
    }
    setAutoSuggest(field, val) {
        var formWizard = this.state.formWizard;
        formWizard.obj[field] = val;
        formWizard['selected' + field] = val;
        this.setState({ formWizard });
    }
    checkForError() {
        // const form = this.formWizardRef;
        const tabPane = document.getElementById('orderQuoteForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        var formWizard = this.state.formWizard;
        formWizard.errors = errors;
        this.setState({ formWizard });
        console.log(errors);
        return hasError;
    }
    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
            var newObj = this.state.formWizard.obj;
            newObj.company = '/companies/' + newObj.company;
            newObj.order = '/orders/' + newObj.order;
            var promise = undefined;
            this.setState({loading:true});
            if (!this.state.formWizard.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }
            promise.then(res => {
                var formw = this.state.formWizard;
                formw.obj.id = res.data.id;
                formw.msg = 'successfully Saved';
                this.props.onSave(res.data.id);
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                // this.toggleTab(0);
                //this.setState({ addError: err.response.data.globalErrors[0] });
                var formWizard = this.state.formWizard;
                formWizard.globalErrors = [];
                if (err.response.data.globalErrors) {
                    err.response.data.fieldError.forEach(e => {
                        formWizard.globalErrors.push(e);
                    });
                }
                var errors = {};
                if (err.response.data.fieldError) {
                    err.response.data.fieldError.forEach(e => {
                        if (errors[e.field]) {
                            errors[e.field].push(e.errorMessage);
                        } else {
                            errors[e.field] = [];
                            errors[e.field].push(e.errorMessage);
                        }
                    });
                }
                formWizard.errors = errors;
                this.setState({ formWizard });
                swal("Unable to Save!", err.response.data.globalErrors[0], "error");
            })
        }
        return true;
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.props.onRef(this);
        this.setState({ loding: true });   
        if(!this.props.currentId && this.props.parentObj) {
            var formWizard = this.state.formWizard;
            formWizard.obj.order = this.props.parentObj.id;
            formWizard.obj.selectedCompany = this.props.parentObj.company;
            formWizard.obj.company = this.props.parentObj.company.id;
            formWizard.obj.paymentTerm = this.props.parentObj.company.paymentTerms;
            this.companyASRef.setInitialField(formWizard.obj.selectedCompany);
            this.setState({ formWizard });
        }
    }
    render() {
        const errors = this.state.formWizard.errors;
        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="orderQuoteForm">
                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <fieldset>
                                <TextField type="text" name="invoiceNo" label="Invoice No" required={true} fullWidth={true}
                                    inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.invoiceNo?.length > 0 ? errors?.invoiceNo[0]?.msg : ""}
                                    error={errors?.invoiceNo?.length > 0}
                                    value={this.state.formWizard.obj.invoiceNo} onChange={e => this.setField("invoiceNo", e)} />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="type" label="Type" required={true} fullWidth={true}
                                    inputProps={{readOnly: true, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.type?.length > 0 ? errors?.type[0]?.msg : ""}
                                    error={errors?.type?.length > 0}
                                    value={this.state.formWizard.obj.type} onChange={e => this.setField("type", e)} />
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <AutoSuggest url="companies"
                                        name="companyName"
                                        displayColumns="name"
                                        label="Company"
                                        onRef={ref => (this.companyASRef = ref)}
                                        placeholder="Search Company by name"
                                        arrayName="companies"
                                        helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                        error={errors?.companyName_auto_suggest?.length > 0}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        readOnly={true}
                                        projection="company_auto_suggest"
                                        value={this.state.formWizard.obj.selectedCompany}
                                        onSelect={e => this.setAutoSuggest('company', e?.id)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="bankName" label="Bank Name" required={true} fullWidth={true} 
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.bankName?.length > 0 ? errors?.bankName[0]?.msg : ""}
                                    error={errors?.bankName?.length > 0}
                                    value={this.state.formWizard.obj.bankName} onChange={e => this.setField("bankName", e)} />
                            </fieldset>                       
                            <fieldset>
                                <TextField type="number" name="accountNo" label="Account No" required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.accountNo} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.accountNo?.length > 0 ? errors?.accountNo[0]?.msg : ""}
                                    error={errors?.accountNo?.length > 0}
                                    onChange={e => this.setField("accountNo", e)} />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="paymentType" label="Payment Type" required={true} fullWidth={true} 
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.paymentType?.length > 0 ? errors?.paymentType[0]?.msg : ""}
                                    error={errors?.paymentType?.length > 0}
                                    value={this.state.formWizard.obj.paymentType} onChange={e => this.setField("paymentType", e)} />
                            </fieldset>                       
                            <fieldset>
                                <TextField type="number" name="referenceNo" label="Reference No" required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.referenceNo} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.referenceNo?.length > 0 ? errors?.referenceNo[0]?.msg : ""}
                                    error={errors?.referenceNo?.length > 0}
                                    onChange={e => this.setField("referenceNo", e)} />
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                <InputLabel>Select PaymentTerms</InputLabel>
                                    <Select
                                        name="paymentTerm" 
                                        helperText={errors?.paymentTerm?.length > 0 ? errors?.paymentTerm[0]?.msg : ""}
                                        error={errors?.paymentTerm?.length > 0}
                                        label="Select paymentTerm..."
                                        value={this.state.formWizard.obj.paymentTerm}
                                        onChange={e => this.setSelectField('paymentTerm', e)}
                                    >
                                        {this.state.terms.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>                       
                            <fieldset>
                                <TextField type="number" name="amountPaid" label="Amount Paid" required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.amountPaid} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.amountPaid?.length > 0 ? errors?.amountPaid[0]?.msg : ""}
                                    error={errors?.amountPaid?.length > 0}
                                    onChange={e => this.setField("amountPaid", e)} />
                            </fieldset>
                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    label="Due Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.dueDate} 
                                    onChange={e => this.setDateField('dueDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="dueDate"
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
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <InputLabel>Payment Status</InputLabel>
                                    <Select label="status" name="status"
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.status?.length > 0 ? errors?.status[0]?.msg : ""}
                                        error={errors?.status?.length > 0}
                                        value={this.state.formWizard.obj.status}
                                        onChange={e => this.setSelectField('status', e)}> {this.state.status.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <TextareaAutosize placeholder="Description" fullWidth={true} rowsMin={3} name="description"
                                inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                helperText={errors?.description?.length > 0 ? errors?.description[0]?.msg : ""}
                                error={errors?.description?.length > 0}
                                value={this.state.formWizard.obj.description} onChange={e => this.setField("description", e)} />
                            </fieldset>
                            <div className="text-center">
                                <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save</Button>
                            </div>
                        </div>
                    </div>
                </Form>
            </ContentWrapper>)
    }
}
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(AddAccounts);