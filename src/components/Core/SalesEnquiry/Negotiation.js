import { Button } from '@material-ui/core';
import axios from 'axios';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import swal from 'sweetalert';
import * as Const from '../../Common/constants';
import Upload from '../Common/Upload';
import AddQuotation from './AddQuotation';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import EmailIcon from '@material-ui/icons/Email';
import Divider from '@material-ui/core/Divider';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';







// const json2csv = require('json2csv').parse;

class Negotiation extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        modal: false,
        obj: '',
        baseUrl: 'sales-quotation',
        currentId: '',
    }


    loadObj(id) {
        axios.get(Const.server_url + Const.context_path + "api/sales-quotation?enquiry.id=" + id + '&projection=sales_quotation_edit').then(res => {
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];
            console.log("negotiation.js", list)

            if(list.length) {
                this.setState({ obj: list[0], currentId: list[0].id });
                console.log("if negotiation.js", list)
            }
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        // console.log('quotation component did mount');
        console.log("componentDidMount Negotiation", this.props.currentId);

       
        this.loadObj(this.props.currentId);
        this.props.onRef(this);
    }

    updateObj() {
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

    sendEmail = (i) => {
        var obj = this.state.obj;
        var prod = this.props.parentObj.products[i];

        axios.patch(Const.server_url + Const.context_path + "quotations/" + obj.id + "/products/" + prod.id)
            .then(res => {
                prod.status = 'Email Sent';
                this.setState({ obj });
                swal("Sent Quotation!", 'Succesfully sent quotation mail.', "success");
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-sm-12">
                    <div className="card b">
                    <div className="row ml-1 mt-4">
                                        <div className="col-sm-12" >
                                        <h4 style={{fontSize: 18,flexDirection: 'row'}}>Generated Quotation</h4>
                                   
                                        </div>
                                        
                                    </div>
                        <Table className="card-header" hover responsive>
                        <thead>
                                            <tr>
                                                <th>Quotation Code</th>
                                                <th>Sent Date</th>
                                                <th>Create On</th>
                                                
                                            </tr>
                                        </thead>
                  
                                
                    <tbody className="card-body bb bt" hover responsive>
                                <tr>
                                <td>{this.state.obj.code}</td>
                                <td> hgjhjh</td>
                                <td>{this.state.obj.creationDate}</td>
                                </tr>      
                                       
                    </tbody>           
                    </Table>
                            </div>    
                    </div>
                </div>
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-12">
                            {/* <Upload onRef={ref => (this.uploadRef = ref)} fileFrom={this.props.baseUrl + '-quotation'} 
                            currentId={this.props.currentId} fileTypes={[{label: 'Attachment', expiryDate: true }]}></Upload> */}

                            {this.state.obj &&
                            <div className="card b">
                                
                                <div className="card-body bb bt">
                          
                                   
                                    <div className=" row text-left mt-4">
                                        <div className="col-sm-12" >
                                        <h4 style={{fontSize: 18,flexDirection: 'row'}}>Products</h4>
                                   
                                        </div>
                                        
                                    </div>
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                              
                                                <th> View Remark</th>
                                                <th>Actions</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                       
                                        {this.state.obj.products &&
                                        <tbody>
                                        {this.props.parentObj.products.map((product, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td className="va-middle">{i + 1}</td>
                                                    <td>
                                                        <Link to={`/products/${product.product.id}`}>
                                                            {product.product.name}
                                                        </Link>
                                                    </td>
                                                    <td>{product.quantity}</td>
                                                    <td>{product.amount}</td>
                                                   
                                                    <td style={{marginLeft: 10}}>
                                                    <button className="btn btn-primary" >< VisibilityRoundedIcon  size="medium" style={{marginLeft: 20}} color="primary" aria-label=" VisibilityRoundedIcon" /></button>
                                                    </td>
                                                    <td>
                                                        
                                                    <Button color='primary' size='small' variant="contained">Negotiation</Button>
                                                    </td>
                                                    <td>
                                                        {!product.status && '-NA-'}
                                                        {product.status && <span className="badge badge-success">{product.status}</span>}
                                                    </td>
                                                    {/* <td>
                                                        <Button variant="contained" color="primary" size="sm" onClick={() => this.sendEmail(i)}><EmailIcon fontSize="small"style={{color:'#fff'}}></EmailIcon> </Button>
                                                    </td> */}
                                                </tr>)
                                            })}
                                        </tbody>}
                                    </Table>
                                    
                                </div>
                            </div>}
                            {this.state.obj &&
                            <div className="card b" style={{marginTop: 0}}>
                                
                                <div className="card-body bb bt">
                          
                                   
                                    <div className=" row text-left mt-4">
                                        <div className="col-sm-12" >
                                        <h4 style={{fontSize: 18,flexDirection: 'row'}}>Product Negoitation Tracking </h4>
                                   
                                        </div>
                                        
                                    </div>
                                    <Table hover responsive >
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Product</th>
                                                <th>Quantity</th>
                                                <th>Price Quoted</th>
                                                <th>Negotiation</th>
                                                <th>Negotiation Stage 1</th>
                                                <th>Negotiation Stage 2</th>
                                            </tr>                                         
                                        </thead>
                                       
                                        {this.state.obj.products &&
                                        <tbody>
                                        {this.props.parentObj.products.map((product, i) => {
                                            return (
                                                <tr key={i}>
                                                    
                                                    {/* <td>
                                                        <Button variant="contained" color="primary" size="sm" onClick={() => this.sendEmail(i)}><EmailIcon fontSize="small"style={{color:'#fff'}}></EmailIcon> </Button>
                                                    </td> */}
                                                </tr>)
                                            })}
                                        </tbody>}
                                    </Table>
                                    
                                </div>
                            </div>}
                            {/* {!this.state.obj &&
                            <div className="text-center">
                                {this.props.user.permissions.indexOf(Const.MG_SE_E) >=0 && <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Generate Quotation</Button>}
                            </div>} */}
                         </div>
                </div>}
                {this.state.editFlag &&
                    <div className="card b">
                        <div className="card-body bb bt">
                            <AddQuotation baseUrl={this.state.baseUrl} currentId={this.state.currentId} parentObj={this.props.parentObj}
                            onRef={ref => (this.addTemplateRef = ref)} onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}></AddQuotation>
                        </div>
                    </div>}
            </div>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(Negotiation);