import axios from 'axios';
import swal from 'sweetalert';
import { context_path, server_url } from '../../Common/constants';

export function saveUsers(baseUrl, objId, users, callBack) {
    var usersUrl = server_url + context_path + "api/" + baseUrl + '-user/';
   
    users.forEach((userObj, idx) => {
        var u = {...userObj};
        if(u.delete) {
            axios.delete(usersUrl + u.id)
                .then(res => {

                }).catch(err => {
                    swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                })
        } else if(!u.id || u.updated) {
            u.reference = '/' + baseUrl + '/' + objId;
            u.user = '/users/' + u.user.id;
             
            var promise = undefined;
            if (!u.id) {
                promise = axios.post(usersUrl, u);
            } else {
                promise = axios.patch(usersUrl + u.id, u);
            }

            promise.then(res => {
                u.id = res.data.id;
            }).catch(err => {
                swal("Unable to Save!", "Please resolve the errors", "error");
            })
        }

        if(idx === users.length - 1) {
            setTimeout(() => {
                if(callBack) {
                    callBack();
                }
            }, 5000);
        }
    })
}