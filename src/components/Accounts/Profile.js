import MomentUtils from '@date-io/moment';
import { AppBar, Button, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, TextField } from '@material-ui/core';
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
import {
    Col, Row,

    Table
} from 'reactstrap';
import { context_path, defaultDateFilter, getStatusBadge, server_url } from '../Common/constants';
import CustomPagination from '../Common/CustomPagination';
import PageLoader from '../Common/PageLoader';
import Sorter from '../Common/Sorter';
import TabPanel from '../Common/TabPanel';
import ContentWrapper from '../Layout/ContentWrapper';

import swal from 'sweetalert';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { IOSSwitch } from '../Common/IOSSwitch';

class Profile extends Component {
    tabs = 0;
    state = {
        loading: false,
        activeTab: 0,
        user: {},
        image: '',
        list: [{
            url: 'sales',
            objects: [],
            isTable: true,
            orderBy: 'id,desc',
            page: {
                number: 0,
                size: 20,
                totalElements: 0,
                totalPages: 0
            },
            filters: {
                search: '',
                category: '',
                fromDate: null,
                toDate: null,
            },
            filterCategories: [
                { label: 'All', value: '' },
                { label: 'On going', value: 'On going' },
                { label: 'Rejected', value: 'Rejected' },
                { label: 'Partially Rejected', value: 'Partially Rejected' },
                { label: 'Converted', value: 'Converted' },
            ],
        }, {
            url: 'purchases',
            objects: [],
            isTable: true,
            orderBy: 'id,desc',
            page: {
                number: 0,
                size: 20,
                totalElements: 0,
                totalPages: 0
            },
            filters: {
                search: '',
                category: '',
                fromDate: null,
                toDate: null,
            },
            filterCategories: [
                { label: 'All', value: '' },
                { label: 'On going', value: 'On going' },
                { label: 'Rejected', value: 'Rejected' },
                { label: 'Partially Rejected', value: 'Partially Rejected' },
                { label: 'Converted', value: 'Converted' },
            ],
        },
        {
            url: 'permissions',
            objects: [],
            isTable: false,

        }
        ],
        status: [
            { label: 'On going', value: 'On going', badge: 'info' },
            { label: 'Rejected', value: 'Rejected', badge: 'danger' },
            { label: 'Partially Rejected', value: 'Partially Rejected', badge: 'warning' },
            { label: 'Converted', value: 'Converted', badge: 'success' },
        ],
        permissions: [],
        existingpermissions: [],
        permissionFlowCodes:[],
        basePath: server_url + context_path + 'api/users/',
    }

    

    loadUser() {
        axios.get(server_url + context_path + "api/users/" + this.props.match.params.objId + '/?projection=user_details')
            .then(res => {
                let specPerms = [];
                axios.get(server_url + context_path + "api/roles/" + res.data.role.id + '?projection=user_role_detail')
                .then(roleResp => {
                    if(res.data.specificPermissions.length !== 0){
                        specPerms = res.data.specificPermissions;
                    }
                    else{
                        specPerms = roleResp.data.permissions;
                    }

                    let permFlowCodes = [];
                    specPerms.map((specPerm,i) => {
                        let matchedElm = this.state.permissions.find(ele  => ele.id === specPerm.permission.id);
                        if(matchedElm){permFlowCodes.push(matchedElm.flowCode);}
                    });

                    this.setState({
                        user: res.data,
                        existingpermissions: specPerms,
                        permissionFlowCodes:permFlowCodes
                    }, o => {
                        for (var x in this.state.list) {
                            this.loadObjects(x);
                        }
                    });

                    console.log("flowcodes from state: ",this.state.permissionFlowCodes);
                });
            });
    }
    loadPermissions() {
        axios.get(server_url + context_path + "api/permissions?active=true&size=100000")
            .then(res => {
                this.setState({ permissions: res.data._embedded[Object.keys(res.data._embedded)[0]] });
            });
        // axios.get(server_url + context_path + "admin/userrole/" + this.props.match.params.objId )
        //     .then(res => {
        //         // var formWizard = this.state.formWizard;
        //         //res.data.permissions.forEach(g=>{g.selected=true;});
        //         // formWizard.obj = res.data;
        //         this.setState({ existingpermissions: res.data.role.permissions });
        //         console.log(res);
        //         // this.setState({ formWizard });
        //     });
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
    componentDidMount() {
        this.loadPermissions();
        this.loadUser();
    }

    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }



    searchObject(idx, e) {
        var list = this.state.list;
        list[idx].filters.search = e.target.value;
        this.setState({ list }, o => {
            this.loadObjects(idx);
        });
    }

    searchCategory(idx, e) {
        var list = this.state.list;
        list[idx].filters.category = e.target.value;
        this.setState({ list }, o => {
            this.loadObjects(idx);
        });
    };

