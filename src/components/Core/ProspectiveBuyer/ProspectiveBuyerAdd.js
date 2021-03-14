import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import { server_url, context_path,getUniqueCode } from '../../Common/constants';
import { FormControl, InputLabel, Select, MenuItem,  Button, TextField,  } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import PageLoader from '../../Common/PageLoader';
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
function getSteps() {
    return ['Basic Details', 'Branches', 'Contacts'];
}
// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
// import TextareaAutosize from '@material-ui/core/TextareaAutosize';
// const json2csv = require('json2csv').parse;
class ProspectiveBuyerAdd extends Component {
    state = {
        editFlag: false,
        activeStep: 0,
        steps: getSteps(),
        pbProductsUrl: server_url + context_path + "api/buyer-product/",
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
            if(formWizard.obj.buyerProduct.length>0){
                if(formWizard.obj.buyerProduct.findIndex(pbProd => pbProd.product.id===val.id) === -1){formWizard.obj.buyerProduct.push({product:prod});}
            }
            else{
                formWizard.obj.buyerProduct.push({product:prod});
            }
            this.setState({formWizard});
        }
    }
    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id+"?projection=prospective_buyer_edit")
        .then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj = res.data;
            formWizard.obj.selectedCompanyType = formWizard.obj.typeOfCompany === ""?[]:formWizard.obj.typeOfCompany.split(', ');
            this.setState({ formWizard });
        });
    }
    // getCompanyProducts() {
    //     axios.get(server_url + context_path + "api/company-products/?&projection=company_product&company.id=" + this.state.formWizard.obj.id)
    //     .then(res => {
    //         let formWizard =  this.state.formWizard;
    //         formWizard.obj.buyerProduct = res.data._embedded[Object.keys(res.data._embedded)[0]];
    //         this.setState({formWizard});
    //     });
    // }
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
                if(formWizard.obj.buyerProduct[i].id){
                    formWizard.obj.buyerProduct[i].delete = true;   
                }
                else{
                    formWizard.obj.buyerProduct.splice(i, 1);
                }
                this.setState({ formWizard });
            }
        });
    }
    addContact = () => {
        var formWizard = this.state.formWizard;
        var contact = formWizard.obj.contact;
        if(formWizard.obj.phone !== "" && formWizard.obj.email !== "" ){
            contact.push({ name: '', phone: '',  email: ''});
            this.setState({ formWizard },()=>{console.log("frm", formWizard)});
        }
    }
    setContactField(i, field, e, noValidate) {
        var formWizard = this.state.formWizard;
        var input = e.target;
        formWizard.obj.contact[i][field] = e.target.value;
        this.setState({ formWizard });
        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({formWizard});
        }
    }
    deleteProduct = (i) => {
        var formWizard = this.state.formWizard;
        var contact = formWizard.obj.contact;
        if (contact[i].id) {
            contact[i].delete = true;
        } else {
            // contact.splice(i, 1);
            formWizard.obj.contact.splice(i, 1);
        }
        this.setState({ formWizard });
    }
    addProduct() {
        if(this.productASRef.state.searchParam !== ""){
            this.setState({ loading: true });
            var newObj = {code: getUniqueCode('PB'),name: this.productASRef.state.searchParam,specification:'',make:'',type:'Food grade',category:''};
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
    handleNext = () => {
        this.saveDetails();
    };
    handleBack = () => {
        var activeStep = this.state.activeStep - 1;
        this.setState({ activeStep })
    };
    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
        var newObj = this.state.formWizard.obj;
        let pbProducts  = [...newObj['buyerProduct']];
        newObj['buyerProduct'] = [];
        this.setState({ loading: true });
        var promise = undefined;
        if (!this.state.editFlag) {
            promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
        } else {
            promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
        }
        promise.then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj.id = res.data.id;
            formWizard.msg = 'successfully Saved';
            this.setState(formWizard);
            this.savePbProducts(pbProducts,formWizard.obj.id,()=>{this.props.onSave(res.data.id);});
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
            // var errorMessage = "";
            // if (err.response.data.globalErrors) {
            //     err.response.data.globalErrors.forEach(e => {
            //         errorMessage += e + ""
            //     });
            // }
            formWizard.errors = errors;
            this.setState({ formWizard });
            swal("Unable to Save!", "Please resolve the errors", "error");
        });
    }
        return true;
    }
 
    savePbProducts = (products,pbId,callBack) => {
        let pbProducts = products;
        if(products && products.length) {
            this.setState({ loading: true });
            products.forEach((prod, idx) => {
                if(prod.delete) {
                    axios.delete(this.state.pbProductsUrl + prod.id)
                    .then(res => {
                    }).catch(err => {
                        swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                    })
                } else if(!prod.id || prod.updated) {
                    prod.buyer = '/prospective-buyer/' + pbId;
                    prod.product = '/products/' + prod.product.id;
                    prod.type = "interested" ;
                    var promise = undefined;
                    if (!prod.id) {
                        promise = axios.post(this.state.pbProductsUrl, prod)
                    } else {
                        promise = axios.patch(this.state.pbProductsUrl + prod.id, prod)
                    }
                    promise.then(res => {
                        prod.id = res.data.id;
                    }).catch(err => {
                        swal("Unable to Save!", "Please resolve the errors", "error");
                    })
                }
                if(idx === products.length - 1) {
                    let formWizard = this.state.formWizard;
                    formWizard.obj.buyerProduct = pbProducts;
                    this.setState({ formWizard,loading: false });
                    if(callBack){
                        setTimeout(callBack,3000);
                    }
                }
            })
        }
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
                            {this.state.formWizard.obj.buyerProduct.length > 0 && this.state.formWizard.obj.buyerProduct.map((pbProd, i) => {
                                return (
                                    !pbProd.delete?
                                    <Chip
                                    style={{margin:"5px"}}
                                        label={pbProd.product.name}
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
                                <Button style={{marginLeft: "-28px"}} variant="contained" color="primary" Size='small'  onClick={this.addContact} >Add More</Button>
                           </div>
                       </div>
                   </div>
               </div>
               {(this.state.formWizard.obj.contact.length  !== 0 ) && this.state.formWizard.obj.contact.map((cnt,i) =>{
                    return(<div className="row">
                    <div className="col-sm-11 ">
                            <div className="row">
                            <div className="col-sm-3 offset-sm-1">
                                 <fieldset>
                                     <TextField
                                         type="text"
                                         name={"name"+i}
                                         label="Name"
                                         inputProps={{ maxLength: 15, "data-validate": '[{ "key":"required"}]' }}
                                         helperText={errors && errors.hasOwnProperty("name"+i) && errors["name"+i].length > 0?errors["name"+i][0]["msg"]:""}
                                         error={errors && errors.hasOwnProperty("name"+i) && errors["name"+i].length > 0}
                                         value={this.state.formWizard.obj.contact[i].name} onChange={e => this.setContactField(i, "name", e)}
                                      
                                          />
                                     </fieldset>
                                </div>
                                <div className="col-sm-3">
                                 <fieldset>
                                     <TextField
                                         type="text"
                                         name={"phone"+i}
                                         label="Phone Number"
                                         inputProps={{ maxLength: 10, "data-validate": '[{ "key":"phone"},{"key":"maxlen","param":"10"}]' }}
                                         helperText={errors && errors.hasOwnProperty("phone"+i) && errors["phone"+i].length > 0?errors["phone"+i][0]["msg"]:""}
                                         error={errors && errors.hasOwnProperty("phone"+i) && errors["phone"+i].length > 0}
                                         value={this.state.formWizard.obj.contact[i].phone} onChange={e => this.setContactField(i, "phone", e)}
                                      
                                          />
                                     </fieldset>
                                </div>
                                <div className="col-sm-4">
                                 <fieldset>
                                     <TextField
                                         type="text"
                                         name={"email"+i}
                                         label="Email"
                                         inputProps={{  "data-validate": '[{ "key":"email"}]' }}
                                         helperText={errors && errors.hasOwnProperty("email"+i) && errors["email"+i].length > 0?errors["email"+i][0]["msg"]:""}
                                         error={errors && errors.hasOwnProperty("email"+i) && errors["email"+i].length > 0}
                                         value={this.state.formWizard.obj.contact[i].email} onChange={e => this.setContactField(i, "email", e)}
                                      
                                          />
                                     </fieldset>
                                </div>
                                <div className="col-sm-1" style={{marginTop: "28px"}}>
                                <Button variant="outlined" color="secondary" size="sm"  title="Delete Product"  onClick={e => this.deleteProduct(i)} >
                                    <em className="fas fa-trash"></em>
                                </Button>
                                 </div>
                            </div>
                        </div>
                     </div>)           
                })}
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