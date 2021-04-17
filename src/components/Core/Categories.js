import React, { Component } from 'react';
import PageLoader from '../Common/PageLoader';
import ContentWrapper from '../Layout/ContentWrapper';
import {
    Button,
    Col,
    Card,
    CardBody,
    Input,
    Modal,
    ModalHeader,
    ModalBody
} from 'reactstrap';

import swal from 'sweetalert';
import axios from 'axios';
import { connect } from 'react-redux';
// import Moment from 'react-moment';
// import { Link } from 'react-router-dom';
import CustomPagination from '../Common/CustomPagination';
import CategoryTree from '../Common/CategoryTree';
import { server_url, context_path } from '../Common/constants';

class Categories extends Component {
    state = {
        loading: false,
        modal: false,
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            search: ''
        },
        type: '',
        typeName: '',
        typePath: '',
        categories: [],
        editFlag: false,
        currentCategory: '',
        newCategory: {
            name: '',
            type: '',
        },
        superCategory: '',
        addError: '',
        deleteError: '',
        updateError: ''
    };

    updateParent = (categories, parent) => {
        for(var x in categories) {
            var dx = categories[x];
            dx.index = x;
            dx.parent = parent;

            if(dx.children.length) {
                this.updateParent(dx.children, dx);
            }
        }
    }

    loadCategories(offset) {
        if (!offset) offset = 1;
        var url = server_url + context_path + "/api/categories?projection=category_all&lineage=null&sort=lineage,asc&page=" + (offset - 1) + "&uid=" + this.props.user.id;

        if (this.state.type) {
            url += "&type=" + this.state.type;
        }

        if (this.state.filters.search) {
            url += "&name=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }

        axios.get(url)
            .then(res => {
                this.updateParent(res.data._embedded.categories, null);

                this.setState({
                    categories: res.data._embedded.categories,
                    page: res.data.page
                });
            })
    }

    componentDidMount() {
        var path = this.props.match.path.substr(1);
        path = path.substr(0, path.indexOf('/'));

        var newCategory = this.state.newCategory;
        newCategory.type = path.substr(0, 4);
        var typeName = path.endsWith('s') ? path.substr(0, path.length - 1) : path;

        this.setState({
            typePath: path,
            type: newCategory.type,
            typeName: typeName.charAt(0).toUpperCase() + typeName.slice(1),
            newCategory: newCategory
        }, o => {this.loadCategories()});
    }

    searchUser = e => {
        var str = e.target.value;
        var filters = this.state.filters;

        filters.search = str;
        this.setState({ filters }, o => { this.loadCategories() });
    }

    updateNewCategory = e => {
        var newCategory = this.state.newCategory;
        newCategory.name = e.target.value;
        this.setState({ newCategory });
    }

    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }


    resetCategory() {
        var newCategory = {
            name: '',
            type: this.state.type
        }

        this.setState({ newCategory });
    }

    addCategory = (superCategory) => {
        this.resetCategory();
        this.setState({ superCategory });
        this.setState({ editFlag: false });

        this.toggleModal();
    }

    editCategory = (newCategory) => {
        this.setState({ newCategory });
        this.setState({ superCategory: newCategory.parent });
        this.setState({ editFlag: true });

        this.toggleModal();
    }

    getIndexArr(child) {
        var arr = [];
        while(child.parent) {
            arr.unshift(child.index);
            child = child.parent;
        }

        arr.unshift(child.index);

        return arr;
    }

    getChildrenArr(category, categories) {
        var indexArr = this.getIndexArr(category.parent);
        var children = categories;
        for(var x in indexArr) {
            children = children[indexArr[x]].children;
        }

        return children;
    }

    onSubmit = e => {
        e.preventDefault();

        var url = server_url + context_path + "/api/categories/";

        var newCategory = this.state.newCategory;

        this.setState({ loading: true });

        if (this.state.editFlag) {
            url += this.state.newCategory.id;

            axios.patch(url, { name: newCategory.name })
                .then(res => {
                    this.toggleModal();

                    if (res.status === 200) {
                        var categories = this.state.categories;

                        var children = this.getChildrenArr(newCategory, categories);

                        console.log(newCategory);
                        console.log(children);

                        children[newCategory.index] = newCategory;

                        this.setState({ categories });
                    } else {
                        this.setState({ addError: res.response.data.globalErrors[0] });
                        swal("Unable to Edit!", res.response.data.globalErrors[0], "error");
                    }
                }).finally(() => {
                    this.setState({ loading: false });
                })
        } else {
            if(this.state.superCategory) {
                newCategory.parentCategory = this.state.superCategory.id;
                newCategory.lineage = (this.state.superCategory.lineage ? this.state.superCategory.lineage : '$') + this.state.superCategory.id + '$';
            } else {
                newCategory.menu = true;
            }

            newCategory.uid = this.props.user.id;
            newCategory.active = true;

            axios.post(url, newCategory)
            .then(res => {
                this.toggleModal();

                if (res.status === 201) {
                    var categories = this.state.categories;

                    var category = res.data;
                    category.parent = this.state.superCategory;
                    category.children = [];

                    var children = this.getChildrenArr(category, categories);

                    children.unshift(res.data);

                    children.forEach(function(dx, idx) {
                        dx.index = idx;
                    })

                    this.setState({ categories });
                } else {
                    this.setState({ addError: res.response.data.globalErrors[0] });
                    swal("Unable to Add!", res.response.data.globalErrors[0], "error");
                }
            }).finally(() => {
                this.setState({ loading: false });
            })
        }
    }

    
    deleteCategory = (category) => {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Category!",
            icon: "warning",
            dangerMode: true,
            button: {
                text: "Yes, delete it!",
                closeModal: true,
            }
        })
        .then(willDelete => {
            if (willDelete) {
                axios.delete(server_url + context_path + "/api/categories/" + category.id)
                    .then(res => {
                        var categories = this.state.categories;

                        var children = this.getChildrenArr(category, categories);

                        children.splice(category.index, 1);

                        children.forEach(function(dx, idx) {
                            dx.index = idx;
                        })
                        
                        this.setState({ categories });
                    }).finally(() => {
                        this.setState({ loading: false });
                    }).catch(err => {
                        this.setState({ deleteError: err.response.data.globalErrors[0] });
                        swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                    })
                }
            });
    }

    render() {
        const CSS = '.content-wrapper .btn { margin: 0 4px 4px 0 }';

        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <style>{CSS}</style>
                <div className="content-heading">
                    {this.state.typeName} Categories
                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <Card className="card-default">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col-md-2 offset-md-4">
                                        <h4 className="float-right">Filters : </h4>
                                    </div>
                                    <div className="col-md-4">
                                        <Input type="text" onChange={this.searchUser} value={this.state.filters.search} placeholder="search category..." />
                                    </div>
                                    <div className="col-md-2">
                                        <Button color="success" size="sm" className="float-right" onClick={() => this.addCategory()}>
                                            <i className="fa fa-plus"></i>&nbsp; Add Category
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <CardBody>
                                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                                    <ModalHeader toggle={this.toggleModal}>
                                        {this.state.editFlag && <span>Edit </span>}
                                        {!this.state.editFlag && <span>Add </span>}
                                        Category
                                    </ModalHeader>
                                    <ModalBody>
                                        <form className="form-horizontal" onSubmit={this.onSubmit}>
                                            {this.state.superCategory && 
                                            <fieldset>
                                                <div className="form-category row mb">
                                                    <label className="col-md-4 col-form-label">Super Categories</label>
                                                    <Col md={8}>
                                                        <h3>{this.state.superCategory.name}</h3>
                                                    </Col>
                                                </div>
                                            </fieldset>
                                            }
                                            <fieldset>
                                                <div className="form-category row mb">
                                                    <label className="col-md-4 col-form-label">Name</label>
                                                    <Col md={8}>
                                                        <Input type="text" onChange={this.updateNewCategory} maxLength="20" value={this.state.newCategory.name} required />
                                                    </Col>
                                                </div>
                                            </fieldset>

                                            <fieldset>
                                                <div className="form-category row">
                                                    <div className="col-sm-12 text-center">
                                                        <button type="submit" className="btn btn-primary">Save Category</button>
                                                    </div>
                                                </div>
                                            </fieldset>
                                        </form>
                                    </ModalBody>
                                </Modal>

                                <CategoryTree 
                                typePath={this.state.typePath} 
                                categories={this.state.categories} 
                                addCategory={this.addCategory.bind(this)}
                                editCategory={this.editCategory.bind(this)}
                                deleteCategory={this.deleteCategory.bind(this)} />

                                <CustomPagination page={this.state.page} onChange={(x) => this.loadCategories(x)} />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </ContentWrapper>
        );
    }

}
const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(Categories);