    filterByDate(idx, e, field) {
        var list = this.state.list;

        if (e) {
            list[idx].filters[field + 'Date'] = e.format();
        } else {
            list[idx].filters[field + 'Date'] = null;
        }

        this.setState({ list }, o => { this.loadObjects(idx); });
    }

    onSort(idx, e, col) {
        var list = this.state.list;

        if (col.status === 0) {
            list[idx].orderBy = 'id,desc';
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            list[idx].orderBy = col.param + ',' + direction;
        }

        this.setState({ list }, o => { this.loadObjects(idx); });
    }

    loadObjects(idx, offset) {
        if (!offset) offset = 1;

        var list = this.state.list;
        if (!list[idx].isTable) {
            return;
        }
        var url = server_url + context_path + "api/" + list[idx].url + "?projection=" + list[idx].url + "_list&page=" + (offset - 1);

        url += '&uid=' + this.state.user.id;

        if (list[idx].orderBy) {
            url += '&sort=' + list[idx].orderBy;
        }

        if (list[idx].filters.search) {
            url += "&code=" + encodeURIComponent('%' + list[idx].filters.search + '%');
        }

        if (list[idx].filters.category) {
            url += "&status=" + list[idx].filters.category;
        }
        url = defaultDateFilter(list[idx], url);

        axios.get(url)
            .then(res => {
                list[idx].objects = res.data._embedded[Object.keys(res.data._embedded)[0]];
                list[idx].page = res.data.page;

                this.setState({ list });
            })
    }

    updatePermissions(){
        // console.log("base path print",this.state.basePath + this.state.user.id);
        this.setState({ loading: true });
        axios.delete(server_url + context_path + "admin/deleteuserspecs/"+this.state.user.id)
        .then(deleteResp => {
            axios.get(server_url + context_path + "api/roles/" + this.state.user.role.id + '?projection=user_role_detail')
            .then(roleResp => {
                let rolePerms = roleResp.data.permissions;;
                let exisitngPerms = this.state.existingpermissions;
                let matchingPermsIndxes = []; 
                
                rolePerms.map((obj,idx) => {
                    for(let i = 0;i<exisitngPerms.length;i++){
                        if(rolePerms[idx].permission.id === exisitngPerms[i].permission.id && rolePerms[idx].selected === exisitngPerms[i].selected){
                            matchingPermsIndxes.push(i);
                            break;
                        }
                    }
                });

                let isSpecPermsExists = false;
                for(let j = 0;j<exisitngPerms.length;j++){
                    if(!matchingPermsIndxes.includes(j)){        //&& exisitngPerms[j].selected
                        isSpecPermsExists = true;
                        break;
                    }
                }

                var selectedpermissions = [];
                var newObj=this.state.user;
                var userid =this.state.user.id;
                var role = this.state.user.role;
                if(isSpecPermsExists){
                    this.state.existingpermissions.map((obj, i) => {
                        if(obj.selected){
                            selectedpermissions.push({
                                permission: 'permissions/' + obj.permission.id,
                                selected: obj.selected,
                                user: "users/" + userid
                            });
                        }
                        return null;
                    });
                }
                newObj.specificPermissions = selectedpermissions;
                newObj.id = userid;
                newObj.role = "roles/" + this.state.user.role.id;
                axios.patch(this.state.basePath + userid, newObj)
                .then(res => {
                    this.state.user.role = role;
                    // this.toggleTab(0);

                    // this.loadObjects();
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    console.log(err);
                    // this.toggleTab(0);
                    if (err.response) {
                        // this.setState({ addError: err.response.data.globalErrors[0] });
                        swal("Unable to Modify!", err.response.data.globalErrors[0], "error");
                    }
                });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                console.log(err);
                if (err.response) {
                    swal("User role not found!", err.response.data.globalErrors[0], "error");
                }
            })
        }).finally(() => {
            this.setState({ loading: false });
        }).catch(err => {
            console.log(err);
            if (err.response) {
                swal("Unable to Modify!", err.response.data.globalErrors[0], "error");
            }
        });
    }

