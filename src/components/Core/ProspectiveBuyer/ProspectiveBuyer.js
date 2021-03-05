import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';

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

 import ProspectiveBuyerList  from './ProspectiveBuyerList';
 import ProspectiveBuyerAdd from './ProspectiveBuyerAdd';
 import ProspectiveBuyerView from './ProspectiveBuyerView';

// const json2csv = require('json2csv').parse;

class ProspectiveBuyer extends Component {

    state = {
        activeTab: 0,
        loading: true,
        baseUrl: 'prospective-buyer',
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
        console.log(id);
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
                    <div className="content-heading">
                    <h4 className="col-9 my-2" onClick={() => this.toggleTab(0)}>
                        <span>Prospective Buyers</span>
                    </h4>

                    <div className="col-3 float-right mt-2">
                        <Button variant="contained" color="warning" size="xs"
                            onClick={() => this.toggleTab(1)} > + Add Prospective Buyers</Button>
                    </div>
                     </div>
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
                                   {/* <Tab label="List" />
                                  <Tab label="Add Lead" hidden={this.state.editFlag} />*/}
                                   {/*  <Tab label="View Lead" hidden={!this.state.editFlag} /> */}
                                </Tabs>
                            </AppBar>
                            <TabPanel value={this.state.activeTab} index={0}>
                                <ProspectiveBuyerList baseUrl={this.state.baseUrl} onRef={ref => (this.listTemplateRef = ref)}
                                onUpdateRequest={id => this.updateObj(id)}></ProspectiveBuyerList>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={1}>
                                <ProspectiveBuyerAdd baseUrl={this.state.baseUrl} onRef={ref => (this.addTemplateRef = ref)} 
                                onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}></ProspectiveBuyerAdd>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={2}>
                                <ProspectiveBuyerView baseUrl={this.state.baseUrl} onRef={ref => (this.viewTemplateRef = ref)} 
                                onUpdateRequest={id => this.updateObj(id)} currentId={this.state.currentId} location={this.props.location}></ProspectiveBuyerView>
                            </TabPanel>

                        </div>
                    </div>
                </div>}
                {this.state.currentId > 0 && 
                <ProspectiveBuyerView baseUrl={this.state.baseUrl} onRef={ref => (this.viewTemplateRef = ref)} 
                    onUpdateRequest={id => this.updateObj(id)} currentId={this.state.currentId} location={this.props.location}></ProspectiveBuyerView>}
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
)(ProspectiveBuyer);