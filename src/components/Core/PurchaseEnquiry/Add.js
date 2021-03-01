import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';

import { Link } from 'react-router-dom';
import { server_url, context_path,  getUniqueCode,  } from '../../Common/constants';
// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl, } from '@material-ui/core';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';
import AutoSuggest from '../../Common/AutoSuggest';
import { saveProducts } from '../Common/AddProducts';

import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';

import { Table } from 'reactstrap';
import FormValidator from '../../Forms/FormValidator';
// import { Card, CardHeader, CardBody, Input, TabContent, TabPane, Nav, NavItem, NavLink, Form, CustomInput } from 'reactstrap';
import {  Form } from 'reactstrap';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import UOM from '../Common/UOM';
// const json2csv = require('json2csv').parse;



class Add extends Component {

    state = {
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},

            obj: {
                code: getUniqueCode('PR'),
                enquiryDate: null,
                company: '',
                contactName: '',
                email: '',
                phone: '',
                source: '',
                status: 'On going',
                description: '',
                quantity: '0',
                product: '',
                products: [],
            },
            selectedProducts: [],
        },
        status: [
            { label: 'On going', value: 'On going' },
            { label: 'Rejected', value: 'Rejected' },
            { label: 'Partially Rejected', value: 'Partially Rejected' },
            { label: 'Converted', value: 'Converted' },
        ],
    }
    loadCompany(companyId) {

        axios.get(server_url + context_path + "api/companies/" + companyId + '?projection=company_auto_suggest_product')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj.email = res.data.email;
                formWizard.obj.phone = res.data.phone;

                if(res.data.products) {
                    res.data.products.forEach(p => {
                            formWizard.obj.products = [];
                            formWizard.selectedProducts = [];
                            var products = formWizard.obj.products;

                            // var idx = products.length;
                            products.push({quantity: '', amount: ''})
                            formWizard.selectedProducts.push(p.product);
                    })
                }

                this.setState({ formWizard },  o => {
                    if(res.data.products) {
                        res.data.products.forEach((p, idx) => {
                            this.productASRef[idx].setInitialField(formWizard.selectedProducts[idx]);
                        });
                    }
                });
            });



    }
    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=purchases_edit')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj = res.data;

                formWizard.obj.selectedCompany = res.data.company;
                formWizard.obj.company = res.data.company.id;
                this.companyASRef.setInitialField(formWizard.obj.selectedCompany);

                formWizard.obj.products.forEach((p, idx) => {
                    formWizard.selectedProducts[idx] = p;
                    this.productASRef.push(''); //this.productASRef[idx].setInitialField(p);
                });

                this.setState({ formWizard });
            });
    }
    createNewObj() {
        var formWizard = {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                code: getUniqueCode('SE'),
                enquiryDate: null,
                company: '',
                contactName: '',
                email: '',
                phone: '',
                source: '',
                status: '',
                description: '',
                product: '',
                quantity: '0',
                createdBy: '',
            }
        }

        this.setState({ formWizard });
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

        if (e) {
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
        if (field === 'company') {
            this.loadCompany(val)
        }
    }




    setProductField(i, field, e, noValidate) {
        var formWizard = this.state.formWizard;

        var input = e.target;
        formWizard.obj.products[i][field] = e.target.value;
        this.setState({ formWizard });

        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({
                formWizard
            });
        }
    }

    setProductAutoSuggest(idx, val) {
        var formWizard = this.state.formWizard;

        var products = formWizard.obj.products;
        var selectedProducts = formWizard.selectedProducts;

        products[idx].product = val;
        selectedProducts[idx] = { id: val };

        products[idx].updated = true;

        this.setState({ formWizard });
    }

    addProduct = () => {
        var formWizard = this.state.formWizard;

        var products = formWizard.obj.products;
        var idx = products.length;
        products.push({
            departmentName: '',
            phone: '',
            email: ''
        })
        formWizard.selectedProducts.push('');

        this.setState({ formWizard }, o => {
            this.productASRef[idx].setInitialField(formWizard.selectedProducts[idx]);
        });
    }

    deleteProduct = (i) => {
        var formWizard = this.state.formWizard;

        var products = formWizard.obj.products;

        if (products[i].id) {
            products[i].delete = true;
        } else {
            products.splice(i, 1);
            formWizard.selectedProducts.splice(i, 1);
        }

        this.setState({ formWizard });
    }



    checkForError() {
        // const form = this.formWizardRef;

        const tabPane = document.getElementById('purchaseEnquiryForm');
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

            if (!newObj.products.length) {
                swal("Unable to Save!", "Please add atleast one product", "error");
                return;
            }

            var products = newObj.products;

            newObj.products = null;


            newObj.adminApproval='N';
            var promise = undefined;

            if (!this.state.formWizard.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }
            var that = this;
            promise.then(res => {
                newObj.products = products;
                if (that.state.formWizard.editFlag) {
                    products.forEach(g => { g.updated = true; g.product = g.product.id; })
                }
                saveProducts(this.props.baseUrl, res.data.id, products, () => {
                    this.setState({ loading: false });
                    this.props.onSave(res.data.id);
                });
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
        this.productASRef = [];
        this.props.onRef(this);
        this.setState({ loding: false })
    }

    render() {
        const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="purchaseEnquiryForm">

                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <fieldset>
                                <TextField type="text" name="code" label="Purchase ID" required={true} fullWidth={true}
                                    inputProps={{ readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    disabled={this.state.formWizard.editFlag}
                                    helperText={errors?.code?.length > 0 ? errors?.code[0]?.msg : ""}
                                    error={errors?.code?.length > 0}
                                    value={this.state.formWizard.obj.code} onChange={e => this.setField("code", e)} />
                            </fieldset>
                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker
                                        autoOk
                                        clearable
                                        disableFuture
                                        label="Enquiry Date"
                                        format="DD/MM/YYYY"
                                        value={this.state.formWizard.obj.enquiryDate}
                                        onChange={e => this.setDateField('enquiryDate', e)}
                                        TextFieldComponent={(props) => (
                                            <TextField
                                                type="text"
                                                name="enquiryDate"
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
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
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
                                <TextField type="text" name="source" label="Source" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.source?.length > 0 ? errors?.source[0]?.msg : ""}
                                    error={errors?.source?.length > 0}
                                    value={this.state.formWizard.obj.source} onChange={e => this.setField("source", e)} />
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <InputLabel>Enquiry Status</InputLabel>
                                    <Select label="Enquiry Status" name="status" disabled={true}
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

                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <h4>
                            Products
                            <Button className="ml-2" variant="outlined" color="primary" size="sm" onClick={this.addProduct} title="Add Product">
                                <em className="fas fa-plus mr-1"></em> Add
                            </Button>
                        </h4>
                    </div>

                    {this.state.formWizard.obj.products && this.state.formWizard.obj.products.length > 0 &&
                        <div className="row">
                            <div className="col-md-12">
                                <Table hover responsive>
                                    <tbody>
                                        {this.state.formWizard.obj.products.map((prod, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td className="va-middle">{i + 1}</td>
                                                    <td className="va-middle">
                                                        <fieldset>
                                                            <FormControl>
                                                                {prod.id &&
                                                                    <Link to={`/products/${prod.product.id}`}>
                                                                        {prod.product.name}
                                                                    </Link>
                                                                }
                                                                {!prod.id &&
                                                                    <AutoSuggest url="products"
                                                                        name="productName"
                                                                        displayColumns="name"
                                                                        label="Product"
                                                                        placeholder="Search product by name"
                                                                        arrayName="products"
                                                                        helperText={errors?.productName_auto_suggest?.length > 0 ? errors?.productName_auto_suggest[i]?.msg : ""}
                                                                        error={errors?.productName_auto_suggest?.length > 0}
                                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                                        onRef={ref => (this.productASRef[i] = ref)}

                                                                        projection="product_auto_suggest"
                                                                        value={this.state.formWizard.selectedProducts[i]}
                                                                        onSelect={e => this.setProductAutoSuggest(i, e?.id)}
                                                                        queryString="&name" ></AutoSuggest>}
                                                            </FormControl>
                                                        </fieldset>
                                                    </td>
                                                    <td>
                                                        <fieldset>
                                                            {prod.id && <span>{prod.quantity}</span>}
                                                            {!prod.id &&
                                                                <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                    helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                                    error={errors?.quantity?.length > 0}
                                                                    value={this.state.formWizard.obj.products[i].quantity} onChange={e => this.setProductField(i, "quantity", e)} />}
                                                        </fieldset>
                                                    </td>
                                                    <td>
                                                       

                                                            <UOM required={true} isReadOnly={false}
                                                                value={prod.uom} onChange={e => this.setProductField(i, "uom", e,true)} />
                                                       
                                                    </td>
                                                    <td>
                                                        <fieldset>

                                                            {this.state.formWizard.editFlag &&
                                                                <TextField type="number" name="amount" label="Amount" required={true} fullWidth={true}
                                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                    helperText={errors?.amount?.length > 0 ? errors?.amount[i]?.msg : ""}
                                                                    error={errors?.amount?.length > 0}
                                                                    value={this.state.formWizard.obj.products[i].amount} onChange={e => this.setProductField(i, "amount", e)} />}
                                                        </fieldset>
                                                    </td>
                                                    <td className="va-middle">
                                                        <Button variant="outlined" color="secondary" size="sm" onClick={e => this.deleteProduct(i)} title="Delete Product">
                                                            <em className="fas fa-trash"></em>
                                                        </Button>
                                                    </td>
                                                </tr>)
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        </div>}

                    <div className="text-center mt-4">
                        <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>
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