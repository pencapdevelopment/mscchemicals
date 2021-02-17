import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';

import { server_url, context_path,  } from '../../Common/constants';
import { Button, TextField, FormControl,  } from '@material-ui/core';
import AutoSuggest from '../../Common/AutoSuggest';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import MenuItem from '@material-ui/core/MenuItem';

import Select from '@material-ui/core/Select';
import Event from '@material-ui/icons/Event';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

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
        editFlag: false,

        formWizard: {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                assignedTo: '',
                docketNo: '',
                fallowupStage:'start',
                inward:"",
                outward:"",
                trackingType:"Inward",
                courierCompany: '',
                dispatchDate: null,
                receivedDate: null,
                remarks: '',
                company: '',
                product: '',
            }


        }
    }
    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;
        var input = e.target;
       console.log("element is:",input);
       console.log("field is:",field);
        formWizard.obj[field] = e.target.value;
        this.setState({ formWizard });
        // if (!noValidate) {
        //     const result = FormValidator.validate(input);
        //     formWizard.errors[input.name] = result;
        //     this.setState({
        //         formWizard
        //     });
        // }
    }
    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=tracking_edit')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj = res.data;

                formWizard.obj.selectedCompany = res.data.company;
                formWizard.obj.selectedProduct = res.data.product;

                formWizard.obj.company = res.data.company.id;
                formWizard.obj.product = res.data.product.id;
                
                this.companyASRef.setInitialField(formWizard.obj.selectedCompany);
                this.productASRef.setInitialField(formWizard.obj.selectedProduct);

                this.setState({ formWizard });
            });
    }
    createNewObj() {
        var formWizard = {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                assignedTo: '',
                docketNo: '',
                inward:"",
                outward:"",
                courierCompany: '',
                dispatchDate: null,
                receivedDate: null,
                remarks: '',
                company: '',
                product: '',
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

        const tabPane = document.getElementById('saveForm');
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
        newObj.company = '/companies/' + this.state.formWizard.selectedcompany;
        newObj.product = '/products/' + this.state.formWizard.selectedproduct;

        var promise = undefined;

        if (!this.state.editFlag) {
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
            swal("Unable to Save!", "Please resolve the errors", "error");
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
                <div className="row">
                <div className="col-md-8 offset-md-2 ">
                <fieldset>
                                <FormControl>
                                    {/* <FormLabel component="legend">Type</FormLabel> */}
                                    <RadioGroup aria-label="type" name="trackingType" row>
                                        <FormControlLabel
                                            value="Inward" checked={this.state.formWizard.obj.trackingType === 'Inward'}
                                            label="Inward"
                                            onChange={e => this.setField("trackingType", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                        
                                            value="Outward" name="trackingType"
                                            checked={this.state.formWizard.obj.trackingType === 'Outward'}
                                            label="Outward"
                                            onChange={e => this.setField("trackingType", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                               
                            </fieldset>
                </div>
                </div>
            
                {this.state.formWizard.obj.trackingType === "Inward" ?
               <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">
                
                    <div className="row" style={{marginTop: -20}}>
                    <div className="col-md-8 offset-md-2 ">
                    <fieldset>
                                <FormControl>
                                    {/* <FormLabel component="legend">Type</FormLabel> */}
                                    <RadioGroup aria-label="type" name="type" row>
                                        <FormControlLabel
                                            value="B" checked={this.state.formWizard.obj.type === 'B'}
                                            label="Supplier "
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                            value="V" checked={this.state.formWizard.obj.type === 'V'}
                                            label="Box"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                               
                            </fieldset>
                    </div>
                        <div className="offset-sm-2 col-md-4 " style={{marginTop: -40}}>
                      
                            <fieldset>
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
                            <Select
                                style={{marginTop: 15}}
                                labelId="demo-controlled-open-select-label"
                                id="demo-controlled-open-select"
                                className=" col-md-12"
                                name="fallowupStage"
                                inputProps={{  maxLength: 30, "data-validate": '[{ "key":"required"}]' }}
                                helperText={errors?.fallowupStage?.length > 0 ? errors?.fallowupStage[0]?.msg : ""}
                                onChange={e => this.setField("fallowupStage", e)}
                                >
                                <MenuItem value='start'>Start</MenuItem>
                                <MenuItem value='fallowup'>Follow Up</MenuItem>
                                <MenuItem value='end'>End</MenuItem>
                            </Select>
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <TextField id="contactName" name="contactName" label="Contact Name" type="text" required={true}
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.contactName?.length > 0 ? errors?.contactName[0]?.msg : ""}
                                        error={errors?.contactName?.length > 0} value={this.state.formWizard.obj.contactName}
                                        defaultValue={this.state.formWizard.obj.contactName} onChange={e => this.setField("contactName", e)} />
                                </FormControl>
                            </fieldset>
                            <fieldset>
                           
                                <FormControl>
                                    <TextField id="assignedTo" name="assignedTo" label="Assigned To" type="text" required={true}
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.assignedTo?.length > 0 ? errors?.assignedTo[0]?.msg : ""}
                                        error={errors?.assignedTo?.length > 0} value={this.state.formWizard.obj.assignedTo}
                                         onChange={e => this.setField("assignedTo", e)} />
                                </FormControl>
                            </fieldset>
                            {/* <fieldset>
                                <TextareaAutosize placeholder="Remarks" fullWidth={true} rowsMin={3} name="remarks"
                                inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                helperText={errors?.remarks?.length > 0 ? errors?.remarks[0]?.msg : ""}
                                error={errors?.remarks?.length > 0}
                                value={this.state.formWizard.obj.remarks} onChange={e => this.setField("remarks", e)} />
                            </fieldset> */}
                            <div className="text-center">
                                <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>
                            </div>
                        </div>
                        <div className="col-md-4  " style={{marginTop: -40}}>
                        <fieldset>
                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    label="Dispatch Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.dispatchDate} 
                                    onChange={e => this.setDateField('dispatchDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="dispatchDate"
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
                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    label="Received Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.receivedDate} 
                                    onChange={e => this.setDateField('receivedDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="receivedDate"
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
                            {this.state.formWizard.obj.fallowupStage ==='end'?
                                <fieldset>
                                    <TextField type="text" name="docketNo" label="Docket No" required={true} fullWidth={true}
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.docketNo?.length > 0 ? errors?.docketNo[0]?.msg : ""}
                                        error={errors?.docketNo?.length > 0}
                                        value={this.state.formWizard.obj.docketNo} onChange={e => this.setField("docketNo", e)} />
                                </fieldset>:''
                            }
                            <fieldset>
                                <TextField type="text" name="courierCompany" label="Courier Company" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.courierCompany?.length > 0 ? errors?.courierCompany[0]?.msg : ""}
                                    error={errors?.courierCompany?.length > 0}
                                    value={this.state.formWizard.obj.courierCompany} onChange={e => this.setField("courierCompany", e)} />
                            </fieldset>       
                        </div>
                    </div>
             
                </Form>
                   :
                   <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">
               
                    <div className="row">
                        <div className="offset-sm-2 col-md-4 ">

                            <fieldset>
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
                                    <TextField id="contactName" name="contactName" label="Contact Name" type="text" required={true}
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.contactName?.length > 0 ? errors?.contactName[0]?.msg : ""}
                                        error={errors?.contactName?.length > 0} value={this.state.formWizard.obj.contactName}
                                        defaultValue={this.state.formWizard.obj.contactName} onChange={e => this.setField("contactName", e)} />
                                </FormControl>
                            </fieldset>
                            <TextField
                                    name="phone"
                                    type="text"
                                    label="Phone"
                                    fullWidth={true}
                                    inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                    helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ""}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.phone}
                                    onChange={e => this.setField('phone', e)} />
                            <fieldset>
                                <FormControl>
                                    <TextField id="assignedTo" name="assignedTo" label="Assigned To" type="text" required={true}
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.assignedTo?.length > 0 ? errors?.assignedTo[0]?.msg : ""}
                                        error={errors?.assignedTo?.length > 0} value={this.state.formWizard.obj.assignedTo}
                                         onChange={e => this.setField("assignedTo", e)} />
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <TextField id="Address" name="Address" label="Address" type="text" required={true}
                                        inputProps={{ maxLength: 100, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.Address?.length > 0 ? errors?.Address[0]?.msg : ""}
                                        error={errors?.Address?.length > 0} value={this.state.formWizard.obj.address}
                                         onChange={e => this.setField("address", e)} />
                                </FormControl>
                            </fieldset>

                         

                                              
                            
{/*                             
                            <fieldset>
                                <TextareaAutosize placeholder="Remarks" fullWidth={true} rowsMin={3} name="remarks"
                                inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                helperText={errors?.remarks?.length > 0 ? errors?.remarks[0]?.msg : ""}
                                error={errors?.remarks?.length > 0}
                                value={this.state.formWizard.obj.remarks} onChange={e => this.setField("remarks", e)} />
                            </fieldset>
 */}

                            <div className="text-center">
                                <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>
                            </div>
                        </div>
                        <div className="col-md-4  ">
                        <fieldset>
                                <FormControl>
                                    <TextField id="quantity " name="quantity " label="quantity " type="text" required={true}
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.assignedTo?.length > 0 ? errors?.assignedTo[0]?.msg : ""}
                                        error={errors?.assignedTo?.length > 0} value={this.state.formWizard.obj.assignedTo}
                                         onChange={e => this.setField("assignedTo", e)} />
                                </FormControl>
                            </fieldset>

                        <fieldset>
                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    label="Dispatch Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.dispatchDate} 
                                    onChange={e => this.setDateField('dispatchDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="dispatchDate"
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
                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    label="Received Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.receivedDate} 
                                    onChange={e => this.setDateField('receivedDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="receivedDate"
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
                            <TextField
                                    name="email"
                                    type="text"
                                    label="Email"
                                    fullWidth={true}
                                    inputProps={{ minLength: 0, maxLength: 80, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"80"}]' }}
                                    helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ""}
                                    error={errors?.email?.length > 0}
                                    value={this.state.formWizard.obj.email}
                                    onChange={e => this.setField('email', e)} />
                            <fieldset>
                                <TextField type="text" name="docketNo" label="Docket No" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.docketNo?.length > 0 ? errors?.docketNo[0]?.msg : ""}
                                    error={errors?.docketNo?.length > 0}
                                    value={this.state.formWizard.obj.docketNo} onChange={e => this.setField("docketNo", e)} />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="courierCompany" label="Courier Company" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.courierCompany?.length > 0 ? errors?.courierCompany[0]?.msg : ""}
                                    error={errors?.courierCompany?.length > 0}
                                    value={this.state.formWizard.obj.courierCompany} onChange={e => this.setField("courierCompany", e)} />
                            </fieldset>       
                        </div>
                    </div>
             
                </Form>
                }
    
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