import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import { Link } from 'react-router-dom';
// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import { server_url, context_path, getUniqueCode, getTodayDate } from '../../Common/constants';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';
import { Button, TextField,  Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
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
import PageLoader from '../../Common/PageLoader';
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
                code: getUniqueCode('PE'),
                enquiryDate: getTodayDate(),
                company: '',
                contactName: '',
                email: '',
                phone: '',
                source: '',
                dispatch:'',
                portOfLanding:"",
                fob:'',
                cif:"",
                paymentTerms:"",
                currency:"",
                status: 'On going',
                description: '',
                quantity: '',
                amount: '',
                product: '',
                products: [],
            },
            selectedProducts: [],
        },
        loading: false,
        users: [],
        selectedCompanies: [],
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
        currency: [
            { label: 'Rupee', value: 'I' },
            { label: 'Dollar', value: 'D' },
            { label: 'EUR', value: 'E' },
           
        ],
    }
    setSelectField(field, e) {
        this.setField(field, e, true);
    }
    loadCompany(companyId) {
        axios.get(server_url + context_path + "api/prospective-vendor/" + companyId + '?projection=vendor_auto_suggest_product')
        .then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj.email = res.data.email;
            formWizard.obj.phone = res.data.phone;
            formWizard.obj.contactName = res.data.name;
            formWizard.obj.paymentTerms = res.data.paymentTerms;
            if (res.data.products) {
                res.data.products.forEach(p => {
                    // formWizard.obj.products = [];
                    // formWizard.selectedProducts = [];
                    var products = formWizard.obj.products;
                    //var idx = products.length;
                    if(products.findIndex(pd => pd.product.id === p.product.id) === -1){
                        products.push({ quantity: '', amount: '',uom: '', product:p.product});
                        formWizard.selectedProducts.push(p.product);
                    }
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
            console.log(server_url + context_path + "api/vendor-contact?sort=id,asc&projection=company_contact_name&page=0&size=1&company=" + companyId)
            axios.get(server_url + context_path + "api/vendor-contact?sort=id,asc&projection=vendor_contact_name&page=0&size=1&vendor=" + companyId)
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
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id + '?projection=pv_purchase_edit')
        .then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj = res.data;
            formWizard.obj.selectedCompany = res.data.company;
            formWizard.obj.paymentTerms = res.data.company.paymentTerms;
            formWizard.obj.company = res.data.company.id;
            this.companyASRef.setInitialField(formWizard.obj.selectedCompany);
            formWizard.obj.products.forEach((p, idx) => {
                formWizard.selectedProducts[idx] = p;
                this.productASRef.push(''); //this.productASRef[idx].setInitialField(p);
            });
            var selectedCompanies = this.state.selectedCompanies;
            selectedCompanies.push({
                companyId:formWizard.obj.selectedCompany.id,
                name:formWizard.obj.selectedCompany.name,
                type:'B',
                email:formWizard.obj.email,
                phone:formWizard.obj.phone,
                contactName:formWizard.obj.contactName,
                source:formWizard.obj.source,
                dispatch:formWizard.obj.dispatch,
                portOfLanding:formWizard.obj.portOfLanding,
                fob:formWizard.obj.fob,
                cif:formWizard.obj.cif,
                currency:formWizard.obj.currency,
                description:formWizard.obj.description
            });
            var users = formWizard.obj.users;
            this.setState({ formWizard , selectedCompanies,users});
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
    }
    setAutoSuggestAssignUser(field, val) {
        var assignUser=this.state.assignUser;
        assignUser=val;
        this.setState({assignUser})
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
    checkForAddCompError() {
        // const form = this.formWizardRef;
        const tabPane = document.getElementById('companyvalidatorDiv');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        var formWizard = this.state.formWizard;
        formWizard.errors = errors;
        this.setState({ formWizard });
        return hasError;
    }
    addCompany = () => {
        var hasError = this.checkForAddCompError();
        if (!hasError) {
            var formWizard = this.state.formWizard;
            var selectedCompanies = this.state.selectedCompanies;
            if(this.state.formWizard.editFlag){
                selectedCompanies = [];
            }
            var exists = selectedCompanies.length>0?selectedCompanies.findIndex(c => c.companyId === formWizard.selectedcompany):-1;
            if(formWizard.selectedcompany && formWizard.obj.contactName !== '' && formWizard.obj.source !== ''){
                if(exists === -1){
                    selectedCompanies.push({
                        companyId:formWizard.selectedcompany,
                        name:this.companyASRef.state.searchParam,
                        type:formWizard.obj.type,
                        email:formWizard.obj.email,
                        phone:formWizard.obj.phone,
                        contactName:formWizard.obj.contactName,
                        source:formWizard.obj.source,
                        description:formWizard.obj.description,
                        dispatch:formWizard.obj.dispatch,
                        portOfLanding:formWizard.obj.portOfLanding,
                        fob:formWizard.obj.fob,
                        cif:formWizard.obj.cif,
                        paymentTerms:formWizard.obj.paymentTerms,
                        currency:formWizard.obj.currency
                    });
                }
                else{
                    selectedCompanies[exists] = {
                        companyId:formWizard.selectedcompany,
                        name:this.companyASRef.state.searchParam,
                        type:formWizard.obj.type,
                        email:formWizard.obj.email,
                        phone:formWizard.obj.phone,
                        contactName:formWizard.obj.contactName,
                        source:formWizard.obj.source,
                        paymentTerms:formWizard.obj.paymentTerms,
                        description:formWizard.obj.description
                    }
                }
                formWizard.selectedcompany = '';
                formWizard.obj.type = '';
                formWizard.obj.email = '';
                formWizard.obj.phone = '';
                formWizard.obj.contactName = '';
                formWizard.obj.source = '';
                formWizard.obj.description = '';
                formWizard.obj.paymentTerms = '';
                this.companyASRef.setInitialField({name:''});
                this.setState({formWizard,selectedCompanies});
            }
        }
    }
    onSelectCompChip = (comp) => {
        var formWizard = this.state.formWizard;
        formWizard.selectedcompany = comp.companyId;
        formWizard.obj.type = comp.type;
        formWizard.obj.email = comp.email;
        formWizard.obj.phone = comp.phone;
        formWizard.obj.contactName = comp.contactName;
        formWizard.obj.source = comp.source;
        formWizard.obj.description = comp.description;
        formWizard.obj.dispatch = comp.dispatch;
        formWizard.obj.portOfLanding = comp.portOfLanding;
        formWizard.obj.fob = comp.fob;
        formWizard.obj.cif = comp.cif;
        formWizard.obj.paymentTerms = comp.paymentTerms;
        formWizard.obj.currency = comp.currency;
        this.companyASRef.setInitialField(comp);
        this.setState({formWizard});
    }
    removeCompany = (i) => {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this company!",
            icon: "warning",
            dangerMode: true,
            button: {
                text: "Yes, delete it!",
                closeModal: true,
            }
        }).
        then(willDelete => {
            if (willDelete) {
                var selectedCompanies = this.state.selectedCompanies;
                selectedCompanies.splice(i, 1);
                this.setState({ selectedCompanies });
            }
        });
    }
    toggleModalAssign = () => {
        var users = this.state.users;
        if(Object.keys(this.state.assignUser).length !== 0 && users.findIndex(u => u.user.id === this.state.assignUser.id) === -1){
            users.push({user:this.state.assignUser})
        };
        var assignUser=this.state.assignUser;
        assignUser='';
        this.setState({ users,assignUser});
    }
    saveUser() {
        var users = this.state.users;
        users.push({user:this.state.user});
        this.setState({ users, modalassign: !this.state.modalassign });
    }
    handleDelete = (i) => {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this user assignment!",
            icon: "warning",
            dangerMode: true,
            button: {
                text: "Yes, delete it!",
                closeModal: true,
            }
        }).
        then(willDelete => {
            if (willDelete) {
                var users = this.state.users;
                users.splice(i, 1);
                this.setState({ users });
            }
        });
    }
    setProductField(i, field, e, noValidate) {
        var formWizard = this.state.formWizard;
        var input = e.target;
        formWizard.obj.products[i][field] = e.target.value;
        this.setState({ formWizard });
        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({formWizard});
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
    addProduct = () => {
        var formWizard = this.state.formWizard;
        var products = formWizard.obj.products;
        if(products.findIndex(pd => pd.product.id === this.state.assignProduct.id) === -1){
            var idx = products.length;
            products.push({ quantity: '', amount: '',product:this.state.assignProduct })
            formWizard.selectedProducts.push(this.state.assignProduct);
            this.setState({ formWizard }, o => {
                this.productASRef[idx].setInitialField(formWizard.selectedProducts[idx]);
            });
        }
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
        const tabPane = document.getElementById('purchaseEnquiryForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        var formWizard = this.state.formWizard;
        if(this.state.users.length>0 && errors.hasOwnProperty('usersName_auto_suggest')){
            errors.usersName_auto_suggest = [];
        }
        if(this.state.formWizard.obj.products.length>0 && errors.hasOwnProperty('productName_auto_suggest')){
            errors.productName_auto_suggest = [];
        }
        if(this.state.selectedCompanies.length>0){
            errors.companyName_auto_suggest = [];
            errors.contactName = [];
            errors.source = [];
        }
        formWizard.errors = errors;
        this.setState({ formWizard });
        let hserr = false;
        let errKeys = Object.keys(errors);
        for(var i=0;i<errKeys.length;i++){
            if(errors[errKeys[i]].length){
                hserr = true;break;
            }
        }
        return hserr;
    }
    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
            if (!this.state.formWizard.obj.products.length) {
                swal("Unable to Save!", "Please add atleast one product", "error");
                return;
            }            
            var selectedCompanies = this.state.selectedCompanies;
            if(selectedCompanies.length === 0){
                this.addCompany();
            }
            this.setState({ loading: true });        
            selectedCompanies.forEach((comps,idx) => {
                var newObj = {...this.state.formWizard.obj};
                newObj.company = '/prospective-vendor/' + comps.companyId;
                if(!this.state.formWizard.editFlag){
                    newObj.code = getUniqueCode('PR');
                    newObj.adminApproval = 'N';
                }
                newObj.contactName = comps.contactName;
                newObj.description = comps.description;
                newObj.email = comps.email;
                newObj.phone = comps.phone;
                newObj.source = comps.source;
                newObj.products = [];
                if (this.state.formWizard.editFlag) {
                    newObj.users = [];
                }
                var promise = undefined;
                if (!this.state.formWizard.editFlag) {
                    promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
                } else {
                    promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
                }
                var that = this;
                promise.then(res => {
                    var products = [...that.state.formWizard.obj.products];
                    var users = [...this.state.users];
                    if (that.state.formWizard.editFlag) {
                        products.forEach(p => { p.updated = true; });
                        users.forEach(u => { u.updated = true; })
                    }
                    saveProducts(this.props.baseUrl, res.data.id, products, () => {});
                    saveUsers(this.props.baseUrl, res.data.id, users, () => {
                        if(idx === selectedCompanies.length -1){this.setState({ loading: false });this.props.onSave(res.data.id);}
                    });
                }).finally(() => {
                    if(idx === selectedCompanies.length -1){this.setState({ loading: false });}
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
            });
        }
        return true;
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.productASRef = [];
        this.props.onRef(this);
        this.setState({ loding: false });
    }
    render() {
        const errors = this.state.formWizard.errors;
        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="purchaseEnquiryForm">
                    <div className="row" style={{fontSize:"15px"}}>
                        <div className="col-md-6">
                            Purchases_ID<p>{this.state.formWizard.obj.code}</p>
                        </div>
                        <div class="col-md-1"></div>
                        <div className="col-md-5 " >
                            Enquiry Date<p><Moment format="DD MMM YY">{this.state.formWizard.obj.enquiryDate}</Moment></p> 
                        </div>
                    </div>
                    {/* <div className="row">
                        <div className="col-md-4">
                            <fieldset>     
                                 <TextField type="text" name="code" label="Sales ID" required={true} fullWidth={true} disabled
                                    inputProps={{ readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    // disabled={this.state.formWizard.editFlag}
                                    helperText={errors?.code?.length > 0 ? errors?.code[0]?.msg : ""}
                                    error={errors?.code?.length > 0}
                                    value={this.state.formWizard.obj.code} onChange={e => this.setField("code", e)} /> 
                            </fieldset>
                        </div>
                        <div className="col-md-4 offset-md-3">
                            <fieldset>
                                 <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker
                                        autoOk
                                        clearable
                                        disableFuture
                                        label="Enquiry Date"
                                        format="DD/MM/YYYY"
                                        value={this.state.formWizard.obj.enquiryDate}
                                        onChange={e => this.setDateField('enquiryDate', e)}
                                        TextFieldComponent={(props) => (
                                            <TextField
                                                type="text"
                                                name="enquiryDate"
                                                id={props.id}
                                                label={props.label}
                                                onClick={props.onClick}
                                                value={props.value}
                                                disabled
                                                // disabled={props.disabled}
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
                        </div>
                    </div> */}
                    <div id="companyvalidatorDiv">
                        <div className="row">
                            <div className="col-3">
                                <fieldset>
                                    <FormControl>
                                        <AutoSuggest url="prospective-vendor"
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
                                            arrayName="prospective-vendor"
                                            helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                            error={errors?.companyName_auto_suggest?.length > 0}
                                            inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                            projection="vendor_auto_suggest"
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
                                <Button style={{backgroundColor:"#2b3db6",color:"#fff"}} variant="contained" color="secondary" size="small" onClick={this.addCompany}>+ Add Company </Button>
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
                                </fieldset>
                            </div>
                        </div>
                        <div className="row">   
                            <div class="col-md-5" style={{marginLeft:"4px"}}>
                                {this.state.selectedCompanies.map((comp, i) => {
                                    return (
                                        <Chip
                                        style={{backgroundColor:"lightgreen"}}
                                            avatar={
                                                <Avatar>
                                                    <AssignmentIndIcon  style={{color:"#000"}} />
                                                </Avatar>
                                            }
                                            label={comp.name}
                                            onClick={() => this.onSelectCompChip(comp)}
                                            onDelete={() => this.removeCompany(i)}
                                        />
                                    )
                                })}
                            </div>
                            {this.state.formWizard.obj.type === 'V' &&
                                <div className="col-md-4 offset-md-2">
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
                                <div className="col-md-4 offset-md-2">
                                    <TextField
                                        name="email"
                                        type="text"
                                        label="Email"
                                        fullWidth={true}
                                        inputProps={{ minLength: 0, maxLength: 80, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"80"}]' }}
                                        helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ""}
                                        error={errors?.email?.length > 0}
                                        value={this.state.formWizard.obj.email}
                                        onChange={e => this.setField('email', e)} />
                                </div>
                            }
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <fieldset>
                                    <FormControl>
                                        <TextField id="contactName" name="contactName" label="Contact Name" type="text" required={true}
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
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <fieldset>
                                    <TextField type="text" name="source" label="Source" required={true} fullWidth={true}
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
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
                                            name="productName"
                                            displayColumns="name"
                                            label=" Products"
                                            onRef={ref => {
                                                (this.productASRef = ref)
                                                if (ref) {
                                                    this.productASRef.load();
                                                }
                                            }}
                                            placeholder="Search Product by name"
                                            arrayName="products"
                                            helperText={errors?.productName_auto_suggest?.length > 0 ? errors?.productName_auto_suggest[0]?.msg : ""}
                                            error={errors?.productName_auto_suggest?.length > 0}
                                            inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                            projection="product_auto_suggest"
                                            value={this.state.assignProduct}
                                            onSelect={e => this.setAutoSuggestAssignProduct('product', e)}
                                            queryString="&name" >
                                        </AutoSuggest>
                                    </FormControl>
                                </fieldset>
                                {/* <h4>Products
                                    <Button className="ml-2" variant="outlined" color="primary" size="sm" onClick={this.addProduct} title="Add Product">
                                        <em className="fas fa-plus mr-1"></em> Add
                                    </Button>
                                </h4> */}
                            </div>
                        </div>
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
                                                                        name={"productName"+i}
                                                                        required={true}
                                                                        fullWidth={true}
                                                                        displayColumns="name"
                                                                        label="Product"
                                                                        placeholder="Search product by name"
                                                                        arrayName="products"
                                                                        helperText={errors && errors.hasOwnProperty("productName"+i+"_auto_suggest") && errors["productName"+i+"_auto_suggest"].length > 0?errors["productName"+i+"_auto_suggest"][0]["msg"]:""}
                                                                        error={errors && errors.hasOwnProperty("productName"+i+"_auto_suggest") && errors["productName"+i+"_auto_suggest"].length > 0}
                                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                                        onRef={ref => {
                                                                            (this.productASRef[i] = ref) 
                                                                            if(ref) {
                                                                            this.productASRef[i].setInitialField(this.state.formWizard.selectedProducts[i]);}
                                                                        }}
                                                                        projection="product_auto_suggest"
                                                                        value={this.state.formWizard.selectedProducts[i]}
                                                                        onSelect={e => this.setProductAutoSuggest(i, e?.id)}
                                                                        queryString="&name" >
                                                                    </AutoSuggest>
                                                                }
                                                            </FormControl>
                                                        </fieldset>
                                                    </td>
                                                    <td>
                                                        <fieldset>
                                                            <TextField type="number" name={"quantity"+i} label="Quantity" required={true} fullWidth={true}
                                                                inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                helperText={errors && errors.hasOwnProperty("quantity"+i) && errors["quantity"+i].length > 0?errors["quantity"+i][0]["msg"]:""}
                                                                error={errors && errors.hasOwnProperty("quantity"+i) && errors["quantity"+i].length > 0}
                                                                value={this.state.formWizard.obj.products[i].quantity} onChange={e => this.setProductField(i, "quantity", e)} />
                                                        </fieldset>
                                                    </td>
                                                    <td>
                                                        <fieldset>
                                                            <UOM required={true} isReadOnly={false} value={this.state.formWizard.obj.products[i].uom} onChange={e => this.setProductField(i, "uom", e, true)} />
                                                        </fieldset>
                                                    </td>
                                                    <td>
                                                        <fieldset>
                                                            <TextField type="number" name={"amount"+i} label="Amount" required={true}
                                                                inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                helperText={errors && errors.hasOwnProperty("amount"+i) && errors["amount"+i].length > 0?errors["amount"+i][0]["msg"]:""}
                                                                error={errors && errors.hasOwnProperty("amount"+i) && errors["amount"+i].length > 0}
                                                                value={this.state.formWizard.obj.products[i].amount} onChange={e => this.setProductField(i, "amount", e)} />
                                                        </fieldset>
                                                    </td>
                                                    <td className="va-middle">
                                                        <Button variant="outlined" style={{color:"red",borderColor:"red"}} color="secondary" size="sm" onClick={e => this.deleteProduct(i)} title="Delete Product">
                                                            <em className="fas fa-trash"></em>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    }
                    <div className="row" style={{padding:"10px"}}>
                        <div className="col-md-12 " >
                            {/* <span>Sales</span> */}   
                        </div>
                    </div>
                    <Divider />
                    <div className="row">
                       <div className="col-sm-3">
                       <fieldset>
                                <TextField type="text" name="portOfLanding" label=" Port OfLanding" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.portOfLanding?.length > 0 ? errors?.portOfLanding[0]?.msg : ""}
                                    error={errors?.portOfLanding?.length > 0}
                                    value={this.state.formWizard.obj.portOfLanding} onChange={e => this.setField("portOfLanding", e)} />
                            </fieldset>
                       </div>
                       <div className="col-sm-3">
                       <fieldset>
                                <TextField type="text" name="dispatch" label="dispatch" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.dispatch?.length > 0 ? errors?.dispatch[0]?.msg : ""}
                                    error={errors?.dispatch?.length > 0}
                                    value={this.state.formWizard.obj.dispatch} onChange={e => this.setField("dispatch", e)} />
                            </fieldset>
                       </div>
                       <div className="col-md-3">
                            <fieldset>
                                <TextField type="text" name="fob" label=" FOB" required={true} fullWidth={true}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.fob?.length > 0 ? errors?.fob[0]?.msg : ""}
                                    error={errors?.fob?.length > 0}
                                    value={this.state.formWizard.obj.fob} onChange={e => this.setField("fob", e)} />
                            </fieldset>
                        </div>
                   </div>
                    <div classname="row">
                        <div classname="col-sm-12">
                            <div className="row">    
                                <div className="col-md-3">
                                    <fieldset>
                                        <TextField type="text" name="cif" label=" CIF" required={true} fullWidth={true}
                                            inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                            helperText={errors?.cif?.length > 0 ? errors?.cif[0]?.msg : ""}
                                            error={errors?.cif?.length > 0}
                                            value={this.state.formWizard.obj.cif} onChange={e => this.setField("cif", e)} />
                                    </fieldset>
                                </div>
                                <div className="col-md-3  ">
                                    <fieldset>
                                        <TextField type="text" name="paymentTerms" label="Payment terms" required={true} fullWidth={true}
                                            inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                            helperText={errors?.paymentTerms?.length > 0 ? errors?.paymentTerms[0]?.msg : ""}
                                            error={errors?.paymentTerms?.length > 0}
                                            value={this.state.formWizard.obj.paymentTerms} onChange={e => this.setField("paymentTerms", e)} />
                                    </fieldset>
                                </div>
                                <div className="col-md-3  ">
                                    <fieldset>
                                        <FormControl    >
                                            <InputLabel > Currency</InputLabel>
                                            <Select
                                                name="currency"
                                                helperText={errors?.currency?.length > 0 ? errors?.currency[0]?.msg : ""}
                                                inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"30"}]' }}
                                                error={errors?.currency?.length > 0}
                                                value={this.state.formWizard.obj.currency} 
                                                required={true} 
                                                fullWidth={true}  
                                                onChange={e => this.setSelectField('currency', e)}
                                            >  
                                                {this.state.currency.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.label}>{e.label}</MenuItem>
                                            );
                                        })}                                                      
                                            {/* <MenuItem value={1}><img src="img/rupee.png"  style={{marginRight: 5}} />IND</MenuItem>                                                        
                                            <MenuItem value={3} > <img src="img/eur.png" style={{marginRight: 7}} />EUR</MenuItem>                                                           
                                            <MenuItem value={5}><img src="img/dollar.png" style={{marginRight: 5}} />DOLLAR</MenuItem> */}
                                            {/* <MenuItem value={6}>40</MenuItem>
                                            <MenuItem value={7}>50</MenuItem> */}
                                            {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                            
                                            </Select>
                                        </FormControl>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className="row" style={{marginTop:"10px"}}>
                        <div className="col-3">
                            <fieldset>
                                <FormControl>
                                    <AutoSuggest url="users/search/roleBasedUsers"
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
                                        helperText={errors?.usersName_auto_suggest?.length > 0 ? errors?.usersName_auto_suggest[0]?.msg : ""}
                                        error={errors?.usersName_auto_suggest?.length > 0}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        projection="user_details_mini"
                                        value={this.state.assignUser}
                                        onSelect={e => this.setAutoSuggestAssignUser('user', e)}
                                        queryString="&flowcode=MG_PR_E&name"
                                        >
                                    </AutoSuggest>
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
                        <div class="col-md-9" style={{marginLeft:"4px"}}>
                            {this.state.users.map((u, i) => {
                                return (
                                    <Chip
                                        avatar={
                                            <Avatar>
                                                <AssignmentIndIcon />
                                            </Avatar>
                                        }
                                        label={u.user.name}
                                        // onClick={() => this.handleClick(obj)}
                                        onDelete={() => this.handleDelete(i)}
                                    // className={classes.chip}
                                    />
                                )
                            })}
                        </div>
                        {/*<div class="col-md-3"><Button variant="contained" color="secondary" size="small" onClick={this.toggleModalAssign}>+ Assign User</Button></div>*/}
                    </div>
                    <div className="row" >
                        <div className=" col-md-12 text-center mt-3" >
                            <Button style={{backgroundColor:"red"}} variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                            <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>
                        </div>
                    </div>
                </Form>
            </ContentWrapper>
        )
    }
}
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(Add);