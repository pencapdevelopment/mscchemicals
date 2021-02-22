import { Button, FormControl } from '@material-ui/core';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Form, Modal,
    ModalBody, ModalHeader, Table
} from 'reactstrap';
import swal from 'sweetalert';
import AutoSuggest from '../../Common/AutoSuggest';
import { context_path, server_url } from '../../Common/constants';
import FormValidator from '../../Forms/FormValidator';
import Divider from '@material-ui/core/Divider';
import PageLoader from '../../Common/PageLoader';
// const json2csv = require('json2csv').parse;
class Products extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        viewFlag: false,
        modal: false,
        loading: false,
        type: '',
        newObj: '',
        errors: {},
        products: [],
        selectedProducts: [],
        productsUrl: server_url + context_path + "api/company-products/",
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            search: '',
            fromDate: null,
            toDate: null,
        },
        addressTypes: [
            { label: 'Company HQ', value: 'HQ' },
            { label: 'Branch', value: 'BR' },
            { label: 'Billing', value: 'BI' },
            { label: 'Plant', value: 'PL' },
            { label: 'Warehouse', value: 'WH' }
        ]
    }
    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    getProducts() {
        var newObj = this.state.newObj;
        axios.get(this.state.productsUrl + "?size=100000&projection=company_product&company.id=" + newObj.id + "&type=" + this.state.type)
        .then(res => {
            newObj[this.state.type] = res.data._embedded[Object.keys(res.data._embedded)[0]];
            var selectedProducts = this.state.selectedProducts;
            this.productASRef = [];
            newObj[this.state.type].forEach((p, idx) => {
                selectedProducts[idx] = p;
            });
            this.setState({
                products: cloneDeep(newObj[this.state.type]),
                newObj: newObj,
                selectedProducts: selectedProducts
            });
        })
    }
    setAutoSuggest(idx, val) {
        var products = this.state.products;
        var selectedProducts = this.state.selectedProducts;
        products[idx].product = val;
        selectedProducts[idx] = {id: val};
        products[idx].updated = true;
        this.setState({ products, selectedProducts });
    }
    openProducts = () => {
        this.setState({
            products: cloneDeep(this.state.newObj[this.state.type])
        }, o => {
            if(!this.state.newObj[this.state.type].length) {
                this.addProduct();
            }
            this.toggleModal();
            // setTimeout(() => {
            //     this.state.selectedProducts.forEach((p, idx) => {
            //         this.productASRef[idx].setInitialField(p);
            //     });
            // }, 500);
        });
    }
    addProduct = () => {
        var products = this.state.products;
        var idx = products.length;
        products.push({
            departmentName: '',
            phone: '',
            email: ''
        })
        this.setState({ products }, o => {
            if(idx){
                this.productASRef[idx].setInitialField(this.state.selectedProducts[idx]);
            }
        });
    }
    deleteProduct = (i) => {
        var products = this.state.products;
        if(products[i].id) {
            products[i].delete = true;
        } else {
            products.splice(i, 1);
        }
        this.setState({ products });
    }
    checkForError() {
        // const form = this.formWizardRef;
        const tabPane = document.getElementById('saveCForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        console.log(errors);
        this.setState({errors});
        return hasError;
    }
    saveDetails = () => {
        var hasError = this.checkForError();
        if (!hasError) {
            var products = this.state.products;
            if(products && products.length) {
                this.setState({ loading: true });
                products.forEach((prod, idx) => {
                    if(prod.delete) {
                        axios.delete(this.state.productsUrl + prod.id)
                        .then(res => {
                        }).catch(err => {
                            swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                        })
                    } else if(!prod.id || prod.updated) {
                        prod.company = '/companies/' + this.state.newObj.id;
                        prod.product = '/products/' + prod.product;
                        prod.type = this.state.type;
                        var promise = undefined;
                        if (!prod.id) {
                            promise = axios.post(this.state.productsUrl, prod)
                        } else {
                            promise = axios.patch(this.state.productsUrl + prod.id, prod)
                        }
                        promise.then(res => {
                            prod.id = res.data.id;
                        }).catch(err => {
                            swal("Unable to Save!", "Please resolve the errors", "error");
                        })
                    }
                    if(idx === products.length - 1) {
                        this.setState({ loading: false });
                        setTimeout(() => {
                            this.getProducts();
                            this.toggleModal();
                        }, 5000);
                    }
                })
            } else {
                this.toggleModal();
            }
        }
        return true;
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.setState({newObj: this.props.parentObj, type: this.props.type}, () => {
            this.getProducts();
        });   
        this.props.onRef(this);
    }
    render() {
        const errors = this.state.errors;
        return (
            <div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} size={'lg'}>
                    {this.state.loading && <PageLoader />}
                    <ModalHeader toggle={this.toggleModal}>
                        <h4>
                            Products {this.state.type}
                            <Button className="ml-2" variant="outlined" color="primary" size="sm" onClick={this.addProduct} title="Add Product">
                                <em className="fas fa-plus"></em>
                            </Button>         
                        </h4>
                    </ModalHeader>
                    <ModalBody>
                        <Form className="form-horizontal" innerRef={this.formRef} name="products" id="saveCForm">
                            <div className="row">
                                <div className="col-md-12">
                                    <Table hover responsive>
                                        <tbody>
                                            {this.state.products.map((prod, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td className="va-middle">{i + 1}</td>
                                                        <td>
                                                            <fieldset>
                                                                {prod.id &&
                                                                <span>{prod.product.name}</span>
                                                                }             
                                                                {!prod.id &&                                                                      
                                                                <FormControl>
                                                                    <AutoSuggest url="products"
                                                                        name={"productName"+i}
                                                                        displayColumns="name"
                                                                        label="Product"
                                                                        placeholder="Search Product by name"
                                                                        arrayName="products"
                                                                        helperText={errors && errors.hasOwnProperty("productName"+i+"_auto_suggest") && errors["productName"+i+"_auto_suggest"].length > 0?errors["productName"+i+"_auto_suggest"][0]["msg"]:""}
                                                                        error={errors && errors.hasOwnProperty("productName"+i+"_auto_suggest") && errors["productName"+i+"_auto_suggest"].length > 0}
                                                                        inputProps={{ "data-validate": '[{ "key":"required","msg":"Product Name is required"}]' }}
                                                                        onRef={ref => (this.productASRef[i] = ref)}
                                                                        projection="product_auto_suggest"
                                                                        value={this.state.selectedProducts[i]}
                                                                        onSelect={e => this.setAutoSuggest(i, e?.id)}
                                                                        queryString="&name" ></AutoSuggest>
                                                                </FormControl>}
                                                            </fieldset>
                                                        </td>
                                                        <td className="va-middle">
                                                            <Button variant="outlined" color="secondary" size="sm" onClick={e => this.deleteProduct(i)} title="Delete Product">
                                                                <em className="fas fa-trash"></em>
                                                            </Button>
                                                        </td>
                                                    </tr>)
                                            })}
                                        </tbody>
                                    </Table>            
                                    <div className="text-center">
                                        <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save</Button>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </ModalBody>
                </Modal>
                <div className="row mt-4">
                <div className="col-sm-9 mt-4">
                    <span >  Products  </span> {this.state.type}
                </div>
                <div className="col-sm-3 mt-4">
                    <h4>
                    <Button  size="small" style={{textTransform: 'none', fontWeight: "normal"}} className="ml-3" variant="contained" color="white" size="sm" onClick={this.openProducts} title="Add Product">
                        Add/Update
                    </Button>  
                    </h4>
                </div>
                </div>
                <Divider/>
               <div className="row">
                   <div clasName="col-sm 12">
                   {this.state.newObj[this.state.type] &&
                <Table   hover responsive style={{border: 6 ,borderColor: "#000"}}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.state.newObj[this.state.type].map((product, i) => {
                        return (
                            <tr key={i} >
                                <td className="va-middle">{i + 1}</td>
                                <td>
                                    <Link to={`/products/${product.product.id}`}>
                                        {product.product.name}
                                    </Link>
                                </td>
                            </tr>)
                        })}
                    </tbody>
                </Table>
            }
                   </div>
               </div>           
            </div>)
    }
}
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(Products);