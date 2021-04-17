import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';

import { IOSSwitch } from '../../Common/IOSSwitch';
import { server_url, context_path } from '../../Common/constants';
import { Button, TextField,  FormControl } from '@material-ui/core';
// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';
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
// import { Card, CardHeader, CardBody, Input, TabContent, TabPane, Nav, NavItem, NavLink, Form, CustomInput } from 'reactstrap';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
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
                code: '',
                name: '',
                description: '',
                defaultRole: false,
                permissions: [],
            },
        },
        permissions: []
    }

    loadPermissions() {
        axios.get(server_url + context_path + "api/permissions?active=true&size=100000")
            .then(res => {
                this.setState({ permissions: res.data._embedded[Object.keys(res.data._embedded)[0]] });
            });
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=user_role_detail')
            .then(res => {
                var formWizard = this.state.formWizard;
                //res.data.permissions.forEach(g=>{g.selected=true;});
                formWizard.obj = res.data;
                console.log(res.data);
                this.setState({ formWizard });
            });
    }
    createNewObj() {
        var formWizard = {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                code: '',
                name: '',
                description: '',
                defaultRole: false,
                permissions: [],
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

    setPermission(idx, e) {
        var formWizard = this.state.formWizard;

        var perm = this.state.permissions[idx];

        var existing = formWizard.obj.permissions.find(g => g.permission.id === perm.id)
        if (existing) {
            existing.selected = e.target.checked;
        } else {
            formWizard.obj.permissions.push({ selected: e.target.checked, permission: perm })
        }

        this.setState({ formWizard });
    }

    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;

        var input = e.target;
        formWizard.obj[field] = input.value;

        if(!formWizard.obj.id && field === 'name' && input.value) {
            formWizard.obj.code = 'ROLE_' + input.value.split(' ')[0].toUpperCase();
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
        if (this.state.formWizard.obj.defaultRole) {
            swal("Unable to Save!", "Default role cann't be edited", "error");
            return;
        }
        
        var hasError = this.checkForError();
        if (!hasError) {
            var newObj = this.state.formWizard.obj;
            var perms = newObj.permissions;
            
            console.log(perms);
            
            var p = [];

            perms.forEach(g => {
                var obj = {}

                obj.id = g.id;
                obj.selected = g.selected;
                obj.permission = '/permissions/' + g.permission.id;
                p.push(obj);
            });

            newObj.permissions = p;
            
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

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.props.onRef(this);
        this.setState({ loding: false });
        this.loadPermissions();
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
                                    <TextField id="name" name="name" label="Name" type="text" required={true}
                                        inputProps={{ readOnly: this.state.formWizard.obj.defaultRole ? true : false, maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.name?.length > 0 ? errors?.name[0]?.msg : ""}
                                        error={errors?.name?.length > 0} value={this.state.formWizard.obj.name}
                                         onChange={e => this.setField("name", e)} />
                                </FormControl>
                            </fieldset>

                            <fieldset>
                                <TextField className="d-none" type="text" name="code" label="Code"
                                    required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.code}
                                    disabled={this.state.formWizard.editFlag}
                                    inputProps={{ readOnly: (this.state.formWizard.obj.id || this.state.formWizard.obj.defaultRole) ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.code?.length > 0 ? errors?.code[0]?.msg : ""}
                                    error={errors?.code?.length > 0}

                                    onChange={e => this.setField("code", e)} />
                            </fieldset>

                            <fieldset>
                                <TextareaAutosize placeholder="Description" fullWidth={true} rowsMin={3} name="description"
                                    inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                    helperText={errors?.description?.length > 0 ? errors?.description[0]?.msg : ""}
                                    error={errors?.description?.length > 0}
                                    value={this.state.formWizard.obj.description} onChange={e => this.setField("description", e)} ></TextareaAutosize>
                            </fieldset>

                            <h4 className="text-center mt-3">Permissions</h4>
                            <hr />
                            {this.state.permissions.map((obj, i) => {
                                return (
                                    <fieldset key={obj.id}>
                                        <div>
                                            {obj.description}
                                            <FormControlLabel className="float-right"
                                                control={
                                                    <IOSSwitch
                                                        label=""
                                                        name={`permissions-${obj.id}`}
                                                        checked={this.state.formWizard.obj.permissions.some(g => g.permission.id === obj.id && g.selected)}
                                                        onChange={e => this.setPermission(i, e)} />}
                                            />
                                        </div>
                                        <hr />
                                    </fieldset>)
                            })}

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