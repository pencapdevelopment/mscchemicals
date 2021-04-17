import React, { Component } from 'react';
// import PageLoader from '../Common/PageLoader';
import { Link } from 'react-router-dom';
import { Input, CustomInput } from 'reactstrap';

import FormValidator from '../Forms/FormValidator.js';
import { server_url, context_path} from '../Common/constants';

class Register extends Component {

    state = {
        loading: false,
        formRegister: {
            fname: '',
            email: '',
            password: '',
            password2: '',
            terms: false
        }
    }

     /**
      * Validate input using onChange event
      * @param  {String} formName The name of the form in the state object
      * @return {Function} a function used for the event
      */
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
        const form = e.target;
        const inputs = [...form.elements].filter(i => ['INPUT', 'SELECT'].includes(i.nodeName))

        const { errors } = FormValidator.bulkValidate(inputs)

        this.setState({
            [form.name]: {
                ...this.state[form.name],
                errors
            }
        });

        e.preventDefault();

        let userObj = { name: this.state.formRegister.fname, email: this.state.formRegister.email, password: this.state.formRegister.password }
        fetch(server_url + context_path + 'register',
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userObj)
            })
            .then(response => {
                return response.json()
            })
            .then(data => {
                if (data.status === 200 || data.status === 201) {
                    this.props.actions.login(data.user);
                    this.props.history.push('/dashboard');
                } else {
                    this.setState({ loginError: data.message });
                }

                // this.props.actions.login(response);
                //    this.props.history.push('/dashboard')
            })
            .catch(error => {

                this.setState({ loginError: 'Error while processing' });
            });;
    }

    /* Simplify error check */
    hasError = (formName, inputName, method) => {
        return  this.state[formName] &&
                this.state[formName].errors &&
                this.state[formName].errors[inputName] &&
                this.state[formName].errors[inputName][method]
    }

    render() {
        const CSS = ".wrapper{background: #2b3eb7} .card {min-height: 400px; max-width: 400px; margin: calc(50vh - 200px) auto 0 !important;} .card img {height: 75px} .btn-primary, .btn-primary:hover, .btn-primary:active, .btn-primary:focus {color: #fff !important; background-color: #2b3eb7 !important; border-color: #2b3eb7 !important; box-shadow: none !important;} .custom-control-label:before,.custom-control-label:after {top: -0.07rem;left: -1.5rem;}";

        return (
            <div className="block-center">
                <style>{CSS}</style>
                {/* START card */}
                <div className="card card-flat">
                    <div className="card-header text-center bg-default">
                        <Link to="">
                            <img className="block-center" src="img/logo-dark.png" alt="Logo"/>
                        </Link>
                    </div>
                    <div className="card-body">
                        <p className="text-center py-2">SIGNUP TO GET INSTANT ACCESS.</p>
                        <form className="mb-3" name="formRegister" onSubmit={this.onSubmit}>
                            <div className="form-group">
                                <div className="input-group with-focus">
                                    <Input type="text"
                                        id="id-fname"
                                        name="fname"
                                        className="border-right-0"
                                        placeholder="Name"
                                        invalid={this.hasError('formRegister','fname','required')}
                                        onChange={this.validateOnChange}
                                        data-validate='["required"]'
                                        value={this.state.formRegister.fname}
                                    />
                                    <div className="input-group-append">
                                        <span className="input-group-text text-muted bg-transparent border-left-0">
                                            <em className="fa fa-edit"></em>
                                        </span>
                                    </div>
                                    <span className="invalid-feedback">Field is required</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-group with-focus">
                                    <Input type="email"
                                        name="email"
                                        className="border-right-0"
                                        placeholder="Enter email"
                                        invalid={this.hasError('formRegister','email','required')||this.hasError('formRegister','email','email')}
                                        onChange={this.validateOnChange}
                                        data-validate='["required", "email"]'
                                        value={this.state.formRegister.email}/>
                                    <div className="input-group-append">
                                        <span className="input-group-text text-muted bg-transparent border-left-0">
                                            <em className="fa fa-envelope"></em>
                                        </span>
                                    </div>
                                    { this.hasError('formRegister','email','required') && <span className="invalid-feedback">Field is required</span> }
                                    { this.hasError('formRegister','email','email') && <span className="invalid-feedback">Field must be valid email</span> }
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-group with-focus">
                                    <Input type="password"
                                        id="id-password"
                                        name="password"
                                        className="border-right-0"
                                        placeholder="Password"
                                        invalid={this.hasError('formRegister','password','required')}
                                        onChange={this.validateOnChange}
                                        data-validate='["required"]'
                                        value={this.state.formRegister.password}
                                    />
                                    <div className="input-group-append">
                                        <span className="input-group-text text-muted bg-transparent border-left-0">
                                            <em className="fa fa-lock"></em>
                                        </span>
                                    </div>
                                    <span className="invalid-feedback">Field is required</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-group with-focus">
                                    <Input type="password" name="password2"
                                        className="border-right-0"
                                        placeholder="Retype assword"
                                        invalid={this.hasError('formRegister','password2','equalto')}
                                        onChange={this.validateOnChange}
                                        data-validate='["equalto"]'
                                        value={this.state.formRegister.password2}
                                        data-param="id-password"
                                    />
                                    <div className="input-group-append">
                                        <span className="input-group-text text-muted bg-transparent border-left-0">
                                            <em className="fa fa-lock"></em>
                                        </span>
                                    </div>
                                    <span className="invalid-feedback">Field must be equal to previous</span>
                                </div>
                            </div>
                            <CustomInput type="checkbox" id="terms"
                                name="terms"
                                label="I agree with the terms"
                                invalid={this.hasError('formRegister','terms','required')}
                                onChange={this.validateOnChange}
                                data-validate='["required"]'
                                checked={this.state.formRegister.terms}>
                                    <span className="invalid-feedback">Field is required</span>
                                </CustomInput>
                            <button className="btn btn-raised btn-block btn-primary mt-3" type="submit">Create account</button>
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
                    <span>MSC Chemicals</span>
                </div>
            </div>
        );
    }
}

export default Register;
