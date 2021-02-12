import axios from 'axios';
import swal from 'sweetalert';
import { context_path, server_url } from '../../Common/constants';

export function saveUsers(baseUrl, objId, users, callBack) {
    var usersUrl = server_url + context_path + "api/" + baseUrl + '-user/';
   
    users.forEach((user, idx) => {
        if(user.delete) {
            axios.delete(usersUrl + user.id)
                .then(res => {

                }).catch(err => {
                    swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                })
        } else if(user.id || user.updated) {
            user.reference = '/' + baseUrl + '/' + objId;
            user.user = '/users/' + user.id;
             
            var promise = undefined;
            if (user.id) {
                promise = axios.post(usersUrl, user);
            } else {
                promise = axios.patch(usersUrl + user.id, user);
            }

            promise.then(res => {
                user.id = res.data.id;
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