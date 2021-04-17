import { AppBar, Tab, Tabs,Button } from '@material-ui/core';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import PageLoader from '../../Common/PageLoader';
import TabPanel from '../../Common/TabPanel';
import ContentWrapper from '../../Layout/ContentWrapper';
import Add from './Add1';
import List from './List';
import View from './View';
import {
    Modal,
   ModalBody, ModalHeader,
} from 'reactstrap';
import axios from 'axios';
import { server_url, context_path} from '../../Common/constants';
import swal from 'sweetalert';
// const json2csv = require('json2csv').parse;
class Companies extends Component {
    state = {
        activeTab: 0,
        loading: true,
        baseUrl: 'companies',
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
            formData.append("from", "companies");
            // formData.append("parent", '');
            formData.append("fileType", "import companies");
            // if (this.state.formWizard.obj.enableExpiryDate && this.state.formWizard.obj.expiryDate) {
            //     formData.append("expiryDate", this.state.formWizard.obj.expiryDate);
            // }
            // docs/upload
            axios.post(server_url + context_path + 'bulkimportcomp/companies', formData, {
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
                this.closetoggleModal();
                this.setState({importBtndisable:false,importBtnText:"Submit"});
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
            url: server_url + context_path + "bulkimportcomp/samplefile",
            method: 'GET',
            responseType: 'blob',
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'companies.csv');
            document.body.appendChild(link);
            link.click();
        });
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
                            <Button variant="contained" color="primary" disabled={this.state.importBtndisable} onClick={e => this.uploadFiles()}>{this.state.importBtnText}</Button>
                        </div>
                    </ModalBody>
                </Modal>
              
                {this.state.loading && <PageLoader />}
                {this.state.currentId === 0 && 
                <div>
                    <div className="content-heading">
                    <h4 className="col-8 my-2" onClick={() => this.toggleTab(0)}>
                        <span>Companies</span>
                    </h4>
                    {  this.props.user.role === 'ROLE_ADMIN' &&
                         <div className="col-2 float-right mt-2">
                         <Button variant="contained" color="warning" size="xs"
                             onClick={() => this.toggleTab(1)} > + Add Company</Button>
                     </div>
                     }
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
                                    style={{ display: 'none' }}
                                    onChange={(e, i) => this.toggleTab(i)} >
                                    <Tab label="List" />
                                    <Tab label="Add Company" hidden={this.state.editFlag} />
                                    <Tab label="View Company" hidden={!this.state.editFlag} />
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
)(Companies);