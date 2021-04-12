import MomentUtils from '@date-io/moment';
import { AppBar, Button, FormControl, Tab, Tabs, TextField } from '@material-ui/core';
import Event from '@material-ui/icons/Event';
import {
    DatePicker,
    MuiPickersUtilsProvider
} from '@material-ui/pickers';
import axios from 'axios';
import React, { Component } from 'react';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { IOSSwitch } from '../Common/IOSSwitch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
    Col,
    Input, Table
} from 'reactstrap';
import swal from 'sweetalert';
import AutoSuggest from '../Common/AutoSuggest';
import { context_path, defaultDateFilter, server_url } from '../Common/constants';
import CustomPagination from '../Common/CustomPagination';
import FileDownload from '../Common/FileDownload';
import PageLoader from '../Common/PageLoader';
import Sorter from '../Common/Sorter';
import TabPanel from '../Common/TabPanel';
import ContentWrapper from '../Layout/ContentWrapper';
import {
    Modal,
   ModalBody, ModalHeader,
} from 'reactstrap';
const json2csv = require('json2csv').parse;
class Users extends Component {
    state = {
        activeTab: 0,
        loading: false,
        modal1: false,
        modal: false,
        modal2: false,
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        editFlag: false,
        filters: {
            search: '',
            category: '',
            fromDate: null,
            toDate: null,
        },
        orderBy: 'id,desc',
        addError: '',
        patchError: '',
        updateError: '',
        basePath: server_url + context_path + 'api/users/',
        all: [],
        objects: [],
        newObj: {
            name: '',
            mobile: '',
            email: '@mscgroup.co.in',
            password: '',
            category: null,
            role: '',
            selectedRole: '',
            specificPermissions: []
        },
        permissions: [],
        existingpermissions: [],
        isPermissions: false,
        importBtndisable:false,
        importBtnText:'Submit'
    };
    loadObjects(offset, all, callBack) {
        if (!offset) offset = 1;
        var url = this.state.basePath + "?projection=user_details&page=" + (offset - 1);
        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }
        url += "&role.defaultRole=false"; 
        if (this.state.filters.search) {
            url += "&name=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }
        if (this.state.filters.category) {
            url += "&category=" + this.state.filters.category;
        }
        url = defaultDateFilter(this.state, url);
        if (all) {
            url += "&size=100000";
        }
        axios.get(url)
        .then(res => {
            if (all) {
                this.setState({all: res.data._embedded.users});
            } else {
                this.setState({
                    objects: res.data._embedded.users,
                    page: res.data.page
                });
            }
            if (callBack) {
                callBack();
            }
        });
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
    componentDidMount() {
        this.loadObjects();
    }
    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({activeTab: tab});
        }
        if (tab === 1) {
            axios.get(server_url + context_path + "api/permissions?active=true&size=100000")
            .then(res => {
                this.setState({ permissions: res.data._embedded[Object.keys(res.data._embedded)[0]] });
            });
        }
    }
    toggleModal1 = () => {
        this.setState({modal1: !this.state.modal1});
    }
    toggleModal2 = () => {
        this.setState({modal2: !this.state.modal2});
    }
    searchObject = e => {
        var str = e.target.value;
        var filters = this.state.filters;
        filters.search = str;
        this.setState({ filters }, o => { this.loadObjects() });
    }
    searchCategory(e) {
        var filters = this.state.filters;
        filters.category = e.target.value;
        this.setState({ filters }, o => {
            this.loadObjects();
        });
    };
    filterByDate(e, field) {
        var filters = this.state.filters;
        if (e) {
            filters[field + 'Date'] = e.format();
        } else {
            filters[field + 'Date'] = null;
        }
        this.setState({ filters: filters }, g => { this.loadObjects(); });
    }
    onSort(e, col) {
        if (col.status === 0) {
            this.setState({ orderBy: 'id,desc' }, this.loadObjects)
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            this.setState({ orderBy: col.param + ',' + direction }, this.loadObjects);
        }
    }
    setObjField(field, e) {
        var newObj = this.state.newObj;
        newObj[field] = e.target.value;
        this.setState({ newObj });
    }
    setAutoSuggest(field, val) {
        var newObj = this.state.newObj;
        newObj[field] = val;
        this.setState({ newObj });
        if (val !== undefined) {
            axios.get(server_url + context_path + "api/roles/" + val + '?projection=user_role_detail')
            .then(res => {
                // var formWizard = this.state.formWizard;
                //res.data.permissions.forEach(g=>{g.selected=true;});
                // formWizard.obj = res.data;
                this.setState({ existingpermissions: res.data.permissions, isPermissions: true });
                // this.setState({ formWizard });
            });
        } else {
            this.setState({ existingpermissions: [], isPermissions: false });
        }
    }
    addObj = () => {
        this.resetObj();
        this.setState({ editFlag: false ,isPermissions:false});
        this.toggleTab(0)
    }
    editObj = (i) => {
        var user = this.state.objects[i];
        this.setState({ editFlag: true });
        axios.get(this.state.basePath + user.id + '?projection=user_details').then(res => {
            res.data.password = '';
            var newObj = res.data;
            newObj.selectedRole = newObj.role;
            newObj.role = newObj.role.id;
            this.setState({ newObj });
            this.toggleTab(1)
        });
    }
    resetObj() {
        var newObj = {
            name: '',
            mobile: '',
            email: '@mscgroup.co.in',
            password: '',
            category: null,
            role: '',
            selectedRole: '',
        }
        this.setState({ newObj });
    }
    onSubmit = e => {
        e.preventDefault();
        var url = this.state.basePath;
        var newObj = {...this.state.newObj};
        if (!newObj.role) {
            swal("Unable to Save!", "Role is missing", "error");
            return;
        }
        var selectedRoleId = newObj.role;
        newObj.role = '/roles/' + newObj.role;
        this.setState({ loading: true });
        let confirmPermsModifications = (defaultRolePerms,existingPerms) => {
            let ispermsChanged = false;
            if(defaultRolePerms.length !== existingPerms.length){
                for(let idx=0; idx<existingPerms.length;idx++) {
                    if(idx < defaultRolePerms.length && defaultRolePerms[idx].permission.id === existingPerms[idx].permission.id){
                        if(defaultRolePerms[idx].selected !== existingPerms[idx].selected){
                            ispermsChanged = true;
                            break;
                        }
                    }
                    else{
                        if(existingPerms[idx].selected){
                            ispermsChanged = true;
                            break;
                        }
                    }
                }
            }
            else{
                for(let idx=0; idx<defaultRolePerms.length;idx++) {
                    if(defaultRolePerms[idx].permission.id === existingPerms[idx].permission.id){

                        if(defaultRolePerms[idx].selected !== existingPerms[idx].selected){
                            ispermsChanged = true;
                            break;
                        }
                    }
                }
            }
            return ispermsChanged;
        }
        if (this.state.editFlag) {
            url += this.state.newObj.id;
            // this.state.newObj.email = undefined;
            if (newObj.password.length === 0) {
                delete newObj.password;
            }
            let updateUser = (u,obj) => {
                axios.patch(u, obj)
                .then(res => {
                    this.addObj();
                    if (res.status === 200) {
                        this.loadObjects();
                    } else {
                        this.setState({ addError: res.response.data.globalErrors[0] });
                        swal("Unable to Edit!", res.response.data.globalErrors[0], "error");
                    }
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    this.toggleTab(0);
                    this.setState({ addError: err.response.data.globalErrors[0] });
                    swal("Unable to Edit!", err.response.data.globalErrors[0], "error");
                })
            } 
            if(this.state.isPermissions){
                axios.get(server_url + context_path + "api/roles/" + selectedRoleId + '?projection=user_role_detail')
                .then(res => {
                    let defaultRoleBasedPermissions = res.data.permissions;          
                    axios.delete(server_url + context_path+"admin/deleteuserspecs/"+newObj.id)
                    .then(deleteResp => {
                        if(deleteResp){
                            let ispermsChanged2 = confirmPermsModifications(defaultRoleBasedPermissions,this.state.existingpermissions);
                            let perms = [];
                            if(ispermsChanged2){
                                if(this.state.existingpermissions.length){
                                    this.state.existingpermissions.map((obj,i) => {
                                        if(obj.selected){
                                            perms.push({
                                                permission : 'permissions/' + obj.permission.id,
                                                selected : obj.selected,
                                                user : "/users/"+newObj.id
                                            });
                                        }
                                        return null;
                                    });
                                }
                            }
                            newObj.specificPermissions = perms;
                            updateUser(url,newObj);
                        }
                    });
                });
            }
            else{
                let perms = [];
                if(newObj.specificPermissions.length){
                    newObj.specificPermissions.map((obj,i) => {
                        perms.push({
                            id:obj.id,
                            permission: 'permissions/' + obj.permission.id,
                            selected: obj.selected,
                        });
                        return null;
                    });
                    newObj.specificPermissions = perms;
                }
                updateUser(url,newObj);
            }
        } else {
            newObj.parent = this.props.user.id;
            // newObj.specificPermissions = this.state.existingpermissions;
            axios.get(server_url + context_path + "api/roles/" + selectedRoleId + '?projection=user_role_detail')
            .then(response => {
                let defaultRoleBasedPermissions = response.data.permissions;
                axios.post(url, newObj)
                .then(res => {
                    var selectedpermissions = [];
                    var userid = res.data.id;
                    let ispermsChanged2 = confirmPermsModifications(defaultRoleBasedPermissions,this.state.existingpermissions);
                    if(ispermsChanged2){
                        this.state.existingpermissions.map((obj, i) => {
                            if(obj.selected){
                                selectedpermissions.push({
                                    permission: 'permissions/' + obj.permission.id,
                                    selected: obj.selected,
                                    user: "users/" + userid
                                })
                            }
                            return null;
                        });
                    }
                    newObj.specificPermissions = selectedpermissions;
                    newObj.id = userid;
                    axios.patch(url + userid, newObj)
                    .then(res => {
                        this.addObj();
                        this.loadObjects();
                    }).finally(() => {
                        this.setState({ loading: false });
                    }).catch(err => {
                        // this.toggleTab(0);
                        if (err.response) {
                            this.setState({ addError: err.response.data.globalErrors[0] });
                            swal("Unable to Add!", err.response.data.globalErrors[0], "error");
                        }
                    })
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    // this.toggleTab(0);
                    if (err.response) {
                        this.setState({ addError: err.response.data.globalErrors[0] });
                        swal("Unable to Add!", err.response.data.globalErrors[0], "error");
                    }
                })
            });
            return;
        }
    }
    uploadFiles() {
        var imagefile = document.querySelector('#fileUpload');
        if(imagefile.files.length){
            this.setState({importBtndisable:true,importBtnText:"Please Wait..."});
            var formData = new FormData();
            formData.append("file", imagefile.files[0]);
            formData.append("from", "users");
            // formData.append("parent", '');
            formData.append("fileType", "import users");
            // if (this.state.formWizard.obj.enableExpiryDate && this.state.formWizard.obj.expiryDate) {
            //     formData.append("expiryDate", this.state.formWizard.obj.expiryDate);
            // }
            // docs/upload
            axios.post(server_url + context_path + 'bulkimportuser/users', formData, {
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
            url: server_url + context_path + "bulkimportuser/samplefile",
            method: 'GET',
            responseType: 'blob',
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'users.csv');
            document.body.appendChild(link);
            link.click();
        });
    }
    patchObj(idx) {
        var user = this.state.objects[idx];
        this.setState({ loading: true });
        if (user.id !== this.props.user.id) {
            axios.patch(server_url + context_path + "admin/users/" + user.id)
            .then(res => {
                // this.state.objects[idx].enabled = !this.state.objects[idx].enabled;
                this.setState({ objects: this.state.objects });
                this.loadObjects();
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
        } else {
            swal("Unable to Inactivate!", "Cann't inactivate yourself.", "warning");
        }
    }
    setPermission(idx, e) {
        var existingpermissions = this.state.existingpermissions;
        var perm = this.state.permissions[idx];
        var existing = existingpermissions.find(g => g.permission.id === perm.id)
        if (existing) {
            existing.selected = e.target.checked;
        } else {
            existingpermissions.push({ selected: e.target.checked, permission: perm })
        }
        this.setState({ existingpermissions });
    }
    printReport() {
        this.loadObjects(this.state.offset, true, () => {
            window.print();
        });
    }
    handleChange(e) {
    }
    downloadReport = () => {
        const fields = ['id', 'name', 'email', 'mobile', 'creationDate'];
        const opts = { fields };
        this.loadObjects(this.state.offset, true, () => {
            var csv = json2csv(this.state.all, opts);
            FileDownload.download(csv, 'reports.csv', 'text/csv');
        });
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
                <div className="row content-heading">
                    <h4 className="col-9 my-2" onClick={() => this.toggleTab(0)}>
                        <span>Users</span>
                    </h4>
                  
                    <div className="col-2 float-right mt-2">
                        <Button variant="contained"  style={{marginLeft: "70px"}} color="warning" size="xs" onClick={() => this.toggleTab(1)} > + Add User</Button>
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
                                style={{ display: 'none' }}
                                onChange={(e, i) => this.toggleTab(i)} >
                                <Tab label="List" />
                                <Tab label="Add User" />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={this.state.activeTab} index={0}>
                            <div className="row">
                                <div className="col-md-3">
                                    <h4 className="float-right">Filters : </h4>
                                </div>
                                <div className="col-md-2 form-group">
                                    <TextField
                                        type="text"
                                        label="search user"
                                        fullWidth={true}
                                        value={this.state.filters.search}
                                        onChange={this.searchObject} />
                                </div>
                                <div className="col-md-2">
                                    <MuiPickersUtilsProvider utils={MomentUtils}>
                                        <DatePicker
                                            autoOk
                                            clearable
                                            disableFuture
                                            label="From Date"
                                            format="DD/MM/YYYY"
                                            value={this.state.filters.fromDate}
                                            onChange={e => this.filterByDate(e, 'from')}
                                            TextFieldComponent={(props) => (
                                                <TextField
                                                    type="text"
                                                    name="from"
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
                                </div>
                                <div className="col-md-2">
                                    <MuiPickersUtilsProvider utils={MomentUtils}>
                                        <DatePicker
                                            autoOk
                                            clearable
                                            disableFuture
                                            label="To Date"
                                            format="DD/MM/YYYY"
                                            value={this.state.filters.toDate}
                                            onChange={e => this.filterByDate(e, 'to')}
                                            TextFieldComponent={(props) => (
                                                <TextField
                                                    type="text"
                                                    name="to"
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
                                </div>
                                <div className="col-md-3">
                                    <div className="float-right">
                                        <Button className="d-none" variant="contained" color="secondary" size="small" onClick={() => this.printReport()}>Print</Button>
                                        <Button className="d-none" variant="contained" color="secondary" size="small" onClick={() => this.downloadReport()}>Download</Button>
                                    </div>
                                </div>
                            </div>
                            <Table hover responsive>
                                <thead>
                                    <Sorter columns={[
                                        { name: '#', sortable: false },
                                        { name: 'Name', sortable: true, param: 'name' },
                                        { name: 'Email', sortable: true, param: 'email' },
                                        { name: 'Mobile', sortable: true, param: 'mobile' },
                                        { name: 'Role', sortable: false, param: 'mobile' },
                                        { name: 'Created On', sortable: true, param: 'creationDate' },
                                        { name: 'Action', sortable: false }]}
                                        onSort={this.onSort.bind(this)} />
                                </thead>
                                <tbody>
                                    {this.state.objects.map((obj, i) => {
                                        return (
                                            <tr key={obj.id}>
                                                <td>{i + 1}</td>
                                                <td>
                                                    <Link to={`/users/${obj.id}`}>
                                                        {obj.name}
                                                    </Link>
                                                </td>
                                                <td>{obj.email}</td>
                                                <td>{obj.mobile}</td>
                                                <td>
                                                    <Link to={`/roles/${obj.role.id}`}>
                                                        {obj.role.name}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                </td>
                                                <td>
                                                    <Button variant="contained" color="inverse" size="xs" onClick={() => this.editObj(i)}>Edit</Button>
                                                    <Button variant="contained" className={obj.enabled ? 'inactivate' : 'activate'} color="warning" size="xs" onClick={() => this.patchObj(i)}>{obj.enabled ? 'InActivate' : ' Activate   '}</Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>

                            <CustomPagination page={this.state.page} onChange={(x) => this.loadObjects(x)} />

                            <Table id="printSection" responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Role</th>
                                        <th>Created On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.all.map((obj, i) => {
                                        return (
                                            <tr key={obj.id}>
                                                <td>{i + 1}</td>
                                                <td>{obj.name}</td>
                                                <td>{obj.email}</td>
                                                <td>{obj.mobile}</td>
                                                <td>{obj.role.name}</td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </TabPanel>
                        <TabPanel value={this.state.activeTab} index={1}>
                            <form className="form-horizontal" onSubmit={this.onSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <fieldset>
                                            <div className="form-group row mb">
                                                <label className="col-md-4 col-form-label text-right">Name *</label>
                                                <Col md={8}>
                                                    <Input type="text" onChange={e => this.setObjField('name', e)} minLength="2" maxLength="50" value={this.state.newObj.name} required />
                                                </Col>
                                            </div>
                                        </fieldset>
                                    </div>
                                    <div className="col-md-6">
                                        <fieldset>
                                            <div className="form-group row mb">
                                                <label className="col-md-4 col-form-label text-right">Email *</label>
                                                <Col md={8}>
                                                    <Input type="email" onChange={e => this.setObjField('email', e)}
                                                        minLength="5" readOnly={this.state.editFlag} maxLength="100"
                                                        value={this.state.newObj.email} pattern="[a-zA-Z0-9]*@mscgroup\.co\.in" required />
                                                </Col>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <fieldset>
                                            <div className="form-group row mb">
                                                <label className="col-md-4 col-form-label text-right">Mobile *</label>
                                                <Col md={8}>
                                                    <Input type="text" onChange={e => this.setObjField('mobile', e)} minLength="8" maxLength="15" value={this.state.newObj.mobile} required />
                                                </Col>
                                            </div>
                                        </fieldset>
                                    </div>
                                    <div className="col-md-6">
                                        <fieldset>
                                            <div className="form-group row mb">
                                                <label className="col-md-4 col-form-label text-right">Password</label>
                                                <Col md={8}>
                                                    <Input type="text" onChange={e => this.setObjField('password', e)} minLength="5" maxLength="50" value={this.state.newObj.password} />
                                                </Col>
                                            </div>
                                        </fieldset>
                                    </div>
                                    <div className="col-md-4 offset-md-4">
                                        <fieldset>
                                            <FormControl>
                                                <AutoSuggest url="roles"
                                                    name="role"
                                                    displayColumns="name"
                                                    label="Role"
                                                    onRef={ref => {
                                                        (this.roleASRef = ref)
                                                        if (ref) {
                                                            this.roleASRef.setInitialField(this.state.newObj.selectedRole);
                                                        }
                                                    }}
                                                    placeholder="Search role by name"
                                                    arrayName="roles"
                                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                    onChange={(e) => { this.handleChange(e) }}
                                                    projection="role_auto_suggest&defaultRole=false"
                                                    value={this.state.newObj.selectedRole}
                                                    onSelect={e => this.setAutoSuggest('role', e?.id)}
                                                    queryString="&name" ></AutoSuggest>
                                            </FormControl>
                                        </fieldset>
                                    </div>
                                </div>
                                <div>
                                    {this.state.isPermissions ? <h4 className="text-center mt-3">Permissions</h4> : null}
                                    <hr />
                                    {this.state.isPermissions ? this.state.permissions.map((obj, i) => {
                                        return (
                                            <fieldset key={obj.id}>
                                                <div>
                                                    {obj.description}
                                                    <FormControlLabel className="float-right"
                                                        control={
                                                            <IOSSwitch
                                                                label=""
                                                                name={`permissions-${obj.id}`}
                                                                checked={this.state.existingpermissions.some(g => g.permission.id === obj.id && g.selected)}
                                                                onChange={e => this.setPermission(i, e)} 
                                                            />
                                                        }
                                                    />
                                                </div>
                                                <hr />
                                            </fieldset>)
                                    }) : null}
                                </div>
                                <fieldset>
                                    <div className="form-group row">
                                        <div className="col-12 text-center mt-3">
                                            <button type="submit" className="btn btn-raised btn-primary">Save User</button>
                                        </div>
                                    </div>
                                </fieldset>
                            </form>
                        </TabPanel>
                    </div>
                </div>
            </ContentWrapper>
        );
    }
}
const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })
export default connect(
    mapStateToProps
)(Users);