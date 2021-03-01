import React, { Suspense, lazy } from 'react';
import PrivateRoute from './components/Shared/PrivateRoute';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

/* loader component for Suspense*/
import PageLoader from './components/Common/PageLoader';

import Base from './components/Layout/Base';
import BasePage from './components/Layout/BasePage';
// import BaseHorizontal from './components/Layout/BaseHorizontal';

/* Used to render a lazy component with react-router */
const waitFor = Tag => props => <Tag {...props} />;
const Login = lazy(() => import('./components/Public/Login'));
const Recover = lazy(() => import('./components/Public/Recover'));
const Mobile = lazy(() => import('./components/Public/Mobile'));
const Register = lazy(() => import('./components/Public/Register'));

const Dashboard = lazy(() => import('./components/Website/Dashboard'));


const Users = lazy(() => import('./components/Accounts/Users'));
const User = lazy(() => import('./components/Accounts/Profile'));
const Roles = lazy(() => import('./components/Core/Roles/Roles'));

const Groups = lazy(() => import('./components/Contacts/Groups'));
const GroupContacts = lazy(() => import('./components/Contacts/GroupContacts'));

const BulkSMS = lazy(() => import('./components/Bulk/BulkSMS'));
const BulkMail = lazy(() => import('./components/Bulk/BulkMail'));

const Blog = lazy(() => import('./components/Core/Blog'));

const Profile = lazy(() => import('./components/User/Profile'));

const Feedbacks = lazy(() => import('./components/Website/Feedbacks'));
const Subscribers = lazy(() => import('./components/Website/Subscribers'));

const Categories = lazy(() => import('./components/Core/Categories'));
const Notifications = lazy(() => import('./components/Core/Notifications'));
const SalesNotifications = lazy(() => import('./components/Core/SalesNotifications'));
const PurchaseNotifications = lazy(() => import('./components/Core/PurchaseNotifications'));



// Core Features
const Template = lazy(() => import('./components/Core/Template/Template'));

const Companies = lazy(() => import('./components/Core/Companies/Companies'));
const Branches = lazy(() => import('./components/Core/Companies/Branches'));
const Contacts = lazy(() => import('./components/Core/CompanyContacts/CompanyContacts'));
const Products = lazy(() => import('./components/Core/Products/Products'));
const SalesEnquiry = lazy(() => import('./components/Core/SalesEnquiry/SalesEnquiry'));
const PurchaseEnquiry = lazy(() => import('./components/Core/PurchaseEnquiry/PurchaseEnquiry'));
const Followups = lazy(() => import('./components/Core/Followups/Followups'));

const Lead = lazy(() => import('./components/Core/Lead/Lead'));
const Tracking = lazy(() => import('./components/Core/Tracking/Tracking'));
const Order = lazy(() => import('./components/Core/Orders/Order'));
const Event = lazy(() => import('./components/Core/Events/Event'));
const CostAccount = lazy(() => import('./components/Core/CostAccount'));
const Approvals = lazy(() => import('./components/Core/Approvals/Approval'));

const Invoices = lazy(() => import('./components/Core/Invoices'));

const Reports = lazy(() => import('./components/Core/Reports'));
const ProspectiveBuyers = lazy(()=> import('./components/Core/ProspectiveBuyer/ProspectiveBuyer'))
const ProspectiveVendor = lazy(()=> import('./components/Core/ProspectiveVendors/ProspectiveVendor'))
// const Sales1 = lazy(()=> import('./components/Core/Sales1/Add1'))



// List of routes that uses the page layout
// listed here to Switch between layouts
// depending on the current pathname
const listofPages = [
    /* See full project for reference */
    '/login',
    '/recover',
    '/mobile',
    '/register',
    '/notfound',
    '/error500',
    '/maintenance'
];

