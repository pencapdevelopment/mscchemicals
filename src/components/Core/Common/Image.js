import { Button } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Modal,
    ModalBody, ModalHeader
} from 'reactstrap';
import swal from 'sweetalert';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { context_path, server_url } from '../../Common/constants';
import ContentWrapper from '../../Layout/ContentWrapper';
class Image extends Component {
    state = {
        modal: false,
        error: {},
        obj: {},
        exts: {
            'png': 'image/png',
            'jpg': 'image/jpeg',
        }
    }
    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        // console.log('image component did mount');
        // console.log(this.props.currentId);
        this.props.onRef(this);
        this.setState({obj: this.props.parentObj});
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
    updateImage() {
        axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.obj.id, {image: true})
        .then(res => {
            var obj = this.state.obj;
            obj.image = true;
            this.setState({ obj });
        }).finally(() => {
            this.setState({ loading: false });
        }).catch(err => {
            this.setState({ patchError: err.response.data.globalErrors[0] });
            swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
        })
    }
    uploadFiles() {
        var formData = new FormData();
        var imagefile = document.querySelector('#fileUpload');
        formData.append("file", imagefile.files[0]);
        axios.post(server_url + context_path + this.props.baseUrl + '-images/' + this.state.obj.id, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            if (res.status === 200) {
                this.toggleModal();
                if(!this.state.obj.image) {
                    this.updateImage();
                }
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
    downloadFile = (e, type) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        // var doc = this.state.docs[idx];
        var doc = this.state.obj.docs.find(g => g.fileType === type);
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
                        <Modal isOpen={this.state.modal} toggle={this.toggleModal} size={'md'}>
                            <ModalHeader toggle={this.toggleModal}>
                                Upload Image
                            </ModalHeader>
                            <ModalBody>
                                <fieldset>
                                    <Button
                                        variant="contained"
                                        component="label"> Select File
                                    <input type="file" id="fileUpload"
                                            name="fileUpload" accept='.png,.jpg'
                                            onChange={e => this.fileSelected('fileUpload', e)}
                                            style={{ display: "none" }} />
                                    </Button>{this.state.name}
                                </fieldset>
                                <span>*Please upload .png,.jpg files only</span>
                                <div className="text-center">
                                    <Button variant="contained" color="primary" onClick={e => this.uploadFiles()}>Save</Button>
                                </div>
                            </ModalBody>
                        </Modal>
                        {!this.state.obj.image && 
                            // <Button  style={{marginTop: -8,marginLeft: 0}} size="small" onClick={this.toggleModal} variant="contained" color="primary" startIcon={<CloudUploadIcon />}>Upload
                            //  </Button>
                               <img onClick={this.toggleModal}  style={{width: 70, height: 50, marginBottom: -5}} src="img/logo4.png" /> 
                                
                            //                                 {/* <Avatar className="avatar" size="small"  alt={this.state.obj.name} src="img/dummy.png" /> 
                           
                        }
                        {this.state.obj.image && 
                            <Button onClick={this.toggleModal}>
                                <Avatar className="avatar" alt={this.state.obj.name} src={`${server_url + context_path + this.props.baseUrl}-images/${this.state.obj.id}`} />
                            </Button>
                        }
        </ContentWrapper>)
    }
}
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(Image);