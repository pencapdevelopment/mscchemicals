import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import { server_url, context_path, getUniqueCode } from '../../Common/constants';
import {Select, MenuItem, InputLabel, FormControl, Button, TextField,  } from '@material-ui/core';
import { allcats } from './ProspectiveSubcat';
import AutoSuggest from '../../Common/AutoSuggest';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
import Chip from '@material-ui/core/Chip';
import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';
import Divider from '@material-ui/core/Divider';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
// import TextareaAutosize from '@material-ui/core/TextareaAutosize';

// const json2csv = require('json2csv').parse;

class ProspectiveVendorAdd extends Component {

    state = {
        editFlag: false,

        formWizard: {
            globalErrors: [],
            msg: '',
            pvProductsUrl: server_url + context_path + "api/vendor-product/",
            errors: {},
            obj: {
                id: 0,
                code:getUniqueCode('PV'),
                name: '',
                companyName:"",
                department:'',
                designation:'',
                phone:'',
                email:'',
                categories:'',
                contact:[],
                products: [],
                province:'',
                country:'',
                vendorProduct:[], 
                remarks: '',
            }
        } , 
        products: [],
        category: [
            { label: 'Amino acids', value: 'Amino acids' },
            { label: 'Nutraceuticals', value: 'Nutraceuticals' },
            { label: 'Extracts', value: 'Extracts' },
            { label: 'Sweeteners', value: 'Sweeteners' },
            { label: 'Oil', value: 'Oil' },
        ],
     
        
    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=prospective_vendor_edit')
        .then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj = res.data;
          //  formWizard.obj.selectedCompanyType = formWizard.obj.typeOfCompany === ""?[]:formWizard.obj.typeOfCompany.split(', ');
            this.setState({ formWizard });
        });
    }
    // createNewObj() {
    //     var formWizard = {
    //         globalErrors: [],
    //         msg: '',
    //         errors: {},
    //         obj: {
    //             name: '',
    //             company:'',
    //             department:'',
    //             designation:'',
    //             email:'',
    //             address: '',
    //             country:'',
    //             Province:'',
    //             category:'',
    //             phonenumber:'',
    //             other: '',
    //             contactName:''
    //         }
    //     }

    //     this.setState({ formWizard });
    // }
    loadDataa() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id+"?projection=prospective_vendor_edit")
            .then(res => {
                var formWizard = this.state.formWizard;
                console.log(res.data);
                var newobj = res.data;

                // newobj.selectedMakes = newobj['make'].split(",");//
                // newobj.selectedTypes = newobj['type'].split(",");

                this.setState({ subCategory: allcats.filter(g => g.type === newobj['categories']).map(g => { return { label: g.name, value: g.name } }) });
                this.uomRef.updateVal(newobj.uom);
                formWizard.obj = newobj;

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

        if(!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({
                formWizard
            });
        }
    }
    addContact = () => {
        var formWizard = this.state.formWizard;
        var contact = formWizard.obj.contact;
        if(formWizard.obj.phone !== "" && formWizard.obj.email !== "" ){
            contact.push({ name: '', phone: '',  email: ''});
            this.setState({ formWizard },()=>{console.log("frm", formWizard)});
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
    addProduct() {
        if(this.productASRef.state.searchParam !== ""){
            this.setState({ loading: true });
            var newObj = {code: getUniqueCode('PV'),
            name: this.productASRef.state.searchParam,specification:'',make:'',type:'Food grade',category:''};
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
    setProducts(field, val) {
        if(Object.keys(val).length){
            let formWizard = this.state.formWizard;
            let prod = {id:val.id,name:val.name}
            if(formWizard.obj.vendorProduct.length>0){
                if(formWizard.obj.vendorProduct.findIndex(pvProd => pvProd.product.id===val.id) === -1){formWizard.obj.vendorProduct.push({product:prod});}
            }
            else{
                formWizard.obj.vendorProduct.push({product:prod});
            }
            this.setState({formWizard});
        }
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
        let pvProducts  = [...newObj['vendorProduct']];
        newObj['vendorProduct'] = [];
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
            this.savePvProducts(pvProducts,formWizard.obj.id,()=>{this.props.onSave(res.data.id);});
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
    savePvProducts = (products,pvId,callBack) => {
        let pvProducts = products;
        if(products && products.length) {
            this.setState({ loading: true });
            products.forEach((prod, idx) => {
                if(prod.delete) {
                    axios.delete(this.state.pvProductsUrl + prod.id)
                    .then(res => {
                    }).catch(err => {
                        swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                    })
                } else if(!prod.id || prod.updated) {
                    prod.vendor = '/prospective-vendor/' + pvId;
                    prod.product = '/products/' + prod.product.id;
                    prod.type = "Focused";
                    var promise = undefined;
                    if (!prod.id) {
                        promise = axios.post(this.state.pvProductsUrl, prod)
                    } else {
                        promise = axios.patch(this.state.pvProductsUrl + prod.id, prod)
                    }
                    promise.then(res => {
                        prod.id = res.data.id;
                    }).catch(err => {
                        console.log("product add err",err);
                        swal("Unable to Save!", "Please resolve the errors", "error");
                    })
                }
                if(idx === products.length - 1) {
                    let formWizard = this.state.formWizard;
                    formWizard.obj.vendorProduct = pvProducts;
                    this.setState({ formWizard,loading: false });
                    if(callBack){
                        setTimeout(callBack,3000);
                    }
                }
            })
        }
    }
 
    saveDeta() {
        var hasError = this.checkForError();
        if (!hasError) {
        var newObj = this.state.formWizard.obj;
        // newObj['categories'] = "";
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
            formWizard.errors = errors;
            this.setState({ formWizard });
            swal("Unable to Save!", "Please resolve the errors", "error");
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
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">

                    <div className="row">
                        <div className="col-md-4   offset-md-1 ">

                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Name"
                                    name="name"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
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
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.companyName}
                                    onChange={e => this.setField('companyName', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Department"
                                    name="department"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.department}
                                    onChange={e => this.setField('department', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Designation"
                                    name="designation"
                                    required={true}
                                    fullWidth={true}
                                    readOnly={true}
                                    inputProps={{maxLength: 30, "data-validate": '[{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    value={this.state.formWizard.obj.designation}
                                    onChange={e => this.setField('designation', e)} />
                            </fieldset>
                     
                            <fieldset>
                                <TextField
                                    name="remarks"
                                    type="text"
                                    label="Remarks"                         
                                    fullWidth={true}
                                    inputProps={{ minLength: 0, maxLength: 300 }}
                                    value={this.state.formWizard.obj.remarks}
                                    onChange={e => this.setField('remarks', e)} />
                            </fieldset>                        
                        </div>
                        <div className="col-md-4">
                             <fieldset>
                                    <TextField
                                        name="country"
                                        type="text"
                                        label="Country"                                
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                        helperText={errors?.country?.length > 0 ? errors?.country[0]?.msg : ""}
                                        error={errors?.country?.length > 0}
                                        value={this.state.formWizard.obj.country}
                                        onChange={e => this.setField('country', e)} />
                                </fieldset>
                                <fieldset>
                                    <TextField
                                        name="province"
                                        type="text"
                                        label="Province"                                           
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                        helperText={errors?.province?.length > 0 ? errors?.province[0]?.msg : ""}
                                        error={errors?.province?.length > 0}
                                        value={this.state.formWizard.obj.province}
                                        onChange={e => this.setField('province', e)} />
                                </fieldset>
                                <fieldset>
                                <FormControl>
                                    <InputLabel id="demo-mutiple-checkbox-label">Category</InputLabel>
                                     <Select
                                        name="categories"
                                        labelId="demo-mutiple-checkbox-label"
                                        id="demo-mutiple-checkbox"
                                        value={this.state.formWizard.obj.categories}
                                         
                                        helperText={errors?.categories?.length > 0 ? errors?.categories[0]?.msg : ""}
                                        error={errors?.categories?.length > 0}
                                        onChange={e => this.setSelectField('categories', e)}
                                       > 
                                       {this.state.category.map((e,keyIndex) => {
                                        return (
                                            <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                        );
                                    })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                            {/* <fieldset>
                                    <TextField
                                        name="vendorProduct"
                                        type="text"
                                        label="Products Offered"                                            
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                        helperText={errors?.vendorProduct?.length > 0 ? errors?.vendorProduct[0]?.msg : ""}
                                        error={errors?.vendorProduct?.length > 0}
                                        value={this.state.formWizard.obj.vendorProduct}
                                        onChange={e => this.setField('vendorProduct', e)} />
                                </fieldset>                            */}
                   </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-4 offset-sm-1">
                        <fieldset className="row">
                                                <FormControl >
                                                    <AutoSuggest url="products"
                                                        name="products"
                                                        displayColumns="name"
                                                        label="Products Offered"
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
                            {this.state.formWizard.obj.vendorProduct.length > 0 && this.state.formWizard.obj.vendorProduct.map((pvProd, i) => {
                                return (
                                    !pvProd.delete?
                                    <Chip
                                    style={{margin:"5px"}}
                                        label={pvProd.product.name}
                                        // onClick={() => this.handleSelectedProducClick(compProd)}
                                        onDelete={() => this.handleSelectedProductDelete(i)}
                                    />:null
                                )
                            })}
                        </div>
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

                    <div className="text-center">
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
)(ProspectiveVendorAdd);