import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
// import swal from 'sweetalert';
import axios from 'axios';
// import Moment from 'react-moment';
// import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
// import PageLoader from '../../Common/PageLoader';
// import {
//     Row, Col, Modal,
//     ModalHeader,
//     ModalBody
// } from 'reactstrap';
import Sorter from '../../Common/Sorter';
import FormValidator from '../../Forms/FormValidator';
import {  Form } from 'reactstrap';

// import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path,  } from '../../Common/constants';
import { Button, TextField } from '@material-ui/core';
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



class SalesInventory extends Component {
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
            
            obj:[]
        },
        status: [
            { label: 'On going', value: 'On going', badge: 'info' },
            { label: 'Completed', value: 'Completed', badge: 'success' },
        ]

    }


    loadObj(id) {
        axios.get(server_url + context_path + "inventory/"+this.props.orderProduct.product.id+"/"+this.props.orderProduct.id ).then(res => {
            var formWizard=this.state.formWizard; 
             
            formWizard.obj=res.data;
            
            this.setState({formWizard})
            console.log(res.data);
             
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
    updateQty(e,i){
        var formWizard = this.state.formWizard;
        formWizard.obj[i].currentQty=e.target.value;
        this.setState({ formWizard });
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
       
            var newObj = this.state.formWizard.obj;
            

            var promise = undefined;

                promise = axios.post(server_url + context_path + "inventory-update/"+this.props.orderProduct.product.id+"/"+this.props.orderProduct.id, newObj)
          

            promise.then(res => {
                var formw = this.state.formWizard;
                formw.obj.id = res.data.id;
                formw.msg = 'successfully Saved';

                this.props.onSave(res.data.id);
            }).finally(() => {
                this.setState({ loading: false });
                this.props.onCancel();
            }).catch(err => {
                console.log(err)
               // swal("Unable to Save!", "Please resolve the errors", "error");
            })
        
    }
    render() {
        // const errors = this.state.formWizard.errors;
        // const disableAll=this.state.disabled;
        return (
            <ContentWrapper>
                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="orderForm">

                    <div className="row">
                        <div className="col-md-9">
                        <Table hover responsive>
                <thead>
                    <Sorter columns={[
                        { name: '#', sortable: false },
                        { name: 'Batch', sortable: false, param: 'code' },
                        { name: 'Available Qty', sortable: false, param: 'type' },
                        { name: 'Select Qty', sortable: false},]}
                         />
                </thead>
                <tbody>
                    {this.state.formWizard.obj.map((obj, i) => {
                        return (
                            <tr key={obj.id}>
                                <td>{i + 1}</td>
                                <td>
                                     
                                        {obj.batch}
                                     
                                </td>
                                <td>
                                    
                                        {obj.availableQty}
                                    
                                </td>
                                  
                                <td>
                                <TextField
                                    type="number"
                                    label="Qty .."
                                    fullWidth={true}
                                    value={obj.currentQty}
                                    onChange={e => this.updateQty(e,i)} />
                                </td>
                                 
                            </tr>
                        )
                    })}
                </tbody>
            </Table>

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
)(SalesInventory);