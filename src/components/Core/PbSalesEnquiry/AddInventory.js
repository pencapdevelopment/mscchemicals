import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
// import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
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
import { Button } from '@material-ui/core';
// import Upload from '../Common/Upload';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';

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
        exts: {
            'doc': 'application/msword',
            'docx': 'application/msword',
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
        },
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            flows:[],

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
        axios.get(server_url + context_path + "api/" + this.state.baseUrl + "?product.id=" + id+"&sord=id,desc").then(res => {
            var formWizard=this.state.formWizard;
            formWizard.flows= res.data._embedded['product-flow'] ;
            this.setState({formWizard})
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        // console.log('inventory component did mount');

        this.loadObj(this.props.orderProduct.product.id);

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
    downloadFile = (e, refId,type) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

         
        axios({
            url: server_url + context_path + "docs/ref/"+refId+"/"+type,
            method: 'GET',
            responseType: 'blob',
        }).then(response => {
            var disposition=response.headers['content-disposition'];
            console.log(response.headers);
            var fileName=disposition.substr(disposition.lastIndexOf(';') + 1);
            fileName=fileName.substr(fileName.lastIndexOf('=') + 1)
            var fileType = disposition.substr(disposition.lastIndexOf('.') + 1);
            fileType = this.state.exts[fileType];

            const url = window.URL.createObjectURL(new Blob([response.data], { type: fileType }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        });
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
                this.props.onCancel();
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
    }
    render() {
        // const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="orderForm">

                    <div className="row">
                        <div className="col-md-12  ">
                        <Table hover responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Batch</th>
                                                            <th>Quantity</th>
                                                            <th>Mfg Date</th>
                                                            <th>Expiry Date</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                         
                            {this.state.formWizard.flows.map((g,idx)=>{
                                return (<tr>
                                        <td>{idx+1}</td>
                                <td>{g.batch}</td>
                                <td>{g.quantity}</td>
                                <td>  <Moment format="DD MMM YY HH:mm">{g.mfgDate}</Moment></td>
                                <td> <Moment format="DD MMM YY HH:mm">{g.expiryDate}</Moment></td>
                                <td><a href="#s" className="btn-link" onClick={(e) => this.downloadFile(e,g.orderProduct, 'Sales COA')}>
                                    Sales COA
                                </a></td>
                                <td><a href="#s" className="btn-link" onClick={(e) => this.downloadFile(e,this.props.orderProduct.product.id, 'MOA')}>
                                    MOA
                                </a></td>
                                </tr>

                                )
                            })}
                                </tbody>
                                                </Table>
                            
                            <div className="text-center">
                                <Button variant="contained" color="secondary" onClick={e => this.props.onCancel()}>Cancel</Button>
                                <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save & Continue</Button>
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