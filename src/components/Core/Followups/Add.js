import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import { server_url, context_path,  } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl,  } from '@material-ui/core';
import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';
// import ListItemText from '@material-ui/core/ListItemText';
// import Checkbox from '@material-ui/core/Checkbox';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';
import PageLoader from '../../Common/PageLoader';
// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
// const json2csv = require('json2csv').parse;
class Add extends Component {
    state = {
        formWizard: {
            editFlag: false,
            loading: false,
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                contact: '',
                followUpDate: null,
                type: '',
                stage: '',
                response: '',
                nextFollowUpDate: null,
                nextFollowupType: '',
                repository: this.props.repository,
                reference: this.props.reference,
            }
        },
        followUpType: [
            { label: 'Visit', value: 'visit' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Chat', value: 'chat' }
        ],
        stage: [
            { label: 'Initial contact', value: 'Initial contact' },
            { label: 'Lead qualify', value: 'Lead qualify' },
            { label: 'Offer Sent', value: 'Offer Sent' },
            { label: 'Negotiation', value: 'Negotiation' },
            { label: 'Deal close-lost', value: 'Deal close-lost' }
        ],
        nextFollowUpType: [
            { label: 'visit', value: 'visit' },
            { label: 'email', value: 'email' },
            { label: 'phone', value: 'phone' },
            { label: 'chat', value: 'chat' }
        ]
    }
    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id)
            .then(res => {
                var formWizard = this.state.formWizard;
                var newobj = res.data;
                if (!newobj.type) {
                    newobj.type = '';
                }
                if (!newobj.stage) {
                    newobj.stage = '';
                }
                if (!newobj.nextFollowupType) {
                    newobj.nextFollowupType = '';
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
            this.setState({ loading: true });
            var newObj = this.state.formWizard.obj;
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
        this.setState({ loding: false })
    }
    render() {
        const errors = this.state.formWizard.errors;
        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">
                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Contact"
                                    name="contact"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.contact?.length > 0 ? errors?.contact[0]?.msg : ""}
                                    error={errors?.contact?.length > 0}
                                    value={this.state.formWizard.obj.contact}
                                    onChange={e => this.setField('contact', e)} />
                            </fieldset>
                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    label="Follow up date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.followUpDate} 
                                    onChange={e => this.setDateField('followUpDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="followUpDate"
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
                                    <InputLabel>Follow up type</InputLabel>
                                    <Select name="type" label="Follow up type" value={this.state.formWizard.obj.type}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.type?.length > 0 ? errors?.type[0]?.msg : ""}
                                        error={errors?.type?.length > 0}
                                        onChange={e => this.setSelectField('type', e)}> {this.state.followUpType.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <InputLabel>Stage</InputLabel>
                                    <Select name="stage" label="Stage" value={this.state.formWizard.obj.stage}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.stage?.length > 0 ? errors?.stage[0]?.msg : ""}
                                        error={errors?.stage?.length > 0}
                                        onChange={e => this.setSelectField('stage', e)}> {this.state.stage.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <TextareaAutosize placeholder="Summary" name="response" fullWidth={true} rowsMin={3}
                                    inputProps={{ maxLength: 500, "data-validate": '[{ "key":"required"},{ "key":"maxlen","param:500},{ "key":"minlen","param:10}]' }}
                                    helperText={errors?.response?.length > 0 ? errors?.response[0]?.msg : ""}
                                    error={errors?.response?.length > 0}
                                    value={this.state.formWizard.obj.response} onChange={e => this.setField("response", e)} />
                            </fieldset>
                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    label="Next follow up date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.nextFollowUpDate} 
                                    onChange={e => this.setDateField('nextFollowUpDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="nextFollowUpDate"
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
                                    )}/>
                                </MuiPickersUtilsProvider>
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <InputLabel>Next follow up type</InputLabel>
                                    <Select name="nextFollowupType" label="Next follow up type"
                                        helperText={errors?.nextFollowupType?.length > 0 ? errors?.nextFollowupType[0]?.msg : ""}
                                        error={errors?.nextFollowupType?.length > 0} value={this.state.formWizard.obj.nextFollowupType}
                                        onChange={e => this.setSelectField('nextFollowupType', e)}> {this.state.followUpType.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
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
)(Add);