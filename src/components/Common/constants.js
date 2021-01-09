// GLOBAL CONSTANTS
// -----------------------------------
import moment from 'moment';

var randomstring = require("randomstring");

export const APP_COLORS = {
    'primary': '#5d9cec',
    'success': '#27c24c',
    'info': '#23b7e5',
    'warning': '#ff902b',
    'danger': '#f05050',
    'inverse': '#131e26',
    'green': '#37bc9b',
    'pink': '#f532e5',
    'purple': '#7266ba',
    'dark': '#3a3f51',
    'yellow': '#fad732',
    'gray-darker': '#232735',
    'gray-dark': '#3a3f51',
    'gray': '#dde6e9',
    'gray-light': '#e4eaec',
    'gray-lighter': '#edf1f2'
};

export const APP_MEDIAQUERY = {
    'desktopLG': 1200,
    'desktop': 992,
    'tablet': 768,
    'mobile': 480
};


// export const server_url = 'http://192.168.1.13:8080/';
export const server_url = '/';
// export const server_url = 'https://mscservicesapi.herokuapp.com/';
export const context_path = 'msc-api/'

export function getSqlDate(date) {
    return moment(date, "DD/MM/YYYY").format('YYYY/MM/DD');
}
export function getTodayDate() {
    return moment().format();  
}

export function updateSqlDates(obj, fields) {
    if(fields && fields.length) {
        fields.array.forEach(ele => {
            obj[ele] = getSqlDate(obj[ele]);
        });
    }
}

export function defaultDateFilter(state, url) {
    if (state.filters.fromDate && state.filters.fromDate.length > 0) {
        url += "&creationDate=" + encodeURIComponent(moment(state.filters.fromDate).startOf('day').utc().format('YYYY/MM/DD HH:mm:ss'));
    } else if (state.filters.toDate && state.filters.toDate.length > 0) {
        url += "&creationDate=" + encodeURIComponent(moment().subtract(1, 'years').startOf('day').utc().format('YYYY/MM/DD HH:mm:ss'));
    }

    if (state.filters.toDate && state.filters.toDate.length > 0) {
        url += "&creationDate=" + encodeURIComponent(moment(state.filters.toDate).endOf('day').utc().format('YYYY/MM/DD HH:mm:ss'));
    } else {
        // url += "&creationDate=" + encodeURIComponent(moment().endOf('day').utc().format('YYYY/MM/DD HH:mm:ss'));
    }

    return url;
}

export function getDateToAndFrom(mmt, param) {
    var mmt1 = mmt.clone();
    return param + "=" + encodeURIComponent(mmt.subtract(2, 'months').startOf('month').utc().format('YYYY/MM/DD HH:mm:ss')) + "&" + param + "=" + encodeURIComponent(mmt1.add(2, 'months').endOf('month').utc().format('YYYY/MM/DD HH:mm:ss'));
}

export function getUniqueCode(prefix) {
    return prefix + '-' + randomstring.generate({
        length: 8,
        charset: 'numeric' //alphanumeric, alphabetic, numeric
    });
}

export function getStatusBadge(status, list) {
    var obj = list.find(g => g.label === status);
    return 'badge badge-' + (obj ? obj.badge : 'default');
}

 export const MG_AC='MG_AC'
 export const MG_CM='MG_CM'
 export const MG_OR_E='MG_OR_E'
 export const MG_OR_V='MG_OR_V'
 export const MG_PD='MG_PD'
 export const MG_PR_E='MG_PR_E'
 export const MG_PR_V='MG_PR_V'
 export const MG_SE_E='MG_SE_E'
 export const MG_SE_V='MG_SE_V'
 export const MG_TR='MG_TR'