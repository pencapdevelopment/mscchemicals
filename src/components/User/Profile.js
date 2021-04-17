import { server_url, context_path } from '../Common/constants';
import React, { Component } from 'react';
import PageLoader from '../Common/PageLoader';
import ContentWrapper from '../Layout/ContentWrapper';
// import classnames from 'classnames';
import {
    Row,
    Col,
    Table,
   
    Input,
} from 'reactstrap';

import TabPanel from '../Common/TabPanel';
import { Button, Tab, Tabs, AppBar } from '@material-ui/core';

import swal from 'sweetalert';
import axios from 'axios';
import { connect } from 'react-redux';
import Moment from 'react-moment';

class Profile extends Component {

    state = {
        loading: false,
        activeTab: 0,
        user: {
            name: '',
            mobile: '',
            email: '',
            url: '',
            location: '',
            bio: '',
            company: ''
        },
        role:{

        },
        imageUrl: 'img/user.jpg',
        password: {
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            errorMessage: ''
        },
        image: ''
    }

    loadUser() {
        
        axios.get(server_url + context_path + "/user/profile")
            .then(res => {
                if (typeof res.data.url === 'undefined') {
                    res.data.url = '';
                }
                if (typeof res.data.company === 'undefined') {
                    res.data.company = '';
                }
                if (typeof res.data.location === 'undefined') {
                    res.data.location = '';
                }
                if (typeof res.data.bio === 'undefined') {
                    res.data.bio = '';
                }
                this.setState({

                    user: res.data

                });

                axios.get(server_url + context_path + "/api/roles?projection=user_role_detail&code="+this.state.user.role)
                .then(res1 => {
                    this.setState({

                            role: res1.data('_embedded').roles[0]
                            
                        });
                    
                });
            });

        axios.get(server_url + context_path + "/user-images/" + this.props.user.id)
            .then(res => {
                if (res.data && res.data.url) {
                    this.setState({ imageUrl: res.data.url });
                }
            });
    }

    saveProfile = e => {
        e.preventDefault();
        axios.post(server_url + context_path + "/user/profile", this.state.user)
            .then(res => {
                swal("Successfully Updated!", 'Success', "success");
            }).catch(err => {
                swal("Unable to Add!", 'Error ', "error");
            })
    }

    componentDidMount() {
        this.loadUser();
    }

    updateOldPwd(e) {
        var pwd = this.state.password;
        pwd.oldPassword = e.target.value;
        this.setState({ password: pwd })
    }

    updateNewPwd(param, e) {
        var pwd = this.state.password;
        pwd[param] = e.target.value;
        if (pwd.newPassword !== pwd.confirmNewPassword) {
            pwd.errorMessage = 'New Password and confirm password not matching';
        } else {
            pwd.errorMessage = ''
        }
        if (this.state.password.newPassword.length < 6) {
            pwd.errorMessage = 'New Password should contain minimum 6 characters';
        }

        this.setState({ password: pwd })
    }

    updatePassword = e => {
        e.preventDefault();
        if (this.state.password.newPassword.length < 6) {
            var pwd = this.state.password;
            pwd.errorMessage = 'New Password should contain minimum 6 characters';
            this.setState({ password: pwd });
            return;
        }

        if (this.state.password.newPassword !== this.state.password.confirmNewPassword) {
            var pwd1 = this.state.password;
            pwd1.errorMessage = 'New Password and confirm password not matching';
            this.setState({ password: pwd1 });
            return;
        }
        var bodyFormData = new FormData();
        bodyFormData.append("oldPassword", this.state.password.oldPassword);
        bodyFormData.append("newPassword", this.state.password.newPassword);

        axios({
            method: 'post',
            url: server_url + context_path + 'user/password',
            data: bodyFormData,
            config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        })
            .then((resp) => {
                swal("Successfully Updated!", 'Success', "success");
            })
            .catch(function (err) {
                swal("Unable to Update!", err.response.data.message, "error");
            });
    }

    imageChange(e) {
        if (e.target.files && e.target.files[0]) {
            this.setState({ image: e.target.files[0] });
        }
    }

    uploadImage = e => {
        e.preventDefault();

        if (this.state.image) {
            var bodyFormData = new FormData();
            bodyFormData.append("image", this.state.image);

            axios({
                method: 'post',
                url: server_url + context_path + 'user/image',
                data: bodyFormData,
                config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            })
                .then((res) => {
                    this.setState({ image: '', imageUrl: res.data.url });
                    swal("Successfully Updated!", 'Success', "success");
                })
                .catch(function (err) {
                    swal("Unable to Update!", err.response ? err.response.data.message : err.message, "error");
                });
        } else {
            swal("Image required!", 'Please upload image to update', "warning");
        }
    }

