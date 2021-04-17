import { server_url, context_path, getDateToAndFrom } from '../Common/constants';
import React from 'react';
import PageLoader from '../Common/PageLoader';
// import { Trans } from 'react-i18next';
import ContentWrapper from '../Layout/ContentWrapper';
import StatCard from '../Cards/StatCard';
import GroupIcon from '@material-ui/icons/Group';
import BusinessIcon from '@material-ui/icons/Business';
import ContactsIcon from '@material-ui/icons/Contacts';
import ApartmentOutlinedIcon from '@material-ui/icons/ApartmentOutlined';
import AssignmentSharpIcon from '@material-ui/icons/AssignmentSharp';
import BackupSharpIcon from '@material-ui/icons/BackupSharp';
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined';
import BookIcon from '@material-ui/icons/Book';
import { mockDashboard } from "../../utils";
import { Bar, Bubble } from "react-chartjs-2";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import CardHeader from "@material-ui/core/CardHeader";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Moment from 'react-moment';
import CustomPagination from '../Common/CustomPagination';
import BigCalendar from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
// import swal from 'sweetalert';
import {
    Row, Col, Table
} from 'reactstrap';
// import Now from '../Common/Now';

import { Card, } from "@material-ui/core";

BigCalendar.momentLocalizer(moment);

const localizer = BigCalendar.momentLocalizer(moment)

class Dashboard extends React.Component {

    state = {
        loading: false,
        dropdownOpen: false,
        page: {
            number: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0
        },
        data: {
            users:0,
            products:0,
            orders:0,
            sales:0,
            contacts:0,
            companies: 0,
            invoices: 0,
            purchases: 0,
            posts: 0,
            articles: 0,
            recommendations: 0
        },
        eventDate: new Date(),
        events: [],
        companies: [],
        styles: {
            'MARKET_FOLLOWUP': {
                backgroundColor: '#f39c12',
                borderColor: '#f39c12'
            },
            'SALES_FOLLOWUP': {
                backgroundColor: '#0073b7',
                borderColor: '#0073b7'
            },
            'purchases_FOLLOWUP': {
                backgroundColor: '#00c0ef',
                borderColor: '#00c0ef'
            },
            'COMMON': {
                backgroundColor: '#00a65a',
                borderColor: '#00a65a'
            }
        }
    }

