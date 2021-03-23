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
import Uploadp from './Uploadp';
import AddQuotation from './AddQuotation';
import EditIcon from '@material-ui/icons/Edit';
import EmailIcon from '@material-ui/icons/Email';
// const json2csv = require('json2csv').parse;

class Quotation extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        modal: false,
        obj: '',
        baseUrl: 'purchases-quotation',
        currentId: '',
        fileTypes2: [
            { label: 'Quotation', expiryDate: true },
            { label: 'COA', expiryDate: true },],
    }

    loadObj(id) {
        axios.get(Const.server_url + Const.context_path + "api/purchases-quotation?enquiry.id=" + id + '&projection=purchases_quotation_edit&sort=id,desc').then(res => {
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
        // console.log('quotation component did mount');
        console.log(this.props.currentId);   
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

    generateQuote = (expiryDate,products)=>{
        console.log("expiry date is",expiryDate);
        let PE = this.props.parentObj;
        axios.get(Const.server_url+Const.context_path+'api/companies/'+PE.company.id).then(compRes => {
            var newObj = {
                code: Const.getUniqueCode('PQ'),
                company: "/companies/"+compRes.data.id,
                gst: '',
                amount: '',
                transportationCharges: '',
                terms: compRes.data.paymentTerms,
                deliveryPeriod: '',
                enquiry: '/purchases/'+PE.id,
                validTill: expiryDate,
            };
            axios.post(Const.server_url + Const.context_path + "api/purchases-quotation", newObj).then(res =>{
                this.setState({ loading: false });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                this.setState({ loading: false });
                swal("Upload Quotation Error!", "Unable to Upload Quotation!", "error");
            });
        }).finally(()=>{
            this.setState({ loading: false });
        }).catch(err =>{
            this.setState({ loading: false });
            swal("Company Not found!", "Unable to find the selected Company", "error");
        });
    }

    render() {
        return (
            <div>
                {!this.state.editFlag &&            
                    <div className="row">
                        <div className="col-md-12">
                             <div className="card b">
                                 {/* <div className="card-header">
                                 </div> */}
                             </div>
                                <Uploadp onRef={ref => (this.uploadRef = ref)} fileFrom={this.props.baseUrl} currentId={this.props.currentId}
                                    fileTypes={this.state.fileTypes2} products={this.props.parentObj.products} generateQuote={(expiryDate) => this.generateQuote(expiryDate)}></Uploadp>
                                    {/* <Upload onRef={ref => (this.uploadRef = ref)} fileFrom={this.props.baseUrl + '-quotation'} 
                                    currentId={this.props.currentId} fileTypes={[{label: 'Attachment', expiryDate: true }]}></Upload> */}
                                    {/* {this.state.obj && */}
                            <div className="card b">
                                <div className="card-header">
                                    <div className="float-right mt-2">
                                    <button style={{ backgroundColor: "#2b3db6", border:"1px solid #2b3db6 ",borderRadius:"5x"}} color="primary" variant="contained" onClick={() => this.updateObj()}> <EditIcon  style={{ color: '#fff', }} fontSize="small" /></button>
                                    </div>
                                    <h4 className="my-2">
                                        <span>{this.state.obj.name}</span>
                                    </h4>
                                </div>
                                <div className="card-body bb bt">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <strong>Code</strong>
                                                </td>
                                                <td>{this.state.obj.code}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Company</strong>
                                                </td>
                                                <td>
                                                    {/* <Link to={`/companies/${this.state.obj.company.id}`}>
                                                        {this.state.obj.company.name}
                                                    </Link> */}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Specification</strong>
                                                </td>
                                                <td>{this.state.obj.specification}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Makes</strong>
                                                </td>
                                                <td>{this.state.obj.make}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Payment Terms</strong>
                                                </td>
                                                <td>{this.state.obj.terms}</td>
                                            </tr>
                                           {/* <tr>
                                                <td>
                                                    <strong>Transportation Charger</strong>
                                                </td>
                                                <td>{this.state.obj.transportationCharges}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Packing</strong>
                                                </td>
                                                <td>{this.state.obj.packing}</td>
                                            </tr>
                                           
                                            <tr>
                                                <td>
                                                    <strong>Delivery Period</strong>
                                                </td>
                                                <td>{this.state.obj.deliveryPeriod} days</td>
                                            </tr>*/}
                                             <tr>
                                                <td>
                                                    <strong>GST</strong>
                                                </td>
                                                <td>{this.state.obj.gst}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Valid Till</strong>
                                                </td>
                                                <td>{this.state.obj.validTill?<Moment format="DD MMM YY">`{this.state.obj.validTill}`</Moment>:'-NA-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <div className="text-center mt-4">
                                        <h4>Products</h4>
                                    </div>
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Actions</th>
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
                                                    <td>
                                                        {!product.status && '-NA-'}
                                                        {product.status && <span className="badge badge-success">{product.status}</span>}
                                                    </td>
                                                    <td>
                                                    <button style={{ backgroundColor: "#2b3db6", border:"1px solid  #2b3db6",borderRadius:"5px" }} color="primary" variant="outlined" onClick={() => this.sendEmail()} ><EmailIcon  style={{ color: '#fff', }} fontSize="small" /></button>
                                                    </td>
                                                </tr>)
                                            })}
                                        </tbody>}
                                    </Table>
                               
                                </div>
                            </div>
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
)(Quotation);