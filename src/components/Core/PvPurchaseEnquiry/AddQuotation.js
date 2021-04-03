import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import AutoSuggest from '../../Common/AutoSuggest';
// import { saveProducts } from '../Common/AddProducts';
import * as Const from '../../Common/constants';
import { Link } from 'react-router-dom';
import { server_url, context_path, getUniqueCode, } from '../../Common/constants';
import { Button, TextField, FormControl, } from '@material-ui/core';
import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';
import { Table } from 'reactstrap';
import FormValidator from '../../Forms/FormValidator';
import { Form } from 'reactstrap';
// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
// const json2csv = require('json2csv').parse;
class AddQuotation extends Component {
    state = {
        editFlag: false,
        status: [],
        formWizard: {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                code: getUniqueCode('PVQ'),
                company: '',
                specification: '',
                make: '',
                packing: '',
                gst: '',
                amount: '',
                transportationCharges: '',
                terms: '',
                deliveryPeriod: '',
                validity: '',
                enquiry: 0,
                validTill: null,
                selectedProduct: '',
                selectedCompany: '',
                product: '',
                products: [],
            },
            selectedProducts: [],
        }
    }
    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=pv_purchase_quotation_edit')
        .then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj = res.data;
            formWizard.obj.selectedCompany = res.data.company;
            formWizard.obj.company = res.data.company.id;
            formWizard.obj.enquiry = res.data.enquiry.id;
            this.companyASRef.setInitialField(formWizard.obj.selectedCompany);
            // formWizard.obj.products.forEach((p, idx) => {
            //     formWizard.selectedProducts[idx] = p;
            //     this.productASRef.push(''); //this.productASRef[idx].setInitialField(p);
            // });
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
        const tabPane = document.getElementById('salesQuoteForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        var formWizard = this.state.formWizard;
        formWizard.errors = errors;
        this.setState({ formWizard });
        return hasError;
    }
    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
            var newObj = {...this.state.formWizard.obj};
            newObj.company = '/prospective-vendor/' + newObj.company;
            newObj.enquiry = '/pvPurchase/' + newObj.enquiry;
            newObj.products = null;
            var promise = undefined;
            if (!this.state.formWizard.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }
            promise.then(res => {
                // newObj.products = products;
                this.setState({ loading: false });
                this.props.onSave(res.data.id);
                /*saveProducts(this.props.baseUrl, res.data.id, products, () => {
                    this.setState({ loading: false });
                    this.props.onSave(res.data.id);
                });*/
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
                var errorMessage = "";
                if (err.response.data.globalErrors) {
                    err.response.data.globalErrors.forEach(e => {
                        errorMessage += e + ""
                    });
                }
                formWizard.errors = errors;
                this.setState({ formWizard });
                if (!errorMessage) errorMessage = "Please resolve the errors";
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
        if (!this.props.currentId && this.props.parentObj) {
            var formWizard = this.state.formWizard;
            formWizard.obj.enquiry = this.props.parentObj.id;
            formWizard.obj.selectedCompany = this.props.parentObj.company;
            formWizard.obj.company = this.props.parentObj.company.id;
            this.companyASRef.setInitialField(formWizard.obj.selectedCompany);
            this.props.parentObj.products.forEach((p, idx) => {
                p.id = null;
            });
            formWizard.obj.products = this.props.parentObj.products;
            axios.get(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "/" + this.props.parentObj.id + '?projection=pvpurchase_edit').then(res => {
                // this.setState({ obj: res.data });
                res.data.products.forEach((p, idx) => {
                    formWizard.selectedProducts[idx] = p.product;
                    p.product = p.product.id;
                    this.productASRef.push(formWizard.selectedProducts[idx]); //this.productASRef[idx].setInitialField(p);
                });
                this.setState({ formWizard });
            });
        }
    }
    render() {
        const errors = this.state.formWizard.errors;
        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="salesQuoteForm">
                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <fieldset>
                                <TextField type="text" name="code" label="Quotation ID" required={true} fullWidth={true}
                                    inputProps={{ readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.code?.length > 0 ? errors?.code[0]?.msg : ""}
                                    error={errors?.code?.length > 0}
                                    value={this.state.formWizard.obj.code} onChange={e => this.setField("code", e)} />
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <AutoSuggest url="prospective-vendor"
                                        name="companyName"
                                        displayColumns="name"
                                        label="Company"
                                        onRef={ref => (this.companyASRef = ref)}
                                        placeholder="Search Company by name"
                                        arrayName="prospective-vendor"
                                        helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                        error={errors?.companyName_auto_suggest?.length > 0}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        readOnly={true}
                                        projection="vendor_auto_suggest"
                                        value={this.state.formWizard.obj.selectedCompany}
                                        onSelect={e => this.setAutoSuggest('company', e?.id)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>
                            </fieldset>
                            {/* <fieldset>
                                <TextField type="text" name="specification" label="Specification" required={true} fullWidth={true} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.specification?.length > 0 ? errors?.specification[0]?.msg : ""}
                                    error={errors?.specification?.length > 0}
                                    value={this.state.formWizard.obj.specification} onChange={e => this.setField("specification", e)} />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="make" label="Make" required={true}
                                    fullWidth={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.make?.length > 0 ? errors?.make[0]?.msg : ""}
                                    error={errors?.make?.length > 0}
                                    value={this.state.formWizard.obj.make}
                                    onChange={e => this.setField("make", e)} />
                            </fieldset> */}
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
                                <TextField type="number" name="gst" label="GST" required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.gst} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.gst?.length > 0 ? errors?.gst[0]?.msg : ""}
                                    error={errors?.gst?.length > 0}
                                    onChange={e => this.setField("gst", e)} />
                            </fieldset>
                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker
                                        autoOk
                                        clearable
                                        label="Valid Till"
                                        format="DD/MM/YYYY"
                                        value={this.state.formWizard.obj.validTill}
                                        onChange={e => this.setDateField('validTill', e)}
                                        TextFieldComponent={(props) => (
                                            <TextField
                                                type="text"
                                                name="validTill"
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
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save</Button>
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
)(AddQuotation);