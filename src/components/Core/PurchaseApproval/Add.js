import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';

import { server_url, context_path,  } from '../../Common/constants';
import { Button,  Select, MenuItem, InputLabel, FormControl, } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';

// import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

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
            readOnly:false,
            obj: {
                 
                 
                response: '',
                description: '',
                status:'',
                repository: this.props.repository,
                reference: this.props.reference,
                orderApproval:'N'
            }
        },
 
        status: [
            { label: 'Accept', value: 'A' },
            { label: 'Reject', value: 'R' },
          
        ], 

    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id)
            .then(res => {
                var formWizard = this.state.formWizard;
                
                var newobj = res.data;
                
                 
                if (!newobj.status) {
                    newobj.status = '';
                }
                 
                var readOnly=(newobj.status==='A' || newobj.status==='R');
                formWizard.obj = newobj;

                this.setState({ formWizard ,readOnly});
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
    onOrderApprovalChange(e){
        var newObj=this.state.formWizard;
        console.log(e.target.checked);
        newObj.obj.orderApproval =e.target.checked?'Y':'N'
        this.setState({newObj})

    }

    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
            var newObj = this.state.formWizard.obj;
            var promise = undefined;
            if((this.props.user.role === 'ROLE_ADMIN' ||this.props.user.permissions.indexOf("MG_AC")>=0)  && newObj.status===''){
                swal("Unable to Save!", "Please select status", "error");
                return ;
            }
            if (!this.state.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }

            promise.then(res => {
                if(newObj.orderApproval==='Y' && newObj.status==='A'){
                    console.log(this.props.repository);
                    axios.patch(server_url + context_path + "api/"+newObj.repository+"/"+newObj.reference , {adminApproval:'Y',accountsApproval:'Y'})
                }else if(  newObj.status==='A'){
                    axios.patch(server_url + context_path + "api/"+this.props.repository+"/"+this.props.reference , {adminApproval:'Y',accountsApproval:'Y'})
           
                }
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
        const readOnly=this.state.readOnly;
        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">

                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                        <fieldset>
                                <TextareaAutosize placeholder="Request Description"
                                disabled={(this.props.user.role === 'ROLE_ADMIN' && this.state.formWizard.editFlag) || readOnly}
                                name="description" fullWidth={true} rowsMin={3}
                                    inputProps={{ maxLength: 500, "data-validate": '[{ "key":"required"},{ "key":"maxlen","param:500},{ "key":"minlen","param:10}]' }}
                                    helperText={errors?.description?.length > 0 ? errors?.description[0]?.msg : ""}
                                    error={errors?.description?.length > 0}
                                    value={this.state.formWizard.obj.description} onChange={e => this.setField("description", e)} />
                            </fieldset>
                            {this.props.repository !== 'orders' && <fieldset>
                            <FormControl>
                            <InputLabel>Order Approval *</InputLabel>
                            <Checkbox name="orderApproval" disabled={this.props.user.role === 'ROLE_ADMIN' || readOnly} checked={this.state.formWizard.obj.orderApproval ==='Y'} value="Y" onChange={e=> this.onOrderApprovalChange(e)} />
                            </FormControl>
                            </fieldset>}
                          {(this.props.user.role === 'ROLE_ADMIN' || readOnly || (this.props.user.permissions.indexOf("MG_AC")>=0) ) &&  <fieldset>
                                <FormControl>
                                    <InputLabel>Status*</InputLabel>
                                    <Select name="status" label="Status" value={this.state.formWizard.obj.status}
                                        disabled={readOnly}
                                        helperText={errors?.status?.length > 0 ? errors?.status[0]?.msg : ""}
                                        error={errors?.status?.length > 0}
                                        onChange={e => this.setSelectField('status', e)}> {this.state.status.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>}

                            {(this.props.user.role === 'ROLE_ADMIN' || readOnly || (this.props.user.permissions.indexOf("MG_AC")>=0)) &&  <fieldset>
                                <TextareaAutosize placeholder="Response" name="response" fullWidth={true} rowsMin={3}
                                    disabled={readOnly}
                                    inputProps={{ maxLength: 500, "data-validate": '[{ "key":"maxlen","param:500}]' }}
                                    helperText={errors?.response?.length > 0 ? errors?.response[0]?.msg : ""}
                                    error={errors?.response?.length > 0}
                                    value={this.state.formWizard.obj.response} onChange={e => this.setField("response", e)} />
                            </fieldset>}
                                        
                            <div className="text-center">
                                <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                {!readOnly &&  <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save</Button>
                                 }                                                            
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