import MomentUtils from '@date-io/moment';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import ListItemText from '@material-ui/core/ListItemText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Event from '@material-ui/icons/Event';
import {
    DatePicker,
    MuiPickersUtilsProvider
} from '@material-ui/pickers';
import axios from 'axios';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import { Form } from 'reactstrap';
import swal from 'sweetalert';
import { context_path, getUniqueCode, server_url } from '../../Common/constants';
import FormValidator from '../../Forms/FormValidator';
import ContentWrapper from '../../Layout/ContentWrapper';
import AutoSuggest from '../../Common/AutoSuggest';





// const json2csv = require('json2csv').parse;

class Add extends Component {

    state = {
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                code: getUniqueCode('CM'),
                name: '',
                type: 'B',
                locationType: 'I',
                categories: '',
                customerType: '',
                phone: '',
                email: '',
                country: '',
                number: '',
                province: '',
                city: '',
                location: '',
                zipcode: '',
                pincode: '',
                rating: '',
                agent: 'N',
                paymentTerms: '',
                categoriesInterested: '',
                gstin: '',
                pan: '',
                fssai: '',
                drugLicense: '',
                others: '',
                msme: 'N',
                turnOver: '',
                international: '',
                selectedInterests: [],
                selectedCategories: [],
                selectedCustomerTypes: [],
                selectedorganizations: [],
                msmeId: ''
            }
        },
        types: [
            { label: 'Buyer', value: 'B' },
            { label: 'Vendor', value: 'V' }
        ],
        categories: [
            { label: 'Food', value: 'Food' },
            { label: 'Pharma', value: 'Pharma' },
            { label: 'Nutra', value: 'Nutra' }
        ],
        customerTypes: [
            { label: 'Manufacture', value: 'Manufacture' },
            { label: 'Formulator', value: 'Formulator' },
            { label: 'Trader', value: 'Trader' },
            { label: 'Agent', value: 'Agent' },
            { label: 'Marketing co', value: 'Marketing co' },
            { label: 'Pharma', value: 'Pharma' },
            { label: 'Nutraceuticals', value: 'Nutraceuticals' },
            { label: 'Sweeteners', value: 'Sweeteners' },
            { label: 'Herbal', value: 'Herbal' },
            { label: 'Ayurvedic', value: 'Ayurvedic' },
            { label: 'Own / contract / export', value: 'Own' }
        ],
        categoriesInterested: [
            { label: 'Extracts', value: 'Extracts' },
            { label: 'Vitamins', value: 'vitamins' },
            { label: 'Amino acids', value: 'amino acids' },
            { label: 'Nutra', value: 'Nutra' },
            { label: 'Sweeteners', value: 'sweeteners' }
        ],
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
        ratings: [
            { label: 'A', value: 'A' },
            { label: 'B', value: 'B' },
            { label: 'C', value: 'C' },
            { label: 'D', value: 'D' }
        ],
        organizations: []
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id)
            .then(res => {
                var formWizard = this.state.formWizard;
                console.log(res.data);
                var newobj = res.data;

                if (newobj['categories']) {
                    newobj.selectedCategories = newobj['categories'].split(",");
                } else {
                    newobj.selectedCategories = [];
                }
                if (newobj['customerType']) {
                    newobj.selectedCustomerTypes = newobj['customerType'].split(",");//
                } else {
                    newobj.selectedCustomerTypes = [];//
                }

                if (newobj['categoriesInterested']) {
                    newobj.selectedInterests = newobj['categoriesInterested'].split(",");
                } else {
                    newobj.selectedInterests = [];
                }

                if (newobj['organizations']) {
                    newobj.selectedorganizations = newobj['organizations'].split(",");
                } else {
                    newobj.selectedorganizations = [];
                }

                formWizard.obj = newobj;
                this.setState({ formWizard });
            });
    }

    createNewObj() {

        var formWizard = {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {

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
        formWizard.obj[field] = input.value;

        if(field === 'gstin' && input.value && input.value.length === 15) {
            formWizard.obj.pan = input.value.substr(2, 10);
        }

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

    setAutoSuggest(field, val, multi) {
        var formWizard = this.state.formWizard;
        if(!multi) {
            formWizard.obj[field] = val;
        }
        formWizard.obj['selected' + field] = val;
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
            if(newObj.msme === 'Y' && (!newObj.msmeId  || newObj.msmeId==='')){
                var formWizard = this.state.formWizard;
                formWizard.errors['msmeId'] = 'Enter the msme id';
                this.setState({ formWizard });
                return ;
            }

            newObj['categories'] = newObj.selectedCategories.join(",");
            newObj['customerType'] = newObj.selectedCustomerTypes.join(",");//
            newObj['categoriesInterested'] = newObj.selectedInterests.join(",");
            newObj['organizations'] = newObj.selectedorganizations.join(",");

            var promise = undefined;
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

    loadOrgs() {
        axios.get(server_url + context_path + "api/companies?projection=company_auto_suggest_product")
            .then(res => {
            var lis = res.data._embedded[Object.keys(res.data._embedded)];
                if(lis) {
                    var organizations = this.state.organizations;
                    lis.forEach(e => {
                        organizations.push({label: e.name, value: e.name});
                    })

                    this.setState({organizations});
                }
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.props.onRef(this);
        this.setState({ loding: false });
        this.loadOrgs();
    }

    render() {
        const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">

                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <fieldset>
                                <FormControl>
                                    <FormLabel component="legend">Type</FormLabel>
                                    <RadioGroup aria-label="type" name="type" row>
                                        <FormControlLabel
                                            value="B" checked={this.state.formWizard.obj.type === 'B'}
                                            label="Buyer"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                            value="V" checked={this.state.formWizard.obj.type === 'V'}
                                            label="Vendor"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <FormLabel component="legend">Location</FormLabel>
                                    <RadioGroup aria-label="position" name="position" row>
                                        <FormControlLabel
                                            value="I" checked={this.state.formWizard.obj.locationType === 'I'}
                                            label="International"
                                            onChange={e => this.setField("locationType", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                            value="N" checked={this.state.formWizard.obj.locationType === 'N'}
                                            label="National"
                                            onChange={e => this.setField("locationType", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </fieldset>

                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Code"
                                    name="companyCode"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.code}
                                    onChange={e => this.setField('code', e)} />
                            </fieldset>

                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Name"
                                    name="name"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.name?.length > 0 ? errors?.name[0]?.msg : ""}
                                    error={errors?.name?.length > 0}
                                    value={this.state.formWizard.obj.name}
                                    onChange={e => this.setField('name', e)} />
                            </fieldset>
                            
                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    label="Date of Incorporation"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.dateOfIncorporation} 
                                    onChange={e => this.setDateField('dateOfIncorporation', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="dateOfIncorporation"
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
                                <TextField
                                    type="text"
                                    name="number"
                                    label="Phone"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ maxLength: 13,  "data-validate": '[{ "key":"number"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.number?.length > 0 ? errors?.number[0]?.msg : ""}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.number}
                                    onChange={e => this.setField('number', e)} />
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
                            </fieldset>


                            {(this.state.formWizard.obj.type === 'V' && this.state.formWizard.obj.locationType === 'I') &&
                            <div>
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
                                    <TextField
                                        name="city"
                                        type="text"
                                        label="City"
                                            
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                        helperText={errors?.city?.length > 0 ? errors?.city[0]?.msg : ""}
                                        error={errors?.city?.length > 0}
                                        value={this.state.formWizard.obj.city}
                                        onChange={e => this.setField('city', e)} />
                                </fieldset>
                                <fieldset>
                                    <TextField
                                        name="zipcode"
                                        type="text"
                                        label="Zipcode"
                                            
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 6, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"6"}]' }}
                                        helperText={errors?.zipcode?.length > 0 ? errors?.zipcode[0]?.msg : ""}
                                        error={errors?.zipcode?.length > 0}
                                        value={this.state.formWizard.obj.zipcode}
                                        onChange={e => this.setField('zipcode', e)} />
                                </fieldset>
                            </div>
                            }

                            {(this.state.formWizard.obj.type === 'V' && this.state.formWizard.obj.locationType === 'N') &&
                            <div>
                                <fieldset>
                                    <TextField
                                        name="location"
                                        type="text"
                                        label="Location"
                                            
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                        helperText={errors?.city?.length > 0 ? errors?.city[0]?.msg : ""}
                                        error={errors?.city?.length > 0}
                                        value={this.state.formWizard.obj.city}
                                        onChange={e => this.setField('city', e)} />
                                </fieldset>
                                <fieldset>
                                    <TextField
                                        name="pincode"
                                        type="text"
                                        label="Pincode"
                                        
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 5, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"5"}]' }}
                                        helperText={errors?.pincode?.length > 0 ? errors?.pincode[0]?.msg : ""}
                                        error={errors?.pincode?.length > 0}
                                        value={this.state.formWizard.obj.pincode}
                                        onChange={e => this.setField('pincode', e)} />
                                </fieldset>
                            </div>}



                            {this.state.formWizard.obj.type === 'B' &&
                                <fieldset>
                                    <FormControl>
                                        <InputLabel id="demo-mutiple-checkbox-label">Categories</InputLabel>
                                        <Select
                                            name="categories"
                                            labelId="demo-mutiple-checkbox-label"
                                            id="demo-mutiple-checkbox"
                                            value={this.state.formWizard.obj.selectedCategories}
                                             
                                            helperText={errors?.category?.length > 0 ? errors?.category[0]?.msg : ""}
                                            error={errors?.category?.length > 0}
                                            renderValue={(selected) => selected.join(', ')}
                                            onChange={e => this.setSelectField('selectedCategories', e)}
                                            multiple={true}
                                        >

                                            {this.state.categories.map((e, keyIndex) => {
                                                return (
                                                    <MenuItem key={keyIndex} value={e.value}>
                                                        <Checkbox checked={this.state.formWizard.obj.selectedCategories.indexOf(e.value) > -1} />
                                                        <ListItemText primary={e.label} />
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                </fieldset>}
                            {this.state.formWizard.obj.type === 'B' &&
                                <fieldset>
                                    <FormControl>
                                        <FormLabel component="legend">Agent</FormLabel>
                                        <RadioGroup aria-label="position" name="position" row>
                                            <FormControlLabel
                                                value="Y"
                                                label="Yes" checked={this.state.formWizard.obj.agent === 'Y'}
                                                onChange={e => this.setField("agent", e)}
                                                control={<Radio color="primary" />}
                                                labelPlacement="end"
                                            />
                                            <FormControlLabel
                                                value="N"
                                                label="No" checked={this.state.formWizard.obj.agent === 'N'}
                                                onChange={e => this.setField("agent", e)}
                                                control={<Radio color="primary" />}
                                                labelPlacement="end"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </fieldset>}
                            <fieldset>
                                <FormControl>
                                    <InputLabel id="demo-mutiple-checkbox-label">Categories Interested</InputLabel>
                                    <Select
                                        name="categoriesInterested"
                                        labelId="demo-mutiple-checkbox-label"
                                        id="demo-mutiple-checkbox"
                                        value={this.state.formWizard.obj.selectedInterests}
                                        
                                        helperText={errors?.category?.length > 0 ? errors?.category[0]?.msg : ""}
                                        error={errors?.category?.length > 0}
                                        renderValue={(selected) => selected.join(', ')}
                                        onChange={e => this.setSelectField('selectedInterests', e)}
                                        multiple={true}
                                    >
                                        {this.state.categoriesInterested.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>
                                                    <Checkbox checked={this.state.formWizard.obj.selectedInterests.indexOf(e.value) > -1} />
                                                    <ListItemText primary={e.label} />
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                            {this.state.formWizard.obj.type === 'B' &&
                                <fieldset>
                                    <FormControl>
                                        <InputLabel id="demo-mutiple-checkbox-label">Select Customer Type</InputLabel>
                                        <Select
                                            name="customerTypes"
                                            labelId="demo-mutiple-checkbox-label"
                                            id="demo-mutiple-checkbox"
                                            value={this.state.formWizard.obj.selectedCustomerTypes}
                                          
                                            helperText={errors?.category?.length > 0 ? errors?.category[0]?.msg : ""}
                                            error={errors?.category?.length > 0}
                                            renderValue={(selected) => selected.join(', ')}
                                            onChange={e => this.setSelectField('selectedCustomerTypes', e)}
                                            multiple={true}
                                        >
                                            {this.state.customerTypes.map((e, keyIndex) => {
                                                return (
                                                    <MenuItem key={keyIndex} value={e.value}>
                                                        <Checkbox checked={this.state.formWizard.obj.selectedCustomerTypes.indexOf(e.value) > -1} />
                                                        <ListItemText primary={e.label} />
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </fieldset>}                           

                            <fieldset>
                                <TextField
                                    name="turnOver"
                                    type="number"
                                    label="Turn Over"
                                    
                                    fullWidth={true}
                                    inputProps={{ minLength: 0, maxLength: 30 }}
                                    value={this.state.formWizard.obj.turnOver}
                                    onChange={e => this.setField('turnOver', e)} />
                            </fieldset>

                                <fieldset>
                                    <FormControl>
                                        <InputLabel>Select Rating</InputLabel>
                                        <Select
                                            name="rating"
                                            label="Select Customer..."
                                            value={this.state.formWizard.obj.rating}
                                            onChange={e => this.setSelectField('rating', e)}
                                        >
                                            {this.state.ratings.map((e, keyIndex) => {
                                                return (
                                                    <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </fieldset>

                            <fieldset>
                                <FormControl>
                                    {/* <InputLabel id="demo-mutiple-checkbox-label">Associated Organizations</InputLabel>
                                    <Select
                                        name="organizations"
                                        required={true}
                                        labelId="demo-mutiple-checkbox-label"
                                        id="demo-mutiple-checkbox"
                                        inputProps={{ maxLength: 200, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"200"}]' }}
                                        helperText={errors?.organizations?.length > 0 ? errors?.organizations[0]?.msg : ""}
                                        error={errors?.organizations?.length > 0}

                                        value={this.state.formWizard.obj.selectedorganizations}
                                        renderValue={(selected) => selected.join(', ')}
                                        onChange={e => this.setSelectField('selectedorganizations', e)}
                                        multiple={true}
                                    > {this.state.organizations.map((e, keyIndex) => {
                                        return (
                                            <MenuItem key={keyIndex} value={e.value}>
                                                <Checkbox checked={this.state.formWizard.obj.selectedorganizations.indexOf(e.value) > -1} />
                                                <ListItemText primary={e.label} />
                                            </MenuItem>
                                        )
                                    })}
                                    </Select> */}

                                    <AutoSuggest url="companies"
                                        name="organizations"
                                        onRef={ref => (this.companyASRef = ref)}
                                        displayColumns="name"
                                        label="Associated Organizations"
                                        readOnly={false}
                                        multiple={true}
                                        placeholder="Search Company by name"
                                        arrayName="companies"
                                        projection="company_auto_suggest"
                                        value={this.state.formWizard.selectedorganizations}
                                        onSelect={e => this.setAutoSuggest('organizations', e, true)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>
                            </fieldset>
                            
                            <fieldset>
                                <FormControl>
                                    <InputLabel>Select PaymentTerms</InputLabel>
                                    <Select
                                        name="paymentTerms"
                                        
                                        helperText={errors?.paymentTerms?.length > 0 ? errors?.paymentTerms[0]?.msg : ""}
                                        error={errors?.paymentTerms?.length > 0}

                                        label="Select PaymentTerms..."
                                        value={this.state.formWizard.obj.paymentTerms}
                                        onChange={e => this.setSelectField('paymentTerms', e)}
                                    >
                                        {this.state.terms.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>

                            {(this.state.formWizard.obj.type === 'B' || this.state.formWizard.obj.locationType === 'N') &&
                                <div>
                                    <fieldset>
                                        <TextField
                                            name="gstin"
                                            type="text"
                                            label="GSTIN"
                                             
                                            fullWidth={true}
                                            inputProps={{ minLength: 15, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                            helperText={errors?.gstin?.length > 0 ? errors?.gstin[0]?.msg : ""}
                                            error={errors?.gstin?.length > 0}
                                            value={this.state.formWizard.obj.gstin}
                                            onChange={e => this.setField('gstin', e)} />
                                    </fieldset>
                                    <fieldset>
                                        <TextField
                                            name="pan"
                                            type="text"
                                            label="PAN NO"
                                             
                                            fullWidth={true}
                                            inputProps={{ minLength: 10, maxLength: 10, "data-validate": '[{ "key":"minlen","param":"10"},{ "key":"maxlen","param":"10"}]' }}
                                            helperText={errors?.pan?.length > 0 ? errors?.pan[0]?.msg : ""}
                                            error={errors?.pan?.length > 0}
                                            value={this.state.formWizard.obj.pan}
                                            onChange={e => this.setField('pan', e)} />
                                    </fieldset>
                                    <fieldset>
                                        <TextField
                                            name="fssai"
                                            type="text"
                                            label="FSSAI NO"
                                            // required={true}
                                            fullWidth={true}
                                            inputProps={{ minLength: 14, maxLength: 14, "data-validate": '[{ "key":"maxlen","param":"14"}]' }}
                                            helperText={errors?.fssai?.length > 0 ? errors?.fssai[0]?.msg : ""}
                                            error={errors?.fssai?.length > 0}
                                            value={this.state.formWizard.obj.fssai}
                                            onChange={e => this.setField('fssai', e)} />
                                    </fieldset>
                                    <fieldset>
                                        <TextField
                                            name="drugLicense"
                                            type="text"
                                            label="Drug license no"
                                            // required={true}
                                            fullWidth={true}
                                            inputProps={{ minLength: 5, maxLength: 20 }}
                                            value={this.state.formWizard.obj.drugLicense}
                                            onChange={e => this.setField('drugLicense', e)} />
                                    </fieldset>
                                    <fieldset>
                                        <TextField
                                            name="Others"
                                            type="text"
                                            label="Manufacture license no"
                                            fullWidth={true}
                                            inputProps={{ minLength: 0, maxLength: 50 }}
                                            value={this.state.formWizard.obj.others}
                                            onChange={e => this.setField('others', e)} />
                                    </fieldset>
                                    <fieldset>
                                    <FormControl>
                                        <FormLabel component="legend">MSME</FormLabel>
                                        <RadioGroup aria-label="position" name="position" row>
                                            <FormControlLabel
                                                value="Y" checked={this.state.formWizard.obj.msme === 'Y'}
                                                label="Yes"
                                                onChange={e => this.setField("msme", e)}
                                                control={<Radio color="primary" />}
                                                labelPlacement="end"
                                            />
                                            <FormControlLabel
                                                value="N" checked={this.state.formWizard.obj.msme === 'N'}
                                                label="No"
                                                onChange={e => this.setField("msme", e)}
                                                control={<Radio color="primary" />}
                                                labelPlacement="end"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </fieldset>
                                {this.state.formWizard.obj.msme === 'Y' && <fieldset>
                                        <TextField
                                            name="msmeId"
                                            type="text"
                                            label="MSME Registration Id"
                                            required={false}
                                            fullWidth={true}
                                            inputProps={{ minLength: 0, maxLength: 35 }}
                                            value={this.state.formWizard.obj.msmeId}
                                            onChange={e => this.setField('msmeId', e)} />
                                    </fieldset>}
                                
                                
                                </div>
                                
                            }

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
)(Add);