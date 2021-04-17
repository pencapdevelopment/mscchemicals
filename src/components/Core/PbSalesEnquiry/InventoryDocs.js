import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import PageLoader from '../../Common/PageLoader';
import { Row, Col, Modal,
    ModalHeader,
    ModalBody } from 'reactstrap';
import Sorter from '../../Common/Sorter';

import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';
import Upload from '../Common/Upload';
import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';

import TabPanel from '../../Common/TabPanel';

import Status from '../Common/Status';
 
const json2csv = require('json2csv').parse;

class InventoryDocs extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        modal: false,
        obj: '',
        baseUrl: 'inventory',
        currentId: '',
        status: [
            { label: 'On going', value: 'On going', badge: 'info' },
            { label: 'Completed', value: 'Completed', badge: 'success' },
        ],
        bankingFileTypes: {}
    }


    loadObj(id) {
        axios.get(server_url + context_path + "api/" + this.state.baseUrl + "?order.id=" + id + '&projection=order_inventory_edit').then(res => {
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];

            if(list.length) {
                this.setState({ obj: list[0], currentId: list[0].id });
            }
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        // console.log('inventory component did mount');
          console.log(this.props.parentObj);
          var bankingFileTypes={}
          this.props.parentObj.products.forEach(g=>{
              
          });
          console.log(bankingFileTypes);
          this.setState({bankingFileTypes});
        this.loadObj(this.props.currentId);
        this.props.onRef(this);
    }

    updateObj(prodId) {
        if(this.state.obj) {
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

    render() {
        return (
            <div>
                 {this.props.parentObj.products.map((product, i) => {
                                                return (
                    <div className="row">
                        <div className="col-md-12">
                        
                        <div> {product.product.name} </div>
                                        
                            
                        </div>
                    </div>)})}
                 
            </div>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(InventoryDocs);