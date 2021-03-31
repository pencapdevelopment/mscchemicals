import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { context_path, server_url } from './constants';
import nextId from "react-id-generator";


class AutoSuggest extends Component {
  state = {
    searchParam: '',
    searchedValues: [],
    loading: false
  }

  search = e => {
    this.setState({ searchParam: e.target.value }, this.load);
  }

  load() {
    // if (!(this.state.searchParam && this.state.searchParam.length > 0)) {
    //   this.setState({ searchedValues: [] });
    //   return;
    // }
    this.setState({ loading: true });

    var url = server_url + context_path + "api/" + this.props.url + "?";
    url += "&projection=" + this.props.projection
    url += this.props.queryString + "=" + encodeURIComponent('%' + this.state.searchParam + '%');

    axios.get(url)
      .then(res => {
        this.setState({
          searchedValues: res.data._embedded[this.props.arrayName],
          page: res.data.page
        });
      }).finally(res => {
        this.setState({ loading: false });
      })
  }

  select(e, obj, reason) {
    e.stopPropagation();
    // e.nativeEvent.stopImmediatePropagation();
    // debugger;
    if(this.state.searchedValues.length===0){
      this.setState({ searchParam: obj.name });
    }
    if (obj) {
      this.props.onSelect(obj);
      this.setState({ searchParam: obj.name });
    } else {
      this.props.onSelect({});
      this.setState({ searchParam: '' });
    }
  }


  componentWillUnmount() {
    if (this.props.onRef) {
      // this.props.onRef(undefined);
    }
  }

  setInitialField(obj) {
    if (obj) {
      var searchedValues = [];
      searchedValues.push(obj);
      this.setState({ searchParam: obj.name, selectedObj: obj, searchedValues: searchedValues })
    }
    this.load();
  }

  componentDidMount() {

    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  render() {
    const classes = makeStyles({
      option: {
        fontSize: 15,
        '& > span': {
          marginRight: 10,
          fontSize: 18,
        },
      },
    });


    return (
      <Autocomplete
        id={nextId("auto-complete-id-")}
        loading={this.state.loading}
        disableClearable={false}
        options={this.state.searchedValues}
        classes={{
          option: classes.option,
        }}
        inputValue={this.state.searchParam}
        onChange={(a, b, c) => this.select(a, b, c)}
        value={this.state.selectedObj}
        autoHighlight
        multiple={this.props.multiple}
        noOptionsText="No suggestions"
        getOptionLabel={(option) => option.name}
        renderOption={(option) => (
          <React.Fragment>
            {option[this.props.displayColumns]}
          </React.Fragment>
        )}

        renderInput={(params) => (
          <TextField
            {...params}
            name={this.props.name+"_auto_suggest"}
            placeholder={this.props.placeholder}
            label={this.props.label}
            onChange={e => this.search(e)}
            value={this.state.searchParam}
            error={this.props.error}
            helperText={this.props.helperText}
            inputProps={{
              ...params.inputProps, ...this.props.inputProps,
              // autoComplete: 'new-password',
              // autoComplete: 'on', // disable autocomplete and autofill
              readOnly:this.props.readOnly
            }}
          />
        )}
      />
    )
  }
}

AutoSuggest.propTypes = {
  url: PropTypes.string.isRequired,
  displayColumns: PropTypes.string.isRequired,
  arrayName: PropTypes.string.isRequired,
  onSelect: PropTypes.any.isRequired,
  queryString: PropTypes.string.isRequired,
  placeholder: PropTypes.string
};

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
  mapStateToProps
)(AutoSuggest);