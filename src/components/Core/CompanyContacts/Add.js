import MomentUtils from '@date-io/moment';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
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
import AutoSuggest from '../../Common/AutoSuggest';
import { context_path, server_url } from '../../Common/constants';
import FormValidator from '../../Forms/FormValidator';
import ContentWrapper from '../../Layout/ContentWrapper';
// const json2csv = require('json2csv').parse;
class Add extends Component {
    state = {
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                name: '',
                pic: '',
                type: 'C',
                branch: '',
                status: '',
                email: '',
                phone: '',
                company: '',
                department: '',
                gender: '',
                pan: '',
                gstin: '',
                aboutWork: '',
                reportsTo: '',
                firstMet: '',
                whatsapp: '',
                linkedin: '',
                wechat: '',
                qq: '',
                dob: null,
                anniversary: null,
                previousCompany: '',
                selectedcompany: '',
                selectedbranch: '',
                editCompany: true
            }
        },
        company: [],
        branch: [],
        status: [],
        fileTypes1: [
            { label: 'GSTIN', expiryDate: true },
            { label: 'PAN', expiryDate: true },
        ],
        department: [
            { label: 'R & D', value: 'R & D' },
            { label: 'Qaquc', value: 'Qaquc' },
            { label: 'Purch', value: 'Purch' },
            { label: 'Stores', value: 'Stores' },
            { label: 'Acs', value: 'Acs' },
            { label: 'Management', value: 'Management' },
            { label: 'Sales', value: 'Sales' },
            { label: 'Consultant', value: 'Consultant' },
            { label: 'Broker', value: 'Broker' },
            { label: 'Others', value: 'Others' }
        ]
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + "?projection=company_contact_edit")
        .then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj = res.data;
            formWizard.selectedcompany = formWizard.obj.company;
            formWizard.selectedbranch = formWizard.obj.branch;
            // if (formWizard.obj.company) {
            //     formWizard.obj.company = formWizard.obj.company.id;
            // }
            this.companyASRef.setInitialField(formWizard.selectedcompany);
            this.branchASRef.setInitialField(formWizard.selectedbranch);
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
        if (field === 'phone' && input.value >= 10) {
            formWizard.obj.whatsapp = input.value;
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
        return hasError;
    }

    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
            var newObj = this.state.formWizard.obj;
            if (this.state.formWizard.obj.gender === '') {
                swal("Unable to Save!", "Please select gender", "error");
                return;
            }
            if (this.state.formWizard.selectedcompany) {
                newObj.company = '/companies/' + this.state.formWizard.selectedcompany.id;
            }
            if (this.state.formWizard.selectedbranch) {
                newObj.branch = '/branches/' + this.state.formWizard.selectedbranch.id;
            }
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
        this.props.onRef(this);
        if (this.props.company) {
            var formWizard = this.state.formWizard;
            formWizard.selectedcompany = this.props.company;
            // formWizard.obj.company = this.props.company.id;
            formWizard.obj.editCompany = false;
            this.companyASRef.setInitialField(this.props.company)
            this.setState({ formWizard });
        }
        this.setState({ loding: false })
    }
    render() {
        const errors = this.state.formWizard.errors;
        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">
                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            {this.state.formWizard.obj.editCompany && <fieldset>
                                <FormControl>

                                    <RadioGroup aria-label="position" name="position" row>
                                        <FormControlLabel
                                            value="C" checked={this.state.formWizard.obj.type === 'C'}
                                            label="Company Contact"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                            value="B" checked={this.state.formWizard.obj.type === 'B'}
                                            label="Broker"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </fieldset>}
                            <fieldset>
                                <TextField type="text" label="Name" required={true}
                                    fullWidth={true} name="name"
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required","msg":"Name is required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.name?.length > 0 ? errors?.name[0]?.msg : ''}
                                    error={errors?.name?.length > 0}

                                    value={this.state.formWizard.obj.name}
                                    onChange={e => this.setField("name", e)}
                                />
                            </fieldset>
                            {this.state.formWizard.obj.type && <fieldset>
                                <FormControl>
                                    <AutoSuggest url="companies"
                                        name="companyName"
                                        onRef={ref => {
                                            (this.companyASRef = ref)
                                            if (ref) {
                                                this.companyASRef.load();
                                            }
                                        }}
                                        displayColumns="name"
                                        label="Company"
                                        readOnly={!this.state.formWizard.obj.editCompany}
                                        placeholder="Search Company by name"
                                        arrayName="companies"
                                        projection="company_auto_suggest"
                                        value={this.state.formWizard.selectedcompany}
                                        onSelect={e => this.setAutoSuggest('company', e)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>
                            </fieldset>}
                            {this.state.formWizard.obj.type === 'C' &&
                                <fieldset>
                                    <FormControl>
                                        <AutoSuggest url="branches"
                                            displayColumns="name"
                                            name="branchName"
                                            onRef={ref => (this.branchASRef = ref)}
                                            label="Branch"
                                            placeholder="Search Branch by name"
                                            arrayName="branches"
                                            projection="branch_auto_suggest"
                                            value={this.state.formWizard.selectedbranch}
                                            onSelect={e => this.setAutoSuggest('branch', e)}
                                            queryString={`&company.id=${this.state.formWizard.obj.company ? this.state.formWizard.obj.company.id : 0}&branchName`}></AutoSuggest>
                                    </FormControl>
                                </fieldset>}


                            <fieldset>
                                <TextField
                                    type="text"
                                    name="email"
                                    label="Email"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"email"}]' }}
                                    helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ''}
                                    error={errors?.email?.length > 0}
                                    value={this.state.formWizard.obj.email}
                                    onChange={e => this.setField('email', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="phone"
                                    label="Phone"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ maxLength: 13, "data-validate": '[ { "key":"phone"}]' }}
                                    helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ''}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.phone}
                                    onChange={e => this.setField('phone', e)} />
                            </fieldset>
                            {this.state.formWizard.obj.type === 'C' &&
                                <fieldset>
                                    <FormControl>
                                        <InputLabel>Department</InputLabel>
                                        <Select label="Department" value={this.state.formWizard.obj.department} name="department"

                                            helperText={errors?.department?.length > 0 ? errors?.department[0]?.msg : ''}
                                            error={errors?.department?.length > 0}
                                            onChange={e => this.setSelectField('department', e)}> {this.state.department.map((e, keyIndex) => {
                                                return (
                                                    <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </fieldset>}
                            <fieldset>
                                <FormControl>
                                    <FormLabel component="legend">Gender*</FormLabel>
                                    <RadioGroup aria-label="position" name="Gender" row>
                                        <FormControlLabel
                                            value="M" checked={this.state.formWizard.obj.gender === 'M'}
                                            label="Male"
                                            onChange={e => this.setField("gender", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                            value="F" checked={this.state.formWizard.obj.gender === 'F'}
                                            label="Female"
                                            onChange={e => this.setField("gender", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </fieldset>
                            {this.state.formWizard.obj.type === 'B' && <fieldset>

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

                            </fieldset>}
                            {this.state.formWizard.obj.type === 'B' && <fieldset>

                                <TextField
                                    name="pan"
                                    type="text"
                                    label="Pan"

                                    fullWidth={true}
                                    inputProps={{ minLength: 15, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                    helperText={errors?.pan?.length > 0 ? errors?.pan[0]?.msg : ""}
                                    error={errors?.pan?.length > 0}
                                    value={this.state.formWizard.obj.pan}
                                    onChange={e => this.setField('pan', e)} />

                            </fieldset>}
                            {/* <fieldset>
                      <FormControl>
                        <InputLabel>Designation</InputLabel>
                        <Select label="Designation" value={this.state.formWizard.obj.designation} name="designation"
				 inputProps={{ "data-validate": '[{ "key":"required"}]' }}
				    helperText={errors?.designation?.length > 0 ? errors?.designation[0]?.msg : ''}
                                    error={errors?.designation?.length > 0}
                          onChange={e => this.setSelectField('designation', e)}> {this.state.designation.map((e, keyIndex) => {
                            return (
                              <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </fieldset> */}
                            {/* <fieldset>
                                <TextareaAutosize placeholder="About Work" fullWidth={true} rowsMin={3} name="aboutWork"

                                    inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }}
                                    helperText={errors?.aboutWork?.length > 0 ? errors?.aboutWork[0]?.msg : ''}
                                    error={errors?.aboutWork?.length > 0}
                                    value={this.state.formWizard.obj.aboutWork} onChange={e => this.setField("aboutWork", e)} />
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <TextField type="text" label="Reports To"
                                         fullWidth={true} name="reportsTo"
                                        inputProps={{ maxLength: 45 }}
                                        helperText={errors?.reportsTo?.length > 0 ? errors?.reportsTo[0]?.msg : ''}
                                        error={errors?.reportsTo?.length > 0}
                                        value={this.state.formWizard.obj.reportsTo}
                                        onChange={e => this.setField("reportsTo", e)}
                                    />
                                </FormControl>
                            </fieldset> */}
                            <fieldset>
                                <TextField type="text" label="Where met first" name="firstMet" fullWidth={true}
                                    inputProps={{ maxLength: 45,}}
                                    helperText={errors?.firstMet?.length > 0 ? errors?.firstMet[0]?.msg : ''}
                                    error={errors?.firstMet?.length > 0}

                                    value={this.state.formWizard.obj.firstMet} onChange={e => this.setField("firstMet", e)}
                                />
                            </fieldset>
                            {this.state.formWizard.obj.type === 'B' &&
                                <fieldset>

                                    <TextareaAutosize placeholder="Street Address"
                                        name="street"
                                        inputProps={{ "data-validate": '[{ "key":"required"}]', maxLength: 50 }}
                                        fullWidth={true} rowsMin={3}
                                        value={this.state.formWizard.obj.street} onChange={e => this.setField("street", e)} />

                                </fieldset>}

                            <fieldset>
                                <TextField type="text" label="WhatsApp" required={true} fullWidth={true} name="whatsapp"
                                    // inputProps={{ maxLength: 45 }}
                                    helperText={errors?.whatsapp?.length > 0 ? errors?.whatsapp[0]?.msg : ''}
                                    error={errors?.whatsapp?.length > 0}
                                    inputProps={{ minLength: 10, "data-validate": '[ { "key":"phone"}]' }}
                                    value={this.state.formWizard.obj.whatsapp} onChange={e => this.setField("whatsapp", e)}
                                />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" label="Wechat" fullWidth={true} name="wechat"
                                    inputProps={{ maxLength: 45 }}
                                    helperText={errors?.wechat?.length > 0 ? errors?.wechat[0]?.msg : ''}
                                    error={errors?.wechat?.length > 0}
                                    value={this.state.formWizard.obj.wechat} onChange={e => this.setField("wechat", e)}
                                />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" label="QQ" fullWidth={true} name="qq"
                                    inputProps={{ maxLength: 45 }}
                                    helperText={errors?.qq?.length > 0 ? errors?.qq[0]?.msg : ''}
                                    error={errors?.qq?.length > 0}
                                    value={this.state.formWizard.obj.qq} onChange={e => this.setField("qq", e)}
                                />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" label="LinkedIn" fullWidth={true} name="linkedin"
                                    inputProps={{ maxLength: 45 }}
                                    helperText={errors?.linkedin?.length > 0 ? errors?.linkedin[0]?.msg : ''}
                                    error={errors?.linkedin?.length > 0}
                                    value={this.state.formWizard.obj.linkedin} onChange={e => this.setField("linkedin", e)}
                                />
                            </fieldset>

                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker
                                        autoOk
                                        clearable
                                        disableFuture
                                        label="DOB"
                                        format="DD/MM/YYYY"
                                        value={this.state.formWizard.obj.dob}
                                        onChange={e => this.setDateField('dob', e)}
                                        TextFieldComponent={(props) => (
                                            <TextField
                                                type="text"
                                                name="dob"
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
                                        label="Anniversary"
                                        format="DD/MM/YYYY"
                                        value={this.state.formWizard.obj.anniversary}
                                        onChange={e => this.setDateField('anniversary', e)}
                                        TextFieldComponent={(props) => (
                                            <TextField
                                                type="text"
                                                name="anniversary"
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
                            {/* <fieldset>
                                <TextField type="text" label="Previously worked company"
                                     fullWidth={true} name="previousCompany"
                                    inputProps={{ maxLength: 45 }}
                                    helperText={errors?.previousCompany?.length > 0 ? errors?.previousCompany[0]?.msg : ''}
                                    error={errors?.previousCompany?.length > 0}
                                    value={this.state.formWizard.obj.previousCompany} onChange={e => this.setField("previousCompany", e)}
                                />
                            </fieldset> */}


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