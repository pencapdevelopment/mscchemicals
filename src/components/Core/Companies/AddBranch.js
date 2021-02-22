import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import axios from 'axios';
import queryString from 'query-string';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import { Form } from 'reactstrap';
import swal from 'sweetalert';
import AutoSuggest from '../../Common/AutoSuggest';
import { context_path, getUniqueCode, server_url } from '../../Common/constants';
import FormValidator from '../../Forms/FormValidator';
import ContentWrapper from '../../Layout/ContentWrapper';
//import Branches from './Branches';


// const json2csv = require('json2csv').parse;


class AddBranch extends Component {

    state = {
        newObj: '',
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                name: getUniqueCode('CB'),
                type: '',
                street: '',
                locality: '',
                landmark: '',
                city: '',
                state: '',
                country: '',
                pincode: ''

            },
            selectedcountry: '',


        },
        addressTypes: [
            { label: 'Company HQ', value: 'HQ' },
            { label: 'Branch', value: 'BR' },
            { label: 'Billing', value: 'BI' },
            { label: 'Plant', value: 'PL' },
            { label: 'Warehouse', value: 'WH' }
        ],
        isLocationtype: false,
        province:''

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
            ref: React.createRef(),
            name: '',
            type: '',
            street: '',
            locality: '',
            landmark: '',
            city: '',
            state: '',
            country: '',
            pincode: ''
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
        formWizard.obj[field] = input.value;

        if (field === 'pincode' && input.value && input.value.length === 6) {
            axios.get(server_url + context_path + "api/pincodes?pincode=" + input.value)
                .then(res => {
                    if (res.data._embedded.pincodes && res.data._embedded.pincodes.length) {
                        var obj = res.data._embedded.pincodes[0];
                        formWizard.obj.city = obj.city;
                        formWizard.obj.state = obj.state;
                        formWizard.obj.country = 'India';
                    }

                    this.setState({ formWizard });
                });
        } else {
            this.setState({ formWizard });
        }

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
            newObj.company = '/companies/' + this.props.currentId;
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


    loadObj() {
        console.log("Add branch loadobj ");
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.props.branchId).then(res => {
            console.log("Add branch axiossssssAdd branch loadobj ");
            if (res.data.paymentTerms) {
                console.log("paymentTerms ");
                res.data.paymentTerms = this.state.terms.find(g => g.value === res.data.paymentTerms).label;
            }
            console.log("Before ");

            this.setState({
                newObj: res.data,
                loading: false
            });
            console.log("Add Branch After ", this.state.newObj);

            // if (res.data.locationType !== 'I') {
            //     if (!res.data.fssai || !res.data.drugLicense || !res.data.others) {
            //         var fileTypes1 = this.state.fileTypes1;

            //         if (!res.data.fssai) {
            //             fileTypes1[2].noshow = true;
            //         }
            //         if (!res.data.drugLicense) {
            //             fileTypes1[3].noshow = true;
            //         }

            //         if (!res.data.fssai && !res.data.drugLicense) {
            //             fileTypes1[4].noshow = false;
            //         }

            //         if (!res.data.others) {
            //             fileTypes1[5].noshow = true;
            //         }

            //         this.setState({ fileTypes1 });
            //     }
            // }

            // // this.loadSubObjs();

            // if (this.props.location.search) {
            //     let params = queryString.parse(this.props.location.search);

            //     if (params.branch) {
            //         this.toggleTab(1);
            //     }
            // }
        });
    }




    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.loadObj();
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
        } else {
            axios.get(server_url + context_path + "api/companies/" + this.props.currentId).then(res => {
                console.log(res.data)
                if (res.data.locationType === 'N') {
                    this.setState({
                        isLocationtype: true,
                        province:'state'

                    })
                }
                else{
                    this.setState({
                        province:'province'
                    })
                }
                // this.loadSubObjs();


            });
        }
    }

    // static getDerivedStateFromProps()
    // {
    //     this.loadObj();
    // }

    // shouldComponentUpdate(){
    //     this.loadObj();
    // }

    render() {
        const errors = this.state.formWizard.errors;
        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">
                    <div className="row">
                        <div className="col-md-8 offset-md-2">
                            <div className="text-center">
                                <h4>{this.state.formWizard.obj.id ? 'Edit' : 'Add'} Branch</h4>
                            </div>
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Branch Code"
                                    name="name"
                                    inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"}]' }}
                                    helperText={errors?.name?.length > 0 ? errors?.name[0]?.msg : ""}
                                    error={errors?.name?.length > 0}
                                    fullWidth={true}
                                    value={this.state.formWizard.obj.name}
                                    onChange={e => this.setField('name', e)} />
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <InputLabel>Select Type</InputLabel>
                                    <Select
                                        label="Select Type..."
                                        name="type"
                                        value={this.state.formWizard.obj.type}
                                        inputProps={{ "data-validate": '[{ "key":"required","msg":"Type is required"}]' }}
                                        helperText={errors?.type?.length > 0 ? errors?.type[0]?.msg : ""}
                                        error={errors?.type?.length > 0}
                                        onChange={e => this.setSelectField('type', e)}
                                    >
                                        {this.state.addressTypes.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <TextareaAutosize placeholder="Street Address"
                                    name="street"
                                    inputProps={{ "data-validate": '[{ "key":"required","msg":"Street is required"}]', maxLength: 50 }}
                                    fullWidth={true} rowsMin={3}
                                    value={this.state.formWizard.obj.street} onChange={e => this.setField("street", e)} />
                            </fieldset>
                            {/* <fieldset>
                                <TextField
                                    type="text"
                                    name="locality"
                                    label="locality"
                                    required={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.locality?.length > 0 ? errors?.locality[0]?.msg : ""}
                                    error={errors?.locality?.length > 0}

                                    fullWidth={true}

                                    value={this.state.formWizard.obj.locality}
                                    onChange={e => this.setField('locality', e)} />
                            </fieldset> */}
                            {/* {(this.state.formWizard.obj.type === 'V' || this.state.formWizard.obj.locationType === 'N') ? */}
                            {this.state.isLocationtype &&
                                <fieldset>

                                    <TextField
                                        type="text"
                                        name="landmark"
                                        label="Landmark"
                                        required={true}
                                        fullWidth={true}
                                        helperText={errors?.landmark?.length > 0 ? errors?.landmark[0]?.msg : ""}
                                        error={errors?.landmark?.length > 0}
                                        inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required","msg":"Landmark is required"}]' }}
                                        value={this.state.formWizard.obj.landmark}  
                                        onChange={e => this.setField('landmark', e)} />

                                </fieldset>}
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="pincode"
                                    label="Pincode"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ "data-validate": '[{ "key":"required","msg":"Pincode is required"}]' }}
                                    helperText={errors?.pincode?.length > 0 ? errors?.pincode[0]?.msg : ""}
                                    error={errors?.pincode?.length > 0}
                                    value={this.state.formWizard.obj.pincode}
                                    onChange={e => this.setSelectField('pincode', e)} />
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <TextField
                                        type="text"
                                        name="city"
                                        label="City"
                                        required={true}
                                        fullWidth={true}
                                        inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required","msg":"City is required"}]' }}
                                        helperText={errors?.city?.length > 0 ? errors?.city[0]?.msg : ""}
                                        error={errors?.city?.length > 0}
                                        value={this.state.formWizard.obj.city}
                                        onChange={e => this.setField('city', e)} />
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <TextField
                                        type="text"
                                        name="state"
                                        label={this.state.province}
                                        required={true}
                                        fullWidth={true}
                                        helperText={errors?.state?.length > 0 ? errors?.state[0]?.msg : ""}
                                        error={errors?.state?.length > 0}
                                        inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required","msg":"State is required"}]' }}
                                        value={this.state.formWizard.obj.state}
                                        onChange={e => this.setField('state', e)} />
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <AutoSuggest url="countries"
                                        name="companyName"
                                        displayColumns="name"
                                        label="Country"
                                        onRef={ref => (this.countryASRef = ref)}
                                        placeholder="Search Country by name"
                                        arrayName="countries"
                                        projection=""
                                        value={this.state.formWizard.selectedcountry}
                                        onSelect={e => this.setAutoSuggest('country', e.name)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>
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
)(AddBranch);