    updateProfile(param, e) {
        var profile = this.state.user;
        profile[param] = e.target.value;
        this.setState({ user: profile })
    }

    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <Row>
                    <Col lg="4">
                        <div className="card card-default">
                            <div className="card-body text-center">
                                <div className="py-4">
                                    <img className="img-fluid rounded-circle img-thumbnail thumb96" src={this.state.imageUrl} alt="Contact" />
                                </div>
                                <h3 className="m-0 text-bold">{this.props.user.name}</h3>
                                <div className="my-3">
                                    <p>{this.props.user.role.replace('ROLE_', '')}</p>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col lg="8">
                        <AppBar position="static">
                            <Tabs
                                className="bg-white"
                                indicatorColor="primary"
                                textColor="primary"
                                variant="scrollable"
                                scrollButtons="auto"
                                aria-label="scrollable auto tabs example"
                                value={this.state.activeTab}
                                onChange={(e, i) => this.toggleTab(i)} >
                                <Tab label="Profile" />
                                <Tab label="Update" />
                                <Tab label="Image" />
                                <Tab label="Password" />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={this.state.activeTab} index={0}>
                            {this.state.user &&
                                <Table hover responsive className="table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <strong>Name</strong>
                                            </td>
                                            <td>{this.state.user.name}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Phone</strong>
                                            </td>
                                            <td>{this.state.user.mobile}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Email</strong>
                                            </td>
                                            <td>{this.state.user.email}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>User Name</strong>
                                            </td>
                                            <td>{this.state.user.username}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Role</strong>
                                            </td>
                                            <td>{this.state.user.role ? this.state.user.name.replace('ROLE_', '') : ''}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Permissions</strong>
                                            </td>
                                            <td>
                                                <ul>
                                                {this.state.user.role ? this.state.user.role.permissions.map(g=>g.permission.description).map(g=>{
                                                return (<li>{g}</li>)
    }): ''}</ul>
                                            
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Account Created On</strong>
                                            </td>
                                            <td><Moment format="DD MMM YY HH:mm">{this.state.user.creationDate}</Moment></td>
                                        </tr>
                                    </tbody>
                                </Table>}
                        </TabPanel>

                        <TabPanel value={this.state.activeTab} index={1}>
                            <form onSubmit={this.saveProfile} className="col-md-8 offset-md-2">
                                <div className="form-group">
                                    <label>Name</label>
                                    <Input value={this.state.user.name} onChange={e => this.updateProfile('name', e)} type="text" />
                                </div>
                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea value={this.state.user.bio} onChange={e => this.updateProfile('bio', e)} className="form-control" rows="3"></textarea>
                                </div>
                                <div className="form-group">
                                    <label>URL</label>
                                    <Input value={this.state.user.url} onChange={e => this.updateProfile('url', e)} className="form-control" type="text" />
                                </div>
                                <Button className="btn btn-raised btn-info" type="submit">Update Profile</Button>
                            </form>
                        </TabPanel>

                        <TabPanel value={this.state.activeTab} index={2}>
                            <form onSubmit={this.uploadImage} className="col-md-8 offset-md-2">
                                <div className="form-group">
                                    <label>Picture</label>
                                    <Input className="form-control filestyle" onChange={e => this.imageChange(e)} type="file" accept="image/*" data-input="false" data-classbutton="btn btn-secondary" data-classinput="form-control inline" data-text="Upload new picture" data-icon="&lt;span class='fa fa-upload mr-2'&gt;&lt;/span&gt;" />
                                </div>
                                <Button className="btn btn-raised btn-info" type="submit">Upload</Button>
                            </form>
                        </TabPanel>

                        <TabPanel value={this.state.activeTab} index={3}>
                            <form onSubmit={this.updatePassword} className="col-md-8 offset-md-2">
                                <div className="form-group">
                                    <label>Current password</label>
                                    <Input className="form-control" type="password" value={this.state.password.oldPassword} onChange={e => this.updateOldPwd(e)} />
                                </div>
                                <div className="form-group">
                                    <label>New password</label>
                                    <Input className="form-control" type="password" value={this.state.password.newPassword} onChange={e => this.updateNewPwd('newPassword', e)} />
                                </div>
                                <div className="form-group">
                                    <label>Confirm new password</label>
                                    <Input className="form-control" type="password" value={this.state.password.confirmNewPassword} onChange={e => this.updateNewPwd('confirmNewPassword', e)} />
                                </div>
                                <p>
                                    {this.state.password.errorMessage}
                                </p>

                                <Button className="btn btn-raised btn-info" type="submit">Update password</Button>
                            </form>
                        </TabPanel>
                    </Col>
                </Row>
            </ContentWrapper>
        );
    }

}

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(Profile);
