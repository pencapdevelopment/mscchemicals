import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';

import PageLoader from '../../Common/PageLoader';

import TabPanel from '../../Common/TabPanel';

// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import {  Tab, Tabs, AppBar,Button } from '@material-ui/core';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';

import List from './List';
import Add from './Add';
import View from './View';

// const json2csv = require('json2csv').parse;

class CompanyContacts extends Component {
    state = {
        activeTab: 0,
        loading: true,
        baseUrl: 'company-contact',
        editFlag: false,
        currentId: 0
    }

    toggleTab = (tab) => {
        if (tab === 0) {
            this.setState({ editFlag: false })
        }
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    saveSuccess(id) {
        this.setState({ editFlag: true, currentId: id });
        this.toggleTab(2);
    }

    updateObj(id) {
        this.toggleTab(1);
        this.setState({ editFlag: false }, () => {
            this.addTemplateRef.updateObj(id);
        })
    }

    cancelSave = () => {
        this.toggleTab(0);
    }

    componentWillUnmount() {
        if(this.props.company) {
            this.props.onRef(undefined);
        }
    }

    componentDidMount() {
        if(this.props.company) {
            this.props.onRef(this);
        } else if (this.props.match && this.props.match.params.objId) {
            this.setState({ editFlag: true, currentId: this.props.match.params.objId });
            this.toggleTab(2);
        }

        this.setState({ loading: false })
    }

    render() {

        return (
            <ContentWrapper>
                
                {this.state.loading && <PageLoader />}
                {this.state.currentId === 0 && 
                <div>
                    {!this.props.company &&
                    <div className="content-heading">
                          <h4 className="col-10 my-2" onClick={() => this.toggleTab(0)}>
                                <span>Contacts</span>
                            </h4>

                            <div className="col-2 float-right mt-2">
                                <Button variant="contained" color="warning" size="xs"
                                    onClick={() => this.toggleTab(1)} > + Add Contact</Button>
                            </div>
                     </div>}
                    <div className="row">
                        <div className="col-md-12">
                            <AppBar position="static">
                                <Tabs
                                    className="bg-white"
                                    indicatorColor="primary"
                                    textColor="primary"
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    aria-label="scrollable auto tabs example"
                                    value={this.state.activeTab}
                                    style={{ display: 'none' }}
                                    onChange={(e, i) => this.toggleTab(i)} >
                                    <Tab label="List" />
                                    <Tab label="Add Contact" hidden={this.state.editFlag} />
                                    <Tab label="View Contact" hidden={!this.state.editFlag} />
                                </Tabs>
                            </AppBar>
                            <TabPanel value={this.state.activeTab} index={0}>
                                <List baseUrl={this.state.baseUrl} onRef={ref => (this.listTemplateRef = ref)}
                                onUpdateRequest={id => this.updateObj(id)}
                                company={this.props.company}></List>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={1}>
                                <Add baseUrl={this.state.baseUrl} onRef={ref => (this.addTemplateRef = ref)} 
                                onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}
                                company={this.props.company}></Add>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={2}>
                                <View baseUrl={this.state.baseUrl} onRef={ref => (this.viewTemplateRef = ref)} 
                                onUpdateRequest={id => this.updateObj(id)} currentId={this.state.currentId} location={this.props.location}
                                company={this.props.company}></View>
                            </TabPanel>
                        </div>
                    </div>
                </div>}
                {this.state.currentId > 0 && 
                <View baseUrl={this.state.baseUrl} onRef={ref => (this.viewTemplateRef = ref)} 
                    onUpdateRequest={id => this.updateObj(id)} currentId={this.state.currentId} location={this.props.location}
                    company={this.props.company}></View>}
            </ContentWrapper>
        )
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(CompanyContacts);