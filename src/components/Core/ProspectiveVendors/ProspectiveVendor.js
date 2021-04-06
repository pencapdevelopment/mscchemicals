import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import axios from 'axios';
import swal from 'sweetalert';
import PageLoader from '../../Common/PageLoader';

import TabPanel from '../../Common/TabPanel';
import {
    Modal,
   ModalBody, ModalHeader,
} from 'reactstrap';
import { server_url, context_path} from '../../Common/constants';
import {  Tab, Tabs, AppBar } from '@material-ui/core';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';

 import ProspectiveVendorList  from './ProspectiveVendorList';
 import ProspectiveVendorAdd from './ProspectiveVendorAdd';
 import ProspectiveVendorView from './ProspectiveVendorView';

// const json2csv = require('json2csv').parse;

class ProspectiveVendor extends Component {

    state = {
        activeTab: 0,
        loading: true,
        baseUrl: 'prospective-vendor',
        editFlag: false,
        currentId: 0,
        importBtndisable:false,
        importBtnText:'Submit'
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
    fileSelected(name, e) {
        var file = e.target.files[0];
        var sizeinMb = file.size / (1024 * 1024);
        if (sizeinMb > 3) {
            var error = this.state.error;
            error[name] = 'File is > 3MB'
            this.setState({ error });
        }
        this.setState({ name: file.name });
    }
    uploadFiles() {
        var imagefile = document.querySelector('#fileUpload');
        if(imagefile.files.length){
            this.setState({importBtndisable:true,importBtnText:"Please Wait..."});
            var formData = new FormData();
            formData.append("file", imagefile.files[0]);
            formData.append("from", "prospectiveVendor");
            // formData.append("parent", '');
            formData.append("fileType", "import prospectiveVendors");
            // if (this.state.formWizard.obj.enableExpiryDate && this.state.formWizard.obj.expiryDate) {
            //     formData.append("expiryDate", this.state.formWizard.obj.expiryDate);
            // }
            // docs/upload
            axios.post(server_url + context_path + 'bulkimportpv/prospectiveVendor', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                console.log(res);
                this.setState({importBtndisable:false,importBtnText:"Submit"});
                if (res.data.status) {
                    // this.toggleModal(this.state.label);
                    this.closetoggleModal();
                    swal("Imported!", res.data.msg, "success");
                } else {
                    swal("Unable to Import!", res.data.msg, "error");
                }
            }).catch(err => {
                this.setState({importBtndisable:false,importBtnText:"Submit"});
                this.closetoggleModal();
                var msg = "Select a File";
                console.log("error is", err);
                if (err?.response?.data?.globalErrors && err?.response?.data?.globalErrors[0]) {
                    msg = err.response.data.globalErrors[0];
                }
                swal("Unable to Import!", msg, "error");
            })
        }
        else{
            swal("Unable to Import!", "Select a File", "error");
        }
    }
    downloadSampleFile = (e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        // var doc = this.state.docs[idx];
        axios({
            url: server_url + context_path + "bulkimportpv/samplefile",
            method: 'GET',
            responseType: 'blob',
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'prospectiveVendor.csv');
            document.body.appendChild(link);
            link.click();
        });
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
                        Upload
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
                        <span><a href="javascript:void(0);" className="btn-link" 
                            onClick={(e) => this.downloadSampleFile(e)}>download sample file</a>
                        </span><br/>
                        <span><strong>Note:-</strong>*Please upload .CSV files only</span>
                        {/* {this.state.formWizard.obj.enableExpiryDate &&  */}
                        {/*  } */}
                        <div className="text-center">
                            <Button variant="contained" color="primary" disabled={this.state.importBtndisable} 
                            onClick={e => this.uploadFiles()}>{this.state.importBtnText}</Button>
                        </div>
                    </ModalBody>
                </Modal>
              
                {this.state.loading && <PageLoader />}
                {this.state.currentId === 0 && 
                <div>
                    <div className="content-heading">
                    <h4 className="col-7 my-2" onClick={() => this.toggleTab(0)}>
                        <span>Prospective Vendors</span>
                    </h4>

                    <div className="col-3 float-right mt-2">
                        <Button variant="contained" color="warning" size="xs"
                            onClick={() => this.toggleTab(1)} > + Add Prospective Vendors</Button>
                    </div>
                    <div className="col-1 float-right mt-2">
                    <Button type="submit" className="btn btn-raised btn-primary" style={{marginLeft: "-20px"}} onClick={e => this.toggleModal()} >Bulk Import</Button>
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
                                    {/*<Tab label="List" />
                                    <Tab label="Add Lead" hidden={this.state.editFlag} />*/}
                                    <Tab label="View Lead" hidden={!this.state.editFlag} />
                                </Tabs>
                            </AppBar>
                            <TabPanel value={this.state.activeTab} index={0}>
                                <ProspectiveVendorList baseUrl={this.state.baseUrl} onRef={ref => (this.listTemplateRef = ref)}
                                onUpdateRequest={id => this.updateObj(id)}></ProspectiveVendorList>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={1}>
                                <ProspectiveVendorAdd baseUrl={this.state.baseUrl} onRef={ref => (this.addTemplateRef = ref)} 
                                onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}></ProspectiveVendorAdd>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={2}>
                                <ProspectiveVendorView baseUrl={this.state.baseUrl} onRef={ref => (this.viewTemplateRef = ref)} 
                                onUpdateRequest={id => this.updateObj(id)} currentId={this.state.currentId} location={this.props.location}></ProspectiveVendorView>
                            </TabPanel>

                        </div>
                    </div>
                </div>}
                {this.state.currentId > 0 && 
                <ProspectiveVendorView baseUrl={this.state.baseUrl} onRef={ref => (this.viewTemplateRef = ref)} 
                    onUpdateRequest={id => this.updateObj(id)} currentId={this.state.currentId} location={this.props.location}></ProspectiveVendorView>}
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
)(ProspectiveVendor);