import { Button, TextField } from '@material-ui/core';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import {
    Form, Modal,

    ModalBody, ModalHeader, Table
} from 'reactstrap';
import swal from 'sweetalert';
import { context_path, defaultDateFilter, server_url } from '../../Common/constants';
import CustomPagination from '../../Common/CustomPagination';
import Sorter from '../../Common/Sorter';
import FormValidator from '../../Forms/FormValidator';
import AddBranch from './AddBranch';
// const json2csv = require('json2csv').parse;
class Branches extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        viewFlag: false,
        modal: false,
        newObj: '',
        contacts: [],
        errors: {},
        contactsUrl: server_url + context_path + "api/branch-contacts/",
        objs: [],
        page: {
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
        addressTypes: [
            { label: 'Company HQ', value: 'HQ' },
            { label: 'Branch', value: 'BR' },
            { label: 'Billing', value: 'BI' },
            { label: 'Plant', value: 'PL' },
            { label: 'Warehouse', value: 'WH' }
        ]
    }
    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    addObj = () => {
        this.setState({ editFlag: true });
    }
    editObj = (i) => {
        if(i !== undefined) {
            var newObj = this.state.objs[i];
            this.setState({ newObj: newObj });
        }
        this.setState({ editFlag: true });
    }
    saveObj(id) {
        this.setState({ editFlag: false});
        this.loadObjs();
    }
    viewObj = (i) => {
        var newObj = this.state.objs[i];
        this.setState({ newObj: newObj, viewFlag: true }, o => {
            this.getContacts();
        });
    }
    viewAll() {
        this.setState({ viewFlag: false });
    }
    cancelSave = () => {
        this.setState({ editFlag: false});
    }
    searchObj = e => {
        var str = e.target.value;
        var filters = this.state.filters;
        filters.search = str;
        this.setState({ filters }, o => { this.loadObjs() });
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
            this.setState({ orderBy: 'id,desc' }, this.loadObjs)
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            this.setState({ orderBy: col.param + ',' + direction }, this.loadObjs);
        }
    }

    loadObjs = (offset, callBack) => {
        if (!offset) offset = 1;
        var url = server_url + context_path + "api/branches?projection=branch_details&page=" + (offset - 1);
        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }
        url += "&company=" + this.props.currentId;
        if (this.state.filters.search) {
            url += "&name=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }
        url = defaultDateFilter(this.state, url);
        axios.get(url)
        .then(res => {
                this.setState({
                    objs: res.data._embedded[Object.keys(res.data._embedded)[0]],
                    page: res.data.page
                });

            if (callBack) {
                callBack();
            }
        })
    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    componentDidMount() {
        this.loadObjs(1, o => {
            // if(this.props.location.search) {
            //     let params = queryString.parse(this.props.location.search);
                
            //     if(params.branch) {
            //         for(var x in this.state.objs) {
            //             if(params.branch === this.state.objs[x].id) {
            //                 this.viewObj(x);
            //                 return;
            //             }
            //         }
            //     }
            // }
        });
        this.props.onRef(this);
    }
    getAddressType(type) {
        var addressType = this.state.addressTypes.find(g => g.value === type);
        if (addressType) {
            return addressType.label;
        } else {
            return "-NA-";
        }
    }
    getContacts() {
        var newObj = this.state.newObj;
        axios.get(this.state.contactsUrl + "?size=100000&branch.id=" + newObj.id)
        .then(res => {
            newObj.contacts = res.data._embedded[Object.keys(res.data._embedded)[0]];
            this.setState({
                contacts: cloneDeep(newObj.contacts),
                newObj: newObj
            });
        })
    }
    setContactField(idx, field, e, noValidate) {
        var contacts = this.state.contacts;
        // var input = e.target;
        contacts[idx][field] = e.target.value;   
        contacts[idx].updated = true;
        this.setState({ contacts });
    }
    openContacts = () => {
        this.setState({
            contacts: cloneDeep(this.state.newObj.contacts)
        }, o => {
            if(!this.state.newObj.contacts.length) {
                this.addContact();
            }
            this.toggleModal();
        });
    }
    addContact = () => {
        var contacts = this.state.contacts;
        contacts.push({
            departmentName: '',
            phone: '',
            email: ''
        })
        this.setState({ contacts });
    }
    deleteContact = (i) => {
        var contacts = this.state.contacts;
        if(contacts[i].id) {
            contacts[i].delete = true;
        } else {
            contacts.splice(i, 1);
        }
        this.setState({ contacts });
    }
    checkForError() {
        // const form = this.formWizardRef;
        const tabPane = document.getElementById('saveCForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        console.log(errors);
        this.setState({errors});
        return hasError;
    }
    saveDetails = () => {
        var hasError = this.checkForError();
        if (!hasError) {
            var contacts = this.state.contacts;
            if(contacts && contacts.length) {
                this.setState({ loading: true });
                contacts.forEach((con, idx) => {
                    if(con.delete) {
                        axios.delete(this.state.contactsUrl + con.id)
                        .then(res => {
                        }).catch(err => {
                            swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                        })
                    } else if(!con.id || con.updated) {
                        con.company = '/companies/' + this.props.currentId;
                        con.branch = '/branches/' + this.state.newObj.id;
                        var promise = undefined;
                        if (!con.id) {
                            promise = axios.post(this.state.contactsUrl, con)
                        } else {
                            promise = axios.patch(this.state.contactsUrl + con.id, con)
                        }
                        promise.then(res => {
                            con.id = res.data.id;
                        }).catch(err => {
                            swal("Unable to Save!", "Please resolve the errors", "error");
                        })
                    }
                    if(idx === contacts.length - 1) {
                        this.setState({ loading: false });
                        setTimeout(() => {
                            this.getContacts();
                            this.toggleModal();
                        }, 5000);
                    }
                })
            } else {
                this.toggleModal();
            }
        }
        return true;
    }
    render() {
        const errors = this.state.errors;
        return (
            <div>
                {(!this.state.editFlag && this.state.objs.length>0) &&
                    <div className="row">
                        <div className="col-md-12">
                            {!this.state.viewFlag &&
                            <div className="card b">
                                <div className="card-header">
                                {this.props.user.role === 'ROLE_ADMIN' && <div className="float-right mt-2">
                                        <Button variant="contained" color="warning" size="xs" onClick={() => this.addObj()}>Add</Button>
                                    </div>}
                                    <h4 className="my-2">
                                        <span>Branches</span>
                                    </h4>
                                </div>
                                <div className="card-body bb bt">
                                    <Table hover responsive>
                                        <thead>
                                            <Sorter columns={[
                                                { name: '#', sortable: false },
                                                { name: 'Name', sortable: true, param: 'name' },
                                                { name: 'Type', sortable: false, param: 'type' },
                                                { name: 'City', sortable: true, param: 'city' },
                                                { name: 'Created On', sortable: true, param: 'creationDate' },
                                                { name: 'Action', sortable: false }]}
                                                onSort={this.onSort.bind(this)} />
                                        </thead>
                                        <tbody>
                                            {this.state.objs.map((obj, i) => {
                                                return (
                                                    <tr key={obj.id}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <a href="javascript:void(0);" className="btn-link" onClick={() => this.viewObj(i)}>
                                                                {obj.name}
                                                            </a>
                                                        </td>
                                                        <td>
                                                            {this.getAddressType(obj.type)}
                                                        </td>
                                                        <td>
                                                            {obj.city}
                                                        </td>
                                                        <td>
                                                            <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                        </td>
                                                        <td>
                                                        {this.props.user.role === 'ROLE_ADMIN' && 
                                                            <Button variant="contained" color="warning" size="xs" onClick={() => this.editObj(i)}>Edit</Button>
                                                        }    
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>

                                    <CustomPagination page={this.state.page} onChange={(x) => this.loadObjs(x)} />
                                </div>
                            </div>}
                            {this.state.viewFlag &&
                            <div className="card b">
                            
                                <div className="card-header">
                                {this.props.user.role === 'ROLE_ADMIN' && 
                                <div className="float-right mt-2">
                                <Button variant="contained" color="warning" size="xs" onClick={() => this.viewAll()}>View All</Button>
                                <Button variant="contained" color="warning" size="xs" onClick={() => this.editObj()}>Edit</Button>
                            </div>
                                }
                                    
                                    <h4 className="my-2">
                                        <span>{this.state.newObj.name}</span>
                                    </h4>
                                </div>
                                <div className="card-body bb bt">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <strong>Type</strong>
                                                </td>
                                                <td>{this.state.newObj.type?this.state.newObj.type:"-NA-"}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>street</strong>
                                                </td>
                                                <td>{this.state.newObj.street?this.state.newObj.street:"-NA-"}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>locality</strong>
                                                </td>
                                                <td>{this.state.newObj.locality?this.state.newObj.locality:"-NA-"}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>landmark</strong>
                                                </td>
                                                <td>{this.state.newObj.landmark?this.state.newObj.landmark:"-NA-"}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>city</strong>
                                                </td>
                                                <td>{this.state.newObj.city?this.state.newObj.city:"-NA-"}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>state</strong>
                                                </td>
                                                <td>{this.state.newObj.state?this.state.newObj.state:"-NA-"}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>country</strong>
                                                </td>
                                                <td>{this.state.newObj.country?this.state.newObj.country:"-NA-"}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>pincode</strong>
                                                </td>
                                                <td>{this.state.newObj.pincode?this.state.newObj.pincode:"-NA-"}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Creation Date</strong>
                                                </td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{this.state.newObj.creationDate?this.state.newObj.creationDate:"-NA-"}</Moment>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <Modal isOpen={this.state.modal} toggle={this.toggleModal} size={'lg'}>
                                        <ModalHeader toggle={this.toggleModal}>
                                            <h4>
                                                Contacts
                                                <Button className="ml-2" variant="outlined" color="primary" size="sm" onClick={this.addContact} title="Add Contact">
                                                    <em className="fas fa-plus"></em>
                                                </Button>         
                                            </h4>
                                        </ModalHeader>
                                        <ModalBody>
                                            <Form className="form-horizontal" innerRef={this.formRef} name="contacts" id="saveCForm">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <Table hover responsive>
                                                            <tbody>
                                                                {this.state.contacts.map((contact, i) => {
                                                                    return (
                                                                        <tr key={i}>
                                                                            <td className="va-middle">{i + 1}</td>
                                                                            <td>
                                                                                <fieldset>
                                                                                    <TextField
                                                                                        type="text"
                                                                                        name="departmentName"
                                                                                        label="Department Name"
                                                                                        required={true}
                                                                                        fullWidth={true}
                                                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                                                        helperText={errors?.departmentName?.length > 0 ? errors?.departmentName[i]?.msg : ""}
                                                                                        error={errors?.departmentName?.length > 0}
                                                                                        value={contact.departmentName}
                                                                                        onChange={e => this.setContactField(i, 'departmentName', e)} />
                                                                                </fieldset>
                                                                            </td>
                                                                            <td>
                                                                                <fieldset>
                                                                                    <TextField
                                                                                        type="text"
                                                                                        name="phone"
                                                                                        label="Phone"
                                                                                        required={true}
                                                                                        fullWidth={true}
                                                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                                                        helperText={errors?.phone?.length > 0 ? errors?.phone[i]?.msg : ""}
                                                                                        error={errors?.phone?.length > 0}
                                                                                        value={contact.phone}
                                                                                        onChange={e => this.setContactField(i, 'phone', e)} />
                                                                                </fieldset>
                                                                            </td>
                                                                            <td>
                                                                                <fieldset>
                                                                                    <TextField
                                                                                        type="email"
                                                                                        name="email"
                                                                                        label="Email"
                                                                                        required={true}
                                                                                        fullWidth={true}
                                                                                        inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"email"}]' }}
                                                                                        helperText={errors?.email?.length > 0 ? errors?.email[i]?.msg : ""}
                                                                                        error={errors?.email?.length > 0}
                                                                                        value={contact.email}
                                                                                        onChange={e => this.setContactField(i, 'email', e)} />
                                                                                </fieldset>
                                                                            </td>
                                                                            <td className="va-middle">
                                                                                <Button variant="outlined" color="secondary" size="sm" onClick={e => this.deleteContact(i)} title="Delete Contact">
                                                                                    <em className="fas fa-trash"></em>
                                                                                </Button>
                                                                            </td>
                                                                        </tr>)
                                                                })}
                                                            </tbody>
                                                        </Table>            
                                                        <div className="text-center">
                                                            <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form>
                                        </ModalBody>
                                    </Modal>
                                    <div className="text-center mt-4">
                                        <h4>
                                            Contacts
                                            {this.props.user.role === 'ROLE_ADMIN' &&
                                             <Button className="ml-3" variant="outlined" color="primary" size="sm" onClick={this.openContacts} title="Add Contact">
                                             Add/Update
                                         </Button>  
                                            }
                                                  
                                        </h4>
                                    </div>
                                    {this.state.newObj.contacts &&
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Department</th>
                                                <th>Phone</th>
                                                <th>Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.newObj.contacts.map((contact, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td className="va-middle">{i + 1}</td>
                                                    <td>{contact.departmentName}</td>
                                                    <td>{contact.phone}</td>
                                                    <td>{contact.email}</td>
                                                </tr>)
                                            })}
                                        </tbody>
                                    </Table>}
                                </div>
                            </div>}
                        </div>
                    </div>}
                {this.state.editFlag &&
                    <AddBranch baseUrl="branches" currentId={this.props.currentId} branchId={this.state.newObj.id} 
                    onRef={ref => (this.addTemplateRef = ref)} onSave={(id) => this.saveObj(id)} onCancel={this.cancelSave}></AddBranch>}
            </div>)
    }
}
const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})
export default connect(
    mapStateToProps
)(Branches);