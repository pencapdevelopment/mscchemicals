import { Button } from '@material-ui/core';
import axios from 'axios';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import {
    Modal,
    ModalBody, ModalHeader,
} from 'reactstrap';
import { context_path, getUniqueCode, server_url, defaultDateFilter } from '../../Common/constants';
import AutoSuggest from '../../Common/AutoSuggest';
import UOM from '../Common/UOM';
import { AppBar, Tab, Tabs, FormControl, TextField } from '@material-ui/core';
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
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import PageLoader from '../../Common/PageLoader';
// import CustomPagination from '../../Common/CustomPagination';
import styled from "styled-components";
// const json2csv = require('json2csv').parse;
class Negotiation extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        modal: false,
        loading:false,
        quoteObj: '',
        purchaseEnqObj:'',
        purchProdObj:'',
        ngTObj:'',
        obj3:'',
        remarksObj:{},
        page:'',
        ngTracking : [],
        remark:'',
        loadData:false,
        baseUrl: 'purchase-quotation',
        currentId: '',
        modalnegatation: false,
        modalRemark : false,
        status:'',
        ngList1:{
            negotiation_stage1:'',
            negotiation_stage2:'',
            negotiation_stage3:'',
            ns1_readOnly:false,
            ns2_readOnly:false,
            ns3_readOnly:false,
            remark:''
        },
        trackingData:[]
    }
    loadQuoteObj(id) {
        axios.get(Const.server_url + Const.context_path + "api/purchase-quotation?enquiry.id=" + id + '&projection=purchase_quotation_edit').then(res => {
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];
            if(list.length) {
                this.setState({ quoteObj: list[0], currentId: list[0].id });
            }
        }); 
    }
    negotiationTraking(){
        axios.get( server_url + context_path + "api/purchase-negotiation-tracking?reference.id="+this.props.currentId+"&sort=id,desc&projection=purchase-negotiation-tracking").then(res => {
            let ngList1 = res.data._embedded[Object.keys(res.data._embedded)[0]];
            let ngList =  [];
            ngList1.map((ngt1,idx1)=>{
                if(idx1===0){
                    ngList.push(ngt1);
                }
                else{
                    if(ngList.findIndex(nt=> nt.product.id === ngt1.product.id)===-1){
                        ngList.push(ngt1);
                    }
                }
            });
            if(ngList.length>0){
              this.setState({
                ngTracking:ngList, 
                trackingData:ngList1,
                page:''
            });
            }else{
                this.setState({
                   page:  <Span2>No Records Found</Span2>  
                }); 
            }
        });   
    }
    findStatus(prodId,stage){
        let trackingData=this.state.trackingData;
        let indx=-1;
        if(stage==='ng1'){
            indx=trackingData.findIndex(el=>el.product.id===prodId && el.negotiation_stage1 !==0 && el.negotiation_stage2 === 0 && el.negotiation_stage3 === 0)
        }
        if(stage==='ng2'){
            indx=trackingData.findIndex(el=>el.product.id===prodId && el.negotiation_stage1 !==0 && el.negotiation_stage2 !== 0 && el.negotiation_stage3 === 0)
        }
        if(stage==='ng3'){
            indx=trackingData.findIndex(el=>el.product.id===prodId && el.negotiation_stage1 !==0 && el.negotiation_stage2 !== 0 && el.negotiation_stage3 !== 0)
        }
        if(indx!==-1)
        {
            if(trackingData[indx].status === null){
                return <div className="badge badge-secondary">pending</div>;
            }
            else if(trackingData[indx].status === "Approved"){
                return <div className="badge badge-success">{trackingData[indx].status}</div>;
            }else{
                return <div className="badge badge-danger">{trackingData[indx].status}</div>;
            }           
        }else{
            return null;
        }
    }
    loadPurchaseEnqObj(id) {
        axios.get(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "/" + id + '?projection=purchase_edit').then(res => {
            this.setState({ purchaseEnqObj: res.data });
        });  
    }
    // loadObj2(id) {
    //     axios.get(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "/" + id + '?projection=purchases_edit').then(res => {
    //         var newData=res.data;
    //         this.setState({ obj: newData });
    //     });
    // }
    saveNegotiation= (productsid) => {
        let purchProdObj={...this.state.purchProdObj};
        purchProdObj.product = "/products/"+purchProdObj.product.id;
        purchProdObj.reference = "/purchase/"+this.state.purchaseEnqObj.id;
        purchProdObj.purchaseProduct = "/purchase-products/"+purchProdObj.id;
        purchProdObj.remark=this.state.ngList1.remark;  
        purchProdObj.negotiation_stage1=this.state.ngList1.negotiation_stage1;
        purchProdObj.negotiation_stage2=this.state.ngList1.negotiation_stage2;
        purchProdObj.negotiation_stage3=this.state.ngList1.negotiation_stage3;
        purchProdObj.status=null;
        if(!(this.state.ngList1.ns1_readOnly && this.state.ngList1.ns2_readOnly && this.state.ngList1.ns3_readOnly)){
            axios.post( server_url + context_path + "api/purchase-negotiation-tracking/", purchProdObj)
            .then(res => {
                axios.patch(server_url + context_path + "api/purchase-products/"+purchProdObj.id,{id:purchProdObj.id,status:null});
                this.setState({ngTObj: res.data, modalnegatation:false, loading: false});
                this.purchaseApprovalData();
                this.loadPurchaseEnqObj(this.props.currentId);
                this.negotiationTraking();
            })
            .catch(err=>err) ;
        }else{
            this.setState({ modalnegatation:false});
        }
    }
    purchaseApprovalData(){
        let ngTObj={...this.state.ngTObj};
        ngTObj.purchaseNegotiationTracking="/purchase-negotiation-tracking/"+ngTObj.id;
        ngTObj.repository=this.props.baseUrl;
        ngTObj.reference = this.state.purchaseEnqObj.id;
        ngTObj.remark=ngTObj.remark;
        axios.post( server_url + context_path + "api/approvals/", {"purchaseNegotiationTracking":ngTObj.purchaseNegotiationTracking,"repository":ngTObj.repository,"reference":ngTObj.reference,"remark":ngTObj.remark})
        .then(res => {
            //this.setState({obj2: res.data, modalnegatation:false, loading: false, loadData:true});
        })
        .catch(err=> err);
    }
    toggleModalNegotation = (productId) => {
        // axios.get( server_url + context_path + "api/purchase-products/"+ productId ).then(res => {
        //         this.setState({ purchProdObj: res.data, modalnegatation:!this.state.modalnegatation });
        //     });
        axios.get(server_url + context_path + "api/purchase-products/"+ productId+"?projection=purchase-product")
        .then(res => {
           // var product = this.props.parentObj.products.find(p => p.id === res.data.id);
            this.setState({ purchProdObj: res.data, modalnegatation:!this.state.modalnegatation });
        });    
        axios.get( server_url + context_path + "api/purchase-negotiation-tracking?purchaseProduct="+productId+"&page=0&size=1&sort=id,desc&projection=purchase-negotiation-tracking")
        .then(res => {
            //var ngList = res.data._embedded[Object.keys(res.data._embedded)[0]];
            var ngList=res.data._embedded[Object.keys(res.data._embedded)[0]];
            if (ngList.length) {
                if(ngList[0].negotiation_stage1 === 0 ){ngList[0]['negotiation_stage1']= ''}
                if(ngList[0].negotiation_stage2 === 0){ngList[0]['negotiation_stage2']= ''}
                if(ngList[0].negotiation_stage3 === 0){ngList[0]['negotiation_stage3']= ''}
                if(ngList[0].negotiation_stage1 !== '' ){ngList[0]['ns1_readOnly']= true}
                if(ngList[0].negotiation_stage2 !== ''){ngList[0]['ns2_readOnly']= true}
                if(ngList[0].negotiation_stage3 !== ''){ngList[0]['ns3_readOnly']= true}
                this.setState({ ngList1: ngList[0] });
            } else {
                this.setState({
                    ngList1: {
                        negotiation_stage1: '',
                        negotiation_stage2: '',
                        negotiation_stage3: '',
                        ns1_readOnly:false,
                        ns2_readOnly:false,
                        ns3_readOnly:false,
                        remark: ''
                    }
                })
            }
        });         
    }
    toggleRemarkNegotiation = (productId) => {
        // axios.get( server_url + context_path + "api/purchases-products/"+ productId+"?projection=purchases-product")
        // .then(res => {
        // });
        let remarksObj = {};
        remarksObj.productName = this.state.purchaseEnqObj.products.find(p=>p.id===productId).product.name;
        remarksObj.productId = this.state.purchaseEnqObj.products.find(p=>p.id===productId).product.id;
        remarksObj.purchaseProductId = productId
        remarksObj.ns1_remark = '-No Remarks-';
        remarksObj.ns2_remark = '-No Remarks-';
        remarksObj.ns3_remark = '-No Remarks-';
        remarksObj.status = null;
        axios.get( server_url + context_path + "api/purchase-negotiation-tracking?purchaseProduct="+productId+"&page=0&sort=id,desc&projection=purchase-negotiation-tracking")
        .then(remarkResp => {
            let ngList = remarkResp.data._embedded[Object.keys(remarkResp.data._embedded)[0]];
            if(ngList.length) {
                remarksObj.productName = ngList[0].product.name;
                remarksObj.productId = ngList[0].product.id;
                remarksObj.purchaseProductId = productId;
                let idx1 = ngList.findIndex(ng1 => ng1.negotiation_stage1 !==0 && ng1.negotiation_stage2 === 0 && ng1.negotiation_stage3 === 0);
                let idx2 = ngList.findIndex(ng1 => ng1.negotiation_stage1 !==0 && ng1.negotiation_stage2 !== 0 && ng1.negotiation_stage3 === 0);
                let idx3 = ngList.findIndex(ng1 => ng1.negotiation_stage1 !==0 && ng1.negotiation_stage2 !== 0 && ng1.negotiation_stage3 !== 0);
                remarksObj.ns1_remark = idx1 === -1?'-No Remarks-':ngList[idx1].remark;
                remarksObj.ns2_remark = idx2 === -1?'-No Remarks-':ngList[idx2].remark;
                remarksObj.ns3_remark = idx3 === -1?'-No Remarks-':ngList[idx3].remark;
                remarksObj.status = ngList[0].status;
            }
        })
        .finally(() => {
            this.setState({remarksObj: remarksObj, modalRemark:!this.state.modalRemark });
        })
    }
    toggleModalNegotation1= () => {
        this.setState({
            modalnegatation: false
         });
    }
    componentDidUpdate(){}
    toggleRemark = () => {
        this.setState({
           modalRemark: false
        });
    };
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.loadQuoteObj(this.props.currentId);
        this.loadPurchaseEnqObj(this.props.currentId);
        this.negotiationTraking();
        //this.loadObj2(this.props.currentId);
        this.props.onRef(this);
        axios.get(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "-user?projection=" +
            this.props.baseUrl + "-user&reference=" + this.props.currentId).then(res => {
            this.setState({
                objects: res.data._embedded[Object.keys(res.data._embedded)[0]],
                loading:false
            });
        });
    }
    updateObj() {
        if(this.state.quoteObj) {
            this.setState({ editFlag: true }, () => {
                this.addTemplateRef.updateObj(this.state.currentId);
            })
        } else {
            this.setState({ editFlag: true });
        }
    }
    saveSuccess(id) {
        this.setState({ editFlag: false });
        this.loadQuoteObj(this.props.currentId);
    }
    cancelSave = () => {
        this.setState({ editFlag: false });
    }
    // saveProduct(e) {
    //     var obj3 = this.state.obj2;
    //     var input=e.target;
    //     obj3.amount=input.value;
    //     //obj3.uom=input.value;
    //     // var newData1=this.state.obj2.amount;
    //     // if(newData1){
    //     // }
    //     this.setState({obj3});
    // }
    // saveUom(e) {
    //     var obj3 = this.state.obj2;
    //     var input=e.target;
    //     //obj3.amount=input.value;
    //     obj3.uom=input.value;
    //     // var newData1=this.state.obj2.amount;
    //     // if(newData1){
    //     // }
    //     this.setState({obj3});
    // }
    // saveQuantity(e) {
    //     var obj3 = this.state.obj2;
    //     var input=e.target;
    //     //obj3.amount=input.value;
    //     obj3.quantity=input.value;
    //     // var newData1=this.state.obj2.amount;
    //     // if(newData1){
    //     // }
    //     this.setState({obj3});
    // }
    saveRemark(e){
        var ngList1= this.state.ngList1;
        var input=e.target;
        ngList1.remark=input.value;
        this.setState({ngList1})
    }
    negotiation_stage1(e){
        var ngList1=this.state.ngList1;
        var input=e.target;
        ngList1.negotiation_stage1=input.value ;
        this.setState({
            ngList1
        });
    }
    negotiation_stage2(e){
        var ngList1=this.state.ngList1;
        var input=e.target;
        ngList1.negotiation_stage2=input.value;
        this.setState({
            ngList1
        });
    }
    negotiation_stage3(e){
        var ngList1=this.state.ngList1;
        var input=e.target;
        ngList1.negotiation_stage3=input.value;
        this.setState({
            ngList1
        });
    }
    sendEmail = (i) => {
        var quoteObj = this.state.quoteObj;
        var prod = this.props.parentObj.products[i];
        axios.patch(Const.server_url + Const.context_path + "quotations/" + quoteObj.id + "/products/" + prod.id)
        .then(res => {
            prod.status = 'Email Sent';
            this.setState({ quoteObj });
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
                {(this.state.quoteObj.status === 'Rejected' || this.state.quoteObj.status === null) ? null: 
                <div>
                    {this.state.loading && <PageLoader />}
                    <Modal isOpen={this.state.modalnegatation} backdrop="static" toggle={this.toggleModalNegotation1} size={'lg'}>
                        <ModalHeader toggle={this.toggleModalNegotation1}>
                            Negotation Products : {this.state.purchProdObj.id}
                        </ModalHeader> 
                        <ModalBody>               
                            <div className="row">
                                <div className="col-md-12">
                                    <Table hover responsive>
                                        <tbody>
                                            {this.props.parentObj.products.map((product, i) => {
                                                return(<div>
                                                {product.id===this.state.purchProdObj.id &&                
                                                    <tr key={i}>
                                                        <td className="va-middle">{i + 1}</td>
                                                        <td className="va-middle">
                                                            <fieldset>
                                                                <FormControl>
                                                                    <Link to={`/products/${product.product.id}`}>
                                                                        {product.product.name}
                                                                    </Link>
                                                                    {!this.state.purchProdObj.id &&
                                                                        <AutoSuggest url="products"
                                                                            name="productName"
                                                                            fullWidth={true}
                                                                            displayColumns="name"
                                                                            label="Product"
                                                                            placeholder="Search product by name"
                                                                            arrayName="products"
                                                                            // helperText={errors?.productName_auto_suggest?.length > 0 ? errors?.productName_auto_suggest[i]?.msg : ""}
                                                                            // error={errors?.productName_auto_suggest?.length > 0}
                                                                            inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                                            // onRef={ref => (this.productASRef[i] = ref)}
                                                                            projection="product_auto_suggest"
                                                                            //value={this.state.formWizard.selectedProducts[i]}
                                                                            //onSelect={e => this.setProductAutoSuggest(i, e?.id)}
                                                                            queryString="&name" >
                                                                        </AutoSuggest>
                                                                    }
                                                                </FormControl>
                                                            </fieldset>
                                                        </td>
                                                        <td>
                                                            <fieldset>
                                                                <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                                                    //inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                    inputProps={{ readOnly: true }}
                                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                                    // error={errors?.quantity?.length > 0}
                                                                    value={this.state.purchProdObj.quantity} 
                                                                    onChange={(e)=>this.saveQuantity(e)}
                                                                    //onChange={e => this.setProductField(i, "quantity", e)}
                                                                />
                                                            </fieldset>
                                                        </td>
                                                        <td>
                                                            <fieldset>
                                                                <UOM required={true}
                                                                    value={this.state.purchProdObj.uom} onChange={(e)=>this.saveUom(e)} isReadOnly={true}
                                                                    //onChange={e => this.setProductField(i, "uom", e, true)}
                                                                />
                                                            </fieldset>
                                                        </td>
                                                        <td>
                                                            <fieldset>
                                                                <TextField type="number" name="amount" label="Amount" required={true}
                                                                    inputProps={{ readOnly: true }}
                                                                    //inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                    // helperText={errors?.amount?.length > 0 ? errors?.amount[i]?.msg : ""}
                                                                    // error={errors?.amount?.length > 0}
                                                                    value={this.state.purchProdObj.amount} onChange={(e)=>this.saveProduct(e)} />
                                                            </fieldset>
                                                        </td>
                                                        <td className="va-middle">
                                                            {/* <Button variant="outlined" color="secondary" size="sm" onClick={e => this.deleteProduct(i)} title="Delete Product">
                                                                <em className="fas fa-trash"></em>
                                                            </Button> */}
                                                        </td>
                                                    </tr>
                                                }</div>);
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                            <div>              
                                <div>     
                                    <div className="row">  
                                        <div className="col-md-4">
                                            <strong>Negotiation Stage1 :</strong>
                                        </div>
                                        <div className="col-md-5">  
                                            {!this.state.ngList1.ns1_readOnly ?
                                            <TextField type="number" name="negotiation_stage1" label="Amount" required={true} 
                                            value={this.state.ngList1.negotiation_stage1} onChange={(e) => this.negotiation_stage1(e)}/>:
                                            <TextField type="number" name="negotiation_stage1" label="Amount" required={true}  inputProps={{ readOnly: true }}
                                            value={this.state.ngList1.negotiation_stage1} onChange={(e) => this.negotiation_stage1(e)}/>
                                            }
                                        </div>
                                    </div>
                                    {this.state.ngList1.ns1_readOnly &&
                                        <div className="row">
                                            <div className="col-md-4">
                                                <strong>Negotiation Stage2 :</strong>
                                            </div>
                                            <div className="col-md-5">
                                                {!this.state.ngList1.ns2_readOnly ?    
                                                    <TextField type="number" name="negotiation_stage2" label="Amount" required={true} 
                                                    value={this.state.ngList1.negotiation_stage2} onChange={(e) => this.negotiation_stage2(e)}/>:
                                                    <TextField type="number" name="negotiation_stage2" label="Amount" required={true}  inputProps={{ readOnly: true }}
                                                    value={this.state.ngList1.negotiation_stage2} onChange={(e) => this.negotiation_stage2(e)}/>
                                                }
                                            </div>
                                        </div>
                                    }
                                    {(this.state.ngList1.ns1_readOnly && this.state.ngList1.ns2_readOnly) &&
                                        <div className="row">
                                            <div className="col-md-4">
                                                <strong>Negotiation Stage3 :</strong>
                                            </div>
                                            <div className="col-md-5"> 
                                                {!this.state.ngList1.ns3_readOnly ?    
                                                    <TextField type="number" name="negotiation_stage3" label="Amount" required={true} 
                                                    value={this.state.ngList1.negotiation_stage3} onChange={(e) => this.negotiation_stage3(e)}/>:  
                                                    <TextField type="number" name="negotiation_stage2" label="Amount" required={true}  inputProps={{ readOnly: true }}
                                                    value={this.state.ngList1.negotiation_stage3} onChange={(e) => this.negotiation_stage3(e)}/>
                                                }
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                            <br/><br/><br/>    
                            <div className="col-md-5  offset-md-3 " style={{marginTop:"-30px",marginBottom:"-3px"}}>
                                <fieldset>
                                    <TextareaAutosize placeholder="Remark" fullWidth={true} rowsMin={3} name="remark"
                                        style={{padding: 10}}
                                        //    inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                        //     helperText={errors?.description?.length > 0 ? errors?.description[0]?.msg : ""}
                                        //     error={errors?.description?.length > 0}
                                        value={this.state.ngList1.remark} onChange={(e) => this.saveRemark(e)}
                                    />
                                </fieldset>
                            </div>
                            <div className="text-center">
                                <Button variant="contained" color="primary" onClick={()=>this.saveNegotiation(this.state.purchProdObj.id)} >Save</Button>
                            </div>
                        </ModalBody>
                    </Modal>
                    <Modal isOpen={this.state.modalRemark} backdrop="static" toggle={this.toggleRemark} size={'md'}>
                        <ModalHeader toggle={this.toggleRemark}>
                            <span ><b>Remarks </b></span>
                            <hr style={{ width: "400px", border: "0.5px solid rgba(0, 0, 0, 0.42)" }}></hr>
                            {Object.keys(this.state.remarksObj).length>0 &&
                                <div>
                                    <td>Product Name :
                                        <Link to= {`/products/${this.state.remarksObj.productId}`}>
                                            {this.state.remarksObj.productName}
                                        </Link>
                                    </td>
                                    purchase Product Id : {this.state.remarksObj.purchaseProductId}
                                </div>
                            }
                        </ModalHeader>
                        <ModalBody>
                            {Object.keys(this.state.remarksObj).length>0 &&
                            <Table style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }}>
                                <tbody>
                                    <tr style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }} >
                                        <td style={{ width: '35px' ,border: '1px solid rgba(0, 0, 0, 0.42)'}}>Negotiation Stage 1</td>
                                        <td style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }}>
                                            {this.state.remarksObj ? this.state.remarksObj.ns1_remark: '-No Remarks-'}
                                            {this.state.remarksObj?this.findStatus(this.state.remarksObj.productId,"ng1"):''}
                                        </td>
                                    </tr>
                                    <tr style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }}>
                                        <td style={{ width: '35px', border: '1px solid rgba(0, 0, 0, 0.42)' }}>Negotiation Stage 2</td>
                                        <td style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }}>
                                            {this.state.remarksObj ? this.state.remarksObj.ns2_remark: '-No Remarks-'}
                                            {this.state.remarksObj?this.findStatus(this.state.remarksObj.productId,"ng2"):''}
                                        </td>
                                    </tr>
                                    <tr style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }} >
                                        <td style={{ width: '35px', border: '1px solid rgba(0, 0, 0, 0.42)' }}>Negotiation Stage 3</td>
                                        <td style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }}>
                                            {this.state.remarksObj ? this.state.remarksObj.ns3_remark: '-No Remarks-'}
                                            {this.state.remarksObj?this.findStatus(this.state.remarksObj.productId,"ng3"):''}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>}
                        </ModalBody>
                    </Modal>
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
                                            <th>Recieved Date</th>
                                            <th>Created On</th>
                                            <th>Expiry Date</th>
                                        </tr>
                                    </thead>        
                                    <tbody className="card-body bb bt" hover responsive>
                                        <tr>
                                            <td>{this.state.quoteObj.code}</td>
                                            <td>{this.state.quoteObj.mailSetnDate?<Moment format="DD MMM YY">{this.state.quoteObj.creationDate}</Moment>:'-NA-'}</td>
                                            <td>{'-NA-'}</td>
                                            <td><Moment format="DD MMM YY">{this.state.quoteObj.creationDate}</Moment></td>
                                            <td><Moment format="DD MMM YY">{this.state.quoteObj.validTill}</Moment></td>
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
                                {this.state.quoteObj &&
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
                                                        <th>View Remark</th>
                                                        <th>Actions</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                {this.state.purchaseEnqObj.products &&
                                                <tbody>
                                                    {this.state.purchaseEnqObj.products.map((product, i) => {
                                                        console.log("ngtrack length",this.state.ngTracking.length);
                                                        console.log("ngtrack some of"+product.product.id,this.state.ngTracking.some(p =>p.product.id === product.product.id),product);
                                                    if((this.state.ngTracking.length < 1 && (product.status === null || product.status === 'Pending')) ||
                                                    (this.state.ngTracking.length>0 && !this.state.ngTracking.some(p =>p.product.id === product.product.id) && !(product.status === 'Rejected' || product.status === 'Approved'))){
                                                        return null;
                                                    }
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
                                                        <button className="btn btn-primary"  onClick={()=>this.toggleRemarkNegotiation(product.id)}  >< VisibilityRoundedIcon  size="medium" style={{marginLeft: 20}} color="primary" aria-label=" VisibilityRoundedIcon" /></button>
                                                        </td>
                                                        <td>
                                                        <Button color='primary' size='small' disabled={product.status==='Approved'} onClick={()=>this.toggleModalNegotation(product.id)} variant="contained">Negotiation</Button>
                                                        </td>
                                                        {/* <td>
                                                            <Button variant="contained" color="primary" size="sm" onClick={() => this.sendEmail(i)}><EmailIcon fontSize="small"style={{color:'#fff'}}></EmailIcon> </Button>
                                                        </td> */}
                                                        {this.state.ngTracking.map((ng) => {
                                                        return (<div>
                                                        {product.product.id===ng.product.id && <div>
                                                        <td>
                                                            {ng.status===null ? <div>
                                                                <span className="badge badge-secondary">Pending</span></div> :<div>
                                                                {product.status === 'Rejected' ? <div>
                                                                    <span className="badge badge-danger">{product.status}</span></div>:<div>
                                                                    <span className="badge badge-success">{product.status}</span></div>
                                                                }
                                                                </div>
                                                            }
                                                        </td>
                                                        </div>
                                                            }</div>)})}    
                                                    </tr>)})}
                                                </tbody>}
                                            </Table>
                                        </div>
                                    </div>}
                                    {this.state.quoteObj &&
                                        <div className="card b" style={{marginTop: 0}}>
                                            <div className="card-body bb bt">
                                                <div className=" row text-left mt-4">
                                                    <div className="col-sm-12" >
                                                    <h4 style={{fontSize: 18,flexDirection: 'row'}}>Product Negotiation Tracking </h4>
                                                    </div>
                                                </div>
                                                <Table hover responsive >
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Product</th>
                                                            <th>Quantity</th>
                                                            <th>Price Quoted</th>
                                                            <th>Negotiation Stage 1</th>
                                                            <th>Negotiation Stage 2</th>
                                                            <th>Negotiation Stage 3</th>
                                                        </tr>                                         
                                                    </thead>
                                                    <tbody>
                                                        {this.state.ngTracking.map((product, i) => {
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
                                                                    <td>{product.negotiation_stage1} <br/>
                                                                    { this.findStatus(product.product.id,"ng1")}
                                                    
                                                                    </td>
                                                                    <td>{product.negotiation_stage2}
                                                                    <br/>
                                                                    { this.findStatus(product.product.id,"ng2")}
                                                                </td>
                                                                    
                                                                    <td>{product.negotiation_stage3} <br/>
                                                                    { this.findStatus(product.product.id,"ng3")}
                                                                    </td>
                                                                </tr>
                                                            )
                                                            })}
                                                        </tbody>
                                                </Table>
                                                <div className ="row text-center">{this.state.page}</div>
                                            </div>
                                        </div>
                                    }
                                    {/* {!this.state.quoteObj &&
                                    <div className="text-center">
                                        {this.props.user.permissions.indexOf(Const.MG_PR_E) >=0 && <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Generate Quotation</Button>}
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
                    </div>}</div>)
    }
}
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(Negotiation);
const Span1 = styled.span`
    padding-top: 1em;
    white-space: nowrap;
    float: left;
  `;
const Span2 = styled.span`
    padding-top: 1em;
    white-space: nowrap;
    font-size: 16px;
    margin-left : auto;
    margin-right:auto;
  `;