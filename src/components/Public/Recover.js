import React, { Component } from 'react';
// import PageLoader from '../Common/PageLoader';
import { Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import { server_url, context_path} from '../Common/constants';

class Recover extends Component {

    state = {
        loading: false,
        email: '',
        resetError:''
    }

    
    validateOnChange = event => {
        
        var email=event.target.value;
        console.log(email)
        this.setState({email:email});
    }

    onSubmit = e => {
        e.preventDefault();
        if(this.state.email.length<0){
            return;
        }
        fetch(server_url + context_path + 'forgot-password?userName='+this.state.email,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                
            })
            .then(response => {
                return response.json()
            })
            .then(data => {
                if (data.status === 200) {
                    
                } else {
                    this.setState({ resetError: data.message });

                }


                // this.props.actions.login(response);
                //    this.props.history.push('/dashboard')
            })
            .catch(error => {

                this.setState({ loginError: 'Error while processing' });
            });;


        console.log('asas');
    }

    render() {
        const CSS = ".wrapper{background: #2b3eb7} .card {min-height: 400px; max-width: 400px; margin: calc(50vh - 200px) auto 0 !important;} .card img {height: 75px} .btn-primary, .btn-primary:hover, .btn-primary:active, .btn-primary:focus {color: #fff !important; background-color: #2b3eb7 !important; border-color: #2b3eb7 !important; box-shadow: none !important;}";

        return (
            <div className="block-center">
                <style>{CSS}</style>
                {/* START card */}
                <div className="card card-flat">
                    <div className="card-header text-center bg-default">
                        <Link to="">
                            <img className="block-center rounded" src="img/logo-dark.png" alt="Logo"/>
                        </Link>
                    </div>
                    <div className="card-body">
                        <p className="text-center py-2">PASSWORD RESET</p>
                        <form onSubmit={this.onSubmit}>
                            <p className="text-center">Fill with your mail to receive instructions on how to reset your password.</p>
                            <div className="form-group">
                                <div className="input-group with-focus">
                                    <Input type="text"
                                        name="email"
                                        className="border-right-0"
                                        placeholder="Enter email"
                                        onChange={e => this.validateOnChange(e)}
                                        data-validate='["required", "email"]'
                                        value={this.state.email}
                                        minLength="5" maxLength="100" />
                                    <div className="input-group-append">
                                        <span className="input-group-text text-muted bg-transparent border-left-0">
                                            <em className="fa fa-envelope"></em>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className="invalid-feedback"> {this.state.resetError}</span>
                            <button className="btn btn-raised btn-primary btn-block" type="submit">Reset</button>
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

export default Recover;
