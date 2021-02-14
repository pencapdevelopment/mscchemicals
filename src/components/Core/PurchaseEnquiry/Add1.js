import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';

import { Link } from 'react-router-dom';
// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import { server_url, context_path, getUniqueCode, getTodayDate } from '../../Common/constants';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';
import { Button, TextField, FormControl } from '@material-ui/core';
import AutoSuggest from '../../Common/AutoSuggest';
import { saveProducts } from '../Common/AddProducts1';
import { saveUsers } from '../Common/AssignUsers';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import 'react-datetime/css/react-datetime.css';
import Moment from 'react-moment';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
import Divider from '@material-ui/core/Divider';
import {
    Table, Modal,

    ModalBody, ModalHeader,
} from 'reactstrap';
import FormValidator from '../../Forms/FormValidator';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
// import { Card, CardHeader, CardBody, Input, TabContent, TabPane, Nav, NavItem, NavLink, Form, CustomInput } from 'reactstrap';
import { Form } from 'reactstrap';

// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import UOM from '../Common/UOM';

// const json2csv = require('json2csv').parse;



class Add extends Component {

    state = {
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            modalassign: false,
            obj: {
                code: getUniqueCode('PR'),
                enquiryDate: getTodayDate(),
                company: '',
                contactName: '',
                email: '',
                phone: '',
                source: '',
                status: 'On going',
                description: '',
                quantity: '',
                amount: '',
                product: '',
                products: [],
            },
            selectedProducts: [],
        },
        objects: [],
        selectedUser: '',
        assignUser: '',
        assignProduct: '',
        user: '',
        status: [
            { label: 'On going', value: 'On going' },
            { label: 'Rejected', value: 'Rejected' },
            { label: 'Partially Rejected', value: 'Partially Rejected' },
            { label: 'Converted', value: 'Converted' },
        ],
    }
    loadCompany(companyId) {

        axios.get(server_url + context_path + "api/companies/" + companyId + '?projection=company_auto_suggest_product')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj.email = res.data.email;
                formWizard.obj.phone = res.data.phone;
                formWizard.obj.contactName = res.data.name;

                if (res.data.products) {
                    res.data.products.forEach(p => {
                        formWizard.obj.products = [];
                        formWizard.selectedProducts = [];
                        var products = formWizard.obj.products;

                        //var idx = products.length;
                        products.push({ quantity: '', amount: '' })
                        formWizard.selectedProducts.push(p.product);
                    })
                }

                this.setState({ formWizard }, o => {
                    if (res.data.products) {
                        res.data.products.forEach((p, idx) => {
                            if(this.productASRef[idx]){
                                this.productASRef[idx].setInitialField(formWizard.selectedProducts[idx]);
                            }
                        });
                    }
                });

                axios.get(server_url + context_path + "api/company-contact?sort=id,asc&projection=company_contact_name&page=0&size=1&company=" + companyId)
                    .then(res => {
                        if (res.data._embedded['company-contact'] && res.data._embedded['company-contact'].length) {
                            var formWizard = this.state.formWizard;
                            formWizard.obj.contactName = res.data._embedded['company-contact'][0].name;
                            this.setState({ formWizard });

                        }
                    });


            });



    }
    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=purchases_edit')
            .then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj = res.data;

                formWizard.obj.selectedCompany = res.data.company;
                formWizard.obj.company = res.data.company.id;
                this.companyASRef.setInitialField(formWizard.obj.selectedCompany);

                formWizard.obj.products.forEach((p, idx) => {
                    formWizard.selectedProducts[idx] = p;
                    this.productASRef.push(''); 
                    // this.productASRef[idx].setInitialField(p);
                });

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

        if (e) {
            formWizard.obj[field] = e.format();
        } else {
            formWizard.obj[field] = null;
        }

        this.setState({ formWizard });
    }

    setAutoSuggestAssignProduct(field, val) {
        var assignProduct=this.state.assignProduct;
        assignProduct=val;
        this.setState({assignProduct})
        // var formWizard = this.state.formWizard;
        // formWizard.obj[field] = val;
        // formWizard['selected' + field] = val;
        // this.setState({ formWizard });
        // if (field === 'company') {
            //     this.loadCompany(val)
            // }
        }
    setAutoSuggestAssignUser(field, val) {
        var assignUser=this.state.assignUser;
        assignUser=val;
        this.setState({assignUser})
        // var formWizard = this.state.formWizard;
        // formWizard.obj[field] = val;
        // formWizard['selected' + field] = val;
        // this.setState({ formWizard });
        // if (field === 'company') {
            //     this.loadCompany(val)
            // }
        }
        setAutoSuggest(field, val) {
            var formWizard = this.state.formWizard;
            formWizard.obj[field] = val;
            formWizard['selected' + field] = val;
            this.setState({ formWizard });
            if (field === 'company') {
                this.loadCompany(val)
            }
        }
        setAutoSuggest1(field, val) {
            this.setState({ user: val });
        }
        toggleModalAssign = () => {
            var objects = this.state.objects;
            objects.push(this.state.assignUser);
            var assignUser=this.state.assignUser;
            assignUser='';
            this.setState({ objects,assignUser});
            // this.setState({
        //     modalassign: !this.state.modalassign
        // });
    }
    saveUser() {

        var objects = this.state.objects;
        objects.push(this.state.user);
        this.setState({ objects, modalassign: !this.state.modalassign });
    }
    handleDelete = (i) => {
        var objects = this.state.objects;

        objects.splice(i, 1);

        this.setState({ objects });
    }
    setProductField(i, field, e, noValidate) {
        var formWizard = this.state.formWizard;
        console.log(e.target.value)
        var input = e.target;
        formWizard.obj.products[i][field] = e.target.value;
        this.setState({ formWizard });

        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({
                formWizard
            });
        }
    }

    setProductAutoSuggest(idx, val) {
        var formWizard = this.state.formWizard;

        var products = formWizard.obj.products;
        var selectedProducts = formWizard.selectedProducts;

        products[idx].product = val;
        selectedProducts[idx] = { id: val };

        products[idx].updated = true;

        this.setState({ formWizard });
    }
