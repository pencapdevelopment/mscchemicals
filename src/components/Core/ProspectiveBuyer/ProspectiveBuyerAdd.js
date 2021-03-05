import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import { server_url, context_path,getUniqueCode } from '../../Common/constants';
import { FormControl, InputLabel, Select, MenuItem,  Button, TextField,  } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
//import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
// import AutoSuggest from '../../Common/AutoSuggest';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
import FormValidator from '../../Forms/FormValidator';

import Divider from '@material-ui/core/Divider';
import {  Form } from 'reactstrap';

import AutoSuggest from '../../Common/AutoSuggest';
// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
// import TextareaAutosize from '@material-ui/core/TextareaAutosize';
// const json2csv = require('json2csv').parse;
class ProspectiveBuyerAdd extends Component {
    state = {
        editFlag: false,
        formWizard: {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                id: 0,
                code:getUniqueCode('PB'),
                name: '',
                companyName:'',
                email:'',
                phone:'',
                products: [],
                typeOfCompany:'',
                selectedCompanyType:[],
                department:'',
                designation:'',
                state:'',
                city:'',
                contact:[],
                buyerProduct:[],
                other: ''
            }
        },
        products: [],
        typeOfCompany: [
            { label: 'Food', value: 'Food' },
            { label: 'Pharma', value: 'Pharma' },
            { label: 'Nutra', value: 'Nutra' }
        ]
    }
   
    createNewObj() {
        var formWizard = {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                name: '',
                email:'',
                address: '',
                phone:'',
                other: '',
                contactName:''
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
        if(input.name === 'typeOfCompany'){
            formWizard.obj['typeOfCompany'] = e.target.value.map(el => {return el;}).join(', ');
        }
        this.setState({ formWizard });
        if(!noValidate) {
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
    setProducts(field, val) {
        if(Object.keys(val).length){
            let formWizard = this.state.formWizard;
            let prod = {id:val.id,name:val.name}
            if(formWizard.obj.products.length>0){
                if(formWizard.obj.products.findIndex(compProd => compProd.product.id===val.id) === -1){formWizard.obj.products.push({product:prod});}
            }
            else{
                formWizard.obj.products.push({product:prod});
            }
            this.setState({formWizard});
        }
    }
    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id)
        .then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj = res.data;
            formWizard.obj.products = [];
            formWizard.obj.selectedCompanyType = formWizard.obj.typeOfCompany === ""?[]:formWizard.obj.typeOfCompany.split(', ');
            this.setState({ formWizard },this.getCompanyProducts);
        });
    }
    getCompanyProducts() {
        axios.get(server_url + context_path + "api/company-products/?&projection=company_product&company.id=" + this.state.formWizard.obj.id)
        .then(res => {
            let formWizard =  this.state.formWizard;
            formWizard.obj.products = res.data._embedded[Object.keys(res.data._embedded)[0]];
            this.setState({formWizard});
        });
    }
    loadproducts() {
        axios.get(server_url + context_path + "api/products")
        .then(res => {
            var lis = res.data._embedded[Object.keys(res.data._embedded)];
            if (lis) {
                var products = this.state.products;
                lis.forEach(e => {
                    products.push({ label: e.name, value: e.name, id: e.id });
                })
                this.setState({ products });
            }
        });
    }
    handleSelectedProductDelete = (i) => {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this product!",
            icon: "warning",
            dangerMode: true,
            button: {
                text: "Yes, delete it!",
                closeModal: true,
            }
        }).
        then(willDelete => {
            if (willDelete) {
                var formWizard = this.state.formWizard;
                if(formWizard.obj.products[i].id){
                    formWizard.obj.products[i].delete = true;   
                }
                else{
                    formWizard.obj.products.splice(i, 1);
                }
                this.setState({ formWizard });
            }
        });
    }
    addProduct() {
        if(this.productASRef.state.searchParam !== ""){
            this.setState({ loading: true });
            var newObj = {code: getUniqueCode('PD'),name: this.productASRef.state.searchParam,specification:'',make:'',type:'Food grade',category:''};
            var promise = undefined;
            promise = axios.post(server_url + context_path + "api/products", newObj)
            promise.then(res => {
                let product = res.data;
                this.setState({ loading: false },this.setProducts('products', {id:product.id,name:product.name}));
            }).finally(() => {
                this.loadproducts();
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
                this.setState({ loading: false,formWizard });
                if (!errorMessage) errorMessage = "Please resolve the errors";
                swal("Unable to Save!", errorMessage, "error");
            })
        }
    }
    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
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
            formWizard.errors = errors;
            this.setState({ formWizard });
            swal("Unable to Save!", "Please resolve the errors", "error");
        });
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
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">
                    <div className="row">
                        <div className="col-md-4 offset-md-1">

                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Name"
                                    name="name"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.name?.length > 0 ? errors?.name[0]?.msg : ""}
                                    error={errors?.name?.length > 0}
                                    value={this.state.formWizard.obj.name}
                                    onChange={e => this.setField('name', e)} />
                            </fieldset>
                           
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Company Name"
                                    name="companyName"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.companyName?.length > 0 ? errors?.companyName[0]?.msg : ""}
                                    error={errors?.companyName?.length > 0}
                                    value={this.state.formWizard.obj.companyName}
                                    onChange={e => this.setField('companyName', e)} />
                            </fieldset>

                            <fieldset>
                                    <FormControl>
                                        <InputLabel id="demo-mutiple-checkbox-label">Type of Company</InputLabel>
                                        <Select
                                            name="typeOfCompany"
                                            labelId="demo-mutiple-checkbox-label"
                                            id="demo-mutiple-checkbox"
                                            value={this.state.formWizard.obj.selectedCompanyType}
                                            inputProps={{"data-validate": '[{ "key":"required","msg":"Type of company is required"}]' }}
                                            helperText={errors?.typeOfCompany?.length > 0 ? errors?.typeOfCompany[0]?.msg : ""}
                                            error={errors?.typeOfCompany?.length > 0}
                                            renderValue={(selected) => selected.join(', ')}
                                            onChange={e => this.setSelectField('selectedCompanyType', e)}
                                            multiple={true}
                                        >
                                            {this.state.typeOfCompany.map((e, keyIndex) => {
                                                return (
                                                    <MenuItem key={keyIndex} value={e.value}>
                                                        <Checkbox checked={this.state.formWizard.obj.selectedCompanyType.indexOf(e.value) > -1} />
                                                        <ListItemText primary={e.label} />
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                </fieldset>
                                <fieldset>
                                <TextField
                                    type="text"
                                    label="Department"
                                    name="department"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.department?.length > 0 ? errors?.department[0]?.msg : ""}
                                    error={errors?.department?.length > 0}
                                    value={this.state.formWizard.obj.department}
                                    onChange={e => this.setField('department', e)} />
                            </fieldset>
                  
                        </div>
                   <div className="col-md-4" >
                   <fieldset>
                                <TextField
                                    type="text"
                                    label="Designation"
                                    name="designation"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.designation?.length > 0 ? errors?.designation[0]?.msg : ""}
                                    error={errors?.designation?.length > 0}
                                    value={this.state.formWizard.obj.designation}
                                    onChange={e => this.setField('designation', e)} />
                            </fieldset>
                   <fieldset>
                                <TextField
                                    type="text"
                                    label="State"
                                    name="state"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    
                                    helperText={errors?.state?.length > 0 ? errors?.state[0]?.msg : ""}
                                    error={errors?.state?.length > 0}
                                    value={this.state.formWizard.obj.state}
                                    onChange={e => this.setField('state', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="City"
                                    name="city"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate":'[ { "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]'  }}
                                    helperText={errors?.city?.length > 0 ? errors?.city[0]?.msg : ""}
                                    error={errors?.city?.length > 0}
                                    value={this.state.formWizard.obj.city}
                                    onChange={e => this.setField('city', e)} />
                            </fieldset>

                            {/* <fieldset>
                                <TextField
                                    type="text"
                                    name="phone"
                                    label="phone"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ maxLength: 13, "data-validate": '[{ "key":"phone"}]'  }}
                                    helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ""}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.phone}
                                    onChange={e => this.setField('phone', e)} />
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
                            </fieldset> */}
                           <fieldset>
                                <TextField
                                    name="other"
                                    type="text"
                                    label="Others"
                                        
                                    fullWidth={true}
                                    inputProps={{ minLength: 0, maxLength: 300 }}
                                    value={this.state.formWizard.obj.other}
                                    onChange={e => this.setField('other', e)} />
                            </fieldset>
                   </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-4 offset-sm-1">
                        <fieldset className="row">
                                                <FormControl >
                                                    <AutoSuggest url="products"
                                                        name="products"
                                                        displayColumns="name"
                                                        label="Products Interested"
                                                        onRef={ref => {
                                                            (this.productASRef = ref)
                                                            if (ref) {
                                                                this.productASRef.load();
                                                            }
                                                        }}
                                                        placeholder="Search Product by name"
                                                        arrayName="products"
                                                        helperText={errors?.products?.length > 0 ? errors?.products[0]?.msg : ""}
                                                        error={errors?.productName_auto_suggest?.length > 0}
                                                        projection="product_auto_suggest"
                                                        value={this.state.assignProduct}
                                                        onSelect={e => this.setProducts('products', e)}
                                                        queryString="&name" >
                                                    </AutoSuggest>
                                                </FormControl>
                                               
                                            </fieldset>
                           
                          
                        </div>
                        <div className="col-sm-3" style={{marginLeft:"-30px", marginTop:"27px"}}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={e => this.addProduct()}                         
                        >
                            + Add Product  </Button>
                        </div>
                    </div>
                    <div class="col-md-9" style={{marginLeft:"70px", marginBottom: "20px"}}>
                            {this.state.formWizard.obj.products.length > 0 && this.state.formWizard.obj.products.map((compProd, i) => {
                                return (
                                    !compProd.delete?
                                    <Chip
                                    style={{margin:"5px"}}
                                        label={compProd.product.name}
                                        // onClick={() => this.handleSelectedProducClick(compProd)}
                                        onDelete={() => this.handleSelectedProductDelete(i)}
                                    />:null
                                )
                            })}
                        </div>
             {/* <Divider />
            <div className="row"style={{marginTop: "8px"}} >
                <div className="col-sm-12" >
                    <h4 style={{fontSize: "16px", marginLeft: 80}}>
                            Contact Details
                    </h4>
                </div>
            </div> */}
            <Divider />
               <div className="row">
                   <div className="col-sm-11 ">
                       <div className="row">
                           <div className="col-sm-4 offset-sm-1">
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="phone"
                                    label="Phone Number"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ maxLength: 13, "data-validate": '[ { "key":"phone"}]' }}
                                    helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ''}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.phone}
                                    onChange={e => this.setField('phone', e)} />
                                </fieldset>
                           </div>
                           <div className="col-sm-4">
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
                           </div>
                           <div className="col-sm-3" style={{marginTop: "28px"}}>
                                <Button style={{marginLeft: "-28px"}} variant="contained" color="primary" Size='small' >Add More</Button>
                           </div>
                       </div>
                   </div>
               </div>             
               <Divider />
                <div className="text-center" style={{marginTop: "10px"}}>
                            <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                            <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>
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
)(ProspectiveBuyerAdd);