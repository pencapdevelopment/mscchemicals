import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
// import moment from 'moment';
import axios from 'axios';
// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import { server_url, context_path, } from '../../Common/constants';
import { Button, TextField,  Checkbox } from '@material-ui/core';
// import AutoSuggest from '../../Common/AutoSuggest';

import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    // DatePicker,
    // TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';

import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
// import TextareaAutosize from '@material-ui/core/TextareaAutosize';

// const json2csv = require('json2csv').parse;

class AddEvent extends Component {

    state = {
        editFlag: false,

        formWizard: {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                id: 0,
                title: '',
                description: '',
                fromTime: null,
                toTime: null,
                allDay: false,
            }
        }
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=template_edit')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj = res.data;
                this.setState({ formWizard });
            });
    }
    createNewObj() {
        var formWizard = {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                id: 0,
                title: '',
                description: '',
                fromTime: null,
                toTime: null,
                allDay: false,
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

    setCheckField(field, e, noValidate) {
        console.log(e);
        
        var formWizard = this.state.formWizard;

        formWizard.obj[field] = e.target.checked;
        this.setState({ formWizard });
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
            newObj.uid = this.props.user.id;
            newObj.type = 'COMMON';
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

        if (this.props.branchId) {
            axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.props.branchId)
                .then(res => {
                    var formWizard = this.state.formWizard;
                    formWizard.obj = res.data;
                    this.setState({ formWizard });

                })
        }

        this.setState({ loding: false });
    }

    render() {
        // const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">

                    <div className="row">
                        <div className="col-md-6 offset-md-3">

                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Title"
                                    name="title"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{ maxLength: 25, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.title}
                                    onChange={e => this.setField('title', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Description"
                                    name="description"
                                    required={true}
                                    fullWidth={true}
                                    multiline={true}
                                    inputProps={{ "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"100"}]' }}
                                    value={this.state.formWizard.obj.description}
                                    onChange={e => this.setField('description', e)} />
                            </fieldset>
                            <fieldset>
                                <FormControlLabel
                                control={
                                <Checkbox
                                    value={true} 
                                    label="All Day"
                                    name="allDay"
                                    inputProps={{ 'aria-label': 'All Day' }}
                                    checked={this.state.formWizard.obj.allDay}
                                    onChange={e => this.setCheckField('allDay', e)}
                                />}
                                label="All Day" />
                            </fieldset>

                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DateTimePicker
                                        autoOk
                                        clearable
                                        variant="inline"
                                        label="From Date"
                                        format="DD/MM/YYYY hh:mm"
                                        value={this.state.formWizard.obj.fromTime}
                                        onChange={e => this.setDateField('fromTime', e)}
                                        TextFieldComponent={(props) => (
                                            <TextField
                                                type="text"
                                                name="fromTime"
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
                                    <DateTimePicker
                                        autoOk
                                        clearable
                                        variant="inline"
                                        label="To Date"
                                        format="DD/MM/YYYY hh:mm"
                                        value={this.state.formWizard.obj.toTime}
                                        onChange={e => this.setDateField('toTime', e)}
                                        TextFieldComponent={(props) => (
                                            <TextField
                                                type="text"
                                                name="toTime"
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
)(AddEvent);