// addProduct = () => {
//         var formWizard = this.state.formWizard;

//         var products = formWizard.obj.products;
//         var idx = products.length;
//         products.push({ quantity: '', amount: '' })
//         formWizard.selectedProducts.push('');

//         this.setState({ formWizard }, o => {
//             this.productASRef[idx].setInitialField(formWizard.selectedProducts[idx]);
//         });
//     }
    addProduct = () => {
        var formWizard = this.state.formWizard;

        var products = formWizard.obj.products;
        var idx = products.length;
        products.push({ quantity: '', amount: '',product:this.state.assignProduct })
        formWizard.selectedProducts.push(this.state.assignProduct);

        this.setState({ formWizard }, o => {
            this.productASRef[idx].setInitialField(formWizard.selectedProducts[idx]);
        });
        // this.setProductAutoSuggest(idx, this.state.assignProduct.id);
    }

    deleteProduct = (i) => {
        var formWizard = this.state.formWizard;

        var products = formWizard.obj.products;

        if (products[i].id) {
            products[i].delete = true;
        } else {
            products.splice(i, 1);
            formWizard.selectedProducts.splice(i, 1);
        }

        this.setState({ formWizard });
    }




    checkForError() {
        // const form = this.formWizardRef;

        const tabPane = document.getElementById('salesEnquiryForm');
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

            if (!newObj.products.length) {
                swal("Unable to Save!", "Please add atleast one product", "error");
                return;
            }

            var products = newObj.products;
            var users = this.state.objects;
            newObj.products = [];
            // newObj.users = this.state.objects;
            newObj.adminApproval = 'N';

            var promise = undefined;
            if (!this.state.formWizard.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }
            var that = this;
            promise.then(res => {
                newObj.products = products;
                if (that.state.formWizard.editFlag) {
                    products.forEach(g => { g.updated = true; g.product = g.product.id; })
                }
                saveProducts(this.props.baseUrl, res.data.id, products, () => {
                    this.setState({ loading: false });
                    this.props.onSave(res.data.id);
                });
                saveUsers(this.props.baseUrl, res.data.id, users, () => {
                    this.setState({ loading: false });
                    this.props.onSave(res.data.id);
                });
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
        this.productASRef = [];
        this.props.onRef(this);
        this.setState({ loding: false })
        if (this.state.formWizard.obj.products.length === 0) {
            this.addProduct();
        }
    }

    render() {
        const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
               
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="salesEnquiryForm">
                    <div className="row  " style={{fontSize:"15px"}}>
                        <div className="col-md-6">
                           Purchase_ID
                        
                            <p>{this.state.formWizard.obj.code}</p>
                        </div>
                        <div class="col-md-1"></div>
                        <div className="col-md-5 " >
                            Enquiry Date
                            
                           <p><Moment format="DD MMM YY">{this.state.formWizard.obj.enquiryDate}</Moment></p> 
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-3">
                            <fieldset>
                                <FormControl>
                                    <AutoSuggest url="companies"
                                        name="companyName"
                                        displayColumns="name"
                                        label="Company"

                                        onRef={ref => {
                                            (this.companyASRef = ref)
                                            if (ref) {
                                                this.companyASRef.load();
                                            }
                                        }}
                                        placeholder="Search Company by name"
                                        arrayName="companies"
                                        helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                        error={errors?.companyName_auto_suggest?.length > 0}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}

                                        projection="company_auto_suggest"
                                        value={this.state.formWizard.obj.selectedCompany}
                                        onSelect={e => this.setAutoSuggest('company', e?.id)}
                                        queryString="&name" >
                                            
                                        </AutoSuggest>

                                </FormControl>

                            </fieldset>
                        </div>
                        <div className="col-2 mt-4">
                            {/*<Button className="ml-2 btn-primary" style={{backgroundColor:"#2b3db6",color:"#fff"}} variant="outlined" color="#fff" size="sm" onClick={this.addProduct} title="Add Product">
                                <em className="fas fa-plus"></em> Add
                                        </Button> */}
                            <Button style={{backgroundColor:"#2b3db6",color:"#fff"}} variant="contained" color="secondary" size="small" >+ Add Company </Button>
                        </div>

                        <div className="col-md-4  offset-md-2" style={{marginTop:"4px"}}>
                            <fieldset>
                                <FormControl>
                                    {/* <FormLabel component="legend">Type</FormLabel> */}
                                    <RadioGroup aria-label="type" name="type" row>
                                        <FormControlLabel
                                            value="B" checked={this.state.formWizard.obj.type === 'B'}
                                            label="Email"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                        <FormControlLabel
                                            value="V" checked={this.state.formWizard.obj.type === 'V'}
                                            label="Phone"
                                            onChange={e => this.setField("type", e)}
                                            control={<Radio color="primary" />}
                                            labelPlacement="end"
                                        />
                                    </RadioGroup>
                                </FormControl>
                                {/* <FormControl>
                                    <TextField id="contactName" name="contactName" label="Contact Name" type="text"
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.contactName?.length > 0 ? errors?.contactName[0]?.msg : ""}
                                        error={errors?.contactName?.length > 0} value={this.state.formWizard.obj.contactName}
                                        defaultValue={this.state.formWizard.obj.contactName} onChange={e => this.setField("contactName", e)} />
                                </FormControl> */}
                            </fieldset>
                        </div></div>
                      
                    <div className="row">
                        <div className="col-md-4">
                            <fieldset>
                                <FormControl>
                                    <TextField id="contactName" name="contactName" label="Contact Name" type="text"
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
                                        helperText={errors?.contactName?.length > 0 ? errors?.contactName[0]?.msg : ""}
                                        error={errors?.contactName?.length > 0} value={this.state.formWizard.obj.contactName}
                                        defaultValue={this.state.formWizard.obj.contactName} onChange={e => this.setField("contactName", e)} />
                                </FormControl>
                            </fieldset>
                            {/* <fieldset>
                                <TextField type="text" name="email" label="Email" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"email"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ""}
                                    error={errors?.email?.length > 0}
                                    value={this.state.formWizard.obj.email} onChange={e => this.setField("email", e)} />
                            </fieldset> */}
                        </div>
                        {this.state.formWizard.obj.type === 'V' &&
                            <div className="col-md-4 offset-md-3" style={{marginTop:"-24px"}}>
                                <TextField
                                    name="phone"
                                    type="text"
                                    label="Phone"

                                    fullWidth={true}
                                    inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                    helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ""}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.phone}
                                    onChange={e => this.setField('phone', e)} />
                                {/* <fieldset>
                                <TextField type="text" name="phone" label="Phone" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 13, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"10"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ""}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.phone} onChange={e => this.setField("phone", e)} />
                            </fieldset> */}
                            </div>
                        }
                        {this.state.formWizard.obj.type === 'B' &&
                            <div className="col-md-4 offset-md-3" style={{marginTop:"-24px"}}>
                                <TextField
                                    name="email"
                                    type="text"
                                    label="Email"

                                    fullWidth={true}
                                    inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                    helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ""}
                                    error={errors?.email?.length > 0}
                                    value={this.state.formWizard.obj.email}
                                    onChange={e => this.setField('email', e)} />
                            </div>}
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <fieldset>
                                <TextField type="text" name="source" label="Source" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"3"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.source?.length > 0 ? errors?.source[0]?.msg : ""}
                                    error={errors?.source?.length > 0}
                                    value={this.state.formWizard.obj.source} onChange={e => this.setField("source", e)} />
                            </fieldset>
                        </div>
                        <div className="col-md-5  offset-md-3 " style={{marginTop:"-30px",marginBottom:"-3px"}}>
                            {/*<fieldset>
                                <FormControl>
                                    <InputLabel>Enquiry Status</InputLabel>
                                    <Select label="Enquiry Status" name="status" disabled={true}
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
                            </fieldset>*/}
                            <fieldset>
                                <TextareaAutosize placeholder="Description" fullWidth={true} rowsMin={3} name="description"
                                   style={{padding: 10}}
                                   inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                    helperText={errors?.description?.length > 0 ? errors?.description[0]?.msg : ""}
                                    error={errors?.description?.length > 0}
                                    value={this.state.formWizard.obj.description} onChange={e => this.setField("description", e)} />
                            </fieldset>
                        </div>
                    </div>
                    <div className="row" style={{padding:"20px"}}>
                        <div className="col-md-12 " >
                      {/* <span  >Products</span>  */}  
                        </div>
                    </div>
                  <Divider /> 
                    <div className="row" style={{marginTop:"10px"}}>
                        {/* <div className="col-md-6"> 
                            <fieldset>
                                <TextareaAutosize placeholder="Description" fullWidth={true} rowsMin={3} name="description"
                                    inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                    helperText={errors?.description?.length > 0 ? errors?.description[0]?.msg : ""}
                                    error={errors?.description?.length > 0}
                                    value={this.state.formWizard.obj.description} onChange={e => this.setField("description", e)} />
                            </fieldset>
                        </div> */}
                        <div className="col-md-3">
                            
                            <div className="mt-2">
                            <fieldset>
                                <FormControl>
                                    <AutoSuggest url="products"
                                        name="companyName"
                                        displayColumns="name"
                                        label=" Products"
                                        

                                        onRef={ref => {
                                            console.log("frstref", ref );
                                            (this.productASRef = ref)
                                            if (ref) {
                                                this.productASRef.load();
                                            }
                                        }}
                                        placeholder="Search Company by name"
                                        arrayName="products"
                                        helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                        error={errors?.companyName_auto_suggest?.length > 0}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}

                                        projection="company_auto_suggest"
                                        value={this.state.formWizard.obj.selectedCompany}
                                        onSelect={e => this.setAutoSuggestAssignProduct('product', e)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>

                            </fieldset>
                            
                               {/* <h4>
                                    Products
                            <Button className="ml-2" variant="outlined" color="primary" size="sm" onClick={this.addProduct} title="Add Product">
                                        <em className="fas fa-plus mr-1"></em> Add
                            </Button>
                                </h4>*/}
                            </div></div>
                            <div className="col-2 mt-4">
                           {/*} <Button style={{backgroundColor:"#2b3db6",color:"#fff"}} className="ml-2" variant="outlined" color="primary" size="sm" onClick={this.addProduct} title="Add Product">
                                        <em className="fas fa-plus mr-1"></em> Add
                            </Button>*/}
                            <Button style={{backgroundColor:"#2b3db6",color:"#fff"}} variant="contained" color="secondary" size="small" onClick={this.addProduct}>+ Add Product</Button>
                            </div>
                            </div>

                    {this.state.formWizard.obj.products && this.state.formWizard.obj.products.length > 0 &&
                        <div className="row">
                            <div className="col-md-12">
                                <Table hover responsive>
                                    <tbody>
                                        {this.state.formWizard.obj.products.map((prod, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td className="va-middle">{i + 1}</td>
                                                    <td className="va-middle">
                                                        <fieldset>
                                                            <FormControl>
                                                                {prod.id &&
                                                                    <Link to={`/products/${prod.product.id}`}>
                                                                        {prod.product.name}
                                                                    </Link>
                                                                }
                                                                {!prod.id &&
                                                                    <AutoSuggest url="products"
                                                                        name="productName"
                                                                        fullWidth={true}
                                                                        displayColumns="name"
                                                                        label="Product"
                                                                        placeholder="Search product by name"
                                                                        arrayName="products"
                                                                        helperText={errors?.productName_auto_suggest?.length > 0 ? errors?.productName_auto_suggest[i]?.msg : ""}
                                                                        error={errors?.productName_auto_suggest?.length > 0}
                                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                                        onRef={ref => {
                                                                            console.log("refis", ref);
                                                                            console.log("this ", this);
                                                                            (this.productASRef[i] = ref) 
                                                                            if(ref) {
                                                                            this.productASRef[i].setInitialField(this.state.formWizard.selectedProducts[i]);}
                                                                        }}
                                                                        

                                                                        projection="product_auto_suggest"
                                                                        value={this.state.formWizard.selectedProducts[i]}
                                                                        onSelect={e => this.setProductAutoSuggest(i, e?.id)}
                                                                        queryString="&name" ></AutoSuggest>
                                                                        
                                                                        }
                                                            </FormControl>
                                                        </fieldset>
                                                    </td>
                                                    <td>
                                                        <fieldset>

                                                            <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                                                inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                                error={errors?.quantity?.length > 0}
                                                                value={this.state.formWizard.obj.products[i].quantity} onChange={e => this.setProductField(i, "quantity", e)} />
                                                        </fieldset>
                                                    </td>
                                                    <td>
                                                        <fieldset>

                                                            <UOM required={true}
                                                                value={this.state.formWizard.obj.products[i].uom} onChange={e => this.setProductField(i, "uom", e, true)} />
                                                        </fieldset>
                                                    </td>
                                                    <td>
                                                        <fieldset>

                                                            <TextField type="number" name="amount" label="Amount" required={true}
                                                                inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                helperText={errors?.amount?.length > 0 ? errors?.amount[i]?.msg : ""}
                                                                error={errors?.amount?.length > 0}
                                                                value={this.state.formWizard.obj.products[i].amount} onChange={e => this.setProductField(i, "amount", e)} />
                                                        </fieldset>
                                                    </td>
                                                    <td className="va-middle">
                                                        <Button variant="outlined" style={{color:"red",borderColor:"red"}} color="secondary" size="sm" onClick={e => this.deleteProduct(i)} title="Delete Product">
                                                            <em className="fas fa-trash"></em>
                                                        </Button>
                                                    </td>
                                                </tr>)
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        </div>}
                        <div className="row" style={{padding:"10px"}}>
                        <div className="col-md-12 " >
                         {/* <span>Sales</span> */}   
                        </div>
                    </div>
                    <Divider />
                    
                    <div className="row" style={{marginTop:"10px"}}>
	                    <div className="col-3">
                           
                            <fieldset>
                                <FormControl>
                                    <AutoSuggest url="users"
                                        name="usersName"
                                        displayColumns="name"
                                        label="Assign"

                                        onRef={ref => {
                                            (this.userASRef = ref)
                                            if (ref) {
                                                this.userASRef.load();
                                            }
                                        }}
                                        placeholder="Search User by name"
                                        arrayName="users"
                                        helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                        error={errors?.companyName_auto_suggest?.length > 0}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}

                                        projection="company_auto_suggest"
                                        value={this.state.assignUser}
                                        onSelect={e => this.setAutoSuggestAssignUser('user', e)}
                                        queryString="&name" ></AutoSuggest>

                                </FormControl>

                            </fieldset>
                        </div>
                        <div className="col-md-2 " style={{marginTop:"30px"}}>
                        
                        <Button style={{backgroundColor:"#2b3db6",color:"#fff"}} variant="contained" color="secondary" size="small" onClick={this.toggleModalAssign}>+ Assign User</Button>
                        </div>
</div>
                    <div className="row">
                     
                     {/*  <div className="col-md-1">
                           <div className="mt-2">
                                <h4>
                                    Assign
                                    </h4>
                            </div> 
                        </div>*/}   
                        <div class="col-md-9" style={{marginLeft:"4px"}}>{this.state.objects.map((obj, i) => {
                            return (
                                <Chip
                                    avatar={
                                        <Avatar>
                                            <AssignmentIndIcon />
                                        </Avatar>
                                    }
                                    label={obj.name}

                                    // onClick={() => this.handleClick(obj)}
                                    onDelete={() => this.handleDelete(i)}
                                // className={classes.chip}
                                />
                            )
                        })}</div>
                        {/*<div class="col-md-3"><Button variant="contained" color="secondary" size="small" onClick={this.toggleModalAssign}>+ Assign User</Button></div>*/}
                    </div>
                    <div className="row" >
                    <div className=" col-md-12 text-center mt-3" >
                        <Button style={{backgroundColor:"red"}} variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>
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
