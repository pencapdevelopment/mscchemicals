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
        obj: '',
        obj1:'',
        obj2:'',
        obj3:'',
        obj4:'',
        page:'',
        ngTracking : [],
        remark:'',
        loadData:false,
        baseUrl: 'sales-quotation',
        currentId: '',
        modalnegatation: false,
        modalRemark : false,
        obj4:{
            remark:'',
        }
      
    }


    loadObj(id) {
        axios.get(Const.server_url + Const.context_path + "api/sales-quotation?enquiry.id=" + id + '&projection=sales_quotation_edit').then(res => {
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];
            console.log("loadObj negotiation.js", list)

            if(list.length) {
                this.setState({ obj: list[0], currentId: list[0].id });
                console.log("if negotiation.js", list)
            }
        });
        axios.get( server_url + context_path + "api/sales-negotiation-tracking?projection=sales-negotiation-tracking").then(res => {
            var ngList = res.data._embedded[Object.keys(res.data._embedded)[0]];
            console.log("first ngList loadObj... negotiation.js", ngList)

            if(ngList.length>0){
              this.setState({
                ngTracking:ngList
            });
            }else{
                console.log("ngList")
                this.setState({
                   page:  <Span2>No Records Found</Span2>
                    //
                }); 
            }
            
        });   
    }

    loadObj1(id) {
        axios.get(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "/" + id + '?projection=sales_edit').then(res => {
            console.log("loadObj1 Products", res.data)
            this.setState({ obj1: res.data });
        });

       
    }

    // loadObj2(id) {
    //     axios.get(Const.server_url + Const.context_path + "api/" + this.props.baseUrl + "/" + id + '?projection=sales_edit').then(res => {
    //         var newData=res.data;
    //         this.setState({ obj: newData });
    //     });
    // }





    saveNegotiation= (productsid) => {
        console.log(" save negotiation", productsid);
        var obj2=this.state.obj3;
        console.log(" before assign save negotiation obj2==>", obj2);
        obj2.product = "/products/"+obj2.product.id;
        obj2.reference = "/sales/"+this.state.obj1.id;
        obj2.sales_product = "/sales-product/"+obj2.id;
       
        console.log("with remark product values===>", obj2);    
        
       // console.log("without remark product values===>",obj6);
        //axios.patch(server_url + context_path + "api/sales-products/"+productsid, obj5)
       
        
        axios.patch(server_url + context_path + "api/sales-products/"+productsid,obj2).then(res => {
                       
                        console.log("patch data of sales-products data==>", res.data)
                    });
                   if(obj2)
                   {

                    obj2.remark=this.state.obj4.remark;  

             axios.post( server_url + context_path + "api/sales-negotiation-tracking/", obj2).then(res => {
                        console.log("axios.get  Negotations toggleModal Negotations==>", res.data)
                        console.log("sales-negotiation-tracking data==>", res.data)
                        
                            this.setState({obj2: res.data, modalnegatation:false, loading: false, loadData:true });
                            
                            
                            this.loadObj1(this.props.currentId);
                            console.log("after componentDidMount")
                        });           
                    }
                    // this.componentDidMount();
                    
                   
                }

    toggleModalNegotation = (productId) => {
        console.log("toggleModalNegotation calling ",productId )
        console.log("toggleModalNegotation calling ",productId )

       

        // axios.get( server_url + context_path + "api/sales-products/"+ productId ).then(res => {
        //     console.log("toggleModal Negotations==>", res.data)
        //     console.log("toggleModal Negotations==>", res.data.amount)
          
        //         this.setState({ obj2: res.data, modalnegatation:!this.state.modalnegatation });
        //     });
        axios.get( server_url + context_path + "api/sales-products/"+ productId+"?projection=sales-product" ).then(res => {
            console.log("toggleModal Negotations==>", res.data)
            console.log("toggleModal Negotations==>", res.data.amount)
            var product = this.props.parentObj.products.find(p => p.id === res.data.id);
            console.log("product from parent", product)
          
                this.setState({ obj2: res.data, modalnegatation:!this.state.modalnegatation });
            });
           

            }
 
    
    toggleRemarkNegotiation = (productId) => {
        axios.get( server_url + context_path + "api/sales-products/"+ productId ).then(res => {
            console.log("toggleRemarkNegotiation==>", res.data)
            console.log("toggleRemarkNegotiation==>", res.data)
          
                this.setState({ obj4: res.data, modalRemark:!this.state.modalRemark });
            });

        
    }

    toggleModalNegotation1= () => {
        this.setState({
            modalnegatation: false
         });
    }

    componentDidUpdate(){
        console.log("componentDidUpdate", this.state.obj2);
        console.log("Negotiation.js.. modalnegatation:- ", this.state.modalnegatation)
    }


    toggleRemark = () => {
        this.setState({
           modalRemark: false
        });
    };


    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        // console.log('quotation component did mount');
        console.log("componentDidMount Negotiation", this.props.currentId);
        this.loadObj(this.props.currentId);
        this.loadObj1(this.props.currentId);
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

    saveProduct(e) {
        console.log("saveProduct");
        var obj3 = this.state.obj2;
        console.log("saveProduct", obj3);
        var input=e.target;
        obj3.amount=input.value;
        //obj3.uom=input.value;
        // var newData1=this.state.obj2.amount;
        // if(newData1){
           
        // }
        this.setState({obj3});

    }

    saveUom(e) {
        console.log("saveUom");
        var obj3 = this.state.obj2;
        var input=e.target;
        //obj3.amount=input.value;
        obj3.uom=input.value;
        // var newData1=this.state.obj2.amount;
        // if(newData1){
           
        // }
        this.setState({obj3});

    }

    saveQuantity(e) {
        console.log("saveUom");
        var obj3 = this.state.obj2;
        var input=e.target;
        //obj3.amount=input.value;
        obj3.quantity=input.value;
        // var newData1=this.state.obj2.amount;
        // if(newData1){
           
        // }
        this.setState({obj3});

    }

    saveRemark(e){
        console.log("saveRemark");
        var obj4= this.state.obj4;
        var input=e.target;
        obj4.remark=input.value;
        this.setState({obj4})
        console.log("save Remark value===>", obj4);

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
                {this.state.loading && <PageLoader />}
                <Modal isOpen={this.state.modalnegatation} backdrop="static" toggle={this.toggleModalNegotation1} size={'lg'}>
                     <ModalHeader toggle={this.toggleModalNegotation1}>
                        Negotation Products : {this.state.obj2.id}
                    </ModalHeader> 
                    <ModalBody>
                   
                            <div className="row">
                                <div className="col-md-12">
                                    <Table hover responsive>
                                        <tbody>
                                        {this.props.parentObj.products.map((product, i) => {
                                            return(<div>
                                            {product.id===this.state.obj2.id &&
                                       
                                               
                                                    <tr key={i}>
                                                        <td className="va-middle">{i + 1}</td>
                                                        <td className="va-middle">
                                                            <fieldset>
                                                                <FormControl>
                                                                   
                                                                        <Link to={`/products/${product.product.id}`}>
                                                                            {product.product.name}
                                                                        </Link>
                                                                    
                                                                    {!this.state.obj2.id &&
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
                                                                            queryString="&name" ></AutoSuggest>}
                                                                </FormControl>
                                                            </fieldset>
                                                        </td>
                                                        <td>
                                                            <fieldset>

                                                                <TextField type="number" name="quantity" label="Quantity" required={true} fullWidth={true}
                                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                    // helperText={errors?.quantity?.length > 0 ? errors?.quantity[i]?.msg : ""}
                                                                    // error={errors?.quantity?.length > 0}
                                                                    value={this.state.obj2.quantity} 
                                                                    onChange={(e)=>this.saveQuantity(e)}
                                                                    //onChange={e => this.setProductField(i, "quantity", e)}
                                                                     />
                                                            </fieldset>
                                                        </td>
                                                        <td>
                                                            <fieldset>

                                                                <UOM required={true}
                                                                    value={this.state.obj2.uom} onChange={(e)=>this.saveUom(e)}
                                                                    //onChange={e => this.setProductField(i, "uom", e, true)}
                                                                     />
                                                            </fieldset>
                                                        </td>
                                                        <td>
                                                            <fieldset>

                                                                <TextField type="number" name="amount" label="Amount" required={true}
                                                                    inputProps={{ maxLength: 8, "data-validate": '[{ "key":"required"},{"key":"maxlen","param":"10"}]' }}
                                                                    // helperText={errors?.amount?.length > 0 ? errors?.amount[i]?.msg : ""}
                                                                    // error={errors?.amount?.length > 0}
                                                                    value={this.state.obj2.amount} onChange={(e)=>this.saveProduct(e)} />
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
                            <div className="col-md-5  offset-md-3 " style={{marginTop:"-30px",marginBottom:"-3px"}}>
                            <fieldset>
                                <TextareaAutosize placeholder="Remark" fullWidth={true} rowsMin={3} name="remark"
                                   style={{padding: 10}}
                                //    inputProps={{ maxLength: 100, "data-validate": '[{maxLength:100}]' }} required={true}
                                //     helperText={errors?.description?.length > 0 ? errors?.description[0]?.msg : ""}
                                //     error={errors?.description?.length > 0}
                                    value={this.state.obj4.remark} onChange={(e) => this.saveRemark(e)}
                                    />
                            </fieldset>
                            </div>

                        <div className="text-center">
                            <Button variant="contained" color="primary" onClick={()=>this.saveNegotiation(this.state.obj2.id)} >Save</Button>
                        </div>
                    </ModalBody>
                </Modal>
  <Modal isOpen={this.state.modalRemark} backdrop="static" toggle={this.toggleRemark} size={'md'}>
  
                    
                    <ModalHeader toggle={this.toggleRemark}>
                    <span ><b>Remarks </b>
                       </span>
                       <hr style={{ width: "400px", border: "0.5px solid rgba(0, 0, 0, 0.42)" }}></hr>
                    
                   
                   
                    {this.props.parentObj.products.map((product, i) => {
                                            return(<div>
                    
                                            {product.id===this.state.obj4.id && 
                                             <td>
                                                Product Name :  
                                             <Link to= {`/products/${product.product.id}`}>
                                                 {product.product.name}
                                                 
                                             </Link>
                                         </td> }</div>)})}  
                                         Product Id :    {this.state.obj4.id}
                    </ModalHeader>
                    <ModalBody>
                        <Table style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }}>
                            <tbody>
                                <tr style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }} >
                                    <td style={{ width: '35px' ,border: '1px solid rgba(0, 0, 0, 0.42)'}}>Negotiation</td>
                                    {this.props.parentObj.products.map((product, i) => {
                                        return (
                                            <div >
                                                {product.id === this.state.obj4.id &&
                                                    <td  >

                                                        {!product.status && '-No Remarks-'}
                                                        {product.status && <span className="badge badge-success">{product.status}</span>}

                                                    </td>
                                                }
                                            </div>
                                        )
                                    })}
                                </tr>
                                <tr style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }}>
                                    <td style={{ width: '35px', border: '1px solid rgba(0, 0, 0, 0.42)' }}>Negotiation
                                    Stage 1
                                 </td>
                                    {this.props.parentObj.products.map((product, i) => {
                                        return (
                                            <div >
                                                {product.id === this.state.obj4.id &&
                                                    <td  >

                                                        {!product.status && '-No Remarks-'}
                                                        {product.status && <span className="badge badge-success">{product.status}</span>}

                                                    </td>
                                                }
                                            </div>
                                        )
                                    })}
                                </tr>

                                <tr style={{ border: '1px solid rgba(0, 0, 0, 0.42)' }} >
                                    <td style={{ width: '35px', border: '1px solid rgba(0, 0, 0, 0.42)' }}>Negotiation
                                    Stage 2
                             </td>
                                    {this.props.parentObj.products.map((product, i) => {
                                        return (
                                            <div>
                                                {product.id === this.state.obj4.id &&
                                                    <td>

                                                        {!product.status && '-No Remarks-'}
                                                        {product.status && <span className="badge badge-success">{product.status}</span>}

                                                    </td>
                                                }
                                            </div>
                                        )
                                    })}

                                </tr>

                            </tbody>
                        </Table>
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
                                       
                                        {this.state.obj1.products &&
                                        <tbody>
                                        {this.state.obj1.products.map((product, i) => {
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
                                                        
                                                    <Button color='primary' size='small'  onClick={()=>this.toggleModalNegotation(product.id)} variant="contained">Negotiation</Button>
                                                    </td>
                                                    <td>
                                                        {!product.status && '-NA-'}
                                                        {product.status && <span className="badge badge-success">{product.status}</span>}
                                                    </td>
                                                    {/* <td>
                                                        <Button variant="contained" color="primary" size="sm" onClick={() => this.sendEmail(i)}><EmailIcon fontSize="small"style={{color:'#fff'}}></EmailIcon> </Button>
                                                    </td> */}
                                                </tr>
                                            )
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
                                                        <td>{product.negotiation}</td>
                                                        <td>{product.negotiation_stage1}</td>
                                                        <td>{product.negotiation_stage2}</td>
                                                    </tr>
                                                )
                                                })}
                                            </tbody>
                                    </Table>
                                    <div className ="row text-center">{this.state.page}</div>
                              
                                    
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