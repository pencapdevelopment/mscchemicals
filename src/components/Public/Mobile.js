import React, { Component } from 'react';
import {  Link } from 'react-router-dom';
import { Input } from 'reactstrap';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/actions';
// import FormValidator from '../Forms/FormValidator.js';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { server_url, context_path} from '../Common/constants';

class Recover extends Component {

    state = {
        loading: false,
        email: '',
        otp: '',
        otpSent: false,
        password: '',
        cnfPassword: '',
    }



    mobileChange = e => {
        this.setState({email: e.target.value});
    }

    otpChange = e => {
        this.setState({otp: e.target.value});
    }

    passwordChange = e => {
        this.setState({password: e.target.value});
    }

    cnfPasswordChange = e => {
        this.setState({cnfPassword: e.target.value});
    }

    onSubmit = e => {
        e.preventDefault();

        if(this.state.otpSent) {
            if(this.state.password === this.state.cnfPassword) {
                fetch(server_url + context_path+'save-new-password?email='+this.state.email+'&emailToken='+
                this.state.otp+"&chgPassword="+this.state.password+"&cnfPassword="+this.state.cnfPassword,
                    {
                        method: "POST",
                        
                       
                    })
                    .then(response => {
                        return response.json()
                    })
                    .then(data => {
                        console.log(data);
                        this.setState({ loginError: data.message });
                    })
                    .catch(error => {
                        this.setState({ loginError: 'Error while processing' });
                    });
                } else {
                    this.setState({ loginError: 'Entered password & confirm passwords are not same.' });
                }
        } else {
            fetch(server_url + context_path + 'forgot-password?userName='+this.state.email,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({email: this.state.email})
                })
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    if (data.status === 201) {
                        this.setState({otpSent: true});
                        this.setState({ loginError: data.message });
                    } else {
                        this.setState({ loginError: data.message });
                    }
                })
                .catch(error => {
                    this.setState({ loginError: 'Error while processing' });
                });
        }
    }

    render() {
        const CSS = ".card img {height: 34px}";

        return (
            <div className="block-center mt-4 wd-xl">
                <style>{CSS}</style>
                {/* START card */}
                <div className="card card-flat">
                    <div className="card-header text-center bg-default">
                        <a href="#s">
                            <img className="block-center rounded" src="img/logo.png" alt="Logo"/>
                        </a>
                    </div>
                    <div className="card-body">
                        <p className="text-center py-2">PASSWORD RESET</p>
                        <form onSubmit={this.onSubmit}>
                            <p className="text-center d-none">Fill with your mail to receive instructions on how to reset your password.</p>
                            <div className="form-group">
                                <label className="text-muted">Email</label>
                                <div className="input-group with-focus">
                                <Input type="text"
                                        name="email"
                                        className="border-right-0"
                                        placeholder="Enter email"
                                        disabled={this.state.otpSent}
                                       onChange={this.mobileChange}
                                        data-validate='["required", "email"]'
                                        value={this.state.email}
                                        minLength="5" maxLength="100" />
                                    <div className="input-group-append">
                                        <span className="input-group-text text-muted bg-transparent border-left-0">
                                            <em className="fa fa-mobile"></em>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {this.state.otpSent && 
                            <div className="form-group">
                                <label className="text-muted">OTP</label>
                                <div className="input-group with-focus">
                                    <Input type="text"
                                        name="otp"
                                        className="border-right-0"
                                        placeholder="Enter OTP"
                                        onChange={this.otpChange}
                                        data-validate='["required", "number"]'
                                        value={this.state.otp}
                                        minLength="4" 
                                        maxLength="4" 
                                        pattern="\d*" required />
                                    <div className="input-group-append">
                                        <span className="input-group-text text-muted bg-transparent border-left-0">
                                            <em className="fa fa-key"></em>
                                        </span>
                                    </div>
                                </div>
                            </div>}
                            {this.state.otpSent && 
                            <div className="form-group">
                                <label className="text-muted">New Password</label>
                                <div className="input-group with-focus">
                                    <Input type="password"
                                        id="id-password"
                                        name="password"
                                        className="border-right-0"
                                        placeholder="New Password"
                                        onChange={this.passwordChange}
                                        data-validate='["required"]'
                                        value={this.state.password}
                                        minLength="5" maxLength="50"
                                        required
                                    />
                                    <div className="input-group-append">
                                        <span className="input-group-text text-muted bg-transparent border-left-0">
                                            <em className="fa fa-lock"></em>
                                        </span>
                                    </div>
                                    <span className="invalid-feedback">Field is required</span>
                                </div>
                            </div>}
                            {this.state.otpSent && 
                            <div className="form-group">
                                <label className="text-muted">Confirm Password</label>
                                <div className="input-group with-focus">
                                    <Input type="password"
                                        id="id-password1"
                                        name="password1"
                                        className="border-right-0"
                                        placeholder="Confirm Password"
                                        onChange={this.cnfPasswordChange}
                                        data-validate='["required"]'
                                        value={this.state.cnfPassword}
                                        minLength="5" maxLength="50"
                                        required
                                    />
                                    <div className="input-group-append">
                                        <span className="input-group-text text-muted bg-transparent border-left-0">
                                            <em className="fa fa-lock"></em>
                                        </span>
                                    </div>
                                    <span className="invalid-feedback">Field is required</span>
                                </div>
                            </div>}

                            <p>{this.state.loginError}</p>
                            <button className="btn btn-primary btn-block" type="submit">
                                {this.state.otpSent ? 'Update Password' : 'Send OTP'}
                            </button>
                        </form>
                    </div>
                    <div className="card-footer text-center">
                        <Link to="login" className="text-muted">Back to Login</Link>
                    </div>
                </div>
                {/* END card */}
                <div className="p-3 text-center">
                    <span className="mr-2">&copy;</span>
                    <span>2019</span>
                    <span className="mx-2">-</span>
                    <span>SMS Panel</span>
                </div>
            </div>
        );
    }
}

Recover.propTypes = {
    actions: PropTypes.object,
    settings: PropTypes.object
};

const mapStateToProps = state => ({ loginStatus: state.login })
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(actions, dispatch) })

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Recover);