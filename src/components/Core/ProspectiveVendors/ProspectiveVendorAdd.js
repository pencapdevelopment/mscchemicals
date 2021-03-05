import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';


import { server_url, context_path, } from '../../Common/constants';
import {Select, MenuItem, InputLabel, FormControl, Button, TextField,  } from '@material-ui/core';
import { allcats } from './ProspectiveSubcat';

// import AutoSuggest from '../../Common/AutoSuggest';

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
// import TextareaAutosize from '@material-ui/core/TextareaAutosize';

// const json2csv = require('json2csv').parse;

class ProspectiveVendorAdd extends Component {

    state = {
        editFlag: false,

        formWizard: {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                id: 0,
                name: '',
                email:'',
                category:'',
                address: '',
                phone:'',
                other: '',
                contactName:'',
                company:'',
                department:'',
                designation:'',
                country:'',
                Province:'',
                productsoffered:'',
                
                

            }
        } , category: [
            { label: 'Amino acids', value: 'Amino acids' },
            { label: 'Nutraceuticals', value: 'Nutraceuticals' },
            { label: 'Extracts', value: 'Extracts' },
            { label: 'Sweeteners', value: 'Sweeteners' },
            { label: 'Oil', value: 'Oil' },
        ],
     
        
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=template_edit')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj = res.data;
                this.setState({ formWizard });
            });
    }
    // createNewObj() {
    //     var formWizard = {
    //         globalErrors: [],
    //         msg: '',
    //         errors: {},
    //         obj: {
    //             name: '',
    //             company:'',
    //             department:'',
    //             designation:'',
    //             email:'',
    //             address: '',
    //             country:'',
    //             Province:'',
    //             category:'',
    //             phonenumber:'',
    //             other: '',
    //             contactName:''
    //         }
    //     }

    //     this.setState({ formWizard });
    // }
    loadDataa() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id)
            .then(res => {
                var formWizard = this.state.formWizard;
                console.log(res.data);
                var newobj = res.data;

                newobj.selectedMakes = newobj['make'].split(",");//
                newobj.selectedTypes = newobj['type'].split(",");

                this.setState({ subCategory: allcats.filter(g => g.type === newobj['category']).map(g => { return { label: g.name, value: g.name } }) });
                this.uomRef.updateVal(newobj.uom);
                formWizard.obj = newobj;

                this.setState({ formWizard });
            });
    }


    updateObj(id) {
        var formWizard = this.state.formWizard;
        formWizard.obj.id = id;
        formWizard.editFlag = true;

        this.setState({ formWizard }, this.loadDataa);
    }

    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;

        var input = e.target;
        formWizard.obj[field] = e.target.value;
        this.setState({ formWizard });

        if(!noValidate) {
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
        // newObj['categories'] = "";
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
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">

                    <div className="row">
                        <div className="col-md-4   offset-md-1 ">

                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Name"
                                    name="name"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.name}
                                    onChange={e => this.setField('name', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Company Name"
                                    name="CompanyName"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.company}
                                    onChange={e => this.setField('company', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Department"
                                    name="department"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.department}
                                    onChange={e => this.setField('department', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Designation"
                                    name="designation"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.designation}
                                    onChange={e => this.setField('designation', e)} />
                            </fieldset>
                            {/* <fieldset>
                                <TextField
                                    type="text"
                                    label="Contact Name"
                                    name="contactName"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.contactName}
                                    onChange={e => this.setField('contactName', e)} />
                            </fieldset> */}
                            {/* <fieldset>
                                <TextField
                                    type="text"
                                    name="Phonenumber"
                                    label="Phone Number"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ maxLength: 13 }}
                                    value={this.state.formWizard.obj.phone}
                                    onChange={e => this.setField('phone', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="email"
                                    label="Email"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"email"}]' }}
                                    helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ""}
                                    error={errors?.email?.length > 0}
                                    value={this.state.formWizard.obj.email}
                                    onChange={e => this.setField('email', e)} />
                            </fieldset> */}
                   <fieldset>
                                        <TextField
                                            name="remarks"
                                            type="text"
                                            label="Remarks"
                                             
                                            fullWidth={true}
                                            inputProps={{ minLength: 0, maxLength: 300 }}
                                            value={this.state.formWizard.obj.other}
                                            onChange={e => this.setField('other', e)} />
                                    </fieldset>

                           
                        </div>
                   <div className="col-md-4">
                   <fieldset>
                                    <TextField
                                        name="country"
                                        type="text"
                                        label="Country"
                                            
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                        helperText={errors?.country?.length > 0 ? errors?.country[0]?.msg : ""}
                                        error={errors?.country?.length > 0}
                                        value={this.state.formWizard.obj.country}
                                        onChange={e => this.setField('country', e)} />
                                </fieldset>
                                <fieldset>
                                    <TextField
                                        name="province"
                                        type="text"
                                        label="Province"
                                            
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                        helperText={errors?.province?.length > 0 ? errors?.province[0]?.msg : ""}
                                        error={errors?.province?.length > 0}
                                        value={this.state.formWizard.obj.province}
                                        onChange={e => this.setField('province', e)} />
                                </fieldset>
                                <fieldset>
                                <FormControl>
                                    <InputLabel id="demo-mutiple-checkbox-label">Category</InputLabel>
                                     <Select
                                        name="category"
                                        labelId="demo-mutiple-checkbox-label"
                                        id="demo-mutiple-checkbox"
                                        value={this.state.formWizard.obj.category}
                                         
                                        helperText={errors?.category?.length > 0 ? errors?.category[0]?.msg : ""}
                                        error={errors?.category?.length > 0}
                                        onChange={e => this.setSelectField('category', e)}
                                       > 
                                       {this.state.category.map((e,keyIndex) => {
                                        return (
                                            <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                        );
                                    })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                    <TextField
                                        name="productsoffered"
                                        type="text"
                                        label="Products Offered"
                                            
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                        helperText={errors?.country?.length > 0 ? errors?.country[0]?.msg : ""}
                                        error={errors?.country?.length > 0}
                                        value={this.state.formWizard.obj.productsoffered}
                                        onChange={e => this.setField('productsoffered', e)} />
                                </fieldset>


                           
                   </div>
                    </div>
                    <div className="text-center">
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
)(ProspectiveVendorAdd);