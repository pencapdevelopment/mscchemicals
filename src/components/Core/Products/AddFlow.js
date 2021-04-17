import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';

import { server_url, context_path,  } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl, } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';

// import ListItemText from '@material-ui/core/ListItemText';
// import Checkbox from '@material-ui/core/Checkbox';
// import TextareaAutosize from '@material-ui/core/TextareaAutosize';
// import AutoSuggest from '../../Common/AutoSuggest';


import FormValidator from '../../Forms/FormValidator';
import {  Form,  } from 'reactstrap';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';


// const json2csv = require('json2csv').parse;


class AddFlow extends Component {

    state = {
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
               type:'',
               quantity: '',
               date: moment(),
               refType: 'Manual'
            },
            selectedcountry: ''
        },
        flowType: [
            { label: 'In Coming', value: 'InComing' },
            { label: 'Out Going', value: 'OutGoing' },
             
        ]

    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id)
            .then(res => {

                var formWizard = this.state.formWizard;

                var newobj = res.data;
                formWizard.selectedcountry = newobj.country;
                formWizard.obj = newobj;


                this.setState({ formWizard });
            });
    }

    getAddress() {
        return {
            type:'',
            quantity:0,
            date: moment(),
        };
    }

    createNewObj() {

        var formWizard = {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: this.getAddress()
        }
        this.setState({ formWizard });
    }

    updateObj(id) {
        var formWizard = this.state.formWizard;
        formWizard.obj.id = id;
        formWizard.editFlag = true;

        this.setState({ formWizard }, this.loadData());
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

        console.log(formWizard.selectedcountry);
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
            newObj.product = '/products/' + this.props.subId;
            var promise = undefined;
            if (!this.state.formWizard.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }
            promise.then(res => {
                var formw = this.state.formWizard;
                formw.obj.id = res.data.id;
                formw.msg = 'Successfully Saved';


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
        this.setState({ loding: false });

        if (this.props.branchId) {
            axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.props.branchId)
                .then(res => {
                    var formWizard = this.state.formWizard;
                    formWizard.obj = res.data;
                    this.setState({ formWizard });
                    this.countryASRef.setInitialField({ id: res.data.country, name: res.data.country })
                })
        }
    }

    render() {
        const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">
                    <div className="row">
                        <div className="col-md-8 offset-md-2">
                            <div className="text-center">
                                <h4>{this.state.formWizard.obj.id ? 'Edit' : 'Add'} Flow</h4>
                            </div>
                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    label="Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.date} 
                                    onChange={e => this.setDateField('date', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="date"
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
                                    <InputLabel>Select Type</InputLabel>
                                    <Select
                                        label="Select Type..."
                                        name="type"
                                        value={this.state.formWizard.obj.type}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.type?.length > 0 ? errors?.type[0]?.msg : ""}
                                        error={errors?.type?.length > 0}

                                        onChange={e => this.setSelectField('type', e)}
                                    >
                                        {this.state.flowType.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                                 
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="quantity"
                                    label="Quantity"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.quantity?.length > 0 ? errors?.quantity[0]?.msg : ""}
                                    error={errors?.quantity?.length > 0}
                                    value={this.state.formWizard.obj.quantity}
                                    onChange={e => this.setSelectField('quantity', e)} />
                            </fieldset>
                        </div>

                        <div className="col-md-12">
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
)(AddFlow);