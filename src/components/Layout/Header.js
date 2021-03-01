import { server_url, context_path } from '../Common/constants';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, ListGroup, ListGroupItem } from 'reactstrap';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../store/actions/actions';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ToggleFullscreen from '../Common/ToggleFullscreen';
import HeaderRun from './Header.run'
import axios from 'axios';
const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

class Header extends Component {
    state = {
        loading: false,
        notifications: [],
        newNotiCount: 0
    }

    checkNewMessages() {
        // if ( this.props.user.id !== 'undefined') {
        //     axios.get(server_url + context_path + "api/notifications?uid=" + this.props.user.id + "&sort=id,desc")
        //         .then(res => {
        //             this.setState({
        //                 notifications: res.data._embedded[Object.keys(res.data._embedded)[0]],
        //             });
        //         });
        // }


        axios.get(server_url + context_path + "notification-cnt").then(res => {

            this.setState({ newNotiCount: Number(res.data.message) });
        })


    }

    componentDidMount() {
        axios.interceptors.request.use(config => {
            var itm = JSON.parse(localStorage.getItem("designbricks-store-key"));

            if (itm && itm.login) {
                config.headers.Authorization = 'Bearer ' + itm.login.userObj.token;
            }

            return config;
        });
        var that = this;
        axios.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            if (error.response && 401 === error.response.status) {
                that.props.actions.logout({});
                window.location.href = 'login';
            } else {
                return Promise.reject(error);
            }
        });

        HeaderRun();

        this.checkNewMessages();
    }

    toggleOffsidebar = e => {
        e.preventDefault()
        this.props.actions.toggleSetting('offsidebarOpen');
    }

    toggleCollapsed = e => {
        e.preventDefault()
        this.props.actions.toggleSetting('isCollapsed');
        this.resize()
    }

    toggleAside = e => {
        e.preventDefault()
        this.props.actions.toggleSetting('asideToggled');
    }

    logOut = e => {
        e.preventDefault()

        axios.post(server_url + context_path + "logout")
            .then(response => {
                this.props.actions.logout({});
            }).catch(e => {
                this.props.actions.logout({});
            });

        // this.props.history.push('/login');


    }
    markRead() {
        //this.setState({newNotiCount:0 });
        axios.post(server_url + context_path + "notification-read")
            .then(response => {
                this.setState({ newNotiCount: 0 });
            }).catch(e => {

            });

    }
    resize() {
        // all IE friendly dispatchEvent
        var evt = document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt);
        // modern dispatchEvent way
        // window.dispatchEvent(new Event('resize'));
    }

    render() {
        return (
            <header className="topnavbar-wrapper">
                <ToastContainer />
                { /* START Top Navbar */}
                <nav className="navbar topnavbar">
                    { /* START navbar header */}
                    <div className="navbar-header">
                        <Link className="navbar-brand" to="dashboard">
                            <div className="brand-logo">
                                <img className="img-fluid" src="img/logo-mix.png" alt="App Logo" />
                            </div>
                            <div className="brand-logo-collapsed">
                                <img className="img-fluid" src="img/icon.png" alt="App Icon" />
                            </div>
                        </Link>
                    </div>
                    { /* END navbar header */}

                    { /* START Left navbar */}
                    <ul className="navbar-nav mr-auto flex-row">
                        <li className="nav-item">
                            { /* Button used to collapse the left sidebar. Only visible on tablet and desktops */}
                            <a href="#s" className="nav-link d-none d-md-block d-lg-block d-xl-block" onClick={this.toggleCollapsed}>
                                <em className="fas fa-bars"></em>
                            </a>
                            { /* Button to show/hide the sidebar on mobile. Visible on mobile only. */}
                            <a href="#s" className="nav-link sidebar-toggle d-md-none" onClick={this.toggleAside}>
                                <em className="fas fa-bars"></em>
                            </a>
                        </li>
                    </ul>
                    { /* END Left navbar */}
                    <div className="text-center mr-auto flex-row white d-none">
                        <h4>{this.props.user ? this.props.user.name : ""}</h4>
                    </div>

                    { /* START Right Navbar */}
                    <ul className="navbar-nav flex-row">
                        { /* Fullscreen (only desktops) */}
                        <li className="nav-item d-none d-md-block">
                            <ToggleFullscreen className="nav-link" />
                        </li>

                        <li className="nav-item d-none">
                            {/* onClick={this.toggleOffsidebar} */}
                            <Link className="nav-link" to="notifications">
                                <em className="fa fa-bell"></em>
                            </Link>
                        </li>

                        { /* START Alert menu */}
                        <UncontrolledDropdown nav inNavbar className="dropdown-list">
                            <DropdownToggle nav className="dropdown-toggle-nocaret" onClick={this.markRead}>
                                <em className="fa fa-bell"></em>
                                {this.state.newNotiCount !== 0 &&
                                    <span className="badge badge-danger">{this.state.newNotiCount}</span>}
                            </DropdownToggle>
                            { /* START Dropdown menu */}
                            <DropdownMenu right className="dropdown-menu-right animated flipInX">
                                <DropdownItem>
                                    { /* START list group */}
                                    <ListGroup>
                                        {this.state.notifications.map((obj, i) => {
                                            return (
                                                <ListGroupItem action tag="a" href="" onClick={e => e.preventDefault()}>
                                                    <Link to={`${obj.url}`}>
                                                        <div className="media">
                                                            <div className="media-body">
                                                                <p className="m-0">{obj.description}</p>

                                                            </div>
                                                        </div>
                                                    </Link>
                                                </ListGroupItem>)
                                        })}
                                        <ListGroupItem action tag="a" href="notifications" onClick={e => e.preventDefault()}>
                                            <Link className="text-center" to="/notifications">
                                                <span className="text-sm">More notifications</span>
                                            </Link>
                                        </ListGroupItem>
                                        <ListGroupItem action tag="a" href="sales-approval-alerts" onClick={e => e.preventDefault()}>
                                        <Link className="text-center" to="/sales-approval-alerts">
                                                <span className="text-sm">Sales Approval Alert</span>
                                            </Link>
                                        </ListGroupItem>
                                        <ListGroupItem action tag="a" href="purchases-approval-alerts" onClick={e => e.preventDefault()}>
                                        <Link className="text-center" to="/purchases-approval-alerts">
                                                <span className="text-sm">Purchases Approval Alert</span>
                                            </Link>
                                        </ListGroupItem>
                                    </ListGroup>
                                    { /* END list group */}
                                </DropdownItem>
                            </DropdownMenu>
                            { /* END Dropdown menu */}
                        </UncontrolledDropdown>
                        { /* END Alert menu */}

                        { /* START Offsidebar button */}
                        <li className="nav-item d-none">
                            <a className="nav-link" href="#s" onClick={this.toggleOffsidebar}>
                                <em className="fa fa-notebook"></em>
                            </a>
                        </li>
                        { /* END Offsidebar menu */}

                        <UncontrolledDropdown nav inNavbar className="dropdown-list">
                            <DropdownToggle nav className="dropdown-toggle-nocaret">
                                <em className="fa fa-user"></em>
                            </DropdownToggle>
                            { /* START Dropdown menu */}
                            <DropdownMenu right className="dropdown-menu-right animated flipInX">
                                <DropdownItem>
                                    { /* START list group */}
                                    <ListGroup>
                                        <Link className="list-group-item-action list-group-item" to="/profile">
                                            <em className="fa fa-user"></em>&nbsp;&nbsp;Profile
                                        </Link>
                                        <ListGroupItem action tag="a" to="logout" onClick={this.logOut}>
                                            <em className="fa fa-sign-out-alt"></em>&nbsp;&nbsp;Logout
                                       </ListGroupItem>
                                    </ListGroup>
                                    { /* END list group */}
                                </DropdownItem>
                            </DropdownMenu>
                            { /* END Dropdown menu */}
                        </UncontrolledDropdown>
                    </ul>
                    { /* END Right Navbar */}

                    { /* START Search form */}
                    <form className="navbar-form" role="search" action="search.html">
                        <div className="form-group">
                            <input className="form-control" type="text" placeholder="Type and hit enter ..." />
                            <div className="fa fa-times navbar-form-close" data-search-dismiss=""></div>
                        </div>
                        <button className="d-none" type="submit">Submit</button>
                    </form>
                    { /* END Search form */}
                </nav>
                { /* END Top Navbar */}
            </header>
        );
    }

}

Header.propTypes = {
    actions: PropTypes.object,
    settings: PropTypes.object
};

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(actions, dispatch) })

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);