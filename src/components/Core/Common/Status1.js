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


class Status1 extends Component {
    state = {
        modal: false,
        loading: false,
        error: {},
        selectedStatus: '',
        statusNotes:'',
        SqObj:'',
        formWizard: {
            editFlag: false,
            errors: {},
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
        this.loadObj();
        // console.log('status component did mount');
        // console.log(this.props.currentId);
        this.props.onRef(this);

        this.setState({
            selectedStatus: this.props.status,
            statusNotes: this.props.statusNotes
        })
    }
    loadObj() {
        console.log("QUotation.js loadObj function")
        axios.get(server_url + context_path + "api/sales-quotation?enquiry.id=" + this.props.currentId + '&projection=sales_quotation_edit').then(res => {
            console.log("Quotation.js", list)
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];
            console.log("Quotation.js", list)
            if(list.length) {
                this.setState({ SqObj: list[0], currentId: list[0].id }, ()=>console.log("loadobj sales-quotation data", this.state.obj));
                console.log("setState")
            }
        });
    }


    patchStatus1=(e)=>{
         e.preventDefault();
        var SqObj=this.state.SqObj;
        var id=SqObj.id;
        axios.patch(server_url + context_path + "api/sales-quotation/"+id, { status: this.state.selectedStatus,statusNotes:this.state.statusNotes })
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
        const errors = this.state.formWizard.errors;
        return (
        <div>
            {(this.state.SqObj.status==='Approved' || this.state.SqObj.status==='Email Sent') ? null: <div>
            <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                <ModalHeader toggle={this.toggleModal}>
                    Quotation Approval
                    </ModalHeader>
                <ModalBody>
                    <form className="form-horizontal" onSubmit={this.patchStatus1}>
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
                        {this.state.selectedStatus==='Rejected' && <fieldset>
                            <FormControl>
                                
                                <TextareaAutosize
                                    label="Notes"
                                    placeholder="Reason For Rejection"
                                    rowsMin={4}
                                    required = {true}
                                    helperText={errors?.Notes?.length > 0 ? errors?.Notes[0]?.msg : ""}
                                    error={errors?.Notes_auto_suggest?.length > 0}
                                    onChange={e => this.setState({ statusNotes: e.target.value })} 
                                    value={this.state.statusNotes}
                                    

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
        </div>}</div>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(Status1);