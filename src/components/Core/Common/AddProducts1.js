import axios from 'axios';
import swal from 'sweetalert';
import { context_path, server_url } from '../../Common/constants';

export function saveProducts(baseUrl, objId, products, callBack) {
    var productsUrl = server_url + context_path + "api/" + baseUrl + '-products/';

    products.forEach((prod, idx) => {
        var p = {...prod};
        if(p.delete) {
            axios.delete(productsUrl + p.id)
                .then(res => {

                }).catch(err => {
                    swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                })
        } else if(!p.id || p.updated) {
            p.reference = '/' + baseUrl + '/' + objId;
            p.product = '/products/' + p.product.id;
             
            var promise = undefined;
            if (!p.id) {
                promise = axios.post(productsUrl, p);
            } else {
                promise = axios.patch(productsUrl + p.id, p);
            }

            promise.then(res => {
                p.id = res.data.id;
            }).catch(err => {
                swal("Unable to Save!", "Please resolve the errors", "error");
            })
        }

        // if(idx === products.length - 1) {
        //     setTimeout(() => {
        //         if(callBack) {
        //             callBack();
        //         }
        //     }, 5000);
        // }
    })
}