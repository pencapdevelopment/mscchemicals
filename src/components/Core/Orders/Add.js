import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';

import { server_url, context_path,  getUniqueCode,  } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl,  } from '@material-ui/core';
import AutoSuggest from '../../Common/AutoSuggest';

import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';


import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

// const json2csv = require('json2csv').parse;



class Add extends Component {

    state = {
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},

            obj: {
                code: getUniqueCode('OR'),
                type: 'Sales',
                enquiryId: 0,
                company: '',
                product: '',
                contactName: '',
                email: '',
                phone: '',
                source: '',
                description: '',
                terms: '',
                billingAddress: '',
                status: 'On going',
                quantity: '0',
                amount: '0'
            }
        },
        status: [
            { label: 'On going', value: 'On going' },
            { label: 'Completed', value: 'Completed' },
        ],
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=order_edit')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj = res.data;

                formWizard.obj.selectedCompany = res.data.company;
                formWizard.obj.selectedProduct = res.data.product;

                formWizard.obj.company = res.data.company.id;
                //formWizard.obj.product = res.data.product.id;
                
                this.companyASRef.setInitialField(formWizard.obj.selectedCompany)
              //  this.productASRef.setInitialField(formWizard.obj.selectedProduct)

                this.setState({ formWizard });
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

        const tabPane = document.getElementById('orderForm');
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

            var promise = undefined;
            var products=newObj.products;
            newObj.products=null;
            if (!this.state.formWizard.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }

            promise.then(res => {
                newObj.products=products;
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
                var errorMessage="";
                if (err.response.data.globalErrors) {
                    err.response.data.globalErrors.forEach(e => {
                        errorMessage+=e+""
                    });
                }
                formWizard.errors = errors;
                this.setState({ formWizard });
                if(!errorMessage) errorMessage = "Please resolve the errors";
                swal("Unable to Save!", errorMessage, "error");
            })
        }
        return true;
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.props.onRef(this);
        this.setState({ loding: false })
    }

    render() {
        const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="orderForm">

                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <fieldset>
                                <TextField type="text" name="code" label="Order ID" required={true} fullWidth={true}
                                    inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    disabled={this.state.formWizard.editFlag}
                                    helperText={errors?.code?.length > 0 ? errors?.code[0]?.msg : ""}
                                    error={errors?.code?.length > 0}
                                    value={this.state.formWizard.obj.code} onChange={e => this.setField("code", e)} />
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

                                        projection="company_auto_suggest"
                                        value={this.state.formWizard.obj.selectedCompany}
                                        onSelect={e => this.setAutoSuggest('company', e?.id)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <TextField id="contactName" name="contactName" label="Contact Name" type="text"
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.contactName?.length > 0 ? errors?.contactName[0]?.msg : ""}
                                        error={errors?.contactName?.length > 0} value={this.state.formWizard.obj.contactName}
                                        defaultValue={this.state.formWizard.obj.contactName} onChange={e => this.setField("contactName", e)} />
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="email" label="Email" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"email"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ""}
                                    error={errors?.email?.length > 0}
                                    value={this.state.formWizard.obj.email} onChange={e => this.setField("email", e)} />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="phone" label="Phone" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 13, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"10"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ""}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.phone} onChange={e => this.setField("phone", e)} />
                            </fieldset>

                            <fieldset>
                                <FormControl>
                                    <InputLabel>Order Status</InputLabel>
                                    <Select label="Order Status" name="status"
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

                            <fieldset>
                                <TextField type="text" name="terms" label="Payment Terms" required={true}
                                    fullWidth={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.terms?.length > 0 ? errors?.terms[0]?.msg : ""}
                                    error={errors?.terms?.length > 0}
                                    value={this.state.formWizard.obj.terms}
                                    onChange={e => this.setField("terms", e)} />
                            </fieldset>

                            <fieldset>
                                <TextField type="text" name="billingAddress" label="Billing Address" required={true}
                                    fullWidth={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.billingAddress?.length > 0 ? errors?.billingAddress[0]?.msg : ""}
                                    error={errors?.billingAddress?.length > 0}
                                    value={this.state.formWizard.obj.billingAddress}
                                    onChange={e => this.setField("billingAddress", e)} />
                            </fieldset>

                           {/*  <fieldset>
                                <FormControl>
                                    <AutoSuggest url="products"
                                        name="productName"
                                        displayColumns="name"
                                        label="Product"
                                        placeholder="Search Product by name"
                                        arrayName="products"
                                        helperText={errors?.productName_auto_suggest?.length > 0 ? errors?.productName_auto_suggest[0]?.msg : ""}
                                        error={errors?.productName_auto_suggest?.length > 0}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        onRef={ref => (this.productASRef = ref)}

                                        projection="product_auto_suggest"
                                        value={this.state.formWizard.selectedProduct}
                                        onSelect={e => this.setAutoSuggest('product', e?.id)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.quantity?.length > 0 ? errors?.quantity[0]?.msg : ""}
                                    error={errors?.quantity?.length > 0}
                                    value={this.state.formWizard.obj.quantity} onChange={e => this.setField("quantity", e)} />
                            </fieldset>
                            <fieldset>
                                <TextField type="number" name="amount" label="Amount" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                    helperText={errors?.amount?.length > 0 ? errors?.amount[0]?.msg : ""}
                                    error={errors?.amount?.length > 0}
                                    value={this.state.formWizard.obj.amount} onChange={e => this.setField("amount", e)} />
                            </fieldset>*/}
                            <div className="text-center">
                                <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>
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
)(Add);