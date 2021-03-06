import React, { Component } from 'react';
import ContentWrapper from '../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import PageLoader from '../Common/PageLoader';
import Dropdown from './Dropdown';
// import Sorter from '../Common/Sorter';
// import { makeStyles, withStyles } from '@material-ui/core/styles';
import FileDownload from '../Common/FileDownload';
import TabPanel from '../Common/TabPanel';
// import CustomPagination from '../Common/CustomPagination';
import AutoSuggest from '../Common/AutoSuggest';
import { server_url, context_path, defaultDateFilter } from '../Common/constants';
import { Button, ButtonGroup,AppBar, Tab, Tabs, TextField, Select, MenuItem, InputLabel, FormControl, } from '@material-ui/core';

import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';
import Divider from '@material-ui/core/Divider';
const items = [
    {
      id: 1,
      value: 'Excel',
    },
    {
        id: 1,
        value: 'Print',
      },
    {
      id: 2,
      value: 'PDF',
    },
    {
      id: 3,
      value: 'CSV',
    },
    
  ];

const json2csv = require('json2csv').parse;

class Reports extends Component {
    

    state = {
        activeStep: 0,
        editFlag: false,
        editSubFlag: false,
        loading: true,
        objects: [],
        all: [],
        assignUser: '',
        baseUrl: 'reports',
        formWizard: {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                assignedTo: '',
                company: '',
              timePeriod:'all',
                
            },


        },
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
        ],
        orderBy:'id,desc',
        patchError: '',

    }
    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    setAutoSuggest(field, val) {
        var formWizard = this.state.formWizard;
        formWizard.obj[field] = val;
        formWizard['selected' + field] = val;
        this.setState({ formWizard });
        if (field === 'company') {
            this.loadCompany(val)
        }
    }
    setAutoSuggestAssignUser(field, val) {
        var assignUser=this.state.assignUser;
        assignUser=val;
        this.setState({assignUser})
        // var formWizard = this.state.formWizard;
        // formWizard.obj[field] = val;
        // formWizard['selected' + field] = val;
        // this.setState({ formWizard });
        // if (field === 'company') {
            //     this.loadCompany(val)
        // }
    }
    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;
        var input = e.target;
       console.log("element is:",input);
       console.log("field is:",field);
        formWizard.obj[field] = e.target.value;
        this.setState({ formWizard });
        // if (!noValidate) {
        //     const result = FormValidator.validate(input);
        //     formWizard.errors[input.name] = result;
        //     this.setState({
        //         formWizard
        //     });
        // }
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

        if(e) {
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
    loadCompany(companyId) {
        axios.get(server_url + context_path + "api/companies/" + companyId + '?projection=company_auto_suggest_product')
        .then(res => {
            var formWizard = this.state.formWizard;
            formWizard.obj.email = res.data.email;
            formWizard.obj.phone = res.data.phone;
            formWizard.obj.contactName = res.data.name;
            if (res.data.products) {
                res.data.products.forEach(p => {
                    formWizard.obj.products = [];
                    formWizard.selectedProducts = [];
                    var products = formWizard.obj.products;
                    //var idx = products.length;
                    products.push({ quantity: '', amount: '' })
                    formWizard.selectedProducts.push(p.product);
                })
            }

            this.setState({ formWizard }, o => {
                if (res.data.products) {
                    res.data.products.forEach((p, idx) => {
                        if(this.productASRef[idx]){
                            this.productASRef[idx].setInitialField(formWizard.selectedProducts[idx]);
                        }
                    });
                }
            });

            axios.get(server_url + context_path + "api/company-contact?sort=id,asc&projection=company_contact_name&page=0&size=1&company=" + companyId)
            .then(res => {
                if (res.data._embedded['company-contact'] && res.data._embedded['company-contact'].length) {
                    var formWizard = this.state.formWizard;
                    formWizard.obj.contactName = res.data._embedded['company-contact'][0].name;
                    this.setState({ formWizard });
                }
            });
        });
    }
    loadObjects(offset, all, callBack) {
        if (!offset) offset = 1;

        var url = server_url + context_path + "api/" + this.state.baseUrl + "?page=" + (offset - 1);


        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }

        if(this.props.user.role !== 'ROLE_ADMIN') {
            url += "&uid=" + this.props.user.id;
        }

        if (this.state.filters.search) {
            url += "&description=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }

        if (this.state.filters.category) {
            url += "&type=" + this.state.filters.category;
        }

        url = defaultDateFilter(this.state, url);

        if (all) {
            url += "&size=100000";
        }

        axios.get(url)
            .then(res => {
                if (all) {
                    this.setState({
                        all: res.data._embedded[Object.keys(res.data._embedded)[0]]
                    });
                } else {
                    this.setState({
                        objects: res.data._embedded[Object.keys(res.data._embedded)[0]],
                        page: res.data.page
                    });
                }

                if (callBack) {
                    callBack();
                }
            })
    }

    componentDidMount() {
        this.loadObjects();
        this.setState({ loading: false });
    }

    patchObj(idx) {
        var obj = this.state.objects[idx];

        axios.patch(server_url + context_path + "api/" + this.state.baseUrl + "/" + obj.id)
            .then(res => {
                var objects = this.state.objects;
                objects[idx].active = !objects[idx].active;
                this.setState({ objects });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }

    printReport() {
        this.loadObjects(this.state.offset, true, () => {
            window.print();
        });
    }

    downloadReport = () => {
        const fields = ['id', 'name', 'email', 'mobile', 'creationDate'];
        const opts = { fields };

        this.loadObjects(this.state.offset, true, () => {
            var csv = json2csv(this.state.all, opts);
            FileDownload.download(csv, 'reports.csv', 'text/csv');
        });
    }

    render()
   
     {
        const errors = this.state.formWizard.errors;
        return (<ContentWrapper>
            {this.state.loading && <PageLoader />}
            {/* <div className="card b"> */}
                {/* <div className="card-body bb bt"> */}
                    <div className="content-heading">Reports</div>
                    {/* <div className="row">
                        <div className="col-md-12">
                            <div className="row">
                                <div className="col-md-2">
                                    <h4 className="float-right">Filters : </h4>
                                </div>
                                <div className="col-md-2 form-group">
                                    <TextField
                                        type="text"
                                        label="Search .."
                                        fullWidth={true}
                                        value={this.state.filters.search}
                                        onChange={this.searchObject} />
                                </div>
                                {this.state.filterCategories.length > 1 &&
                                <div className="col-md-2">
                                    <FormControl>
                                        <InputLabel>Select Type</InputLabel>
                                        <Select
                                            name="category"
                                            value={this.state.filters.category}
                                            onChange={e => this.searchCategory(e)}
                                        >
                                            {this.state.filterCategories.map((e, keyIndex) => {
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
                                <div className="col-md-2">
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
                                        { name: 'Description', sortable: true, param: 'description' },
                                        { name: 'Type', sortable: false, param: 'type' },
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
                                                    <Link to={`/${obj.url}/${obj.id}`}>
                                                        {obj.description}
                                                    </Link>
                                                </td>
                                                <td>
                                                    {obj.type}
                                                </td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                </td>
                                                <td>
                                                    <Button className="d-none" variant="contained" color="warning" size="xs" onClick={() => this.patchObj(i)}>{obj.active ? 'InActivate' : 'Activate'}</Button>
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
                                        <th>Created On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.all.map((obj, i) => {
                                        return (
                                            <tr key={obj.id}>
                                                <td>{i + 1}</td>
                                                <td>{obj.name}</td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                 */}
                {/* </div> */}
            {/* </div> */}
          
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
                                    <Tab label="Sales" />
                                    <Tab label="Purchases" />
                                    <Tab label="Companies" />                                  
                                    <Tab label="Sample Tracking" />
                                    <Tab label="Prospective Buyers" />
                                    <Tab label="Prospective Vendors" />
                                  
                                    {/* <Tab label="Inventory & Docs" />
                                   <Tab label="Pharma Documents" />
                                    <Tab label="Food Documents" />*/}
                                </Tabs>
                            </AppBar>
                            {
                            <TabPanel value={this.state.activeTab} index={0}>                          
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="card b">
                                                {/* <div className="card-header">

                                                </div> */}
                                <div className="card-body">
                                    <div className="row" >
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                    <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>  Sales</InputLabel>
                                                    <Select
                                                        
                                                    
                                                        >
                                                            <MenuItem value={0} >All</MenuItem>
                                                        <MenuItem value={10}>Enquiries</MenuItem>
                                                        <MenuItem value={20}>Order</MenuItem>
                                                        {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                     <div className="col-md-2" style={{marginTop: "-15px"}}>
                                                    <fieldset>
                                            <FormControl>
                                                <AutoSuggest url="companies"
                                                    name="companyName"
                                                    displayColumns="name"
                                                    label="Company"
                                                    onRef={ref => {
                                                        (this.companyASRef = ref)
                                                        if (ref) {
                                                            this.companyASRef.load();
                                                        }
                                                    }}
                                                    placeholder="Search Company by name"
                                                    arrayName="companies"
                                                    helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                                    error={errors?.companyName_auto_suggest?.length > 0}
                                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                    projection="company_auto_suggest"
                                                    value={this.state.formWizard.obj.selectedCompany}
                                                    onSelect={e => this.setAutoSuggest('company', e?.id)}
                                                    queryString="&name" >
                                                </AutoSuggest>
                                            </FormControl>
                                        </fieldset>
                                                    
                                                    </div>
                                    
                                            <div className="col-md-2" style={{marginTop: "-15px"}}>
                                            <fieldset>
                                                <FormControl>
                                                    <AutoSuggest url="users"
                                                        name="usersName"
                                                        displayColumns="name"
                                                        label="Assign"
                                                        onRef={ref => {
                                                            (this.userASRef = ref)
                                                            if (ref) {
                                                                this.userASRef.load();
                                                            }
                                                        }}
                                                        placeholder="Search User by name"
                                                        arrayName="users"
                                                        helperText={errors?.usersName_auto_suggest?.length > 0 ? errors?.usersName_auto_suggest[0]?.msg : ""}
                                                        error={errors?.usersName_auto_suggest?.length > 0}
                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                        projection="user_details_mini"
                                                        value={this.state.assignUser}
                                                        onSelect={e => this.setAutoSuggestAssignUser('user', e)}
                                                        queryString="&name" >
                                                    </AutoSuggest>
                                                </FormControl>
                                            </fieldset>                     
                                        </div>
                                        <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>Status</InputLabel>
                                                    <Select
                                                        

                                                        >
                                                                <MenuItem value={1} >All</MenuItem>
                                                            <MenuItem value={11} >Pending</MenuItem>
                                                        <MenuItem value={10}>Ongoing</MenuItem>
                                                        <MenuItem value={20}>hold</MenuItem>
                                                        <MenuItem value={30}>completed</MenuItem>
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    <div className="col-md-4">
                                                        <FormControl   >
                                                            <InputLabel> Period</InputLabel>
                                                        <Select
                                                            
                                                            onChange={e => this.setField("timePeriod", e)}
                                                            >
                                                                <MenuItem value="all" >All Time</MenuItem>
                                                                <MenuItem value="thismonth">This Month</MenuItem>
                                                                <MenuItem value="lastmonth">Last Month</MenuItem>
                                                                <MenuItem value="thisyear" >This Year</MenuItem>
                                                                <MenuItem value="lastyear">Last Year</MenuItem>
                                                                <MenuItem value="last3month">last 3 Month</MenuItem>
                                                                <MenuItem value="last6month">last 6 Month</MenuItem>
                                                                <MenuItem value="period">period</MenuItem>                                                
                                                            </Select>
                                                            </FormControl>

                                                        {this.state.formWizard.obj.timePeriod === "period"?  
                                                <div className="col-md-12" >
                                                    <table>                                         
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                <fieldset >
                                                        <MuiPickersUtilsProvider utils={MomentUtils} >
                                                                <DatePicker 
                                                                autoOk
                                                                clearable
                                                                disableFuture
                                                                label="From Date"
                                                                format="DD/MM/YYYY"
                                                                value={this.state.formWizard.obj.receivedDate} 
                                                                onChange={e => this.setDateField('receivedDate', e)} 
                                                                TextFieldComponent={(props) => (
                                                                    <TextField
                                                                    type="text"
                                                                    name="receivedDate"
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
                                                    </fieldset>
                                                                </td>
                                                                <td>
                                                                <fieldset>
                                                        <MuiPickersUtilsProvider utils={MomentUtils}>
                                                            <DatePicker 
                                                        
                                                            autoOk
                                                            clearable
                                                            disableFuture
                                                            label="To Date"
                                                            format="DD/MM/YYYY"
                                                            value={this.state.formWizard.obj.emailDate} 
                                                            onChange={e => this.setDateField('emailDate', e)} 
                                                            TextFieldComponent={(props) => (
                                                                <TextField
                                                            
                                                                type="text"
                                                                name="emailDate"
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
                                                </fieldset>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                
                                                </div>
                                                :""} 
                                                    </div>
                                                
                                            
                                   
                                    
     
                                    </div>
                                   
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div classname="card b">
                                <div className="card-header">
                                            <div className="row">
                                              
                                               
                                                    <div className="col-sm-2">
                                                    {/* <h1 style={{ textAlign: 'center' }}>
                                                        Buy Movies{' '}
                                                        <span role="img" aria-label="Movie projector">
                                                        
                                                        </span>
                                                    </h1> */}
                                                    
                                                    <Dropdown title="" items={items} multiSelect />
                                                     {/* <ButtonGroup size="small" aria-label="small outlined button group" >
                                                       <Button></Button>
                                                        <Button><img src="img/refresh.png"/></Button>
                                                      
                                                    </ButtonGroup>   */}                                                    
                                                     </div>
                                                                                                
                                            
                                                <div className="col-sm-1" style={{right: 102}}>
                                                     <ButtonGroup size="medium" aria-label="small outlined button group" >                                   
                                                        <Button><img src="img/refresh.png"/></Button>                                                     
                                                    </ButtonGroup> 
                                                    </div>     
                                                    <div className="col-sm-7" style={{marginTop: "-20px"}}>
                                                    {/* <FormControl    >
                                                        <InputLabel>Pages </InputLabel>
                                                        <Select
                                                            

                                                            >                                                        
                                                            <MenuItem value={1}>10</MenuItem>                                                        
                                                            <MenuItem value={3} >20</MenuItem>                                                           
                                                            <MenuItem value={5}>30</MenuItem>
                                                            <MenuItem value={6}>40</MenuItem>
                                                            <MenuItem value={7}>50</MenuItem>
                                                            
                                                            
                                                            </Select>
                                                     </FormControl>
                                             */}
                                                </div>
                                                    <div className="col-sm-2" style={{marginTop: "-20px"}}>
                                                    <FormControl  >
                                                        <InputLabel>Pages </InputLabel>
                                                        <Select
                                                            

                                                            >                                                        
                                                            <MenuItem value={1}>10</MenuItem>                                                        
                                                            <MenuItem value={3} >20</MenuItem>                                                           
                                                            <MenuItem value={5}>30</MenuItem>
                                                            <MenuItem value={6}>40</MenuItem>
                                                            <MenuItem value={7}>50</MenuItem>
                                                            {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                            
                                                            </Select>
                                                     </FormControl>
                                            
                                                </div>
                                            </div>
                               
                                </div>
                                <div className="card-body">

                                </div>
                            </div>
                        </div>
                    </div>
                                 
                                
                                </TabPanel>}
                               
                                {
                            <TabPanel value={this.state.activeTab} index={1}>                          
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="card b">
                                                {/* <div className="card-header">

                                                </div> */}
                                <div className="card-body">
                                    <div className="row" >
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                    <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>  Sales</InputLabel>
                                                    <Select
                                                        
                                                    
                                                        >
                                                            <MenuItem value={0} >All</MenuItem>
                                                        <MenuItem value={10}>Enquiries</MenuItem>
                                                        <MenuItem value={20}>Order</MenuItem>
                                                        {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                     <div className="col-md-2" style={{marginTop: "-15px"}}>
                                                    <fieldset>
                                            <FormControl>
                                                <AutoSuggest url="companies"
                                                    name="companyName"
                                                    displayColumns="name"
                                                    label="Company"
                                                    onRef={ref => {
                                                        (this.companyASRef = ref)
                                                        if (ref) {
                                                            this.companyASRef.load();
                                                        }
                                                    }}
                                                    placeholder="Search Company by name"
                                                    arrayName="companies"
                                                    helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                                    error={errors?.companyName_auto_suggest?.length > 0}
                                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                    projection="company_auto_suggest"
                                                    value={this.state.formWizard.obj.selectedCompany}
                                                    onSelect={e => this.setAutoSuggest('company', e?.id)}
                                                    queryString="&name" >
                                                </AutoSuggest>
                                            </FormControl>
                                        </fieldset>
                                                    
                                                    </div>
                                    
                                            <div className="col-md-2" style={{marginTop: "-15px"}}>
                                            <fieldset>
                                                <FormControl>
                                                    <AutoSuggest url="users"
                                                        name="usersName"
                                                        displayColumns="name"
                                                        label="Assign"
                                                        onRef={ref => {
                                                            (this.userASRef = ref)
                                                            if (ref) {
                                                                this.userASRef.load();
                                                            }
                                                        }}
                                                        placeholder="Search User by name"
                                                        arrayName="users"
                                                        helperText={errors?.usersName_auto_suggest?.length > 0 ? errors?.usersName_auto_suggest[0]?.msg : ""}
                                                        error={errors?.usersName_auto_suggest?.length > 0}
                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                        projection="user_details_mini"
                                                        value={this.state.assignUser}
                                                        onSelect={e => this.setAutoSuggestAssignUser('user', e)}
                                                        queryString="&name" >
                                                    </AutoSuggest>
                                                </FormControl>
                                            </fieldset>                     
                                        </div>
                                        <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>Status</InputLabel>
                                                    <Select
                                                        

                                                        >
                                                                <MenuItem value={1} >All</MenuItem>
                                                            <MenuItem value={11} >Pending</MenuItem>
                                                        <MenuItem value={10}>Ongoing</MenuItem>
                                                        <MenuItem value={20}>hold</MenuItem>
                                                        <MenuItem value={30}>completed</MenuItem>
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    <div className="col-md-4">
                                                        <FormControl   >
                                                            <InputLabel> Period</InputLabel>
                                                        <Select
                                                            
                                                            onChange={e => this.setField("timePeriod", e)}
                                                            >
                                                                <MenuItem value="all" >All Time</MenuItem>
                                                                <MenuItem value="thismonth">This Month</MenuItem>
                                                                <MenuItem value="lastmonth">Last Month</MenuItem>
                                                                <MenuItem value="thisyear" >This Year</MenuItem>
                                                                <MenuItem value="lastyear">Last Year</MenuItem>
                                                                <MenuItem value="last3month">last 3 Month</MenuItem>
                                                                <MenuItem value="last6month">last 6 Month</MenuItem>
                                                                <MenuItem value="period">period</MenuItem>                                                
                                                            </Select>
                                                            </FormControl>

                                                        {this.state.formWizard.obj.timePeriod === "period"?  
                                                <div className="col-md-12" >
                                                    <table>                                         
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                <fieldset >
                                                        <MuiPickersUtilsProvider utils={MomentUtils} >
                                                                <DatePicker 
                                                                autoOk
                                                                clearable
                                                                disableFuture
                                                                label="From Date"
                                                                format="DD/MM/YYYY"
                                                                value={this.state.formWizard.obj.receivedDate} 
                                                                onChange={e => this.setDateField('receivedDate', e)} 
                                                                TextFieldComponent={(props) => (
                                                                    <TextField
                                                                    type="text"
                                                                    name="receivedDate"
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
                                                    </fieldset>
                                                                </td>
                                                                <td>
                                                                <fieldset>
                                                        <MuiPickersUtilsProvider utils={MomentUtils}>
                                                            <DatePicker 
                                                        
                                                            autoOk
                                                            clearable
                                                            disableFuture
                                                            label="To Date"
                                                            format="DD/MM/YYYY"
                                                            value={this.state.formWizard.obj.emailDate} 
                                                            onChange={e => this.setDateField('emailDate', e)} 
                                                            TextFieldComponent={(props) => (
                                                                <TextField
                                                            
                                                                type="text"
                                                                name="emailDate"
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
                                                </fieldset>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                
                                                </div>
                                                :""} 
                                                    </div>
                                                
                                            
                                   
                                    
     
                                    </div>
                                   
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div classname="card b">
                                <div className="card-header">
                                <div className="row">
                                              
                                               
                                              <div className="col-sm-2">
                                              {/* <h1 style={{ textAlign: 'center' }}>
                                                  Buy Movies{' '}
                                                  <span role="img" aria-label="Movie projector">
                                                  
                                                  </span>
                                              </h1> */}
                                              
                                              <Dropdown title="" items={items} multiSelect />
                                               {/* <ButtonGroup size="small" aria-label="small outlined button group" >
                                                 <Button></Button>
                                                  <Button><img src="img/refresh.png"/></Button>
                                                
                                              </ButtonGroup>   */}                                                    
                                               </div>
                                                                                          
                                      
                                          <div className="col-sm-1" style={{right: 102}}>
                                               <ButtonGroup size="medium" aria-label="small outlined button group" >                                   
                                                  <Button><img src="img/refresh.png"/></Button>                                                     
                                              </ButtonGroup> 
                                              </div>     
                                              <div className="col-sm-7" style={{marginTop: "-20px"}}>
                                              {/* <FormControl    >
                                                  <InputLabel>Pages </InputLabel>
                                                  <Select
                                                      

                                                      >                                                        
                                                      <MenuItem value={1}>10</MenuItem>                                                        
                                                      <MenuItem value={3} >20</MenuItem>                                                           
                                                      <MenuItem value={5}>30</MenuItem>
                                                      <MenuItem value={6}>40</MenuItem>
                                                      <MenuItem value={7}>50</MenuItem>
                                                      
                                                      
                                                      </Select>
                                               </FormControl>
                                       */}
                                          </div>
                                              <div className="col-sm-2" style={{marginTop: "-20px"}}>
                                              <FormControl  >
                                                  <InputLabel>Pages </InputLabel>
                                                  <Select
                                                      

                                                      >                                                        
                                                      <MenuItem value={1}>10</MenuItem>                                                        
                                                      <MenuItem value={3} >20</MenuItem>                                                           
                                                      <MenuItem value={5}>30</MenuItem>
                                                      <MenuItem value={6}>40</MenuItem>
                                                      <MenuItem value={7}>50</MenuItem>
                                                      {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                      
                                                      </Select>
                                               </FormControl>
                                      
                                          </div>
                                      </div>
                         
                                </div>
                                <div className="card-body">

                                </div>
                            </div>
                        </div>
                    </div>
                                 
                                
                                </TabPanel>}
                               
                                {
                            <TabPanel value={this.state.activeTab} index={2}>                          
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="card b">
                                                {/* <div className="card-header">

                                                </div> */}
                                <div className="card-body">
                                    <div className="row" >
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                    <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>  Sales</InputLabel>
                                                    <Select
                                                        
                                                    
                                                        >
                                                            <MenuItem value={0} >All</MenuItem>
                                                        <MenuItem value={10}>Buyers</MenuItem>
                                                        <MenuItem value={20}>Vendors</MenuItem>
                                                        {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                     {/* <div className="col-md-2" style={{marginTop: "-15px"}}>
                                                    <fieldset>
                                            <FormControl>
                                                <AutoSuggest url="companies"
                                                    name="companyName"
                                                    displayColumns="name"
                                                    label="Company"
                                                    onRef={ref => {
                                                        (this.companyASRef = ref)
                                                        if (ref) {
                                                            this.companyASRef.load();
                                                        }
                                                    }}
                                                    placeholder="Search Company by name"
                                                    arrayName="companies"
                                                    helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                                    error={errors?.companyName_auto_suggest?.length > 0}
                                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                    projection="company_auto_suggest"
                                                    value={this.state.formWizard.obj.selectedCompany}
                                                    onSelect={e => this.setAutoSuggest('company', e?.id)}
                                                    queryString="&name" >
                                                </AutoSuggest>
                                            </FormControl>
                                        </fieldset>
                                                    
                                                    </div>
                                     */}
                                            <div className="col-md-2" style={{marginTop: "-15px"}}>
                                            <fieldset>
                                                <FormControl>
                                                    <AutoSuggest url="users"
                                                        name="usersName"
                                                        displayColumns="name"
                                                        label="Assign"
                                                        onRef={ref => {
                                                            (this.userASRef = ref)
                                                            if (ref) {
                                                                this.userASRef.load();
                                                            }
                                                        }}
                                                        placeholder="Search User by name"
                                                        arrayName="users"
                                                        helperText={errors?.usersName_auto_suggest?.length > 0 ? errors?.usersName_auto_suggest[0]?.msg : ""}
                                                        error={errors?.usersName_auto_suggest?.length > 0}
                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                        projection="user_details_mini"
                                                        value={this.state.assignUser}
                                                        onSelect={e => this.setAutoSuggestAssignUser('user', e)}
                                                        queryString="&name" >
                                                    </AutoSuggest>
                                                </FormControl>
                                            </fieldset>                     
                                        </div>
                                        <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>Status</InputLabel>
                                                    <Select
                                                        

                                                        >
                                                                <MenuItem value={1} >All</MenuItem>
                                                            <MenuItem value={11} >Pending</MenuItem>
                                                        <MenuItem value={10}>Ongoing</MenuItem>
                                                        <MenuItem value={20}>hold</MenuItem>
                                                        <MenuItem value={30}>completed</MenuItem>
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    <div className="col-md-4">
                                                        <FormControl   >
                                                            <InputLabel> Period</InputLabel>
                                                        <Select
                                                            
                                                            onChange={e => this.setField("timePeriod", e)}
                                                            >
                                                                <MenuItem value="all" >All Time</MenuItem>
                                                                <MenuItem value="thismonth">This Month</MenuItem>
                                                                <MenuItem value="lastmonth">Last Month</MenuItem>
                                                                <MenuItem value="thisyear" >This Year</MenuItem>
                                                                <MenuItem value="lastyear">Last Year</MenuItem>
                                                                <MenuItem value="last3month">last 3 Month</MenuItem>
                                                                <MenuItem value="last6month">last 6 Month</MenuItem>
                                                                <MenuItem value="period">period</MenuItem>                                                
                                                            </Select>
                                                            </FormControl>

                                                        {this.state.formWizard.obj.timePeriod === "period"?  
                                                <div className="col-md-12" >
                                                    <table>                                         
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                <fieldset >
                                                        <MuiPickersUtilsProvider utils={MomentUtils} >
                                                                <DatePicker 
                                                                autoOk
                                                                clearable
                                                                disableFuture
                                                                label="From Date"
                                                                format="DD/MM/YYYY"
                                                                value={this.state.formWizard.obj.receivedDate} 
                                                                onChange={e => this.setDateField('receivedDate', e)} 
                                                                TextFieldComponent={(props) => (
                                                                    <TextField
                                                                    type="text"
                                                                    name="receivedDate"
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
                                                    </fieldset>
                                                                </td>
                                                                <td>
                                                                <fieldset>
                                                        <MuiPickersUtilsProvider utils={MomentUtils}>
                                                            <DatePicker 
                                                        
                                                            autoOk
                                                            clearable
                                                            disableFuture
                                                            label="To Date"
                                                            format="DD/MM/YYYY"
                                                            value={this.state.formWizard.obj.emailDate} 
                                                            onChange={e => this.setDateField('emailDate', e)} 
                                                            TextFieldComponent={(props) => (
                                                                <TextField
                                                            
                                                                type="text"
                                                                name="emailDate"
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
                                                </fieldset>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                
                                                </div>
                                                :""} 
                                                    </div>
                                                
                                            
                                   
                                    
     
                                    </div>
                                   
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div classname="card b">
                                <div className="card-header">
                                <div className="row">
                                              
                                               
                                              <div className="col-sm-2">
                                              {/* <h1 style={{ textAlign: 'center' }}>
                                                  Buy Movies{' '}
                                                  <span role="img" aria-label="Movie projector">
                                                  
                                                  </span>
                                              </h1> */}
                                              
                                              <Dropdown title="" items={items} multiSelect />
                                               {/* <ButtonGroup size="small" aria-label="small outlined button group" >
                                                 <Button></Button>
                                                  <Button><img src="img/refresh.png"/></Button>
                                                
                                              </ButtonGroup>   */}                                                    
                                               </div>
                                                                                          
                                      
                                          <div className="col-sm-1" style={{right: 102}}>
                                               <ButtonGroup size="medium" aria-label="small outlined button group" >                                   
                                                  <Button><img src="img/refresh.png"/></Button>                                                     
                                              </ButtonGroup> 
                                              </div>     
                                              <div className="col-sm-7" style={{marginTop: "-20px"}}>
                                              {/* <FormControl    >
                                                  <InputLabel>Pages </InputLabel>
                                                  <Select
                                                      

                                                      >                                                        
                                                      <MenuItem value={1}>10</MenuItem>                                                        
                                                      <MenuItem value={3} >20</MenuItem>                                                           
                                                      <MenuItem value={5}>30</MenuItem>
                                                      <MenuItem value={6}>40</MenuItem>
                                                      <MenuItem value={7}>50</MenuItem>
                                                      
                                                      
                                                      </Select>
                                               </FormControl>
                                       */}
                                          </div>
                                              <div className="col-sm-2" style={{marginTop: "-20px"}}>
                                              <FormControl  >
                                                  <InputLabel>Pages </InputLabel>
                                                  <Select
                                                      

                                                      >                                                        
                                                      <MenuItem value={1}>10</MenuItem>                                                        
                                                      <MenuItem value={3} >20</MenuItem>                                                           
                                                      <MenuItem value={5}>30</MenuItem>
                                                      <MenuItem value={6}>40</MenuItem>
                                                      <MenuItem value={7}>50</MenuItem>
                                                      {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                      
                                                      </Select>
                                               </FormControl>
                                      
                                          </div>
                                      </div>
                         
                                </div>
                                <div className="card-body">

                                </div>
                            </div>
                        </div>
                    </div>
                                 
                                
                                </TabPanel>}
                               
                                {
                            <TabPanel value={this.state.activeTab} index={3}>                          
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="card b">
                                                {/* <div className="card-header">

                                                </div> */}
                                <div className="card-body">
                                    <div className="row" >
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                    <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>  Sales</InputLabel>
                                                    <Select
                                                        
                                                    
                                                        >
                                                            <MenuItem value={0} >All</MenuItem>
                                                        <MenuItem value={10}>Inward</MenuItem>
                                                        <MenuItem value={20}>outward</MenuItem>
                                                        {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                     <div className="col-md-2" style={{marginTop: "-15px"}}>
                                                    <fieldset>
                                            <FormControl>
                                                <AutoSuggest url="companies"
                                                    name="companyName"
                                                    displayColumns="name"
                                                    label="Company"
                                                    onRef={ref => {
                                                        (this.companyASRef = ref)
                                                        if (ref) {
                                                            this.companyASRef.load();
                                                        }
                                                    }}
                                                    placeholder="Search Company by name"
                                                    arrayName="companies"
                                                    helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                                    error={errors?.companyName_auto_suggest?.length > 0}
                                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                    projection="company_auto_suggest"
                                                    value={this.state.formWizard.obj.selectedCompany}
                                                    onSelect={e => this.setAutoSuggest('company', e?.id)}
                                                    queryString="&name" >
                                                </AutoSuggest>
                                            </FormControl>
                                        </fieldset>
                                                    
                                                    </div>
                                    
                                            <div className="col-md-2" style={{marginTop: "-15px"}}>
                                            <fieldset>
                                                <FormControl>
                                                    <AutoSuggest url="users"
                                                        name="usersName"
                                                        displayColumns="name"
                                                        label="Assign"
                                                        onRef={ref => {
                                                            (this.userASRef = ref)
                                                            if (ref) {
                                                                this.userASRef.load();
                                                            }
                                                        }}
                                                        placeholder="Search User by name"
                                                        arrayName="users"
                                                        helperText={errors?.usersName_auto_suggest?.length > 0 ? errors?.usersName_auto_suggest[0]?.msg : ""}
                                                        error={errors?.usersName_auto_suggest?.length > 0}
                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                        projection="user_details_mini"
                                                        value={this.state.assignUser}
                                                        onSelect={e => this.setAutoSuggestAssignUser('user', e)}
                                                        queryString="&name" >
                                                    </AutoSuggest>
                                                </FormControl>
                                            </fieldset>                     
                                        </div>
                                        <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>Status</InputLabel>
                                                    <Select
                                                        

                                                        >
                                                                <MenuItem value={1} >All</MenuItem>
                                                            <MenuItem value={11} >Pending</MenuItem>
                                                        <MenuItem value={10}>Ongoing</MenuItem>
                                                        <MenuItem value={20}>hold</MenuItem>
                                                        <MenuItem value={30}>completed</MenuItem>
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    <div className="col-md-4">
                                                        <FormControl   >
                                                            <InputLabel> Period</InputLabel>
                                                        <Select
                                                            
                                                            onChange={e => this.setField("timePeriod", e)}
                                                            >
                                                                <MenuItem value="all" >All Time</MenuItem>
                                                                <MenuItem value="thismonth">This Month</MenuItem>
                                                                <MenuItem value="lastmonth">Last Month</MenuItem>
                                                                <MenuItem value="thisyear" >This Year</MenuItem>
                                                                <MenuItem value="lastyear">Last Year</MenuItem>
                                                                <MenuItem value="last3month">last 3 Month</MenuItem>
                                                                <MenuItem value="last6month">last 6 Month</MenuItem>
                                                                <MenuItem value="period">period</MenuItem>                                                
                                                            </Select>
                                                            </FormControl>

                                                        {this.state.formWizard.obj.timePeriod === "period"?  
                                                <div className="col-md-12" >
                                                    <table>                                         
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                <fieldset >
                                                        <MuiPickersUtilsProvider utils={MomentUtils} >
                                                                <DatePicker 
                                                                autoOk
                                                                clearable
                                                                disableFuture
                                                                label="From Date"
                                                                format="DD/MM/YYYY"
                                                                value={this.state.formWizard.obj.receivedDate} 
                                                                onChange={e => this.setDateField('receivedDate', e)} 
                                                                TextFieldComponent={(props) => (
                                                                    <TextField
                                                                    type="text"
                                                                    name="receivedDate"
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
                                                    </fieldset>
                                                                </td>
                                                                <td>
                                                                <fieldset>
                                                        <MuiPickersUtilsProvider utils={MomentUtils}>
                                                            <DatePicker 
                                                        
                                                            autoOk
                                                            clearable
                                                            disableFuture
                                                            label="To Date"
                                                            format="DD/MM/YYYY"
                                                            value={this.state.formWizard.obj.emailDate} 
                                                            onChange={e => this.setDateField('emailDate', e)} 
                                                            TextFieldComponent={(props) => (
                                                                <TextField
                                                            
                                                                type="text"
                                                                name="emailDate"
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
                                                </fieldset>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                
                                                </div>
                                                :""} 
                                                    </div>
                                                
                                            
                                   
                                    
     
                                    </div>
                                   
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div classname="card b">
                                <div className="card-header">
                                <div className="row">
                                              
                                               
                                              <div className="col-sm-2">
                                              {/* <h1 style={{ textAlign: 'center' }}>
                                                  Buy Movies{' '}
                                                  <span role="img" aria-label="Movie projector">
                                                  
                                                  </span>
                                              </h1> */}
                                              
                                              <Dropdown title="" items={items} multiSelect />
                                               {/* <ButtonGroup size="small" aria-label="small outlined button group" >
                                                 <Button></Button>
                                                  <Button><img src="img/refresh.png"/></Button>
                                                
                                              </ButtonGroup>   */}                                                    
                                               </div>
                                                                                          
                                      
                                          <div className="col-sm-1" style={{right: 102}}>
                                               <ButtonGroup size="medium" aria-label="small outlined button group" >                                   
                                                  <Button><img src="img/refresh.png"/></Button>                                                     
                                              </ButtonGroup> 
                                              </div>     
                                              <div className="col-sm-7" style={{marginTop: "-20px"}}>
                                              {/* <FormControl    >
                                                  <InputLabel>Pages </InputLabel>
                                                  <Select
                                                      

                                                      >                                                        
                                                      <MenuItem value={1}>10</MenuItem>                                                        
                                                      <MenuItem value={3} >20</MenuItem>                                                           
                                                      <MenuItem value={5}>30</MenuItem>
                                                      <MenuItem value={6}>40</MenuItem>
                                                      <MenuItem value={7}>50</MenuItem>
                                                      
                                                      
                                                      </Select>
                                               </FormControl>
                                       */}
                                          </div>
                                              <div className="col-sm-2" style={{marginTop: "-20px"}}>
                                              <FormControl  >
                                                  <InputLabel>Pages </InputLabel>
                                                  <Select
                                                      

                                                      >                                                        
                                                      <MenuItem value={1}>10</MenuItem>                                                        
                                                      <MenuItem value={3} >20</MenuItem>                                                           
                                                      <MenuItem value={5}>30</MenuItem>
                                                      <MenuItem value={6}>40</MenuItem>
                                                      <MenuItem value={7}>50</MenuItem>
                                                      {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                      
                                                      </Select>
                                               </FormControl>
                                      
                                          </div>
                                      </div>
                         
                                </div>
                                <div className="card-body">

                                </div>
                            </div>
                        </div>
                    </div>
                                 
                                
                                </TabPanel>}
                                {
                            <TabPanel value={this.state.activeTab} index={4}>                          
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="card b">
                                                {/* <div className="card-header">

                                                </div> */}
                                <div className="card-body">
                                    <div className="row" >
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                    <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>  Sales</InputLabel>
                                                    <Select
                                                        
                                                    
                                                        >
                                                            <MenuItem value={0} >All</MenuItem>
                                                        <MenuItem value={10}>Enquiries</MenuItem>
                                                        <MenuItem value={20}>Order</MenuItem>
                                                        {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                     <div className="col-md-2" style={{marginTop: "-15px"}}>
                                                    <fieldset>
                                            <FormControl>
                                                <AutoSuggest url="companies"
                                                    name="companyName"
                                                    displayColumns="name"
                                                    label="Company"
                                                    onRef={ref => {
                                                        (this.companyASRef = ref)
                                                        if (ref) {
                                                            this.companyASRef.load();
                                                        }
                                                    }}
                                                    placeholder="Search Company by name"
                                                    arrayName="companies"
                                                    helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                                    error={errors?.companyName_auto_suggest?.length > 0}
                                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                    projection="company_auto_suggest"
                                                    value={this.state.formWizard.obj.selectedCompany}
                                                    onSelect={e => this.setAutoSuggest('company', e?.id)}
                                                    queryString="&name" >
                                                </AutoSuggest>
                                            </FormControl>
                                        </fieldset>
                                                    
                                                    </div>
                                    
                                            <div className="col-md-2" style={{marginTop: "-15px"}}>
                                            <fieldset>
                                                <FormControl>
                                                    <AutoSuggest url="users"
                                                        name="usersName"
                                                        displayColumns="name"
                                                        label="Assign"
                                                        onRef={ref => {
                                                            (this.userASRef = ref)
                                                            if (ref) {
                                                                this.userASRef.load();
                                                            }
                                                        }}
                                                        placeholder="Search User by name"
                                                        arrayName="users"
                                                        helperText={errors?.usersName_auto_suggest?.length > 0 ? errors?.usersName_auto_suggest[0]?.msg : ""}
                                                        error={errors?.usersName_auto_suggest?.length > 0}
                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                        projection="user_details_mini"
                                                        value={this.state.assignUser}
                                                        onSelect={e => this.setAutoSuggestAssignUser('user', e)}
                                                        queryString="&name" >
                                                    </AutoSuggest>
                                                </FormControl>
                                            </fieldset>                     
                                        </div>
                                        <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>Status</InputLabel>
                                                    <Select
                                                        

                                                        >
                                                                <MenuItem value={1} >All</MenuItem>
                                                            <MenuItem value={11} >Pending</MenuItem>
                                                        <MenuItem value={10}>Ongoing</MenuItem>
                                                        <MenuItem value={20}>hold</MenuItem>
                                                        <MenuItem value={30}>completed</MenuItem>
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    <div className="col-md-4">
                                                        <FormControl   >
                                                            <InputLabel> Period</InputLabel>
                                                        <Select
                                                            
                                                            onChange={e => this.setField("timePeriod", e)}
                                                            >
                                                                <MenuItem value="all" >All Time</MenuItem>
                                                                <MenuItem value="thismonth">This Month</MenuItem>
                                                                <MenuItem value="lastmonth">Last Month</MenuItem>
                                                                <MenuItem value="thisyear" >This Year</MenuItem>
                                                                <MenuItem value="lastyear">Last Year</MenuItem>
                                                                <MenuItem value="last3month">last 3 Month</MenuItem>
                                                                <MenuItem value="last6month">last 6 Month</MenuItem>
                                                                <MenuItem value="period">period</MenuItem>                                                
                                                            </Select>
                                                            </FormControl>

                                                        {this.state.formWizard.obj.timePeriod === "period"?  
                                                <div className="col-md-12" >
                                                    <table>                                         
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                <fieldset >
                                                        <MuiPickersUtilsProvider utils={MomentUtils} >
                                                                <DatePicker 
                                                                autoOk
                                                                clearable
                                                                disableFuture
                                                                label="From Date"
                                                                format="DD/MM/YYYY"
                                                                value={this.state.formWizard.obj.receivedDate} 
                                                                onChange={e => this.setDateField('receivedDate', e)} 
                                                                TextFieldComponent={(props) => (
                                                                    <TextField
                                                                    type="text"
                                                                    name="receivedDate"
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
                                                    </fieldset>
                                                                </td>
                                                                <td>
                                                                <fieldset>
                                                        <MuiPickersUtilsProvider utils={MomentUtils}>
                                                            <DatePicker 
                                                        
                                                            autoOk
                                                            clearable
                                                            disableFuture
                                                            label="To Date"
                                                            format="DD/MM/YYYY"
                                                            value={this.state.formWizard.obj.emailDate} 
                                                            onChange={e => this.setDateField('emailDate', e)} 
                                                            TextFieldComponent={(props) => (
                                                                <TextField
                                                            
                                                                type="text"
                                                                name="emailDate"
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
                                                </fieldset>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                
                                                </div>
                                                :""} 
                                                    </div>
                                                
                                            
                                   
                                    
     
                                    </div>
                                   
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div classname="card b">
                                <div className="card-header">
                                <div className="row">
                                              
                                               
                                              <div className="col-sm-2">
                                              {/* <h1 style={{ textAlign: 'center' }}>
                                                  Buy Movies{' '}
                                                  <span role="img" aria-label="Movie projector">
                                                  
                                                  </span>
                                              </h1> */}
                                              
                                              <Dropdown title="" items={items} multiSelect />
                                               {/* <ButtonGroup size="small" aria-label="small outlined button group" >
                                                 <Button></Button>
                                                  <Button><img src="img/refresh.png"/></Button>
                                                
                                              </ButtonGroup>   */}                                                    
                                               </div>
                                                                                          
                                      
                                          <div className="col-sm-1" style={{right: 102}}>
                                               <ButtonGroup size="medium" aria-label="small outlined button group" >                                   
                                                  <Button><img src="img/refresh.png"/></Button>                                                     
                                              </ButtonGroup> 
                                              </div>     
                                              <div className="col-sm-7" style={{marginTop: "-20px"}}>
                                              {/* <FormControl    >
                                                  <InputLabel>Pages </InputLabel>
                                                  <Select
                                                      

                                                      >                                                        
                                                      <MenuItem value={1}>10</MenuItem>                                                        
                                                      <MenuItem value={3} >20</MenuItem>                                                           
                                                      <MenuItem value={5}>30</MenuItem>
                                                      <MenuItem value={6}>40</MenuItem>
                                                      <MenuItem value={7}>50</MenuItem>
                                                      
                                                      
                                                      </Select>
                                               </FormControl>
                                       */}
                                          </div>
                                              <div className="col-sm-2" style={{marginTop: "-20px"}}>
                                              <FormControl  >
                                                  <InputLabel>Pages </InputLabel>
                                                  <Select
                                                      

                                                      >                                                        
                                                      <MenuItem value={1}>10</MenuItem>                                                        
                                                      <MenuItem value={3} >20</MenuItem>                                                           
                                                      <MenuItem value={5}>30</MenuItem>
                                                      <MenuItem value={6}>40</MenuItem>
                                                      <MenuItem value={7}>50</MenuItem>
                                                      {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                      
                                                      </Select>
                                               </FormControl>
                                      
                                          </div>
                                      </div>
                         
                                </div>
                                <div className="card-body">

                                </div>
                            </div>
                        </div>
                    </div>
                                 
                                
                                </TabPanel>}
                               
                                {
                            <TabPanel value={this.state.activeTab} index={5}>                          
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="card b">
                                                {/* <div className="card-header">

                                                </div> */}
                                <div className="card-body">
                                    <div className="row" >
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                    <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>  Sales</InputLabel>
                                                    <Select
                                                        
                                                    
                                                        >
                                                            <MenuItem value={0} >All</MenuItem>
                                                        <MenuItem value={10}>Enquiries</MenuItem>
                                                        <MenuItem value={20}>Order</MenuItem>
                                                        {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    {/* <div className="col-md-1"  style={{marginTop: 20}}  >
                                                
                                                    </div> */}
                                                     <div className="col-md-2" style={{marginTop: "-15px"}}>
                                                    <fieldset>
                                            <FormControl>
                                                <AutoSuggest url="companies"
                                                    name="companyName"
                                                    displayColumns="name"
                                                    label="Company"
                                                    onRef={ref => {
                                                        (this.companyASRef = ref)
                                                        if (ref) {
                                                            this.companyASRef.load();
                                                        }
                                                    }}
                                                    placeholder="Search Company by name"
                                                    arrayName="companies"
                                                    helperText={errors?.companyName_auto_suggest?.length > 0 ? errors?.companyName_auto_suggest[0]?.msg : ""}
                                                    error={errors?.companyName_auto_suggest?.length > 0}
                                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                    projection="company_auto_suggest"
                                                    value={this.state.formWizard.obj.selectedCompany}
                                                    onSelect={e => this.setAutoSuggest('company', e?.id)}
                                                    queryString="&name" >
                                                </AutoSuggest>
                                            </FormControl>
                                        </fieldset>
                                                    
                                                    </div>
                                    
                                            <div className="col-md-2" style={{marginTop: "-15px"}}>
                                            <fieldset>
                                                <FormControl>
                                                    <AutoSuggest url="users"
                                                        name="usersName"
                                                        displayColumns="name"
                                                        label="Assign"
                                                        onRef={ref => {
                                                            (this.userASRef = ref)
                                                            if (ref) {
                                                                this.userASRef.load();
                                                            }
                                                        }}
                                                        placeholder="Search User by name"
                                                        arrayName="users"
                                                        helperText={errors?.usersName_auto_suggest?.length > 0 ? errors?.usersName_auto_suggest[0]?.msg : ""}
                                                        error={errors?.usersName_auto_suggest?.length > 0}
                                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                                        projection="user_details_mini"
                                                        value={this.state.assignUser}
                                                        onSelect={e => this.setAutoSuggestAssignUser('user', e)}
                                                        queryString="&name" >
                                                    </AutoSuggest>
                                                </FormControl>
                                            </fieldset>                     
                                        </div>
                                        <div className="col-md-2">
                                                    <FormControl    >
                                                        <InputLabel>Status</InputLabel>
                                                    <Select
                                                        

                                                        >
                                                                <MenuItem value={1} >All</MenuItem>
                                                            <MenuItem value={11} >Pending</MenuItem>
                                                        <MenuItem value={10}>Ongoing</MenuItem>
                                                        <MenuItem value={20}>hold</MenuItem>
                                                        <MenuItem value={30}>completed</MenuItem>
                                                        
                                                        </Select>
                                                        </FormControl>
                                                    
                                                    </div>
                                                    <div className="col-md-4">
                                                        <FormControl   >
                                                            <InputLabel> Period</InputLabel>
                                                        <Select
                                                            
                                                            onChange={e => this.setField("timePeriod", e)}
                                                            >
                                                                <MenuItem value="all" >All Time</MenuItem>
                                                                <MenuItem value="thismonth">This Month</MenuItem>
                                                                <MenuItem value="lastmonth">Last Month</MenuItem>
                                                                <MenuItem value="thisyear" >This Year</MenuItem>
                                                                <MenuItem value="lastyear">Last Year</MenuItem>
                                                                <MenuItem value="last3month">last 3 Month</MenuItem>
                                                                <MenuItem value="last6month">last 6 Month</MenuItem>
                                                                <MenuItem value="period">period</MenuItem>                                                
                                                            </Select>
                                                            </FormControl>

                                                        {this.state.formWizard.obj.timePeriod === "period"?  
                                                <div className="col-md-12" >
                                                    <table>                                         
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                <fieldset >
                                                        <MuiPickersUtilsProvider utils={MomentUtils} >
                                                                <DatePicker 
                                                                autoOk
                                                                clearable
                                                                disableFuture
                                                                label="From Date"
                                                                format="DD/MM/YYYY"
                                                                value={this.state.formWizard.obj.receivedDate} 
                                                                onChange={e => this.setDateField('receivedDate', e)} 
                                                                TextFieldComponent={(props) => (
                                                                    <TextField
                                                                    type="text"
                                                                    name="receivedDate"
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
                                                    </fieldset>
                                                                </td>
                                                                <td>
                                                                <fieldset>
                                                        <MuiPickersUtilsProvider utils={MomentUtils}>
                                                            <DatePicker 
                                                        
                                                            autoOk
                                                            clearable
                                                            disableFuture
                                                            label="To Date"
                                                            format="DD/MM/YYYY"
                                                            value={this.state.formWizard.obj.emailDate} 
                                                            onChange={e => this.setDateField('emailDate', e)} 
                                                            TextFieldComponent={(props) => (
                                                                <TextField
                                                            
                                                                type="text"
                                                                name="emailDate"
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
                                                </fieldset>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                
                                                </div>
                                                :""} 
                                                    </div>
                                                
                                            
                                   
                                    
     
                                    </div>
                                   
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div classname="card b">
                                <div className="card-header">
                                            <div className="row">
                                                <div className="col-sm-1" style={{marginTop: "-5px"}}>
                                                    <FormControl    >
                                                        {/* <InputLabel> Period</InputLabel> */}
                                                        <Select
                                                            

                                                            >                                                        
                                                            <MenuItem value={1}>10</MenuItem>                                                        
                                                            <MenuItem value={3} >20</MenuItem>                                                           
                                                            <MenuItem value={5}>30</MenuItem>
                                                            <MenuItem value={6}>40</MenuItem>
                                                            <MenuItem value={7}>50</MenuItem>
                                                            {/* <MenuItem value={30}>Rejected</MenuItem> */}
                                                            
                                                            </Select>
                                                     </FormControl>
                                            
                                                </div>
                                               
                                                    <div className="col-sm-2">
                                                    {/* <h1 style={{ textAlign: 'center' }}>
                                                        Buy Movies{' '}
                                                        <span role="img" aria-label="Movie projector">
                                                        
                                                        </span>
                                                    </h1> */}
                                                    
                                                    <Dropdown title="" items={items} multiSelect />
                                                     {/* <ButtonGroup size="small" aria-label="small outlined button group" >
                                                       <Button></Button>
                                                        <Button><img src="img/refresh.png"/></Button>
                                                      
                                                    </ButtonGroup>   */}                                                    
                                                     </div>
                                                                                                
                                            
                                                <div className="col-sm-1" style={{right: 102}}>
                                                     <ButtonGroup size="medium" aria-label="small outlined button group" >                                   
                                                        <Button><img src="img/refresh.png"/></Button>                                                     
                                                    </ButtonGroup> 
                                                    </div>     
                                            </div>
                                </div>
                                <div className="card-body">

                                </div>
                            </div>
                        </div>
                    </div>
                                 
                                
                                </TabPanel>}
                                
        </ContentWrapper>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(Reports);