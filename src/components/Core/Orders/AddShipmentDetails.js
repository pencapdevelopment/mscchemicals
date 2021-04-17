import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import AutoSuggest from '../../Common/AutoSuggest';

import { server_url, context_path, } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl, } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';


import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

// const json2csv = require('json2csv').parse;



class AddShipmentDetails extends Component {

    state = {
        editFlag: false,
        // status: [],
        formWizard: {
            globalErrors: [],
            msg: '',
            errors: {},

            obj: {
                invoiceNo: '', 
                type: this.props.parentObj.type === 'Sales' ? 'Outgoing' : 'Incoming',
                phase: '',
                batchNo: '',
                origin: '', //address/city/state/country/ pin code
                destination: '', //address/city/state/country/ pin code
                eta: '',
                lastLocation: '',
                packagingType: '',
                packageCount: '',
                transporter: '',
                lrDate: null,
                lrDetails: '',
                transportationCharges: '',
                loadingUnloadingCharges: '',
                proofOfDelivery: '',
                status: '',
                company: '',
                order: '',
                products: [],
            }
        },
        status: [
            { label: 'On going', value: 'On going' },
            { label: 'Completed', value: 'Completed' },
        ],
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=order_inventory_edit')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj = res.data;

                formWizard.obj.order = formWizard.obj.order.id;

                formWizard.obj.selectedCompany = res.data.company;
                formWizard.obj.company = res.data.company.id;
                this.companyASRef.setInitialField(formWizard.obj.selectedCompany);



                this.setState({ formWizard });
            });
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

        const tabPane = document.getElementById('orderQuoteForm');
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
            newObj.company = '/companies/' + newObj.company;
            newObj.order = '/orders/' + newObj.order;
            
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

        
        if(!this.props.currentId && this.props.parentObj) {
            var formWizard = this.state.formWizard;

            formWizard.obj.order = this.props.parentObj.id;

            formWizard.obj.selectedCompany = this.props.parentObj.company;
            formWizard.obj.company = this.props.parentObj.company.id;
            this.companyASRef.setInitialField(formWizard.obj.selectedCompany);

            

            this.setState({ formWizard });
        } 
    }

    render() {
        const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="orderQuoteForm">

                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <fieldset>
                                <TextField type="text" name="invoiceNo" label="Invoice No" required={true} fullWidth={true}
                                    inputProps={{readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.invoiceNo?.length > 0 ? errors?.invoiceNo[0]?.msg : ""}
                                    error={errors?.invoiceNo?.length > 0}
                                    value={this.state.formWizard.obj.invoiceNo} onChange={e => this.setField("invoiceNo", e)} />
                            </fieldset>
                            <fieldset>
                                <TextField type="text" name="type" label="Type" required={true} fullWidth={true}
                                    inputProps={{readOnly: true, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.type?.length > 0 ? errors?.type[0]?.msg : ""}
                                    error={errors?.type?.length > 0}
                                    value={this.state.formWizard.obj.type} onChange={e => this.setField("type", e)} />
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
                                        readOnly={true}
                                        projection="company_auto_suggest"
                                        value={this.state.formWizard.obj.selectedCompany}
                                        onSelect={e => this.setAutoSuggest('company', e?.id)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>
                            </fieldset>

                            <fieldset>
                                <TextField type="text" name="phase" label="Phase" required={true} fullWidth={true} 
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.phase?.length > 0 ? errors?.phase[0]?.msg : ""}
                                    error={errors?.phase?.length > 0}
                                    value={this.state.formWizard.obj.phase} onChange={e => this.setField("phase", e)} />
                            </fieldset>                       
                            
                            <fieldset>
                                <TextField type="number" name="batchNo" label="Batch No" required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.batchNo} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.batchNo?.length > 0 ? errors?.batchNo[0]?.msg : ""}
                                    error={errors?.batchNo?.length > 0}
                                    onChange={e => this.setField("batchNo", e)} />
                            </fieldset>

                            <fieldset>
                                <TextareaAutosize placeholder="Origin" fullWidth={true} rowsMin={3} name="origin"
                                inputProps={{ maxLength: 200, "data-validate": '[{maxLength:100}]' }} required={true}
                                helperText={errors?.origin?.length > 0 ? errors?.origin[0]?.msg : ""}
                                error={errors?.origin?.length > 0}
                                value={this.state.formWizard.obj.origin} onChange={e => this.setField("origin", e)} />
                            </fieldset>

                            <fieldset>
                                <TextareaAutosize placeholder="Destination" fullWidth={true} rowsMin={3} name="destination"
                                inputProps={{ maxLength: 200, "data-validate": '[{maxLength:100}]' }} required={true}
                                helperText={errors?.destination?.length > 0 ? errors?.destination[0]?.msg : ""}
                                error={errors?.destination?.length > 0}
                                value={this.state.formWizard.obj.destination} onChange={e => this.setField("destination", e)} />
                            </fieldset>

                            <fieldset>
                                <TextField type="number" name="eta" label="ETA (days)" required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.eta} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.eta?.length > 0 ? errors?.eta[0]?.msg : ""}
                                    error={errors?.eta?.length > 0}
                                    onChange={e => this.setField("eta", e)} />
                            </fieldset>

                            <fieldset>
                                <TextField type="text" name="lastLocation" label="Last Location" required={true} fullWidth={true} 
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.lastLocation?.length > 0 ? errors?.lastLocation[0]?.msg : ""}
                                    error={errors?.lastLocation?.length > 0}
                                    value={this.state.formWizard.obj.lastLocation} onChange={e => this.setField("lastLocation", e)} />
                            </fieldset>    
                            
                            <fieldset>
                                <TextField type="text" name="packagingType" label="Packaging Type" required={true} fullWidth={true} 
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.packagingType?.length > 0 ? errors?.packagingType[0]?.msg : ""}
                                    error={errors?.packagingType?.length > 0}
                                    value={this.state.formWizard.obj.packagingType} onChange={e => this.setField("packagingType", e)} />
                            </fieldset> 
                            
                            <fieldset>
                                <TextField type="number" name="packageCount" label="Package Count" required={true} fullWidth={true}
                                    value={this.state.formWizard.obj.packageCount} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.packageCount?.length > 0 ? errors?.packageCount[0]?.msg : ""}
                                    error={errors?.packageCount?.length > 0}
                                    onChange={e => this.setField("packageCount", e)} />
                            </fieldset>

                            <fieldset>
                                <TextField type="text" name="transporter" label="Transporter" required={true} fullWidth={true} 
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.transporter?.length > 0 ? errors?.transporter[0]?.msg : ""}
                                    error={errors?.transporter?.length > 0}
                                    value={this.state.formWizard.obj.transporter} onChange={e => this.setField("transporter", e)} />
                            </fieldset> 


                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    label="LR Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.lrDate} 
                                    onChange={e => this.setDateField('lrDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="lrDate"
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
                                <TextField type="text" name="lrDetails" label="LR Details" required={true} fullWidth={true} 
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.lrDetails?.length > 0 ? errors?.lrDetails[0]?.msg : ""}
                                    error={errors?.lrDetails?.length > 0}
                                    value={this.state.formWizard.obj.lrDetails} onChange={e => this.setField("lrDetails", e)} />
                            </fieldset> 

                            <fieldset>
                                <FormControl>
                                    <TextField type="number" name="transportationCharges" label="Transportation Charges" required={true} fullWidth={true}
                                        value={this.state.formWizard.obj.transportationCharges} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.transportationCharges?.length > 0 ? errors?.transportationCharges[0]?.msg : ""}
                                        error={errors?.transportationCharges?.length > 0}
                                        onChange={e => this.setField("transportationCharges", e)} />
                                </FormControl>
                            </fieldset>

                            <fieldset>
                                <FormControl>
                                    <TextField type="number" name="loadingUnloadingCharges" label="Loading Unloading Charges" required={true} fullWidth={true}
                                        value={this.state.formWizard.obj.loadingUnloadingCharges} inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.loadingUnloadingCharges?.length > 0 ? errors?.loadingUnloadingCharges[0]?.msg : ""}
                                        error={errors?.loadingUnloadingCharges?.length > 0}
                                        onChange={e => this.setField("loadingUnloadingCharges", e)} />
                                </FormControl>
                            </fieldset>

                            <fieldset>
                                <TextField type="text" name="proofOfDelivery" label="Proof Of Delivery" required={true} fullWidth={true} 
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.proofOfDelivery?.length > 0 ? errors?.proofOfDelivery[0]?.msg : ""}
                                    error={errors?.proofOfDelivery?.length > 0}
                                    value={this.state.formWizard.obj.proofOfDelivery} onChange={e => this.setField("proofOfDelivery", e)} />
                            </fieldset> 

                            <fieldset>
                                <FormControl>
                                    <InputLabel>Delivery Status</InputLabel>
                                    <Select label="status" name="status"
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.status?.length > 0 ? errors?.status[0]?.msg : ""}
                                        error={errors?.status?.length > 0}
                                        value={this.state.formWizard.obj.status}
                                        onChange={e => this.setSelectField('status', e)}> {this.state.status.map((e, keyIndex) => {
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
)(AddShipmentDetails);