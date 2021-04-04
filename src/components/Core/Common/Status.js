import { Button, FormControl, InputLabel, MenuItem, Select, TextareaAutosize } from '@material-ui/core';
import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Modal,
    ModalBody, ModalHeader
} from 'reactstrap';
import swal from 'sweetalert';
import { context_path, server_url } from '../../Common/constants';
import Chip from '@material-ui/core/Chip';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
class Status extends Component {
    state = {
        modal: false,
        loading: false,
        error: {},
        selectedStatus: '',
        statusNotes:''
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
        this.props.onRef(this);
        this.setState({
            selectedStatus: this.props.status,
            statusNotes: this.props.statusNotes
        })
    }
    patchStatus = e => {
        e.preventDefault();

        axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.props.currentId, { status: this.state.selectedStatus,statusNotes:this.state.statusNotes })
            .then(res => {
                this.props.onUpdate(this.state.selectedStatus);
            }).finally(() => {
                this.setState({ loading: false });
                this.toggleModal();
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }

    render() {
        return (<span>
            <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                <ModalHeader toggle={this.toggleModal}>
                    Update {this.props.statusType} Status
                    </ModalHeader>
                <ModalBody>
                    <form className="form-horizontal" onSubmit={this.patchStatus}>
                        <fieldset>
                            <FormControl>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" name="status"
                                    value={this.state.selectedStatus}
                                    onChange={e => this.setState({ selectedStatus: e.target.value })}>
                                    {this.props.statusList.map((e, keyIndex) => {
                                        return (
                                            <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </fieldset>
                        {this.props.showNotes && <fieldset>
                            <FormControl>
                                
                                <TextareaAutosize
                                    label="Notes"
                                    placeholder="Notes"
                                    rowsMin={4}
                                    onChange={e => this.setState({ statusNotes: e.target.value })} 
                                    value={this.state.statusNotes}
                                    defaultValue={this.state.statusNotes}

/>
                            </FormControl>
                        </fieldset>}

                        <fieldset>
                            <div className="form-group text-center">
                                <Button variant="contained" color="primary" type="submit" className="btn btn-raised btn-primary" >Save</Button>
                            </div>
                        </fieldset>
                    </form>
                </ModalBody>
            </Modal>
<p style={{  textTransform: 'none', fontWeight: 'normal', marginLeft: 0, marginTop: -42, }}></p><span title="Status"  style={{  textTransform: 'none', fontWeight: 'normal', marginLeft: 0, marginTop: -50, }}  onClick={this.toggleModal}><ArrowDropDownIcon /></span>
                                                           
            {/* <button variant="contained" color="warning"  size="small"onClick={this.toggleModal}>
           <Chip 
                    className="ml-2 mr-2"  
                            label= "On going"
                            color="dark"
                            style={{ color:" #000"}}
                            variant="contained"
                /> 
                On going
                 <ArrowDropDownIcon />  

            </button>
                       */}
            {/* <Button className="ml-2 mr-2" variant="contained" color="warning" size="xs" onClick={this.toggleModal}> {this.props.statusType} Status</Button> */}
        </span>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(Status);