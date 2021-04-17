import React, { Component } from 'react';
// import PageLoader from '../Common/PageLoader';
import { Redirect, Link } from 'react-router-dom';
import {  FormFeedback } from 'reactstrap';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/actions';
import FormValidator from '../Forms/FormValidator.js';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { server_url, context_path } from '../Common/constants';
import {  TextField } from '@material-ui/core';
import { Email, Lock } from '@material-ui/icons';
import PageLoader from '../Common/PageLoader';

class Login extends Component {
 
    state = {
        loading: false,
        formLogin: {
            email: '',
            password: ''
        }
    }

    componentWillMount() {
        console.log('Component will mount');
        console.log("server :"+server_url);
    }

    validateOnChange = event => {
        const input = event.target;
        const form = input.form
        const value = input.type === 'checkbox' ? input.checked : input.value;

        const result = FormValidator.validate(input);

        this.setState({
            [form.name]: {
                ...this.state[form.name],
                [input.name]: value,
                errors: {
                    ...this.state[form.name].errors,
                    [input.name]: result
                }
            }
        });
    }

    onSubmit = e => {
        e.preventDefault()
        const form = e.target;
        const inputs = [...form.elements].filter(i => ['INPUT', 'SELECT'].includes(i.nodeName))

        const { errors, hasError } = FormValidator.bulkValidate(inputs)
        this.setState({ loading: true });
        this.setState({
            [form.name]: {
                ...this.state[form.name],
                errors
            }
        });
        
        let userObj = { userName: this.state.formLogin.email, password: this.state.formLogin.password }
        fetch(server_url + context_path + 'user-login',
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userObj)
            })
            .then(response => {
                this.setState({ loading: false });
                return response.json()
            })
            .then(data => {
                this.setState({ loading: false });
                if (data.status === 200) {
                    this.props.actions.login(data.user);
                    this.props.history.push('/dashboard');
                } else {
                    this.setState({ loginError: data.message });

                }


                // this.props.actions.login(response);
                //    this.props.history.push('/dashboard')
            })
            .catch(error => {
                this.setState({ loading: false });
                this.setState({ loginError: 'Error while processing' });
            });;


        console.log(hasError ? 'Form has errors. Check!' : 'Form Submitted!')
    }

    /* Simplify error check */
    hasError = (formName, inputName, method) => {
        return this.state[formName] &&
            this.state[formName].errors &&
            this.state[formName].errors[inputName] &&
            this.state[formName].errors[inputName][method]
    }

    render() {
    
        const errors = this.state.formLogin.errors;
        if (this.props.loginStatus.login) {
            return (<Redirect to={{ pathname: '/dashboard', state: { from: this.props.location } }} />)
        } else {
            const CSS = ".wrapper{background: #2b3eb7} .card {height: 450px; width: 540px; border-top-right-radius: 20px; border-bottom-right-radius: 20px; margin: -450px 0px 0px 450px;} .card img {height: 75px} .btn-primary, .btn-primary:hover, .btn-primary:active, .btn-primary:focus {color: #fff !important; background-color: #2b3eb7 !important; border-color: #2b3eb7 !important;}";

            return (
            <div>
              <body className="backimg">
              {this.state.loading && <PageLoader />}
                <div className="login1">
                    <img className="img1" src="img/MSCB2.jpg" alt="MSCLogo" />
                    <style>{CSS}</style>
                    <div className="card">
                        <div className="card-header text-center bg-default">
                            <Link to="">
                                <img className="block-center rounded" src="img/logo-dark.png" alt="Logo" />
                            </Link>
                        </div>
                        <div className="card-body">
                            <p className="text-center py-2">SIGN IN TO CONTINUE.</p>
                            <form className="mb-3" name="formLogin" onSubmit={this.onSubmit}>
                                <div className="form-group">
                                    <div className="input-group with-focus">
                                        <TextField type="text"
                                            name="email"
                                            className="border-right-0"
                                            placeholder="Enter email"
                                            invalid={this.hasError('formLogin', 'email', 'required') || this.hasError('formLogin', 'email', 'email')}
                                            onChange={this.validateOnChange}

                                            // inputProps={{ "data-validate": '[{ "key":"required"},{ "key":"email"}]' }}
                                            helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ""}
                                            error={errors?.email?.length > 0}
                                            value={this.state.formLogin.email}
                                            minLength="5" maxLength="100"
                                            InputProps={{
                                                endAdornment: (
                                                    <Email />
                                                ),
                                            }}
                                        />
                                        {this.hasError('formLogin', 'email', 'required') && <span className="invalid-feedback">Field is required</span>}
                                        {/* {this.hasError('formLogin', 'email', 'email') && <span className="invalid-feedback">Field must be valid email</span>} */}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="input-group with-focus">
                                        <TextField type="password"
                                            id="id-password"
                                            name="password"
                                            className="border-right-0"
                                            placeholder="Password"
                                            invalid={this.hasError('formLogin', 'password', 'required')}
                                            onChange={this.validateOnChange}
                                            // inputProps={{ "data-validate": '[{ "key":"required"},{"key":"minlen","param":"5"},{"key":"maxlen","param":"50"}]' }}
                                            value={this.state.formLogin.password}

                                            helperText={errors?.password?.length > 0 ? errors?.password[0]?.msg : ""}
                                            error={errors?.password?.length > 0}
                                            InputProps={{
                                                endAdornment: (
                                                    <Lock />
                                                ),
                                            }}
                                        />
                                        {this.state.formLogin.errors && this.state.formLogin.errors.password &&
                                            <FormFeedback>{this.state.formLogin.errors.password.required} </FormFeedback>

                                        }
                                        <span className="invalid-feedback">Field is required</span>
                                    </div>
                                </div>
                                <div className="clearfix">
                                    <div className="float-right">
                                        <Link to="mobile" className="text-muted">Forgot Password</Link>
                                    </div>
                                </div>
                                {this.state.loginError}
                                <span className="invalid-feedback"> {this.state.loginError}</span>
                                <button className="btn btn-raised btn-block btn-primary mt-3" type="submit">Login</button>
                            </form>

                        </div>
                        <div className="card-footer text-center d-none">
                            <Link to="register" className="text-muted">Register</Link>
                        </div>
                    </div>

                </div>
                </body> 
            </div> 
            );
        }
    }
}


Login.propTypes = {
    actions: PropTypes.object,
    settings: PropTypes.object
};

const mapStateToProps = state => ({ loginStatus: state.login })
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(actions, dispatch) })

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Login);