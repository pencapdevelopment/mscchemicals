import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';

import { server_url, context_path,  getUniqueCode,  } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Radio,  } from '@material-ui/core';

import { allcats } from './subcat';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import AutoSuggest from '../../Common/AutoSuggest';


import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';

import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';


import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';


// const json2csv = require('json2csv').parse;


class Add extends Component {

    state = {
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                code: getUniqueCode('PD'),
                name: '',
                category: '',
                type: 'Food grade',
                subCategory: '',
                specification: '',
                make: '',
                countryOfOrigin:'',
                batch: '',
                mfgDate: null,
                expDate: null,
                shelfLife: '',
                deliveryPeriod: '',
                hsnCode: '',
                packagingType: '',
                quantity: '',
                incoming: '',
                outgoing: '',
                selectedMakes: [],
                selectedTypes: [],
                companie:''
                
            }
        },
        category: [
            { label: 'Amino acids', value: 'Amino acids' },
            { label: 'Nutraceuticals', value: 'Nutraceuticals' },
            { label: 'Extracts', value: 'Extracts' },
            { label: 'Sweeteners', value: 'Sweeteners' },
            { label: 'Oil', value: 'Oil' },
        ],
        subCategory: [],        
        make: [
        ]
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id)
        .then(res => {
            var formWizard = this.state.formWizard;
            console.log(res.data);
            var newobj = res.data;

            newobj.selectedMakes = (newobj['make'] && newobj['make'] !=="")?newobj['make'].split(","):'';
            newobj.selectedTypes = (newobj['type'] && newobj['type'] !=="")?newobj['type'].split(","):'Food grade';

            this.setState({ subCategory: allcats.filter(g => g.type === newobj['category']).map(g => { return { label: g.name, value: g.name } }) });
            // this.uomRef.updateVal(newobj.uom);
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

    setSelectField(field, e) {
        this.setField(field, e, true);

    }

    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;
        console.log("before formwizard",formWizard);

        var input = e.target;
        formWizard.obj[field] = e.target.value;
        console.log("after formwizard",formWizard);
        if (field === 'category') {
            formWizard.obj['subCategory'] = '';
        }

        this.setState({ formWizard }, function () {
            if (field === 'category') {
                console.log(e.target.value);
                this.setState({ subCategory: allcats.filter(g => g.type === e.target.value).map(g => { return { label: g.name, value: g.name } }) });

            }
        });

        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({
                formWizard
            });
        }
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
           // newObj['make'] = (newObj.selectedMakes && newObj.selectedMakes !=='')?newObj.selectedMakes.join(","):'';
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

    setAutoSuggest1(field, val) {
        var formWizard = this.state.formWizard;
       
        formWizard.obj[field] = val;
        this.setState({ formWizard });
    }
    setAutoSuggest2(field, val) {
        console.log('setAutoSuggest2');
        var formWizard = this.state.formWizard;
       
        formWizard.obj[field] = val;
        this.setState({ formWizard });
    }


    loadMake() {
        axios.get(server_url + context_path + "api/companies?projection=company_auto_suggest&type=V")
            .then(res => {
            var lis = res.data._embedded[Object.keys(res.data._embedded)];
                if(lis) {
                    var make = this.state.make;
                    lis.forEach(e => {
                        make.push({label: e.name, value: e.name});
                    })

                    this.setState({make});
                }
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.props.onRef(this);
        this.setState({ loding: false })
        this.loadMake();
    }

    render() {
        const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">

                    <div className="row">
                        <div className="col-md-6 offset-md-3">

                            <fieldset>
                                <TextField type="text" name="name" label="Product Name"
                                    required={true}
                                    fullWidth={true}
                                    value={this.state.formWizard.obj.name}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.name?.length > 0 ? errors?.name[0]?.msg : ""}
                                    error={errors?.name?.length > 0}

                                    onChange={e => this.setField("name", e)} />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="code" label="Product Code"
                                    required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.code}
                                    disabled={this.state.formWizard.editFlag}
                                    inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.code?.length > 0 ? errors?.code[0]?.msg : ""}
                                    error={errors?.code?.length > 0}

                                    onChange={e => this.setField("code", e)} />
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

                                    > {this.state.category.map((e, keyIndex) => {
                                        return (
                                            <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                        );
                                    })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                           
                           
                          
                        
                            {/* <fieldset>
                                <FormControl>
                                    <InputLabel id="demo-mutiple-checkbox-label">Type</InputLabel>
                                    
                                    <Select
                                    
                                        name="type"
                                        labelId="demo-mutiple-checkbox-label"
                                        id="demo-mutiple-checkbox"
                                        value={this.state.formWizard.obj.selectedTypes}
                                        renderValue={(selected) => selected.join(', ')}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.type?.length > 0 ? errors?.type[0]?.msg : ""}
                                        error={errors?.type?.length > 0}
                                     
                                        onChange={e => this.setSelectField('selectedTypes', e)}
                                        multiple={true}
                                    >
                                         <FormControl>
                                   
                                    <RadioGroup aria-label="type" name="type" row >
                                        <FormControlLabel 
                                            value="B" checked={this.state.formWizard.obj.type === 'B'}
                                            label="Registered"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                      
                                        <FormControlLabel
                                            value="V" checked={this.state.formWizard.obj.type === 'V'}
                                            label=" Not Registered"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                                        {/* {this.state.type.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>
                                                    <Radio checked={this.state.formWizard.obj.selectedTypes.indexOf(e.value) > -1} name={this.state.type[keyIndex].name} />
                                                   
                                                    <ListItemText primary={e.label} />
                                                </MenuItem>
                                            );
                                        })} 
                                    </Select>
                                </FormControl>
                            </fieldset> */}
                             <FormLabel component="legend">Type</FormLabel> 
                                <FormControl>
                                    <RadioGroup aria-label="type" name="type" row>
                                        <FormControlLabel 
                                            value="Registered" checked={this.state.formWizard.obj.type === 'Registered'}
                                            label="Registered"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                            value="Food grade" checked={this.state.formWizard.obj.type === 'Food grade'}
                                            label=" Not Registered"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            {this.state.formWizard.obj.type === 'Registered' &&
                            <div className="col-md-12 " style={{ marginLeft:"-14px"}}>
                                <TextField type="text" name="specification" label="Specification"
                                    required={true} fullWidth={true}
                                    // value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.specification?.length > 0 ? errors?.specification[0]?.msg : ""}
                                    error={errors?.specification?.length > 0}
                                    value={this.state.formWizard.obj.specification} onChange={e => this.setField("specification", e)} />
                                {/* <FormControl>
                                    <InputLabel id="demo-mutiple-checkbox-label">Make</InputLabel>
                                    <Select
                                        name="make"
                                        required={true}
                                        labelId="demo-mutiple-checkbox-label"
                                        id="demo-mutiple-checkbox"
                                        inputProps={{ maxLength: 200, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"200"}]' }}
                                        helperText={errors?.make?.length > 0 ? errors?.make[0]?.msg : ""}
                                        error={errors?.make?.length > 0}

                                        value={this.state.formWizard.obj.selectedMakes}
                                        renderValue={(selected) => selected.join(', ')}
                                        onChange={e => this.setSelectField('selectedMakes', e)}
                                        multiple={true}>
                                    {this.state.make.map((e, keyIndex) => {
                                        return (
                                            <MenuItem key={keyIndex} value={e.value}>
                                                <Checkbox checked={this.state.formWizard.obj.selectedMakes.indexOf(e.value) > -1} />
                                                <ListItemText primary={e.label} />
                                            </MenuItem>
                                        )
                                    })}
                                    </Select>
                                </FormControl> */}
                                 <FormControl>
                                                <AutoSuggest url="companies"
                                                    name="make"
                                                    displayColumns="name"
                                                    label="make"
                                                    required={true}
                                                    helperText={errors?.make_auto_suggest?.length > 0 ? errors?.make_auto_suggest[0]?.msg : ""}
                                                    error={errors?.make_auto_suggest?.length > 0}
                                                    inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required","msg":"make is required"}]' }}
                                                    onRef={ref => (this.countryASRef = ref)}
                                                    placeholder="Search compaies by name"
                                                    arrayName="companies"
                                                    projection="company_auto_suggest"
                                                    value={this.state.formWizard.obj.make}
                                                   onChange={e=>this.setAutoSuggest2('make', e.name)}
                                                    onSelect={e => this.setAutoSuggest1('make', e.name)}
                                                   
                                                    queryString="&type=V&name" ></AutoSuggest>
                                            </FormControl>
                            </div>
                            }
                            {this.state.formWizard.obj.type === 'Food grade' &&
                            <div className="col-md-12 " style={{ marginLeft:"-14px"}}>
                                <TextField type="text" name="countryOfOrigin" label="Country of origin"
                                    required={true} fullWidth={true}
                                    // value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 50, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"50"}]' }}
                                    helperText={errors?.countryOfOrigin?.length > 0 ? errors?.countryOfOrigin[0]?.msg : ""}
                                    error={errors?.countryOfOrigin?.length > 0}

                                    value={this.state.formWizard.obj.countryOfOrigin} onChange={e => this.setField("countryOfOrigin", e)} />
                                {/* <fieldset>
                                <TextField type="text" name="phone" label="Phone" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 13, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"10"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ""}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.phone} onChange={e => this.setField("phone", e)} />
                            </fieldset> */}
                            </div>
                        }
                            {/* <fieldset>
                                <FormControl>
                                    <InputLabel>Sub Category</InputLabel>
                                    <Select label="Sub Category" name="subCategory"
                                        value={this.state.formWizard.obj.subCategory}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.subCategory?.length > 0 ? errors?.subCategory[0]?.msg : ""}
                                        error={errors?.subCategory?.length > 0}
                                        onChange={e => this.setSelectField('subCategory', e)}> {this.state.subCategory.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset> */}
                            {/* <fieldset>
                                <TextField type="text" name="specification" label="Specification"
                                    required={true} fullWidth={true}
                                    // value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.specification?.length > 0 ? errors?.specification[0]?.msg : ""}
                                    error={errors?.specification?.length > 0}

                                    value={this.state.formWizard.obj.specification} onChange={e => this.setField("specification", e)} />
                            </fieldset>
                            <fieldset>
                                
                                <FormControl>
                                    <InputLabel id="demo-mutiple-checkbox-label">Make</InputLabel>
                                    <Select
                                        name="make"
                                        required={true}
                                        labelId="demo-mutiple-checkbox-label"
                                        id="demo-mutiple-checkbox"
                                        inputProps={{ maxLength: 200, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"200"}]' }}
                                        helperText={errors?.make?.length > 0 ? errors?.make[0]?.msg : ""}
                                        error={errors?.make?.length > 0}

                                        value={this.state.formWizard.obj.selectedMakes}
                                        renderValue={(selected) => selected.join(', ')}
                                        onChange={e => this.setSelectField('selectedMakes', e)}
                                        multiple={true}
                                    > {this.state.make.map((e, keyIndex) => {
                                        return (
                                            <MenuItem key={keyIndex} value={e.value}>
                                                <Checkbox checked={this.state.formWizard.obj.selectedMakes.indexOf(e.value) > -1} />
                                                <ListItemText primary={e.label} />
                                            </MenuItem>
                                        )
                                    })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="specification" label="Country of origin"
                                    required={true} fullWidth={true}
                                    // value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.specification?.length > 0 ? errors?.specification[0]?.msg : ""}
                                    error={errors?.specification?.length > 0}

                                    value={this.state.formWizard.obj.specification} onChange={e => this.setField("specification", e)} />
                            </fieldset> */}
                           
                            {/* <fieldset>
                                        <TextField type="number" name="price" label="Price/Kg" required={true} fullWidth={true}
                                            value={this.state.formWizard.price}onChange={e => this.setField("price", e)}/>
                                    </fieldset>
                                    <fieldset>
                                        <TextField type="number" name="taxes" label="Taxes" required={true} fullWidth={true}
                                            value={this.state.formWizard.taxes}onChange={e => this.setField("taxes", e)}/>
                                    </fieldset> 
                            <fieldset>
                                <TextField type="number" name="batch" label="Batch"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ maxLength: 6, "data-validate": '[{ "key":"required"},{ "key":"integer"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"6"}]' }}
                                    helperText={errors?.batch?.length > 0 ? errors?.batch[0]?.msg : ""}
                                    error={errors?.batch?.length > 0}

                                    value={this.state.formWizard.obj.batch} onChange={e => this.setField("batch", e)} />
                            </fieldset>
                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    label="Mfg Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.mfgDate} 
                                    onChange={e => this.setDateField('mfgDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="mfgDate"
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
                                    label="Exp Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.expDate} 
                                    onChange={e => this.setDateField('expDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="expDate"
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
                                <TextField type="text" name="shelfLife" label="Shelf Life"
                                    required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.shelfLife?.length > 0 ? errors?.shelfLife[0]?.msg : ""}
                                    error={errors?.shelfLife?.length > 0}

                                    value={this.state.formWizard.obj.shelfLife} onChange={e => this.setField("shelfLife", e)} />
                            </fieldset>

                            <fieldset>
                                <TextField type="text" name="deliveryPeriod" label="Delivery Period"
                                    required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.deliveryPeriod?.length > 0 ? errors?.deliveryPeriod[0]?.msg : ""}
                                    error={errors?.deliveryPeriod?.length > 0}

                                    value={this.state.formWizard.obj.deliveryPeriod} onChange={e => this.setField("deliveryPeriod", e)} />
                            </fieldset>
*/}
                            {/* <fieldset>
                                <TextField type="text" name="hsnCode" label="HSN Code"
                                    required={true} fullWidth={true}
                                    // value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.hsnCode?.length > 0 ? errors?.hsnCode[0]?.msg : ""}
                                    error={errors?.hsnCode?.length > 0}

                                    value={this.state.formWizard.obj.hsnCode} onChange={e => this.setField("hsnCode", e)} />
                            </fieldset>

                            <fieldset>
                                <TextField type="text" name="packagingType" label="Packaging Type"
                                    required={true} fullWidth={true}
                                    // value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.packagingType?.length > 0 ? errors?.packagingType[0]?.msg : ""}
                                    error={errors?.packagingType?.length > 0}

                                    value={this.state.formWizard.obj.packagingType} onChange={e => this.setField("packagingType", e)} />
                            </fieldset>
                            <UOM  onRef={ref => (this.uomRef = ref)} required={true} isReadOnly={false} value={this.state.formWizard.obj.uom} onChange={e => this.setField("uom", e,true)} />*/}
                            <div className="text-center mt-4">
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