    render() {
        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <Row>
                    <Col lg="3">
                        <div className="card card-default">
                            {this.state.user &&
                                <div className="card-body text-center">
                                    <div className="py-4">
                                        <img className="img-fluid rounded-circle img-thumbnail thumb96" src="img/user.jpg" alt="Contact" />
                                    </div>
                                    <h3 className="m-0 text-bold">{this.state.user.name}</h3>
                                    <hr />
                                    <div className="my-3">
                                        <p>{this.state.user.email}</p>
                                        <p>{this.state.user.mobile}</p>
                                        <p><Moment format="DD MMM YY HH:mm">{this.state.user.creationDate}</Moment></p>
                                    </div>
                                </div>}
                        </div>
                    </Col>
                    <Col lg="9">
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
                                {this.tabs = 0}
                                {this.state.tabsCount=0}
                                {this.state.list.map((ele, i) => {
                                    if((ele.url === 'sales' && this.state.permissionFlowCodes.indexOf('MG_SE_E') < 0) || (ele.url === 'purchases' && this.state.permissionFlowCodes.indexOf('MG_PR_E') < 0)){
                                        return null;
                                    }
                                    else{
                                        return <Tab label={ele.url} />;
                                    }
                                })}
                            </Tabs>
                        </AppBar>
                        {this.state.list.map((ele, idx) => {
                            if((ele.url === 'sales' && this.state.permissionFlowCodes.indexOf('MG_SE_E') < 0) || (ele.url === 'purchases' && this.state.permissionFlowCodes.indexOf('MG_PR_E') < 0)){
                                return null;
                            }
                            else{
                                let index = this.tabs++;
                                return (
                                    ele.isTable ? <TabPanel value={this.state.activeTab} index={index}>
                                        <div className="row" >
                                            <div className="col-md-2">
                                                <h4 className="float-right">Filters : </h4>
                                            </div>
                                            <div className="col-md-2 form-group">
                                                <TextField
                                                    type="text"
                                                    label="Search .."
                                                    fullWidth={true}
                                                    value={ele.filters.search}
                                                    onChange={e => this.searchObject(idx, e)} />
                                            </div>
                                            {ele.filterCategories.length > 1 &&
                                                <div className="col-md-2">
                                                    <FormControl>
                                                        <InputLabel>Select Status</InputLabel>
                                                        <Select
                                                            name="category"
                                                            value={ele.filters.category}
                                                            onChange={e => this.searchCategory(idx, e)}
                                                        >
                                                            {ele.filterCategories.map((e, keyIndex) => {
                                                                return (
                                                                    <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                                                );
                                                            })}
                                                        </Select>
                                                    </FormControl>
                                                </div>}
                                            <div className="col-md-2">
                                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                                    <DatePicker
                                                        autoOk
                                                        clearable
                                                        disableFuture
                                                        label="From Date"
                                                        format="DD/MM/YYYY"
                                                        value={ele.filters.fromDate}
                                                        onChange={e => this.filterByDate(idx, e, 'from')}
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
                                                        value={ele.filters.toDate}
                                                        onChange={e => this.filterByDate(idx, e, 'to')}
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
                                            <div className="col-md-2">
                                                <div className="float-right">
                                                    <Button className="d-none" variant="contained" color="secondary" size="small">Test</Button>
                                                </div>
                                            </div>
                                        </div>
                                        <Table hover responsive>
                                            <thead>
                                                <Sorter columns={[
                                                    { name: '#', sortable: false },
                                                    { name: 'Code', sortable: true, param: 'code' },
                                                    { name: 'Company', sortable: false },
                                                    { name: 'Status', sortable: true, param: 'status' },
                                                    { name: 'Created On', sortable: true, param: 'creationDate' },
                                                    { name: 'Action', sortable: false }]}
                                                    onSort={this.onSort.bind(idx, this)} />
                                            </thead>
                                            <tbody>
                                                {ele.objects.map((obj, i) => {
                                                    return (
                                                        <tr key={obj.id}>
                                                            <td>{i + 1}</td>
                                                            <td>
                                                                <Link to={`/purchases/${obj.id}`}>
                                                                    {obj.code}
                                                                </Link>
                                                            </td>
                                                            <td>
                                                                <Link to={`/companies/${obj.company.id}`}>
                                                                    {obj.company.name}
                                                                </Link>
                                                            </td>
                                                            <td>
                                                                <span className={getStatusBadge(obj.status, this.state.status)}>{obj.status}</span>
                                                            </td>
                                                            <td>
                                                                <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                            </td>
                                                            <td>
                                                                {obj.order &&
                                                                    <Link to={`/orders/${obj.order}`}>
                                                                        <Button variant="contained" color="inverse" size="xs">Order</Button>
                                                                    </Link>}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>

                                        <CustomPagination page={ele.page} onChange={(x) => this.loadObjects(idx, x)} />
                                    </TabPanel> :
                                        <TabPanel value={this.state.activeTab} index={index}>
                                            {/* <hr /> */}
                                            {this.state.permissions.map((obj, i) => {
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
                                                                    />}
                                                            />
                                                        </div>
                                                        <hr />
                                                    </fieldset>)
                                            })}
                                            <div className="text-center">
                                                <Button variant="contained"  onClick={() => this.updatePermissions()}color="secondary" size="small">Update</Button>

                                            </div>
                                            <hr />
                                        </TabPanel>
                                )
                            }
                        })}
                    </Col>
                </Row>
            </ContentWrapper>
        );
    }

}

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(Profile);