const Routes = ({ location }) => {
    const currentKey = location.pathname.split('/')[1] || '/';
    const timeout = { enter: 500, exit: 500 };

    // Animations supported
    //      'rag-fadeIn'
    //      'rag-fadeInRight'
    //      'rag-fadeInLeft'

    const animationName = 'rag-fadeIn'

    if (listofPages.indexOf(location.pathname) > -1) {
        return (
            // Page Layout component wrapper
            <BasePage>
                <Suspense fallback={<PageLoader />}>
                    <Switch location={location}>
                        <Route path="/login" component={waitFor(Login)} />
                        <Route path="/recover" component={waitFor(Recover)} />
                        <Route path="/mobile" component={waitFor(Mobile)} />
                        <Route path="/register" component={waitFor(Register)} />

                        {/* See full project for reference */}
                    </Switch>
                </Suspense>
            </BasePage>
        )
    }
    else {
        return (
            // Layout component wrapper
            // Use <BaseHorizontal> to change layout
            <Base>
                <TransitionGroup>
                    <CSSTransition key={currentKey} timeout={timeout} classNames={animationName} exit={false}>
                        <div>
                            <Suspense fallback={<PageLoader />}>
                                <Switch location={location}>
                                    <PrivateRoute path="/dashboard" component={waitFor(Dashboard)} />

                                    <PrivateRoute path="/bulk-sms" component={waitFor(BulkSMS)} />
                                    <PrivateRoute path="/bulk-mail" component={waitFor(BulkMail)} />
                                    <PrivateRoute path="/blog" component={waitFor(Blog)} />

                                    <PrivateRoute path="/users/:objId" component={waitFor(User)} />
                                    <PrivateRoute path="/all-users" component={waitFor(Users)} />
                                    <PrivateRoute path="/users" component={waitFor(Users)} />
                                    <PrivateRoute path="/profile" component={waitFor(Profile)} />

                                    <PrivateRoute path="/roles/:objId" component={waitFor(Roles)} />
                                    <PrivateRoute path="/roles" component={waitFor(Roles)} />

                                    <PrivateRoute path="/groups/:objId" component={waitFor(GroupContacts)} />
                                    <PrivateRoute path="/groups" component={waitFor(Groups)} />

                                    <PrivateRoute path="/feedbacks" component={waitFor(Feedbacks)} />
                                    <PrivateRoute path="/subscribers" component={waitFor(Subscribers)} />

                                    <PrivateRoute path="/events" component={waitFor(Event)} />
                                    <PrivateRoute path="/reports" component={waitFor(Reports)} />
                                    <PrivateRoute path="/categories" component={waitFor(Categories)} />
                                    <PrivateRoute path="/notifications" component={waitFor(Notifications)} />
                                    
                                    <PrivateRoute path="/template/:objId" component={waitFor(Template)} />
                                    <PrivateRoute path="/template" component={waitFor(Template)} />
                                   
                                    {/* Core Features */}
                                    <PrivateRoute path="/companies/:objId" component={waitFor(Companies)} />
                                    <PrivateRoute path="/companies" component={waitFor(Companies)} />
                                    <PrivateRoute path="/branches/:objId" component={waitFor(Branches)} />
                                    <PrivateRoute path="/branches" component={waitFor(Branches)} />
                                    <PrivateRoute path="/company-contact/:objId" component={waitFor(Contacts)} />
                                   
                                    <PrivateRoute path="/company-contact" component={waitFor(Contacts)} />
                                    <PrivateRoute path="/products/:objId" component={waitFor(Products)} />
                                    <PrivateRoute path="/products" component={waitFor(Products)} />
                                    <PrivateRoute path="/sales/:objId" component={waitFor(SalesEnquiry)} />
                                    <PrivateRoute path="/sales" component={waitFor(SalesEnquiry)} />
                                    <PrivateRoute path="/purchases/:objId" component={waitFor(PurchaseEnquiry)} />
                                    <PrivateRoute path="/purchases" component={waitFor(PurchaseEnquiry)} />
                                    <PrivateRoute path="/followups/:objId" component={waitFor(Followups)} />
                                    <PrivateRoute path="/followups" component={waitFor(Followups)} />

                                    <PrivateRoute path="/leads/:objId" component={waitFor(Lead)} />
                                    <PrivateRoute path="/leads" component={waitFor(Lead)} />
                                    <PrivateRoute path="/ProspectiveBuyer/:objId" component={waitFor(ProspectiveBuyers)} />
                                    <PrivateRoute path="/ProspectiveBuyer" component={waitFor(ProspectiveBuyers)} />
                                    <PrivateRoute path="/prospectivevendor/:objId" component={waitFor(ProspectiveVendor)} />
                                    <PrivateRoute path="/prospectivevendor" component={waitFor(ProspectiveVendor)} />
                                    {/* <PrivateRoute path="/sales1" component={waitFor(Sales1)} /> */}
                                    <PrivateRoute path="/sales-approval-alerts" component={waitFor(SalesNotifications)} />
                                    <PrivateRoute path="/purchases-approval-alerts" component={waitFor(PurchaseNotifications)} />
                                    <PrivateRoute path="/approvals" component={waitFor(Approvals)} />

                                    <PrivateRoute path="/trackings/:objId" component={waitFor(Tracking)} />
                                    <PrivateRoute path="/trackings" component={waitFor(Tracking)} />
                                    <PrivateRoute path="/orders/:objId" component={waitFor(Order)} />
                                    <PrivateRoute path="/orders" component={waitFor(Order)} />
                                    <PrivateRoute path="/cost-accounting" component={waitFor(CostAccount)} />
                                    <PrivateRoute path="/invoices" component={waitFor(Invoices)} />

                                    <Redirect to="/dashboard" />
                                </Switch>
                            </Suspense>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </Base>
        )
    }
}

export default withRouter(Routes);
