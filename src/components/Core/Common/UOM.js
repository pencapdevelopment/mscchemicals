// import MomentUtils from '@date-io/moment';
 
// import Event from '@material-ui/icons/Event';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider
// } from '@material-ui/pickers';
// import axios from 'axios';
// import moment from 'moment';
import React, { Component } from 'react';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
// import {
//     Form, Modal,

//     ModalBody, ModalHeader, Table
// } from 'reactstrap';
// import swal from 'sweetalert';
// import { context_path, server_url } from '../../Common/constants';
// import Sorter from '../../Common/Sorter';
// import ContentWrapper from '../../Layout/ContentWrapper';
import {    Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
// import {   TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';






// const json2csv = require('json2csv').parse;


class UOM extends Component {
    state={
        vals:[{label:'Kgs',value:'Kgs'},
        {label:'Liters',value:'Liters'},
        {label:'Packs',value:'Packs'}],
        selected:{}
    }
    setSelectField(  e) {
        console.log(e.target.value);
        this.setState({selected:e.target.value})
        this.props.onChange(e);
    }

    updateVal(val){
        this.setState({selected:val})
    }

     
    componentDidMount() {
        if (this.props.onRef) {
            this.props.onRef(this);
          }
        console.log(this.props.value);
        this.setState({ selected: this.props.value })
    }
    render(){
        return(                                
        <FormControl>
            <InputLabel  id="uomLabel">UOM</InputLabel>
            <Select
                name="uom" 
                labelId="uomLabel"
                id="demo-mutiple-checkbox"
                value={this.state.selected}
                onChange={e => this.setSelectField( e)}
                required={true} 
                readOnly = {this.props.isReadOnly}
            >

                {this.state.vals.map((e, keyIndex) => {
                    return (
                        <MenuItem key={keyIndex} value={e.value}> {e.label} 
                        </MenuItem>
                    )
                })}
            </Select>
            </FormControl>)
    }


}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(UOM);