    componentDidMount() {
        axios.get(server_url + context_path + "user/dashboard")
            .then(res => {
                this.setState({
                    data: res.data
                });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {

                // swal("Unable to Get details!", err.response, "error");
            })

        this.loadCompanies();
        this.loadEvents();
    }

    loadCompanies(offset) {
        if (!offset) offset = 1;

        var url = server_url + context_path + "api/companies?projection=company_details&role=ROLE_USER&sort=id,desc&size=10&page=" + (offset - 1);

        axios.get(url)
            .then(res => {
                this.setState({
                    companies: res.data._embedded.companies,
                    page: res.data.page
                });

            })
    }

    loadEvents() {
        var url = server_url + context_path + "api/events?uid=" + this.props.user.id + "&" + getDateToAndFrom(moment(this.state.eventDate), 'fromTime') + "&size=100000";
        axios.get(url)
            .then(res => {
                var events = res.data._embedded.events;
                events.forEach(g => {
                    g.style = this.state.styles[g.type];
                    g.start = new Date(g.fromTime);
                    g.end = new Date(g.toTime);

                })
                this.setState({
                    events: events
                });
            })
    }

    onNavigate(e) {
        this.setState({ eventDate: e }, this.loadEvents)
    }

    parseStyleProp = ({ style }) => style ? { style } : {}

    selectEvent = event => {
        console.log(event);
    };

    resizeEvent = (resizeType, { event, start, end }) => {
        const { events } = this.state

        const nextEvents = events.map(existingEvent => {
            return existingEvent.id === event.id
                ? { ...existingEvent, start, end }
                : existingEvent
        })

        this.setState({
            events: nextEvents,
        })

        console.log(`${event.title} was resized to ${start}-${end}`)
    }

    render() {
        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <div className="content-heading d-none">
                    <div>Dashboard</div>
                </div>
                <Row>
                    {this.props.user.role === 'ROLE_ADMIN' &&
                        <Col xl={3} md={6} className="p-2">
                            { /* START card */}
                            <Link className="text-decoration-none" to='/users'  >
                                <StatCard
                                    title="Users"
                                    value={this.state.data.users}
                                    icon={<GroupIcon />}
                                    color="#9c27b0"
                                />
                            </Link>
                            {/* 
                            <div className="card flex-row align-items-center align-items-stretch border-0">
                                <div className="col-4 d-flex align-items-center justify-content-center rounded-left">
                                    <em className="fa fa-users fa-3x"></em>
                                </div>
                                <div className="col-8 py-3 rounded-right">
                                    <div className="h2 mt-0">{this.state.data.users}</div>
                                    <div className="text-uppercase">Users</div>
                                </div>
                            </div>
                         */}
                        </Col>}
                    {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_CM') !== -1) &&
                        <Col xl={3} md={6} className="p-2" >
                            { /* START card */}

                            <Link className="text-decoration-none" to='/companies'>
                                <StatCard
                                    title="Companies"
                                    value={this.state.data.companies}
                                    icon={<BusinessIcon />}
                                    color="#3f51b5"
                                />
                                {/* <div className="card flex-row align-items-center align-items-stretch border-0">
                                    <div className="col-4 d-flex align-items-center justify-content-center rounded-left">
                                        <em className="fa fa-university fa-3x"></em>
                                    </div>
                                    <div className="col-8 py-3 rounded-right">
                                        <div className="h2 mt-0">{this.state.data.companies}</div>
                                        <div className="text-uppercase">Companies</div>
                                    </div>
                                </div> */}
                            </Link>
                        </Col>}
                    {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_CM') !== -1) &&
                        <Col xl={3} md={6} className="p-2">
                            { /* START card */}
                            <Link className="text-decoration-none" to='/company-contact'>
                                <StatCard
                                    title="Contacts"
                                    value={this.state.data.contacts}
                                    icon={<ContactsIcon />}
                                    color="#f44336"
                                />
                                {/* <div className="card flex-row align-items-center align-items-stretch border-0">
                                    <div className="col-4 d-flex align-items-center justify-content-center rounded-left">
                                        <em className="fa fa-address-book fa-3x"></em>
                                    </div>
                                    <div className="col-8 py-3 rounded-right">
                                        <div className="h2 mt-0">{this.state.data.contacts}</div>
                                        <div className="text-uppercase">Contacts</div>
                                    </div>
                                </div> */}
                            </Link>
                        </Col>}
                    {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_PD') !== -1) &&
                        <Col xl={3} md={6} className="p-2">
                            { /* START card */}
                            <Link className="text-decoration-none" to='/products'>
                                <StatCard
                                    title="Products"
                                    value={this.state.data.products}
                                    icon={<ApartmentOutlinedIcon />}
                                    color="#ffd740"
                                />
                                {/* <div className="card flex-row align-items-center align-items-stretch border-0">
                                    <div className="col-4 d-flex align-items-center justify-content-center rounded-left">
                                        <em className="fa fa-cubes fa-3x"></em>
                                    </div>
                                    <div className="col-8 py-3 rounded-right">
                                        <div className="h2 mt-0">{this.state.data.products}</div>
                                        <div className="text-uppercase">Products</div>
                                    </div>
                                </div> */}
                            </Link>
                        </Col>}
                    {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_OR') !== -1) &&
                        <Col xl={3} md={6} className="p-2">
                            { /* START card */}
                            <Link className="text-decoration-none" to='/orders'>
                                <StatCard
                                    title="Orders"
                                    value={this.state.data.orders}
                                    icon={<AssignmentSharpIcon />}
                                    color="#3f51b5"
                                />
                                {/* <div className="card flex-row align-items-center align-items-stretch border-0">
                                    <div className="col-4 d-flex align-items-center justify-content-center rounded-left">
                                        <em className="fa fa-clipboard-list fa-3x"></em>
                                    </div>
                                    <div className="col-8 py-3 rounded-right">
                                        <div className="h2 mt-0">{this.state.data.orders}</div>
                                        <div className="text-uppercase">Orders</div>
                                    </div>
                                </div> */}
                            </Link>
                        </Col>}
                    {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_SE') !== -1) &&
                        <Col xl={3} md={6} className="p-2">
                            { /* START card */}
                            <Link className="text-decoration-none" to='/sales'>
                                <StatCard
                                    title="Sales"
                                    value={this.state.data.sales}
                                    icon={<BackupSharpIcon />}
                                    color="#9c27b0"
                                />
                                {/* <div className="card flex-row align-items-center align-items-stretch border-0">
                                    <div className="col-4 d-flex align-items-center justify-content-center rounded-left">
                                        <em className="fa fa-cloud-upload-alt fa-3x"></em>
                                    </div>
                                    <div className="col-8 py-3 rounded-right">
                                        <div className="h2 mt-0">{this.state.data.sales}</div>
                                        <div className="text-uppercase">Sales</div>
                                    </div>
                                </div> */}
                            </Link>
                        </Col>}
                    {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_PR') !== -1) &&
                        <Col xl={3} md={6} className="p-2">
                            { /* START card */}
                            <Link className="text-decoration-none" to='/purchases'>
                                <StatCard
                                    title="Purchases"
                                    value={this.state.data.purchases}
                                    icon={<ShoppingCartOutlinedIcon />}
                                    color="#f44336"
                                />
                                {/* <div className="card flex-row align-items-center align-items-stretch border-0">
                                    <div className="col-4 d-flex align-items-center justify-content-center rounded-left">
                                        <em className="fa fa-shopping-cart fa-3x"></em>
                                    </div>
                                    <div className="col-8 py-3 rounded-right">
                                        <div className="h2 mt-0">{this.state.data.purchases}</div>
                                        <div className="text-uppercase">Purchases</div>
                                    </div>
                                </div> */}
                            </Link>
                        </Col>}
                    {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_OR') !== -1) &&
                        <Col xl={3} md={6} className="p-2">
                            { /* START card */}
                            <Link className="text-decoration-none" to='/orders'>
                                <StatCard
                                    title="Invoices"
                                    value={this.state.data.invoices}
                                    icon={<BookIcon />}
                                    color="#ffd740"
                                />
                                {/* <div className="card flex-row align-items-center align-items-stretch border-0">
                                    <div className="col-4 d-flex align-items-center justify-content-center rounded-left">
                                        <em className="fa fa-book fa-3x"></em>
                                    </div>
                                    <div className="col-8 py-3 rounded-right">
                                        <div className="h2 mt-0">{this.state.data.invoices}</div>
                                        <div className="text-uppercase">Invoices</div>
                                    </div>
                                </div> */}
                            </Link>
                        </Col>}
                </Row>
                <Row>
                    {
                        mockDashboard.map((chart, index) => (
                            // <Grid item xs={12} sm={12} md={4} key={index}>
                            <Col xl={6} md={6} className="p-2">
                                <Card>
                                    <CardHeader
                                        subheader={chart.title}
                                        action={
                                            <IconButton id={`${index}-menu-button`} >
                                                <MoreVertIcon />
                                            </IconButton>
                                        }
                                    />
                                    <CardContent>
                                        {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_SE') !== -1) && chart.type === "bar" && (
                                            <Bar
                                                data={chart.data}
                                                height={chart.height}
                                                options={chart.options}
                                            />
                                        )}
                                        {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_PR') !== -1) && chart.type === "bubble" && (
                                            <Bubble
                                                data={chart.data}
                                                height={chart.height}
                                                options={chart.options}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </Col>
                        ))
                    }
                </Row>
                {(this.props.user.role === 'ROLE_ADMIN' || this.props.user.permissions.indexOf('MG_CM') !== -1) &&
                    <Card className="card-default">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-12">
                                    <h3>Companies</h3>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-12">
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th>Code</th>
                                                <th>Created On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.companies.map((obj, i) => {
                                                return (
                                                    <tr key={obj.id}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <Link to={`/companies/${obj.id}`}>
                                                                {obj.name}
                                                            </Link>
                                                        </td>
                                                        <td>
                                                            {obj.type === 'B' ? "Buyer" : "Vendor"}
                                                        </td>
                                                        <td>
                                                            {obj.code}
                                                        </td>
                                                        <td>
                                                            <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>

                                    <CustomPagination page={this.state.page} onChange={(x) => this.loadCompanies(x)} />
                                </div>
                            </div>
                        </div>
                    </Card>}

                <Card className="card-default">
                    <div className="card-header">
                        <div className="row">
                            <div className="col-md-12">
                                <h3>Events</h3>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-12">
                                <BigCalendar
                                    localizer={localizer}
                                    style={{ minHeight: 500 }}
                                    popup={false}
                                    events={this.state.events}
                                    onEventDrop={this.moveEvent}
                                    onNavigate={e => this.onNavigate(e)}
                                    onEventResize={this.resizeEvent}
                                    onSelectEvent={this.selectEvent}
                                    defaultView="month"
                                    defaultDate={new Date()}
                                    eventPropGetter={this.parseStyleProp}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </ContentWrapper >
        );
    }
}

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(Dashboard);
