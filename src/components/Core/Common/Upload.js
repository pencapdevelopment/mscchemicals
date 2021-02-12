import MomentUtils from '@date-io/moment';
import { Button, TextField } from '@material-ui/core';
import Event from '@material-ui/icons/Event';
import {
    DatePicker,
    MuiPickersUtilsProvider
} from '@material-ui/pickers';
import axios from 'axios';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import {
    Form, Modal,

    ModalBody, ModalHeader, Table
} from 'reactstrap';
import swal from 'sweetalert';
import { context_path, server_url } from '../../Common/constants';
import Sorter from '../../Common/Sorter';
import ContentWrapper from '../../Layout/ContentWrapper';






// const json2csv = require('json2csv').parse;


class Upload extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        editSubFlag: false,
        modal: false,
        error: {},
        formWizard: {
            docs: [],
            obj: {
                label: '',
                expiryDate: null,
            }
        },
        subObjs: [],
        newSubObj: {},
        subPage: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            search: '',
            fromDate: null,
            toDate: null,
        },
        exts: {
            'doc': 'application/msword',
            'docx': 'application/msword',
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
        }
    }

    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }

    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    loadObj() {
        axios.get(server_url + context_path + "api/docs?parent=" + this.props.currentId + "&active=true&fileFrom=" + this.props.fileFrom).then(res => {
            var formWizard = this.state.formWizard;
            formWizard.docs = res.data._embedded.docs;
            this.setState({ formWizard });
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        // console.log('upload component did mount');
        // console.log(this.props.currentId);
        this.loadObj();

        this.props.onRef(this);
    }

    updateObj() {
        this.setState({ editFlag: true }, () => {
            this.addTemplateRef.updateObj(this.props.currentId);
        })
    }

    saveSuccess(id) {
        this.setState({ editFlag: false });
    }

    cancelSave = () => {
        this.setState({ editFlag: false });
    }

    addSubObj = () => {
        this.setState({ editSubFlag: false });

        this.toggleModal();
    }

    editSubObj = (i) => {
        var files = this.props.fileTypes[i];
        var formWizard = this.state.formWizard;
        formWizard.obj = {};
        formWizard.obj.label = files.label;
        formWizard.obj.enableExpiryDate = files.expiryDate;
        formWizard.obj.expiryDate = null;

        this.setState({ editSubFlag: true, formWizard: formWizard }, this.toggleModal);
    }

    saveObjSuccess(id) {
        this.setState({ editSubFlag: true });
        this.toggleModal();
        this.loadSubObjs();
    }

    searchSubObj = e => {
        var str = e.target.value;
        var filters = this.state.filters;

        filters.search = str;
        this.setState({ filters }, o => { this.loadSubObjs() });
    }

    filterByDate(e, field) {
        var filters = this.state.filters;

        if(e) {
            filters[field + 'Date'] = e.format();
        } else {
            filters[field + 'Date'] = null;
        }

        this.setState({ filters: filters }, g => { this.loadObjects(); });
    }

    onSort(e, col) {
        if (col.status === 0) {
            this.setState({ orderBy: 'id,desc' }, this.loadSubObjs)
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            this.setState({ orderBy: col.param + ',' + direction }, this.loadSubObjs);
        }
    }

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
        var formData = new FormData();
        var imagefile = document.querySelector('#fileUpload');
        formData.append("file", imagefile.files[0]);
        formData.append("from", this.props.fileFrom);
        formData.append("parent", this.props.currentId);
        formData.append("fileType", this.state.formWizard.obj.label);
        if (this.state.formWizard.obj.enableExpiryDate && this.state.formWizard.obj.expiryDate) {
            formData.append("expiryDate", this.state.formWizard.obj.expiryDate);
        }
        axios.post(server_url + context_path + 'docs/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            if (res.data.uploaded === 1) {
                this.toggleModal();
                this.loadObj();
                swal("Uploaded!", "File Uploaded", "success");
            } else {
                swal("Unable to Upload!", "Upload Failed", "error");
            }
        }).catch(err => {
            var msg = "Select File";
            
            if(err.response.data.globalErrors && err.response.data.globalErrors[0]) {
                msg = err.response.data.globalErrors[0];
            }

            swal("Unable to Upload!", msg, "error");
        })
    }

    getFileName = (type) => {
        var doc = this.state.formWizard.docs.find(g => g.fileType === type);
        if (doc) {
            // return doc.fileName;
            return <a href="#s" className="btn-link" onClick={(e) => this.downloadFile(e, type)}>
                        {doc.fileName}
                    </a>
        } else {
            return "-NA-";
        }
    }

    getExpiryDate = (type) => {
        var doc = this.state.formWizard.docs.find(g => g.fileType === type);
        if (doc && doc.expiryDate) {
            return moment(doc.expiryDate).format("DD MMM YYYY");
        } else {
            return "-NA-";
        }
    }

    getCreationDate = (type) => {
        var doc = this.state.formWizard.docs.find(g => g.fileType === type);
        if (doc && doc.creationDate) {
            return moment(doc.creationDate).format("DD MMM YYYY");
        } else {
            return "-NA-";
        }
    }

    setField(field, e) {
        var formWizard = this.state.formWizard;

        // var input = e.target;
        formWizard.obj[field] = e.target.value;
        this.setState({ formWizard });
    }

    setDateField(field, e) {
        var formWizard = this.state.formWizard;

        if(e) {
            formWizard.obj[field] = e.format();
        } else {
            formWizard.obj[field] = null;
        }

        this.setState({ formWizard });
    }

    downloadFile = (e, type) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        // var doc = this.state.docs[idx];
        var doc = this.state.formWizard.docs.find(g => g.fileType === type);

        axios({
            url: server_url + context_path + "docs/" + doc.id,
            method: 'GET',
            responseType: 'blob',
        }).then(response => {
            var fileType = doc.fileName.substr(doc.fileName.lastIndexOf('.') + 1);
            fileType = this.state.exts[fileType];

            const url = window.URL.createObjectURL(new Blob([response.data], { type: fileType }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.fileName);
            document.body.appendChild(link);
            link.click();
        });
    }

    render() {
        return (<ContentWrapper>
            <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">

                <div className="row">
                    <div className="col-md-12">
                        <Modal isOpen={this.state.modal} backdrop="static" toggle={this.toggleModal} size={'md'}>
                            <ModalHeader toggle={this.toggleModal}>
                            <img  style={{width: 20,height: 40, }} src="img/upload.jpg" />
  - {this.state.formWizard.obj.label}
                            </ModalHeader>
                            <ModalBody>
                                <fieldset>
                                    <Button
                                        variant="contained"
                                        component="label"> Select File
                                    <input type="file" id="fileUpload"
                                            name="fileUpload" accept='.doc,.docx,.pdf,.png,.jpg'
                                            onChange={e => this.fileSelected('fileUpload', e)}
                                            style={{ display: "none" }} />
                                    </Button>{this.state.name}
                                </fieldset>
                                <span>*Please upload .doc,.docx,.pdf,.png,.jpg files only</span>
                                {this.state.formWizard.obj.enableExpiryDate && <fieldset>
                                        <MuiPickersUtilsProvider utils={MomentUtils}>
                                            <DatePicker 
                                            autoOk
                                            clearable
                                            // variant="inline"
                                            label="Expiry Date"
                                            format="DD/MM/YYYY"
                                            value={this.state.formWizard.obj.expiryDate} 
                                            onChange={e => this.setDateField('expiryDate', e)} 
                                            TextFieldComponent={(props) => (
                                                <TextField
                                                type="text"
                                                name="expiryDate"
                                                id={props.id}
                                                label={props.label}
                                                onClick={props.onClick}
                                                value={props.value}
                                                disabled={props.disabled}
                                                {...props.inputProps}
                                                InputProps={{
                                                    endAdornment: (
                                                        <Event />
                                                    ),
                                                }}
                                                />
                                            )} />
                                        </MuiPickersUtilsProvider>
                                </fieldset>}
                                <div className="text-center">
                                    <Button variant="contained" color="primary" onClick={e => this.uploadFiles()}>Save</Button>
                                </div>
                            </ModalBody>
                        </Modal>
                        <div className="card-body bb bt">
                            <Table hover responsive>
                                <thead>
                                    <Sorter columns={[
                                        { name: 'File Type', sortable: false },
                                        { name: 'Action', sortable: false },
                                        { name: 'File Name', sortable: false },
                                        { name: 'Expiry Date', sortable: false },
                                        { name: 'Created On', sortable: false },
                                    ]}
                                    />
                                </thead>
                                <tbody>
                                    {this.props.fileTypes.map((obj, i) => {
                                        return (
                                            <tr key={obj.label} className={obj.noshow ? 'd-none' : ''}>
                                                <td>{obj.label}</td>
                                                <td>
                                                    {/* <Button variant="contained" disabled={this.props.disabled} color="warning" size="xs" onClick={() => this.editSubObj(i)}>  </Button> */}
                                                    <img onClick={() => this.editSubObj(i)}  style={{width: 20,height: 40, }} src="img/upload.jpg" />
                                                </td>
                                                <td>
                                                    {this.getFileName(obj.label)}
                                                </td>
                                                
                                                <td>
                                                {/* this.state.formWizard.obj.enableExpiryDate ? : '-NA-' */}
                                                    { this.getExpiryDate(obj.label) }
                                                </td>
                                                <td>
                                                    {this.getCreationDate(obj.label)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </Form>
        </ContentWrapper>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(Upload);