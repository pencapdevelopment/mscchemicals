import MomentUtils from '@date-io/moment';
import { makeStyles } from '@material-ui/core/styles';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import ListItemText from '@material-ui/core/ListItemText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Event from '@material-ui/icons/Event';
import {
    DatePicker,
    MuiPickersUtilsProvider
} from '@material-ui/pickers';
import axios from 'axios';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import Branches from './Branches';
import List from '../CompanyContacts/AddCompanyLists';
import {
    Form, Modal,
    ModalBody, ModalHeader,
} from 'reactstrap';
import swal from 'sweetalert';
import { context_path, getUniqueCode, server_url, defaultDateFilter } from '../../Common/constants';
import FormValidator from '../../Forms/FormValidator';
import ContentWrapper from '../../Layout/ContentWrapper';
import AutoSuggest from '../../Common/AutoSuggest';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import PageLoader from '../../Common/PageLoader';
import { allcats } from '../Products/subcat';

import Upload from '../Common/Upload';
// import { TramRounded } from '@material-ui/icons';

// import Typography from '@material-ui/core/Typography';
function getSteps() {
    return ['Basic Details', 'Branches', 'Contacts'];
}



// const json2csv = require('json2csv').parse;


class Add extends Component {
    state = {
        classes: makeStyles((theme) => ({
            root: {
                width: '100%',
            },
            button: {
                marginTop: theme.spacing(1),
                marginRight: theme.spacing(1),
            },
            actionsContainer: {
                marginBottom: theme.spacing(2),
            },
            resetContainer: {
                padding: theme.spacing(3),
            },
            input: {
                display: 'none',
            },
        })),
        loading: false,
        activeStep: 0,
        modal: false,
        steps: getSteps(),
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                id: '',
                code: getUniqueCode('CM'),
                name: '',
                type: 'B',
                locationType: 'I',
                categories: '',
                customerType: '',
                phone: '',
                email: '',
                country: '',
                province: '',
                city: '',
                location: '',
                zipcode: '',
                pincode: '',
                rating: '',
                agent: 'N',
                paymentTerms: '',
                categoriesInterested: '',
                gstin: '',
                credit: '',
                products: [],
                pan: '',
                fssai: '',
                drugLicense: '',
                others: '',
                msme: 'N',
                turnOver: '',
                international: '',
                selectedInterests: [],
                selectedCategories: [],
                selectedCustomerTypes: [],
                selectedorganizations: [],
                msmeId: '',
                
            },
            tempbranch: {
                name: getUniqueCode('CB'),
                type: '',
                street: '',
                landmark: '',
                selectedcountry: '',
                state: '',
                city: '',
                pincode: ''
            },
            tempcontact: {
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
            }
        },
        category: [
            { label: 'Amino acids', value: 'Amino acids' },
            { label: 'Nutraceuticals', value: 'Nutraceuticals' },
            { label: 'Extracts', value: 'Extracts' },
            { label: 'Sweeteners', value: 'Sweeteners' },
            { label: 'Oil', value: 'Oil' },
        ],
        Categories:[],
        subCategory: [],
        type: [
            { label: 'Registered', value: 'Registered' },
            { label: 'Food grade', value: 'Food grade' }
        ],
        make: [

        ],
        subObjs: [],
        addressTypes: [
            { label: 'Company HQ', value: 'HQ' },
            { label: 'Branch', value: 'BR' },
            { label: 'Billing', value: 'BI' },
            { label: 'Plant', value: 'PL' },
            { label: 'Warehouse', value: 'WH' }
        ],
        fileTypes1: [
            { label: 'GSTIN', expiryDate: true },
            { label: 'PAN', expiryDate: true },
            { label: 'FSSAI NO', noshow: false, expiryDate: true },
            { label: 'Drug License', noshow: false, expiryDate: true },
            { label: 'Customer Declaration', noshow: true, expiryDate: true },
            { label: 'Manufacture License', expiryDate: true },
            { label: 'MSME ', expiryDate: false },
            { label: 'Others ', expiryDate: false },
        ],
        types: [
            { label: 'Buyer', value: 'B' },
            { label: 'Vendor', value: 'V' }
        ],
        categories: [
            { label: 'Food', value: 'Food' },
            { label: 'Pharma', value: 'Pharma' },
            { label: 'Nutra', value: 'Nutra' },
            { label: 'Nutraceuticals', value: 'Nutraceuticals' },
            { label: 'Sweeteners', value: 'Sweeteners' },
            { label: 'Herbal', value: 'Herbal' },
            { label: 'Ayurvedic', value: 'Ayurvedic' },
        ],
        customerTypes: [
            { label: 'Manufacture', value: 'Manufacture' },
            { label: 'Formulator', value: 'Formulator' },
            { label: 'Trader', value: 'Trader' },
            { label: 'Agent', value: 'Agent' },
            { label: 'Marketing co', value: 'Marketing co' },

            { label: 'Own / contract / export', value: 'Own' }
        ],
        categoriesInterested: [
            { label: 'Extracts', value: 'Extracts' },
            { label: 'Vitamins', value: 'vitamins' },
            { label: 'Amino acids', value: 'amino acids' },
            { label: 'Nutra', value: 'Nutra' },
            { label: 'Sweeteners', value: 'sweeteners' }
        ],
        terms: [
            { label: 'Advance', value: 'ADV' },
            { label: 'PDC 30 days', value: 'PDC-30' },
            { label: 'PDC 60 days', value: 'PDC-60' },
            { label: 'PDC 90 days ', value: 'PDC-90' },
            { label: '45 days from date of invoice', value: 'DI-45' },
            { label: '60 days from date of invoice', value: 'DI-60' },
            { label: '75 days from date of invoice', value: 'DI-75' },
            { label: '90 days from date of invoice', value: 'DI-90' }
        ],
        ratings: [
            { label: 'A', value: 'A' },
            { label: 'B', value: 'B' },
            { label: 'C', value: 'C' },
            { label: 'D', value: 'D' }
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
        ],
        uploadedFiles: [],
        organizations: [],
        products: [],
        label: ''
    }
    closetoggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    };
    toggleModal = (label) => {
        this.setState({
            modal: !this.state.modal,
            label: label
        });
    };
    handleNext = () => {
        if (this.state.activeStep === 0) {
            this.saveDetails()
        }
        else if (this.state.activeStep === 1) {
            var activeStep = this.state.activeStep + 1;
            this.setState({ activeStep })
        }
        else {
            //  this.props.onSave(7);
            this.props.onSave(this.state.formWizard.obj.id);
        }

    };

    handleBack = () => {
        var activeStep = this.state.activeStep - 1;
        this.setState({ activeStep })
    };

    handleAssOrgDelete =  (idx) =>{
        console.log("delete clicked",idx);
        var formWizard = this.state.formWizard;
        formWizard.obj.selectedorganizations.splice(idx,1);
        this.setState({formWizard});
    }
    handleSelectedCatsDelete = (idx) =>{
        console.log("delete clicked",idx);
        var formWizard = this.state.formWizard;
        formWizard.obj.selectedCategories.splice(idx,1);
        this.setState({formWizard});
    }
    handleSelectedInterestsDelete =  (idx) =>{
        console.log("delete clicked",idx);
        var formWizard = this.state.formWizard;
        formWizard.obj.selectedInterests.splice(idx,1);
        this.setState({formWizard});
    }

    handleReset = () => {
        this.setState({ activeStep: 0 })
    };

    // handleSubmit = (e) => {
    //     if(this.state.activeStep + 1){
    //         this.setState({
    //             disabled:true
    //         });
    //     }
    //     else if(this.state.activeStep - 1){
    //         this.setState({
    //             disabled:false
    //         });
    //     }
    // }
    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id)
        .then(res => {
            var formWizard = this.state.formWizard;
            var newobj = res.data;
            if (newobj['categories']) {
                newobj.selectedCategories = newobj['categories'].split(",");
            } else {
                newobj.selectedCategories = [];
            }
            if (newobj['customerType']) {
                newobj.selectedCustomerTypes = newobj['customerType'].split(",");
            } else {
                newobj.selectedCustomerTypes = [];
            }
            if (newobj['categoriesInterested']) {
                newobj.selectedInterests = newobj['categoriesInterested'].split(",");
            } else {
                newobj.selectedInterests = [];
            }
            if (newobj['organizations']) {
                newobj.selectedorganizations = newobj['organizations'].split(",");
            } else {
                newobj.selectedorganizations = [];
            }
            newobj.products = [];
            formWizard.obj = newobj;
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
    onSort(e, col) {
        if (col.status === 0) {
            this.setState({ orderBy: 'id,desc' }, this.loadSubObjs)
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            this.setState({ orderBy: col.param + ',' + direction }, this.loadSubObjs);
        }
    }
    loadSubObjs(offset, callBack) {
        if (!offset) offset = 1;
        var url = server_url + context_path + "api/branches?projection=branch_details&page=" + (offset - 1);
        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }
        url += "&company=" + this.props.currentId;

        if (this.state.filters.search) {
            url += "&name=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }

        url = defaultDateFilter(this.state, url);

        axios.get(url)
        .then(res => {
            this.setState({
                subObjs: res.data._embedded[Object.keys(res.data._embedded)[0]],
                subPage: res.data.page
            });

            if (callBack) {
                callBack();
            }
        })
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
    setProducts(field, val) {
        console.log("value keys length:",Object.keys(val).length);
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
                if(!this.state.formWizard.editFlag){
                    var formWizard = this.state.formWizard;
                    formWizard.obj.products.splice(i, 1);
                    this.setState({ formWizard });
                }
                else{
                    this.setState({loading:true});
                    axios.delete(server_url + context_path + "api/company-products/"+ this.state.formWizard.obj.products[i].id)
                    .then(res => {this.getCompanyProducts();})
                    .finally(() => {this.setState({ loading: false })});
                }
            }
        });
    }
    setField2(field, e, noValidate) {
        var formWizard = this.state.formWizard;
        var input = e.target;
        formWizard.tempcontact[field] = input.value;
        if (field === 'phone' && input.value >= 10) {
            formWizard.tempcontact.whatsapp = input.value;
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
    setField1(field, e, noValidate) {
        var formWizard = this.state.formWizard;
        var input = e.target;
        formWizard.tempbranch[field] = input.value;
        this.setState({ formWizard });
    }
    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;
        var input = e.target;
        formWizard.obj[field] = input.value;
        if (field === 'gstin' && input.value && input.value.length === 15) {
            formWizard.obj.pan = input.value.substr(2, 10);
        }
        this.setState({ formWizard });
        console.log("Add1 set field", formWizard);
        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({
                formWizard
            });
        }
        if(this.state.formWizard.obj.locationType=='I'){
            formWizard.obj.province = 'province'
            console.log("Add1 set field");
        }
       else{
        formWizard.obj.province = 'state'
       }
    }
    setSelectField(field, e) {
        this.setField(field, e, true);
    }
    setSelectField1(field, e) {
        this.setField1(field, e, true);
    }
    setSelectField2(field, e) {
        this.setField2(field, e, true);
    }
    setDateField2(field, e) {
        var formWizard = this.state.formWizard;
        if (e) {
            formWizard.tempcontact[field] = e.format();
        } else {
            formWizard.tempcontact[field] = null;
        }
        this.setState({ formWizard });
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
    setAutoSuggest1(field, val, multi) {
        var formWizard = this.state.formWizard;
        if (!multi) {
            formWizard.tempbranch[field] = val;
        }
        formWizard.tempbranch['selected' + field] = val;
        this.setState({ formWizard });
    }
    setAutoSuggest(field, val, multi) {
        var formWizard = this.state.formWizard;
        // if (!multi) {
        //     formWizard.obj[field] = val;
        // }
        if(Object.keys(val).length){
            formWizard.obj['selected' + field].push(val);
        }
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
    addBranchDetails() {
        console.log(this.state.formWizard.tempbranch);
        var newObj = this.state.formWizard.tempbranch;
        newObj.company = '/companies/' + this.state.formWizard.obj.id;
        // newObj.company = '/companies/' + this.props.currentId;
        var promise = undefined;
        promise = axios.post(server_url + context_path + "api/branches", newObj)
        promise.then(res => {
            // var formw = this.state.formWizard;
            // formw.obj.id = res.data.id;
            // formw.msg = 'successfully Saved';

            // this.props.onSave(res.data.id);
            console.log(res);
            this.branchTemplateRef.loadObjs();
            var formWizard = this.state.formWizard;
            formWizard.tempbranch = {
                name: getUniqueCode('CB'),
                type: '',
                street: '',
                landmark: '',
                selectedcountry: '',
                state: '',
                city: '',
                pincode: ''
            };
            this.setState({ formWizard });
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
    addContactDetails() {
        console.log(this.state.formWizard.tempcontact);
        var newObj = this.state.formWizard.tempcontact;
        // var id = 7;
        var id = this.state.formWizard.obj.id;
        // if(this.state.formWizard.obj.gender===''){
        //     swal("Unable to Save!", "Please select gender", "error");
        //     return ;
        // }
        // if(this.state.formWizard.selectedcompany ){
        // }
        newObj.company = '/companies/' + id;

        // if(this.state.formWizard.selectedbranch){
        // newObj.branch = '/branches/' + this.state.formWizard.selectedbranch;
        // }

        this.setState({ loading: true });
        var promise = undefined;
        // if (!this.state.formWizard.editFlag) {
        promise = axios.post(server_url + context_path + "api/company-contact", newObj)
        // } else {
        //     promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
        // }
        promise.then(res => {
            // var formw = this.state.formWizard;
            // formw.obj.id = res.data.id;
            // formw.msg = 'successfully Saved';
            // this.props.onSave(res.data.id);
            console.log(res)
            // this.contactsTemplateRef.loadObjects();
            this.listTemplateRef.loadObjects1(id);
            var formWizard = this.state.formWizard;
            formWizard.tempcontact = {
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
            };
            this.setState({ formWizard });
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
    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
            var newObj = this.state.formWizard.obj;
            if (newObj.msme === 'Y' && (!newObj.msmeId || newObj.msmeId === '')) {
                var formWizard = this.state.formWizard;
                formWizard.errors['msmeId'] = 'Enter the msme id';
                this.setState({ formWizard });
                return;
            }
            newObj['categories'] = newObj.selectedCategories.join(",");
            newObj['customerType'] = newObj.selectedCustomerTypes.join(",");
            newObj['categoriesInterested'] = newObj.selectedInterests.join(",");
            newObj['organizations'] = newObj.selectedorganizations.join(",");
            newObj['products'] = [];
            this.setState({ loading: true });
            var promise = undefined;
            if (!this.state.formWizard.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }
            promise.then(res => {
                var formWizard = this.state.formWizard;
                formWizard.obj.id = res.data.id;
                formWizard.msg = 'successfully Saved';
                // this.props.onSave(res.data.id);
                this.setState(formWizard);
                console.log(res, this.state.formWizard);
                if (this.state.uploadedFiles.length !== 0) {
                    this.state.uploadedFiles.map(function (value) {
                        console.log(value.url);
                        axios.patch(server_url + context_path + 'api/docs/' + value.url, { "id": value.url, "parent": res.data.id }
                        ).then(res => {
                            console.log(res);
                        })
                        return value;
                    })
                }
                var activeStep = this.state.activeStep + 1;
                this.setState({ activeStep, loading: false });
            }).finally(() => {
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
    loadOrgs() {
        axios.get(server_url + context_path + "api/companies?projection=company_auto_suggest_product")
        .then(res => {
            var lis = res.data._embedded[Object.keys(res.data._embedded)];
            if (lis) {
                var organizations = this.state.organizations;
                lis.forEach(e => {
                    organizations.push({ label: e.name, value: e.name });
                })

                this.setState({ organizations });
            }
        });
        this.loadproducts();
        axios.get(server_url + context_path + "api/companies?projection=company_auto_suggest&type=V")
            .then(res => {
                var lis = res.data._embedded[Object.keys(res.data._embedded)];
                if (lis) {
                    var make = this.state.make;
                    lis.forEach(e => {
                        make.push({ label: e.name, value: e.name });
                    })

                    this.setState({ make });
                }
            });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.props.onRef(this);
        this.setState({ loding: false });
        this.loadOrgs();
        console.log(this.props.baseUrl, "base url")
    }
    fileSelected(name, e) {
        var file = e.target.files[0];
        var sizeinMb = file.size / (1024 * 1024);
        if (sizeinMb > 3) {
            var error = this.state.error;
            error[name] = 'File is > 3MB'
            this.setState({ error });
        }
        this.setState({ name: file.name });
    }
    addProduct() {
        if(this.productASRef.state.searchParam !== ""){
            this.setState({ loading: true });
            var newObj = {code: getUniqueCode('PD'),name: this.productASRef.state.searchParam,specification:'',make:'',type:'Food grade',category:''};
            var promise = undefined;
            promise = axios.post(server_url + context_path + "api/products", newObj)
            promise.then(res => {
                this.setState({ loading: false });
            }).finally(() => {
                this.loadproducts();
                this.setState({ loading: false });
            }).catch(err => {
                console.log("product add error is",err);
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
    uploadFiles() {
        var formData = new FormData();
        var imagefile = document.querySelector('#fileUpload');
        formData.append("file", imagefile.files[0]);
        formData.append("from", "companies");
        // formData.append("parent", '');
        formData.append("fileType", this.state.label);
        // if (this.state.formWizard.obj.enableExpiryDate && this.state.formWizard.obj.expiryDate) {
        //     formData.append("expiryDate", this.state.formWizard.obj.expiryDate);
        // }
        axios.post(server_url + context_path + 'docs/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            if (res.data.uploaded === 1) {
                // this.toggleModal(this.state.label);
                var joined = this.state.uploadedFiles.concat(res.data);
                this.setState({ uploadedFiles: joined });
                this.closetoggleModal();
                swal("Uploaded!", "File Uploaded", "success");
            } else {
                swal("Unable to Upload!", "Upload Failed", "error");
            }
        }).catch(err => {
            var msg = "Select File";
            if (err.response.data.globalErrors && err.response.data.globalErrors[0]) {
                msg = err.response.data.globalErrors[0];
            }
            swal("Unable to Upload!", msg, "error");
        })
    }
    render() {
        const errors = this.state.formWizard.errors;
        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <Modal isOpen={this.state.modal} backdrop="static" toggle={this.closetoggleModal} size={'md'}>
                    <ModalHeader toggle={this.closetoggleModal}>
                        Upload - {this.state.label}
                    </ModalHeader>
                    <ModalBody>
                        <fieldset>
                            <Button
                                variant="contained"
                                component="label"> Select File
                                    <input type="file" id="fileUpload"
                                    name="fileUpload" accept='.doc,.docx,.pdf,.jpg,.png'
                                    onChange={e => this.fileSelected('fileUpload', e)}
                                    style={{ display: "none" }} />
                            </Button>{this.state.name}
                        </fieldset>
                        <span>*Please upload .doc,.docx,.pdf,.jpg,.png files only</span>
                        {/* {this.state.formWizard.obj.enableExpiryDate &&  */}
                        <fieldset>
                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                <DatePicker
                                    autoOk
                                    clearable
                                    // variant="inline"
                                    label="Expiry Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.expiryDate}
                                    onChange={e => this.setDateField('expiryDate', e)}
                                    TextFieldComponent={(props) => (
                                        <TextField
                                            type="text"
                                            name="expiryDate"
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
                        {/*  } */}
                        <div className="text-center">
                            <Button variant="contained" color="primary" onClick={e => this.uploadFiles()}>Save</Button>
                        </div>
                    </ModalBody>
                </Modal>
                <Stepper activeStep={this.state.activeStep} orientation="vertical">
                    {this.state.steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                            <StepContent>
                                {/* {index === 0 ?  */}
                                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">

                                    <div className="row">
                                        <div className="col-md-8 offset-md-2">
                                            <fieldset>
                                                <FormControl>
                                                    <FormLabel component="legend">Type Add</FormLabel>
                                                    <RadioGroup aria-label="type" name="type" row>
                                                        <FormControlLabel
                                                            value="B" checked={this.state.formWizard.obj.type === 'B'}
                                                            label="Buyer"
                                                            onChange={e => this.setField("type", e)}
                                                            control={<Radio color="primary" />}
                                                            labelPlacement="end"
                                                        />
                                                        <FormControlLabel
                                                            value="V" checked={this.state.formWizard.obj.type === 'V'}
                                                            label="Vendor"
                                                            onChange={e => this.setField("type", e)}
                                                            control={<Radio color="primary" />}
                                                            labelPlacement="end"
                                                        />
                                                    </RadioGroup>
                                                </FormControl>
                                            </fieldset>
                                            <fieldset>
                                                <FormControl>
                                                    <FormLabel component="legend">Location</FormLabel>
                                                    <RadioGroup aria-label="position" name="position" row>
                                                        <FormControlLabel
                                                            value="I" checked={this.state.formWizard.obj.locationType === 'I'}
                                                            label="International"
                                                            onChange={e => this.setField("locationType", e)}
                                                            control={<Radio color="primary" />}
                                                            labelPlacement="end"
                                                        />
                                                        <FormControlLabel
                                                            value="N" checked={this.state.formWizard.obj.locationType === 'N'}
                                                            label="National"
                                                            onChange={e => this.setField("locationType", e)}
                                                            control={<Radio color="primary" />}
                                                            labelPlacement="end"
                                                        />
                                                    </RadioGroup>
                                                </FormControl>
                                            </fieldset>

                                            <fieldset>
                                                <TextField
                                                    type="text"
                                                    label="Code"
                                                    name="companyCode"
                                                    required={true}
                                                    fullWidth={true}
                                                    readOnly={true}
                                                    inputProps={{ readOnly: this.state.formWizard.obj.id ? true : false, maxLength: 30, "data-validate": '[{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                                    value={this.state.formWizard.obj.code}
                                                    onChange={e => this.setField('code', e)} />
                                            </fieldset>

                                            <fieldset>
                                                <TextField
                                                    type="text"
                                                    label="Name"
                                                    name="name"
                                                    required={true}
                                                    fullWidth={true}
                                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"30"}]' }}
                                                    helperText={errors?.name?.length > 0 ? errors?.name[0]?.msg : ""}
                                                    error={errors?.name?.length > 0}
                                                    value={this.state.formWizard.obj.name}
                                                    onChange={e => this.setField('name', e)} />
                                            </fieldset>

                                            <fieldset>
                                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                                    <DatePicker
                                                        autoOk
                                                        clearable
                                                        disableFuture
                                                        label="Date of Incorporation"
                                                        format="DD/MM/YYYY"
                                                        value={this.state.formWizard.obj.dateOfIncorporation}
                                                        onChange={e => this.setDateField('dateOfIncorporation', e)}
                                                        TextFieldComponent={(props) => (
                                                            <TextField
                                                                type="text"
                                                                name="dateOfIncorporation"
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
                                                <TextField
                                                    type="text"
                                                    name="phone"
                                                    label="Phone"
                                                    required={true}
                                                    fullWidth={true}
                                                    inputProps={{ maxLength: 13,  "data-validate": '[{ "key":"phone"},{ "key":"minlen","param":"10"},{"key":"maxlen","param":"13"}]' }}
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
                                                    inputProps={{ minLength: 5, maxLength: 100, "data-validate": '[{ "key":"email"}]' }}
                                                    helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ""}
                                                    error={errors?.email?.length > 0}
                                                    value={this.state.formWizard.obj.email}
                                                    onChange={e => this.setField('email', e)} />
                                            </fieldset>


                                            {(this.state.formWizard.obj.type === 'V' && this.state.formWizard.obj.locationType === 'I') &&
                                                <div>
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
                                                        <TextField
                                                            name="city"
                                                            type="text"
                                                            label="City"

                                                            fullWidth={true}
                                                            inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                                            helperText={errors?.city?.length > 0 ? errors?.city[0]?.msg : ""}
                                                            error={errors?.city?.length > 0}
                                                            value={this.state.formWizard.obj.city}
                                                            onChange={e => this.setField('city', e)} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <TextField
                                                            name="zipcode"
                                                            type="text"
                                                            label="Zipcode"

                                                            fullWidth={true}
                                                            inputProps={{ minLength: 0, maxLength: 6, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"6"}]' }}
                                                            helperText={errors?.zipcode?.length > 0 ? errors?.zipcode[0]?.msg : ""}
                                                            error={errors?.zipcode?.length > 0}
                                                            value={this.state.formWizard.obj.zipcode}
                                                            onChange={e => this.setField('zipcode', e)} />
                                                    </fieldset>
                                                </div>
                                            }

                                            {(this.state.formWizard.obj.type === 'V' && this.state.formWizard.obj.locationType === 'N') &&
                                                <div>
                                                    <fieldset>
                                                        <TextField
                                                            name="location"
                                                            type="text"
                                                            label="Location"

                                                            fullWidth={true}
                                                            inputProps={{ minLength: 0, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                                            helperText={errors?.city?.length > 0 ? errors?.city[0]?.msg : ""}
                                                            error={errors?.city?.length > 0}
                                                            value={this.state.formWizard.obj.city}
                                                            onChange={e => this.setField('city', e)} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <TextField
                                                            name="pincode"
                                                            type="text"
                                                            label="Pincode"

                                                            fullWidth={true}
                                                            inputProps={{ minLength: 0, maxLength: 5, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"5"}]' }}
                                                            helperText={errors?.pincode?.length > 0 ? errors?.pincode[0]?.msg : ""}
                                                            error={errors?.pincode?.length > 0}
                                                            value={this.state.formWizard.obj.pincode}
                                                            onChange={e => this.setField('pincode', e)} />
                                                    </fieldset>
                                                </div>}



                                            {this.state.formWizard.obj.type === 'B' &&
                                                <fieldset>
                                                    <FormControl>
                                                        <InputLabel id="demo-mutiple-checkbox-label">Categories</InputLabel>
                                                        <Select
                                                            name="categories"
                                                            labelId="demo-mutiple-checkbox-label"
                                                            id="demo-mutiple-checkbox"
                                                            value={this.state.formWizard.obj.selectedCategories}

                                                            helperText={errors?.category?.length > 0 ? errors?.category[0]?.msg : ""}
                                                            error={errors?.category?.length > 0}
                                                            // renderValue={(selected) => selected.join(', ')}
                                                            onChange={e => this.setSelectField('selectedCategories', e)}
                                                            multiple={true}
                                                        >

                                                            {this.state.categories.map((e, keyIndex) => {
                                                                return (
                                                                    <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                                                );
                                                                // return (
                                                                //     <MenuItem key={keyIndex} value={e.value}>
                                                                //         <Checkbox checked={this.state.formWizard.obj.selectedCategories.indexOf(e.value) > -1} />
                                                                //         <ListItemText primary={e.label} />
                                                                //     </MenuItem>
                                                                // )
                                                            })}
                                                        </Select>
                                                    </FormControl>
                                                    
                                                </fieldset>

                                                }
                                                   <div class="col-md-12" style={{marginLeft:"4px"}}>
                                                {this.state.formWizard.obj.selectedCategories.map((obj, i) => {
                                                    return (
                                                        <Chip
                                                            // avatar={
                                                            //     <Avatar>
                                                            //         <AssignmentIndIcon />
                                                            //     </Avatar>
                                                            // }
                                                            label={obj}

                                                            // onClick={() => this.handleClick(obj)}
                                                            onDelete={() => this.handleSelectedCatsDelete(i)}
                                                        // className={classes.chip}
                                                        />
                                                    )
                                                })}
                                            </div>
                                                  
                                            {/* {this.state.formWizard.obj.type === 'B' &&
                                                <fieldset>
                                                    <FormControl>
                                                        <FormLabel component="legend">Agent</FormLabel>
                                                        <RadioGroup aria-label="position" name="position" row>
                                                            <FormControlLabel
                                                                value="Y"
                                                                label="Yes" checked={this.state.formWizard.obj.agent === 'Y'}
                                                                onChange={e => this.setField("agent", e)}
                                                                control={<Radio color="primary" />}
                                                                labelPlacement="end"
                                                            />
                                                            <FormControlLabel
                                                                value="N"
                                                                label="No" checked={this.state.formWizard.obj.agent === 'N'}
                                                                onChange={e => this.setField("agent", e)}
                                                                control={<Radio color="primary" />}
                                                                labelPlacement="end"
                                                            />
                                                        </RadioGroup>
                                                    </FormControl>
                                                </fieldset>} */}
                                            <fieldset className="row">
                                                <FormControl className="col-md-8">
                                                    <AutoSuggest url="products"
                                                        name="products"
                                                        displayColumns="name"
                                                        label={this.state.formWizard.obj.type === 'B' ? "Products Focused" : "Products Offered"}
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
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={e => this.addProduct()}
                                                    className={this.state.classes.button + " col-md-4 p-2"}
                                                >+ Add Product  </Button>
                                            </fieldset>
                                             <div class="col-md-12" style={{marginLeft:"4px"}}>
                                                {this.state.formWizard.obj.products.length > 0 && this.state.formWizard.obj.products.map((compProd, i) => {
                                                    return (
                                                        <Chip
                                                            label={compProd.product.name}
                                                            // onClick={() => this.handleSelectedProducClick(compProd)}
                                                            onDelete={() => this.handleSelectedProductDelete(i)}
                                                        />
                                                    )
                                                })}
                                            </div>

                                            {this.state.formWizard.obj.type === 'B' &&
                                                <fieldset>
                                                    <FormControl>
                                                        <InputLabel id="demo-mutiple-checkbox-label">Select Customer Type</InputLabel>
                                                        <Select
                                                            name="customerTypes"
                                                            labelId="demo-mutiple-checkbox-label"
                                                            id="demo-mutiple-checkbox"
                                                            value={this.state.formWizard.obj.selectedCustomerTypes}

                                                            helperText={errors?.category?.length > 0 ? errors?.category[0]?.msg : ""}
                                                            error={errors?.category?.length > 0}
                                                            renderValue={(selected) => selected.join(', ')}
                                                            onChange={e => this.setSelectField('selectedCustomerTypes', e)}
                                                            multiple={true}
                                                        >
                                                            {this.state.customerTypes.map((e, keyIndex) => {
                                                                return (
                                                                    <MenuItem key={keyIndex} value={e.value}>
                                                                        <Checkbox checked={this.state.formWizard.obj.selectedCustomerTypes.indexOf(e.value) > -1} />
                                                                        <ListItemText primary={e.label} />
                                                                    </MenuItem>
                                                                );
                                                            })}
                                                        </Select>
                                                    </FormControl>
                                                </fieldset>
                                                }
                                               
                                                  

                                            <fieldset>
                                                <TextField
                                                    name="turnOver"
                                                    type="number"
                                                    label="Turn Over"

                                                    fullWidth={true}
                                                    inputProps={{ minLength: 0, maxLength: 30 }}
                                                    value={this.state.formWizard.obj.turnOver}
                                                    onChange={e => this.setField('turnOver', e)} />
                                            </fieldset>

                                            <fieldset>
                                                <FormControl>
                                                    <InputLabel>Select Rating</InputLabel>
                                                    <Select
                                                        name="rating"
                                                        label="Select Customer..."
                                                        value={this.state.formWizard.obj.rating}
                                                        onChange={e => this.setSelectField('rating', e)}
                                                    >
                                                        {this.state.ratings.map((e, keyIndex) => {
                                                            return (
                                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                                            );
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </fieldset>
                            
                                            <fieldset className="row">
                                                <FormControl className="col-md-12">
                                                    <AutoSuggest url="companies"
                                                            name="organizations"
                                                            onRef={ref => (this.companyASRef = ref)}
                                                            displayColumns="name"
                                                            label="Associated Organizations"
                                                            readOnly={false}
                                                            multiple={false}
                                                            placeholder="Search Company by name"
                                                            className="col-sm-8"
                                                            arrayName="companies"
                                                            projection="company_auto_suggest"
                                                            value={this.state.formWizard.selectedorganizations}
                                                            onSelect={e => this.setAutoSuggest('organizations', e, true)}
                                                            queryString="&name" >
                                                    </AutoSuggest>
                                                </FormControl>
                                            </fieldset>
                                            <div class="col-md-12" style={{marginLeft:"4px"}}>
                                                {this.state.formWizard.obj.selectedorganizations.map((obj, i) => {
                                                    return (
                                                        <Chip
                                                            label={obj}
                                                            // onClick={() => this.handleClick(obj)}
                                                            onDelete={() => this.handleAssOrgDelete(i)}
                                                        />
                                                    )
                                                })}
                                            </div>
                                           
                                            {/* <fieldset>
                                                <FormControl> */}
                                                    {/* <InputLabel id="demo-mutiple-checkbox-label">Associated Organizations</InputLabel>
                <Select
                    name="organizations"
                    required={true}
                    labelId="demo-mutiple-checkbox-label"
                    id="demo-mutiple-checkbox"
                    inputProps={{ maxLength: 200, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"200"}]' }}
                    helperText={errors?.organizations?.length > 0 ? errors?.organizations[0]?.msg : ""}
                    error={errors?.organizations?.length > 0}

                    value={this.state.formWizard.obj.selectedorganizations}
                    renderValue={(selected) => selected.join(', ')}
                    onChange={e => this.setSelectField('selectedorganizations', e)}
                    multiple={true}
                > {this.state.organizations.map((e, keyIndex) => {
                    return (
                        <MenuItem key={keyIndex} value={e.value}>
                            <Checkbox checked={this.state.formWizard.obj.selectedorganizations.indexOf(e.value) > -1} />
                            <ListItemText primary={e.label} />
                        </MenuItem>
                    )
                })}
                </Select> */}

                                                    {/* <AutoSuggest url="companies"
                                                        name="organizations"
                                                        onRef={ref => (this.companyASRef = ref)}
                                                        displayColumns="name"
                                                        label="Associated Organizations"
                                                        readOnly={false}
                                                        multiple={false}
                                                        placeholder="Search Company by name"
                                                        arrayName="companies"
                                                        projection="company_auto_suggest"
                                                        value={this.state.formWizard.selectedorganizations}
                                                        onSelect={e => this.setAutoSuggest('organizations', e, true)}
                                                        queryString="&name" ></AutoSuggest>
                                                </FormControl>
                                            </fieldset> */}

                                            <fieldset>
                                                <FormControl>
                                                    <InputLabel>Select PaymentTerms</InputLabel>
                                                    <Select
                                                        name="paymentTerms"

                                                        helperText={errors?.paymentTerms?.length > 0 ? errors?.paymentTerms[0]?.msg : ""}
                                                        error={errors?.paymentTerms?.length > 0}

                                                        label="Select PaymentTerms..."
                                                        value={this.state.formWizard.obj.paymentTerms}
                                                        onChange={e => this.setSelectField('paymentTerms', e)}
                                                    >
                                                        {this.state.terms.map((e, keyIndex) => {
                                                            return (
                                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                                            );
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </fieldset>
                                            <fieldset>
                                                {/* {this.state.formWizard.obj.locationType === 'I' ? */}
                                                <TextField
                                                    name="freight"
                                                    type="text"
                                                    label="Freight"

                                                    fullWidth={true}
                                                    inputProps={{ minLength: 15, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                                    // helperText={errors?.product?.length > 0 ? errors?.product[0]?.msg : ""}
                                                    // error={errors?.product?.length > 0}
                                                    value={this.state.formWizard.obj.Freight}
                                                    onChange={e => this.setField('freight', e)} />
                                                {/* :null} */}

                                            </fieldset>
                                            <fieldset>
                                                {/* {this.state.formWizard.obj.locationType === 'I' ? */}
                                                <TextField
                                                    name="transporter"
                                                    type="text"
                                                    label="Transporter"

                                                    fullWidth={true}
                                                    inputProps={{ minLength: 15, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                                    // helperText={errors?.product?.length > 0 ? errors?.product[0]?.msg : ""}
                                                    // error={errors?.product?.length > 0}
                                                    value={this.state.formWizard.obj.transporter}
                                                    onChange={e => this.setField('transporter', e)} />
                                                {/*  :null} */}

                                            </fieldset>


                                            <fieldset>
                                                
                                                <TextField
                                                    name="credit"
                                                    type="Number"
                                                    label="Credit limit"

                                                    fullWidth={true}
                                                    inputProps={{ minLength: 15, maxLength: 15, "data-validate": '[{ "key":"minlen","param":"0"},{ "key":"maxlen","param":"15"}]' }}
                                                    helperText={errors?.credit?.length > 0 ? errors?.credit[0]?.msg : ""}
                                                    error={errors?.credit?.length > 0}
                                                    value={this.state.formWizard.obj.credit}
                                                    onChange={e => this.setField('credit', e)} />


                                            </fieldset>
                                            {(this.state.formWizard.obj.type === 'B' || this.state.formWizard.obj.locationType === 'N') &&
                                                <div>
                                                    <fieldset  >
                                                        {this.state.formWizard.obj.locationType === 'N' ? <div className="row m-0">
                                                            <TextField
                                                                name="gstin"
                                                                type="text"
                                                                label="GSTIN"
                                                                required={true}
                                                               
                                                                fullWidth={true}
                                                                inputProps={{ minLength: 15, maxLength: 15, "data-validate": '[{ "key":"gstin"},{ "key":"maxlen","param":"15"}]' }}
                                                                helperText={errors?.gstin?.length > 0 ? errors?.gstin[0]?.msg : ""}
                                                                error={errors?.gstin?.length > 0}
                                                                value={this.state.formWizard.obj.gstin}
                                                                className="col-md-11"
                                                                onChange={e => this.setField('gstin', e)} />
                                                            {/* <Button
                                                                // variant="contained"
                                                                // color="primary"
                                                                onClick={e => this.toggleModal('GST')}
                                                                className={this.state.classes.button + " col-md-2 p-2"}
                                                            > */}
                                                            <img onClick={e => this.toggleModal('GST')} className="col-sm-1 p-2"  src="img/upload.png" />
                                                                {/*  </Button> */}
                                                        </div> :
                                                            null}
                                                    </fieldset>
                                                    <fieldset >
                                                        {this.state.formWizard.obj.locationType === 'N' ? <div className="row m-0"><TextField
                                                            name="pan"
                                                            type="text"
                                                            required={true}
                                                            label="PAN NO"

                                                            fullWidth={true}
                                                            inputProps={{ minLength: 10, maxLength: 10, "data-validate": '[{ "key":"pan"},{ "key":"maxlen","param":"10"}]' }}
                                                            helperText={errors?.pan?.length > 0 ? errors?.pan[0]?.msg : ""}
                                                            error={errors?.pan?.length > 0}
                                                            className="col-md-11"
                                                            value={this.state.formWizard.obj.pan}
                                                            onChange={e => this.setField('pan', e)} /> 
                                                             {/* <Button
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={e => this.toggleModal('PAN')}
                                                                className={this.state.classes.button + " col-md-4 p-2"}
                                                            >
                                                                Upload </Button> */}
                                                                  <img onClick={e => this.toggleModal('PAN')} className="col-sm-1 p-2"  src="img/upload.png" />
                                                        </div> : null}
                                                    </fieldset>
                                                    <fieldset >
                                                        {this.state.formWizard.obj.locationType === 'N' ? <div className="row m-0">
                                                            <TextField
                                                                name="fssai"
                                                                type="text"
                                                                label="FSSAI NO"
                                                                // required={true}
                                                                fullWidth={true}
                                                                inputProps={{ minLength: 14, maxLength: 14, "data-validate": '[{ "key":"maxlen","param":"14"}]' }}
                                                                helperText={errors?.fssai?.length > 0 ? errors?.fssai[0]?.msg : ""}
                                                                error={errors?.fssai?.length > 0}
                                                                value={this.state.formWizard.obj.fssai}
                                                                className="col-md-11"
                                                                onChange={e => this.setField('fssai', e)} /> 
                                                                {/* <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    onClick={e => this.toggleModal('Fssai')}
                                                                    className={this.state.classes.button + " col-md-4 p-2"}
                                                                >
                                                                Upload </Button> */}
                                                                  <img onClick={e => this.toggleModal('Fssai')} className="col-sm-1 p-2" src="img/upload.png" />
                                                        </div> :
                                                            null}

                                                    </fieldset>
                                                    <fieldset>
                                                        <div className="row m-0">
                                                            <TextField
                                                                name="drugLicense"
                                                                type="text"
                                                                label="Drug license no"
                                                                // required={true}
                                                                fullWidth={true}
                                                                inputProps={{ minLength: 5, maxLength: 20 }}
                                                                className="col-md-11"
                                                                value={this.state.formWizard.obj.drugLicense}
                                                                onChange={e => this.setField('drugLicense', e)} />
                                                            {/* <Button
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={e => this.toggleModal('Drug License')}
                                                                className={this.state.classes.button + " col-md-4 p-0"}
                                                            >
                                                                Upload </Button> */}
                                                                  <img onClick={e => this.toggleModal('Drug License')} className="col-sm-1 p-2"  src="img/upload.png" />
                                                        </div>
                                                    </fieldset>
                                                    <fieldset>
                                                    {this.state.formWizard.obj.locationType === 'N' ?
                                                        <div className="row m-0">
                                                            <TextField
                                                                name="customerDeclaration"
                                                                type="text"
                                                                label="Customer Declaration"
                                                                // required={true}
                                                                fullWidth={true}
                                                                inputProps={{ minLength: 5, maxLength: 20 }}
                                                                className="col-md-11"
                                                                value={this.state.formWizard.obj.customerDeclaration}
                                                                onChange={e => this.setField('customerDeclaration', e)} />
                                                            {/* <Button
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={e => this.toggleModal('Customer Declaration')}
                                                                className={this.state.classes.button + " col-md-4 p-2"}
                                                            >
                                                                Upload </Button> */}
                                                                  <img onClick={e => this.toggleModal('Customer Declaration')} className="col-sm-1 p-2"  src="img/upload.png" />
                                                        </div> : null}
                                                    </fieldset>
                                                    {/* <fieldset>
                                                        {this.state.formWizard.obj.locationType === 'N' ? <div className="row m-0"><TextField
                                                            name="customerDeclaration"
                                                            type="text"
                                                            required={true}
                                                            label="Customer Declaration"
                                                            // disabled = {(this.state.input3)}
                                                            // onInput = {this.handleinput3.bind(this)}
                                                            fullWidth={true}
                                                            inputProps={{ minLength: 10, maxLength: 10, "data-validate": '[{ "key":"customerDeclaration"},{ "key":"maxlen","param":"10"}]' }}
                                                            helperText={errors?.customerDeclaration?.length > 0 ? errors?.customerDeclaration[0]?.msg : ""}
                                                            error={errors?.customerDeclaration?.length > 0}
                                                            className="col-md-8"
                                                            value={this.state.formWizard.obj.customerDeclaration}
                                                            onChange={e => this.setField('customerDeclaration', e)} />  <Button
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={e => this.toggleModal('Customer')}
                                                                className={this.state.classes.button + " col-md-4 p-2"}
                                                            >
                                                                Upload </Button>
                                                        </div> : null}
                                                    </fieldset> */}
                                                    <fieldset>
                                                        <TextField
                                                            name="Others"
                                                            type="text"
                                                            label="Manufacture license no"
                                                            fullWidth={true}
                                                            inputProps={{ minLength: 0, maxLength: 50 }}
                                                            value={this.state.formWizard.obj.others}
                                                            onChange={e => this.setField('others', e)} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <FormControl>
                                                            <FormLabel component="legend">MSME</FormLabel>
                                                            <RadioGroup aria-label="position" name="position" row>
                                                                <FormControlLabel
                                                                    value="Y" checked={this.state.formWizard.obj.msme === 'Y'}
                                                                    label="Yes"
                                                                    onChange={e => this.setField("msme", e)}
                                                                    control={<Radio color="primary" />}
                                                                    labelPlacement="end"
                                                                />
                                                                <FormControlLabel
                                                                    value="N" checked={this.state.formWizard.obj.msme === 'N'}
                                                                    label="No"
                                                                    onChange={e => this.setField("msme", e)}
                                                                    control={<Radio color="primary" />}
                                                                    labelPlacement="end"
                                                                />
                                                            </RadioGroup>
                                                        </FormControl>
                                                    </fieldset>
                                                    {this.state.formWizard.obj.msme === 'Y' && <fieldset>
                                                        <div className="row m-0">
                                                            <TextField
                                                                name="msmeId"
                                                                type="text"
                                                                label="MSME Registration Id"
                                                                className="col-md-11"
                                                                required={false}
                                                                fullWidth={true}
                                                                inputProps={{ minLength: 0, maxLength: 35 }}
                                                                value={this.state.formWizard.obj.msmeId}
                                                                onChange={e => this.setField('msmeId', e)} />
                                                          <img onClick={e => this.toggleModal('Msme ')} className="col-sm-1 p-2"   src="img/upload.png" />
                                                        </div>
                                                    </fieldset>}


                                                </div>

                                            }

                                            {/* <div className="text-center">
                                                <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                                <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save</Button>
                                            </div> */}
                                        </div>
                                    </div>
                                </Form>
                                {/* : null} */}
                                {index === 1 || index === 3 || index === 2 ? <div className="row">
                                    <div className="col-md-8 offset-md-2">
                                        <div className="text-center">
                                            <h4>Add Branch</h4>
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

                                                value={this.state.formWizard.tempbranch.name}
                                                onChange={e => this.setField1('name', e)} />
                                        </fieldset>
                                        <fieldset>
                                            <FormControl>
                                                <InputLabel>Select Type</InputLabel>
                                                <Select
                                                    label="Select Type..."
                                                    name="type"
                                                    value={this.state.formWizard.tempbranch.type}
                                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                    helperText={errors?.type?.length > 0 ? errors?.type[0]?.msg : ""}
                                                    error={errors?.type?.length > 0}

                                                    onChange={e => this.setSelectField1('type', e)}
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
                                                inputProps={{ "data-validate": '[{ "key":"required"}]', maxLength: 50 }}
                                                fullWidth={true} rowsMin={3}
                                                value={this.state.formWizard.tempbranch.street} onChange={e => this.setField1("street", e)} />
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
                            {this.state.formWizard.obj.locationType === 'N' &&
                                        <fieldset>
                                        
                                            <TextField
                                                type="text"
                                                name="landmark"
                                                label="Landmark"
                                                required={true}
                                                fullWidth={true}

                                                helperText={errors?.landmark?.length > 0 ? errors?.landmark[0]?.msg : ""}
                                                error={errors?.landmark?.length > 0}
                                                inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required"}]' }}
                                                value={this.state.formWizard.tempbranch.landmark}
                                                onChange={e => this.setField1('landmark', e)} />
                                        </fieldset> }



                                        <fieldset>
                                            <TextField
                                                type="text"
                                                name="pincode"
                                                label="Pincode"
                                                required={true}
                                                fullWidth={true}
                                                inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                helperText={errors?.pincode?.length > 0 ? errors?.pincode[0]?.msg : ""}
                                                error={errors?.pincode?.length > 0}
                                                value={this.state.formWizard.tempbranch.pincode}
                                                onChange={e => this.setSelectField1('pincode', e)} />
                                        </fieldset>

                                        <fieldset>
                                            <FormControl>
                                                <TextField
                                                    type="text"
                                                    name="city"
                                                    label="City"
                                                    required={true}
                                                    fullWidth={true}
                                                    inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required"}]' }}
                                                    helperText={errors?.city?.length > 0 ? errors?.city[0]?.msg : ""}
                                                    error={errors?.city?.length > 0}
                                                    value={this.state.formWizard.tempbranch.city}
                                                    onChange={e => this.setField1('city', e)} />
                                            </FormControl>
                                        </fieldset>

                                        
                                        <fieldset>
                                            <FormControl>
                                                <TextField
                                                    type="text"
                                                    name="state"
                                                    label={this.state.formWizard.obj.province}
                                                    required={true}
                                                    fullWidth={true}
                                                    helperText={errors?.state?.length > 0 ? errors?.state[0]?.msg : ""}
                                                    error={errors?.state?.length > 0}
                                                    inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required"}]' }}
                                                    value={this.state.formWizard.tempbranch.state}
                                                    onChange={e => this.setField1('state', e)} />
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
                                                    value={this.state.formWizard.tempbranch.selectedcountry}
                                                    onSelect={e => this.setAutoSuggest1('country', e.name)}
                                                    queryString="&name" ></AutoSuggest>
                                            </FormControl>
                                        </fieldset> 
                                        
                                       
                                        
                                    </div>

                                    <div className="col-md-12">
                                        <div className="text-center">
                                            <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                            <Button variant="contained" color="primary" onClick={e => this.addBranchDetails()}> + Add</Button>
                                        </div>
                                    </div>
                                    <div className="col-md-8 offset-md-2 mt-3">
                                        <div className="text-center">
                                            <Branches baseUrl={this.props.baseUrl} onRef={ref => (this.branchTemplateRef = ref)}
                                                currentId={this.state.formWizard.obj.id} location={this.props.location}></Branches>
                                        </div>
                                    </div>

                                </div> : null}
                                {index === 2 || index === 3 ? <div className="row">
                                    <div className="col-md-8 offset-md-2">
                                        <div className="text-center">
                                            <h4>Add Contact</h4>
                                        </div>
                                        <fieldset>
                                            <FormControl>

                                                <RadioGroup aria-label="position" name="position" row>
                                                    <FormControlLabel
                                                        value="C" checked={this.state.formWizard.tempcontact.type === 'C'}
                                                        label="Company Contact"
                                                        onChange={e => this.setField2("type", e)}
                                                        control={<Radio color="primary" />}
                                                        labelPlacement="end"
                                                    />
                                                    <FormControlLabel
                                                        value="B" checked={this.state.formWizard.tempcontact.type === 'B'}
                                                        label="Broker"
                                                        onChange={e => this.setField2("type", e)}
                                                        control={<Radio color="primary" />}
                                                        labelPlacement="end"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="Name" required={true}
                                                fullWidth={true} name="name"
                                                inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"2"},{"key":"maxlen","param":"30"}]' }}
                                                helperText={errors?.name?.length > 0 ? errors?.name[0]?.msg : ''}
                                                error={errors?.name?.length > 0}

                                                value={this.state.formWizard.tempcontact.name}
                                                onChange={e => this.setField2("name", e)}
                                            />
                                        </fieldset>
                                        {/* {this.state.formWizard.tempcontact.type === 'C' && <fieldset>
                                            <FormControl>
                                                <AutoSuggest url="companies"
                                                    name="companyName"
                                                    onRef={ref => (this.companyASRef = ref)}
                                                    displayColumns="name"
                                                    label="Company"
                                                   
                                                    placeholder="Search Company by name"
                                                    arrayName="companies"
                                                    projection="company_auto_suggest"
                                                    value={this.state.formWizard.tempcontact.selectedcompany}
                                                    onSelect={e => this.setAutoSuggest2('company', e.id)}
                                                    queryString="&name" ></AutoSuggest>
                                            </FormControl>
                                        </fieldset>} */}
                                        {/*this.state.formWizard.obj.type === 'C' &&
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
                                        onSelect={e => this.setAutoSuggest('branch', e.id)}
                                        queryString={`&company.id=${this.state.formWizard.selectedcompany ? this.state.formWizard.selectedcompany : 0}&branchName`}></AutoSuggest>
                                </FormControl>
        </fieldset>*/}


                                        <fieldset>
                                            <TextField
                                                type="text"
                                                name="email"
                                                label="Email"
                                                required={true}
                                                fullWidth={true}
                                                inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required"}, { "key":"email"}]' }}
                                                helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ''}
                                                error={errors?.email?.length > 0}
                                                value={this.state.formWizard.tempcontact.email}
                                                onChange={e => this.setField2('email', e)} />
                                        </fieldset>
                                        <fieldset>
                                            <TextField
                                                type="text"
                                                name="phone"
                                                label="Phone"
                                                required={true}
                                                fullWidth={true}
                                                inputProps={{ maxLength: 13, "data-validate": '[ { "key":"required"}]' }}
                                                helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ''}
                                                error={errors?.phone?.length > 0}
                                                value={this.state.formWizard.tempcontact.phone}
                                                onChange={e => this.setField2('phone', e)} />
                                        </fieldset>
                                        {this.state.formWizard.tempcontact.type === 'C' &&
                                            <fieldset>
                                                <FormControl>
                                                    <InputLabel>Department</InputLabel>
                                                    <Select label="Department" value={this.state.formWizard.tempcontact.department} name="department"

                                                        helperText={errors?.department?.length > 0 ? errors?.department[0]?.msg : ''}
                                                        error={errors?.department?.length > 0}
                                                        onChange={e => this.setSelectField2('department', e)}> {this.state.department.map((e, keyIndex) => {
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
                                                        value="M" checked={this.state.formWizard.tempcontact.gender === 'M'}
                                                        label="Male"
                                                        onChange={e => this.setField2("gender", e)}
                                                        control={<Radio color="primary" />}
                                                        labelPlacement="end"
                                                    />
                                                    <FormControlLabel
                                                        value="F" checked={this.state.formWizard.tempcontact.gender === 'F'}
                                                        label="Female"
                                                        onChange={e => this.setField2("gender", e)}
                                                        control={<Radio color="primary" />}
                                                        labelPlacement="end"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </fieldset>
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
                                        <fieldset>
                                            <TextareaAutosize placeholder="About Work" fullWidth={true} rowsMin={3} name="aboutWork"

                                                inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }}
                                                helperText={errors?.aboutWork?.length > 0 ? errors?.aboutWork[0]?.msg : ''}
                                                error={errors?.aboutWork?.length > 0}
                                                value={this.state.formWizard.tempcontact.aboutWork} onChange={e => this.setField2("aboutWork", e)} />
                                        </fieldset>
                                        <fieldset>
                                            <FormControl>
                                                <TextField type="text" label="Reports To"
                                                    fullWidth={true} name="reportsTo"
                                                    inputProps={{ maxLength: 45 }}
                                                    helperText={errors?.reportsTo?.length > 0 ? errors?.reportsTo[0]?.msg : ''}
                                                    error={errors?.reportsTo?.length > 0}
                                                    value={this.state.formWizard.tempcontact.reportsTo}
                                                    onChange={e => this.setField2("reportsTo", e)}
                                                />
                                            </FormControl>
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="Where met first" name="firstMet" required={true} fullWidth={true}
                                                inputProps={{ maxLength: 45, "data-validate": '[ { "key":"required"}]' }}
                                                helperText={errors?.firstMet?.length > 0 ? errors?.firstMet[0]?.msg : ''}
                                                error={errors?.firstMet?.length > 0}

                                                value={this.state.formWizard.tempcontact.firstMet} onChange={e => this.setField2("firstMet", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="WhatsApp" required={true} fullWidth={true} name="whatsapp"
                                                // inputProps={{ maxLength: 45 }}
                                                helperText={errors?.whatsapp?.length > 0 ? errors?.whatsapp[0]?.msg : ''}
                                                error={errors?.whatsapp?.length > 0}
                                                inputProps={{ minLength: 10, "data-validate": '[ { "key":"required"}]' }}
                                                value={this.state.formWizard.tempcontact.whatsapp} onChange={e => this.setField2("whatsapp", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="Wechat" fullWidth={true} name="wechat"
                                                inputProps={{ maxLength: 45 }}
                                                helperText={errors?.wechat?.length > 0 ? errors?.wechat[0]?.msg : ''}
                                                error={errors?.wechat?.length > 0}
                                                value={this.state.formWizard.tempcontact.wechat} onChange={e => this.setField2("wechat", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="QQ" fullWidth={true} name="qq"
                                                inputProps={{ maxLength: 45 }}
                                                helperText={errors?.qq?.length > 0 ? errors?.qq[0]?.msg : ''}
                                                error={errors?.qq?.length > 0}
                                                value={this.state.formWizard.tempcontact.qq} onChange={e => this.setField2("qq", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="LinkedIn" fullWidth={true} name="linkedin"
                                                inputProps={{ maxLength: 45 }}
                                                helperText={errors?.linkedin?.length > 0 ? errors?.linkedin[0]?.msg : ''}
                                                error={errors?.linkedin?.length > 0}
                                                value={this.state.formWizard.tempcontact.linkedin} onChange={e => this.setField2("linkedin", e)}
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
                                                    value={this.state.formWizard.tempcontact.dob}
                                                    onChange={e => this.setDateField2('dob', e)}
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
                                                    value={this.state.formWizard.tempcontact.anniversary}
                                                    onChange={e => this.setDateField2('anniversary', e)}
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
                                        <fieldset>
                                            <TextField type="text" label="Previously worked company"
                                                fullWidth={true} name="previousCompany"
                                                inputProps={{ maxLength: 45 }}
                                                helperText={errors?.previousCompany?.length > 0 ? errors?.previousCompany[0]?.msg : ''}
                                                error={errors?.previousCompany?.length > 0}
                                                value={this.state.formWizard.tempcontact.previousCompany} onChange={e => this.setField2("previousCompany", e)}
                                            />
                                        </fieldset>


                                        <div className="text-center">
                                            <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                            <Button variant="contained" color="primary" onClick={e => this.addContactDetails()}>+ Add</Button>
                                        </div>
                                        <div className=" mt-3">
                                            {/* <CompanyContacts className="p-0" company={this.state.newObj} onRef={ref => (this.contactsTemplateRef = ref)}></CompanyContacts> */}
                                            <List className="p-0" baseUrl={'company-contact'}
                                                onRef={ref => {
                                                    (this.listTemplateRef = ref)
                                                    if (ref) {
                                                        this.listTemplateRef.loadObjects1(this.state.formWizard.obj.id);
                                                    }
                                                }}
                                                onUpdateRequest={id => this.updateObj(id)}
                                                company={this.props.company}></List>
                                        </div>
                                    </div>
                                </div> : null}
                                {/* {index === 3 ? <div><div className="text-center">
                                    <h4>Upload Documents</h4>
                                </div><Upload onRef={ref => (this.uploadRef = ref)} fileFrom={this.props.baseUrl} currentId={this.props.currentId}
                                    fileTypes={this.state.fileTypes1}></Upload></div> : null} */}
                                <div className={this.state.classes.actionsContainer}>
                                    <div>

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={this.handleNext}
                                            className={this.state.classes.button}
                                        >
                                            {this.state.activeStep === this.state.steps.length - 1 ? 'Finish' : 'Next'}

                                        </Button>
                                    </div>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {/* <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={this.handleSubmit}
                                            className={this.state.classes.button}
                                            disabled = {this.state.disabled}
                                        >
                                            
                                            {this.state.activeStep === this.state.steps.length - 1 ? '' : 'Submit' }
                                            
                                        </Button> */}


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