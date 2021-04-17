import { Button, Card, TextField } from '@material-ui/core';
import axios from 'axios';
import React, { Component } from 'react';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Modal,

    ModalBody, ModalHeader, Table
} from 'reactstrap';
import swal from 'sweetalert';
import { context_path, server_url } from '../Common/constants';
import CustomPagination from '../Common/CustomPagination';
import PageLoader from '../Common/PageLoader';
import ContentWrapper from '../Layout/ContentWrapper';



class Groups extends Component {
    state = {
        loading: false,
        modal1: false,
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            search: ''
        },
        groups: [],
        editFlag: false,
        currentGroup: '',
        newObj: {
            name: ''
        },
        addError: '',
        deleteError: '',
        updateError: ''
    };

    loadGroups(offset) {
        if (!offset) offset = 1;
        var url = server_url + context_path + "api/groups?sort=id,desc&page=" + (offset - 1) + "&uid=" + this.props.user.id;

        if (this.state.filters.search) {
            url += "&name=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }

        axios.get(url)
            .then(res => {
                res.data._embedded.groups.forEach(function (dx, idx) {
                    dx.index = idx;
                });

                this.setState({
                    groups: res.data._embedded.groups,
                    page: res.data.page
                });
            })
    }

    componentDidMount() {
        this.loadGroups();
    }

    searchObject = e => {
        var str = e.target.value;
        var filters = this.state.filters;

        filters.search = str;
        this.setState({ filters }, o => { this.loadGroups() });
    }

    deleteGroup(idx) {
        axios.delete(server_url + context_path + "api/groups/" + this.state.groups[idx].id)
            .then(res => {
                this.state.groups.splice(idx, 1);
                this.setState({ groups: this.state.groups });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                this.setState({ deleteError: err.response.data.globalErrors[0] });
                swal("Unable to Add!", err.response.data.globalErrors[0], "error");
            })
    }

    openGroupContacts(idx) {
        this.location.href = 'groups/' + this.state.groups[idx].id;
    }

    setObjField(field, e) {
        var newObj = this.state.newObj;
        newObj[field] = e.target.value;
        this.setState({ newObj });
      }

    toggleModal1 = () => {
        this.setState({
            modal1: !this.state.modal1
        });
    }


    resetGroup() {
        var newObj = {
            name: ''
        }

        this.setState({ newObj });
    }

    addGroup = () => {
        this.resetGroup();
        this.setState({ editFlag: false });

        this.toggleModal1();
    }

    editGroup = (i) => {
        var group = this.state.groups[i];

        this.setState({ newObj: group });
        this.setState({ editFlag: true });

        this.toggleModal1();
    }

    onSubmit = e => {
        e.preventDefault();

        var url = server_url + context_path + "api/groups/";

        var newObj = this.state.newObj;

        this.setState({ loading: true });

        if (this.state.editFlag) {
            url += this.state.newObj.id;

            axios.patch(url, { name: newObj.name })
                .then(res => {
                    this.toggleModal1();

                    if (res.status === 200) {
                        var groups = this.state.groups;
                        groups[this.state.newObj.index] = newObj;

                        this.setState({ groups });
                    } else {
                        this.setState({ addError: res.response.data.globalErrors[0] });
                        swal("Unable to Edit!", res.response.data.globalErrors[0], "error");
                    }
                }).finally(() => {
                    this.setState({ loading: false });
                })
        } else {
            newObj.uid = this.props.user.id;

            axios.post(url, newObj)
                .then(res => {
                    this.toggleModal1();


                    var groups = this.state.groups;
                    groups.unshift(res.data);

                    this.setState({ groups });
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    this.toggleModal1();
                    this.setState({ addError: err.response.data.globalErrors[0] });
                    swal("Unable to Add!", err.response.data.globalErrors[0], "error");
                })
        }
    }

    render() {
        const CSS = '.content-wrapper .btn { margin: 0 4px 4px 0 }';

        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <style>{CSS}</style>
                <div className="content-heading">
                    <div>
                        Groups
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <Card className="card-default">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col-md-2 offset-md-2">
                                        <h4 className="float-right">Filters : </h4>
                                    </div>
                                    <div className="col-md-4">
                                        <TextField
                                            type="text"
                                            label="search group"
                                            fullWidth={true}
                                            value={this.state.filters.search}
                                            onChange={this.searchObject}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <Button className="btn btn-raised btn-primary float-right" variant="contained" color="primary" size="xs"  onClick={() => this.addGroup()}>Add Group</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <Modal isOpen={this.state.modal1} toggle={this.toggleModal1}>
                                    <ModalHeader toggle={this.toggleModal1}>
                                        {this.state.editFlag && <span>Edit </span>}
                                        {!this.state.editFlag && <span>Add </span>}
                                        Group
                                    </ModalHeader>
                                    <ModalBody>
                                        <form className="form-horizontal" onSubmit={this.onSubmit}>
                                            <fieldset>
                                                <div className="form-group row mb">
                                                    <div className="col-md-10 offset-md-2">
                                                        <TextField
                                                            type="text"
                                                            label="name"
                                                            required={true}
                                                            fullWidth={true}
                                                            inputProps={{ minLength: 5, maxLength: 30 }}
                                                            value={this.state.newObj.name}
                                                            onChange={e => this.setObjField('name', e)} />
                                                    </div>
                                                </div>
                                            </fieldset>

                                            <fieldset>
                                                <div className="form-group text-center">
                                                    <Button variant="contained" color="primary" type="submit" className="btn btn-raised btn-primary">Save Group</Button>
                                                </div>
                                            </fieldset>
                                        </form>
                                    </ModalBody>
                                </Modal>
                                <Table hover responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Created On</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.groups.map((group, i) => {
                                            return (
                                                <tr key={group.id}>
                                                    <td>{i + 1}</td>
                                                    <td>
                                                        <Link to={`/groups/${group.id}`}>{group.name}</Link>
                                                    </td>
                                                    <td>
                                                        <Moment format="DD MMM YY HH:mm">{group.creationDate}</Moment>
                                                    </td>
                                                    <td>
                                                        <Button variant="contained" color="inverse" size="xs" onClick={() => this.editGroup(i)}>Edit</Button>
                                                        <Link to={`/groups/${group.id}`}>
                                                            <Button variant="contained" color="info" size="xs">Contacts</Button>
                                                        </Link>
                                                        <Button variant="contained" color="warning" size="xs" onClick={() => this.deleteGroup(i)}>Delete</Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>

                                <CustomPagination page={this.state.page} onChange={(x) => this.loadGroups(x)} />
                            </div>
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
)(Groups);