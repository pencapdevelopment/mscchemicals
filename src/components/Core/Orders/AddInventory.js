import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
// import swal from 'sweetalert';
import axios from 'axios';
// import Moment from 'react-moment';
// import { Link } from 'react-router-dom';
// import { Table } from 'reactstrap';
// import PageLoader from '../../Common/PageLoader';
// import {
//     Row, Col, Modal,
//     ModalHeader,
//     ModalBody
// } from 'reactstrap';
// import Sorter from '../../Common/Sorter';
import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';

// import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path,  } from '../../Common/constants';
import { Button, TextField,  } from '@material-ui/core';
// import Upload from '../Common/Upload';
import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';

// import TabPanel from '../../Common/TabPanel';

// import Status from '../Common/Status';

// const json2csv = require('json2csv').parse;



class AddInventory extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        modal: false,
        obj: '',
        baseUrl: 'product-flow',
        currentId: '',
        disabled:false,
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            
            obj: {
                
                type: 'Incoming',
                batch:'',
                mfgDate: null,
                expiryDate: null,
                shelfLife: '',
                deliveryPeriod: '',
                quantity:0,
            }
        },
        status: [
            { label: 'On going', value: 'On going', badge: 'info' },
            { label: 'Completed', value: 'Completed', badge: 'success' },
        ]

    }


    loadObj(id) {
        axios.get(server_url + context_path + "api/" + this.state.baseUrl + "?orderProduct=" + id).then(res => {
            var formWizard=this.state.formWizard; 
            if(res.data._embedded['product-flow'][0]){
            formWizard.obj=res.data._embedded['product-flow'][0];
            formWizard.editFlag=true;
            this.setState({formWizard})
            console.log(res.data._embedded['product-flow'][0]);
             }
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        // console.log('inventory component did mount');

        this.loadObj(this.props.orderProduct.id);
        if(this.props.orderStatus==='Completed'){
            
            this.setState({disabled:true});
        }
        this.props.onRef(this);
    }

    updateObj(prodId) {
        if (this.state.obj) {
            this.setState({ editFlag: true }, () => {
                this.addTemplateRef.updateObj(this.state.currentId);
            })
        } else {
            this.setState({ editFlag: true });
        }
    }

    saveSuccess(id) {
        this.setState({ editFlag: false });
        this.loadObj(this.props.currentId);
    }

    cancelSave = () => {
        this.setState({ editFlag: false });
    }

    updateStatus = (status) => {
        var obj = this.state.obj;
        obj.status = status;
        this.setState({ obj });
    }

    checkForError() {
        // const form = this.formWizardRef;

        const tabPane = document.getElementById('orderForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        var formWizard = this.state.formWizard;
        formWizard.errors = errors;
        this.setState({ formWizard });
        console.log(errors);

        return hasError;
    }
    setSelectField(field, e) {
        this.setField(field, e, true);

    }

    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;

        var input = e.target;
        formWizard.obj[field] = e.target.value;
        if (field === 'category') {
            formWizard.obj['subCategory'] = '';
        }

        this.setState({ formWizard }, function () {
            
        });

        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({
                formWizard
            });
        }
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
    saveDetails() {
        var hasError = this.checkForError();
        if (!hasError) {
            var newObj = this.state.formWizard.obj;
            newObj.product='/products/'+this.props.orderProduct.product.id
            newObj.type= 'InComing';
            newObj.refType='Order';
            newObj.reference=this.props.orderId;
            newObj.orderProduct=this.props.orderProduct.id;
            newObj.quantity=this.props.orderProduct.quantity;
            newObj.remainingQuantity=newObj.quantity;

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
               // this.props.onCancel();
            }).catch(err => {
                // this.toggleTab(0);
                //this.setState({ addError: err.response.data.globalErrors[0] });
                var formWizard = this.state.formWizard;
                formWizard.globalErrors = [];
                if (err?.response?.data?.globalErrors) {
                    err.response.data.fieldError.forEach(e => {
                        formWizard.globalErrors.push(e);
                    });
                }

                var errors = {};
                if (err.response?.data?.fieldError) {
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
               // swal("Unable to Save!", "Please resolve the errors", "error");
            })
        }
    }
    render() {
        const errors = this.state.formWizard.errors;
        const disableAll=this.state.disabled;
        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="orderForm">

                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <fieldset>
                          
                            <fieldset>
                                <TextField type="text" name="batch" label="Batch"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ maxLength: 20, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"1"},{"key":"maxlen","param":"20"}]' }}
                                    helperText={errors?.batch?.length > 0 ? errors?.batch[0]?.msg : ""}
                                    error={errors?.batch?.length > 0}
                                    disabled={disableAll}
                                    value={this.state.formWizard.obj.batch} onChange={e => this.setField("batch", e)} />
                            </fieldset>
                            <fieldset>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DatePicker 
                                    autoOk
                                    clearable
                                    disableFuture
                                    disabled={disableAll}
                                    label="Mfg Date"
                                    format="DD/MM/YYYY"
                                    value={this.state.formWizard.obj.mfgDate} 
                                    onChange={e => this.setDateField('mfgDate', e)} 
                                    TextFieldComponent={(props) => (
                                        <TextField
                                        type="text"
                                        name="mfgDate"
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
                                    label="Exp Date"
                                    disabled={disableAll}
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

                            <fieldset>
                                <TextField type="text" name="shelfLife" label="Shelf Life"
                                    required={true} fullWidth={true}
                                    disabled={disableAll}
                                    // value={this.state.formWizard.obj.subCategory}
                                    inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"},{"key":"maxlen","param":"30"}]' }}
                                    helperText={errors?.shelfLife?.length > 0 ? errors?.shelfLife[0]?.msg : ""}
                                    error={errors?.shelfLife?.length > 0}

                                    value={this.state.formWizard.obj.shelfLife} onChange={e => this.setField("shelfLife", e)} />
                            </fieldset>

                            </fieldset>
                            <div className="text-center">
                                <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                               {this.props.orderStatus!=='Completed' && <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>}
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
)(AddInventory);