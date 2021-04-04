import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';

import PageLoader from '../../Common/PageLoader';
import axios from 'axios';
import TabPanel from '../../Common/TabPanel';
import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import { Tab, Tabs, AppBar, Button } from '@material-ui/core';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';
import swal from 'sweetalert';
import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';
import {
    Modal,
   ModalBody, ModalHeader,
} from 'reactstrap';
import List from './List';
import Add from './Add';
import View from './View';

// const json2csv = require('json2csv').parse;

class Products extends Component {
    state = {
        activeTab: 0,
        loading: true,
        modal1: false,
        baseUrl: 'products',
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
    uploadFiles() {
        var formData = new FormData();
        var imagefile = document.querySelector('#fileUpload');
        formData.append("file", imagefile.files[0]);
        formData.append("from", "companies");
        // formData.append("parent", '');
        formData.append("fileType", this.state.label);
        // if (this.state.formWizard.obj.enableExpiryDate && this.state.formWizard.obj.expiryDate) {
        //     formData.append("expiryDate", this.state.formWizard.obj.expiryDate);
        // }
        axios.post(server_url + context_path + 'docs/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            if (res.data.uploaded === 1) {
                // this.toggleModal(this.state.label);
                var joined = this.state.uploadedFiles.concat(res.data);
                this.setState({ uploadedFiles: joined });
                this.closetoggleModal();
                swal("Uploaded!", "File Uploaded", "success");
            } else {
                swal("Unable to Upload!", "Upload Failed", "error");
            }
        }).catch(err => {
            var msg = "Select File";

            if (err.response.data.globalErrors && err.response.data.globalErrors[0]) {
                msg = err.response.data.globalErrors[0];
            }
            swal("Unable to Upload!", msg, "error");
        })
    //     this.convertToOrder();
    }
    closetoggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    };
    closetoggleModalProduct = () => {
        this.setState({
            modalproduct: !this.state.modalproduct
        });
    };
    toggleModal = (label) => {
        this.setState({
            modal: !this.state.modal,
            label: label
        });
    };
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
                 <Modal isOpen={this.state.modal} backdrop="static" toggle={this.closetoggleModal} size={'md'}>
                    <ModalHeader toggle={this.closetoggleModal}>
                        Upload - Po
                        {/* {this.state.label} */}
                    </ModalHeader>
                    <ModalBody>
                        <fieldset>
                            <Button
                                variant="contained"
                                component="label" color="primary"> Select File
                                    <input type="file" id="fileUpload"
                                    name="fileUpload" accept='.csv'
                                    onChange={e => this.fileSelected('fileUpload', e)}
                                    style={{ display: "none" }} />
                            </Button>{this.state.name}
                        </fieldset>
                        <span><strong>Note:-</strong>*Please upload .CSV files only</span>
                        {/* {this.state.formWizard.obj.enableExpiryDate &&  */}
                        {/*  } */}
                        <div className="text-center">
                            <Button variant="contained" color="primary" onClick={e => this.uploadFiles()}>Submit</Button>
                        </div>
                    </ModalBody>
                </Modal>
                {this.state.loading && <PageLoader />}
                {this.state.currentId === 0 &&
                    <div>
                        <div className="content-heading">
                            <h4 className="col-8 my-2" onClick={() => this.toggleTab(0)}>
                                <span>Products</span>
                            </h4>

                            <div className="col-2 float-right mt-2">
                                <Button variant="contained"  style={{marginLeft: "30px"}} color="warning" size="xs"
                                    onClick={() => this.toggleTab(1)} > + Add Product</Button>
                            </div>
                            <div className="col-2 float-right mt-2">
                                <Button variant="contained" color="warning"   size="xs"
                                   onClick={e => this.toggleModal()} > Bulk Import</Button>
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
                                        style={{ display: 'none' }}
                                        onChange={(e, i) => this.toggleTab(i)} >
                                        <Tab label="List" />
                                        <Tab label="Add Product" hidden={this.state.editFlag} />
                                        <Tab label="View Product" hidden={!this.state.editFlag} />
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
)(Products);