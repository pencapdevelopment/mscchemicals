import { Button } from '@material-ui/core';
import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Modal,

    ModalBody, ModalHeader
} from 'reactstrap';
import swal from 'sweetalert';
import AutoSuggest from '../../Common/AutoSuggest';
import { context_path, server_url } from '../../Common/constants';
import CustomPagination from '../../Common/CustomPagination';
import PageLoader from '../../Common/PageLoader';



class Assign extends Component {
    state = {
        modal: false,
        loading: false,
        error: {},
        objects: [],
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        user: '',
        selectedUser: ''
    }

    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        // console.log('assign component did mount');
        // console.log(this.props.currentId);
        this.props.onRef(this);

        this.loadObjects();
    }

    setAutoSuggest(field, val) {
        this.setState({ user: val });
    }

    loadObjects() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "-user?projection=" + 
        this.props.baseUrl + "-user&reference=" + this.props.currentId).then(res => {
            this.setState({
                objects: res.data._embedded[Object.keys(res.data._embedded)[0]],
                page: res.data.page
            });
        });
    }

    saveUser() {
        var user = {
            active: true,
            user: '/users/' + this.state.user,
            reference: "/" + this.props.baseUrl + "/" + this.props.currentId
        };

        this.setState({ loading: true });
        axios.post(server_url + context_path + "api/" + this.props.baseUrl + "-user", user)
            .then(res => {
                this.loadObjects();
            }).finally(() => {
                this.setState({ loading: false });
                this.toggleModal();
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }

    deleteUser(i) {
        var user = this.state.objects[i];

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this user assignment!",
            icon: "warning",
            dangerMode: true,
            button: {
                text: "Yes, delete it!",
                closeModal: true,
            }
        })
        .then(willDelete => {
            if (willDelete) {
                axios.delete(server_url + context_path + "api/" + this.props.baseUrl + "-user/" + user.id)
                    .then(res => {
                        var objects = this.state.objects;

                        objects.splice(i, 1);

                        this.setState({ objects });
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
        return (
            <div className="card b">
                  {this.state.loading && <PageLoader />}
                <div className="card-header">
                    <h4>Assigned Users</h4>
                </div>
                <div className="card-body bb bt">
                    <Modal isOpen={this.state.modal} toggle={this.toggleModal} size={'md'}>
                        <ModalHeader toggle={this.toggleModal}>
                            Assign User
                        </ModalHeader>
                        <ModalBody>
                            <fieldset>
                                <AutoSuggest url="users"
                                    name="userName"
                                    displayColumns="name"
                                    label="User"
                                    placeholder="Search User by name"
                                    arrayName="users"
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    onRef={ref => (this.userASRef = ref)}
                                    projection="user_details_mini"
                                    value={this.state.selectedUser}
                                    onSelect={e => this.setAutoSuggest('user', e?.id)}
                                    queryString="&name" ></AutoSuggest>
                            </fieldset>
                            <div className="text-center">
                                <Button variant="contained" color="primary" onClick={e => this.saveUser()}>Save</Button>
                            </div>
                        </ModalBody>
                    </Modal>
                    <table className="table">
                        <tbody>
                            {this.state.objects.map((obj, i) => {
                            return (
                            <tr key={i}>
                                <td>
                                    <Link to={`/users/${obj.user.id}`}>
                                        {obj.user.name}
                                    </Link>
                                </td>
                                <td>
                                    <Button color="secondary" size="small" onClick={() => this.deleteUser(i)}>
                                        <i className="fa fa-trash"></i>
                                    </Button>
                                </td>
                            </tr>)
                        })}
                        </tbody>
                    </table>

                    <CustomPagination page={this.state.page} onChange={(x) => this.loadObjects(x)} />

                    <div className="mt-2 text-center">
                        <Button variant="contained" color="secondary" size="small" onClick={this.toggleModal}>Assign User</Button>
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
)(Assign);