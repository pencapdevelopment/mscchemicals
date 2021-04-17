import React, { Component } from 'react';
import ContentWrapper from '../Layout/ContentWrapper';
import { connect } from 'react-redux';

import PageLoader from '../Common/PageLoader';

// import TabPanel from '../Common/TabPanel';

// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../Common/constants';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';
import Upload from './Common/Upload';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
 

// const json2csv = require('json2csv').parse;

class CostAccount extends Component {
    state = {
        activeTab: 0,
        loading: true,
        baseUrl: 'products',
        editFlag: false,
        currentId: 0,
        fileTypes: [
            { label: 'Document', expiryDate: false },
             
        ],
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
                    <div className="content-heading">Cost Accounting </div>
                    <div className="row">
                        <div className="col-md-12">
                            <Upload onRef={ref => (this.uploadRef = ref)} fileFrom='cost-account' currentId={1} 
                            fileTypes={this.state.fileTypes}></Upload>
                            
                        </div>
                    </div>
                </div>}
                 
                 
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
)(CostAccount);