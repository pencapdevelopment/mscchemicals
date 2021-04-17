import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

class Sorter extends Component {
    state = { 
        cols: [] 
    }

    componentDidMount() {
        var cols = this.props.columns;

        cols.forEach(g => {
            if (g.sortable) {
                g.className = 'sorter';
                g.status = 0;
                g.sortable = true;
            } else {
                g.className = '';
                g.status = -1;
                g.sortable = false;
            }
        })

        this.setState({ cols });
    }

    handleClick = (e, col, i) => {
        e.preventDefault();

        if (!col.sortable) {
            return;
        }
        var cols = this.state.cols;
        cols[i].status = cols[i].status + 1;
        if (cols[i].status === 3) {
            cols[i].status = 0;
        }

        if (cols[i].status === 0) {
            cols[i].className = 'sorter';
        }
        if (cols[i].status === 1) {
            cols[i].className = 'sorter desc';
        }
        if (cols[i].status === 2) {
            cols[i].className = 'sorter asc';
        }

        cols.forEach((g, idx) => {
            if (idx !== i && g.sortable) {
                g.className = 'sorter';
                g.status = 0;
            }
        })
        this.setState({ cols });
        this.props.onSort(e, col);
    }

    render() {
        const CSS1 = '.sorter{font-size:14px;font-weight:bold;position:relative;cursor:pointer}.sorter::after,.sorter::before{position:absolute;bottom:.9em;display:block;opacity:.3}.sorter::before{right:1em;content:"\\2191"}.sorter::after{right:.5em;content:"\\2193"}.sorter.asc::before{opacity:1}.sorter.desc::after{opacity:1}';
        // const CSS2 = '.sorter{font-size:14px;font-weight:bold;position:relative;cursor:pointer}.sorter::after{font-family:Fontawesome;position:relative;left:10px;font-size:10px;font-weight:bold;content:"\\2191\\2193";opacity:.3}.sorter.asc::after{content:"\\2191";opacity:1}.sorter.desc::after{content:"\\2193";opacity:1}';

        return (
            <tr>
                <style>{CSS1}</style>
                {/* <style>{CSS2}</style> */}
                {this.state.cols.map((col, i) => {
                    return (
                        <th key={i} onClick={e => this.handleClick(e, col, i)} className={col.className}>{col.name}</th>
                    )
                })}
            </tr>
        )
    }
}

Sorter.propType = {
    /** options object */
    columns: PropTypes.array.isRequired,
    /** callback function for response */
    onSort: PropTypes.func
}

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(Sorter);