import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';

import PageLoader from '../../Common/PageLoader';

import TabPanel from '../../Common/TabPanel';

// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import {  Tab, Tabs, AppBar } from '@material-ui/core';
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


class SalesEnquiry extends Component {

    state = {
        activeTab: 0,
        loading: true,
        baseUrl: 'sales',
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
        console.log(id);
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

    componentDidMount() {
        if (this.props.match.params.objId) {
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
                    <div className="content-heading">Sales Enquiry </div>
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
                                    onChange={(e, i) => this.toggleTab(i)} >
                                    <Tab label="List" />
                                    <Tab label="Add" hidden={this.state.editFlag} />
                                    <Tab label="View" hidden={!this.state.editFlag} />
                                </Tabs>
                            </AppBar>
                            <TabPanel value={this.state.activeTab} index={0}>
                                <List baseUrl={this.state.baseUrl} onRef={ref => (this.listTemplateRef = ref)}
                                onUpdateRequest={id => this.updateObj(id)}></List>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={1}>
                                <Add baseUrl={this.state.baseUrl} onRef={ref => (this.addTemplateRef = ref)} 
                                onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}></Add>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={2}>
                                <View baseUrl={this.state.baseUrl} onRef={ref => (this.viewTemplateRef = ref)} 
                                onUpdateRequest={id => this.updateObj(id)} currentId={this.state.currentId} location={this.props.location}></View>
                            </TabPanel>

                        </div>
                    </div>
                </div>}
                {this.state.currentId > 0 && 
                <View baseUrl={this.state.baseUrl} onRef={ref => (this.viewTemplateRef = ref)} 
                    onUpdateRequest={id => this.updateObj(id)} currentId={this.state.currentId} location={this.props.location}></View>}
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
)(SalesEnquiry);