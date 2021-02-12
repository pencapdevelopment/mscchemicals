import axios from 'axios';
import swal from 'sweetalert';
import { context_path, server_url } from '../../Common/constants';

export function saveProducts(baseUrl, objId, products, callBack) {
    var productsUrl = server_url + context_path + "api/" + baseUrl + '-products/';
   
    products.forEach((prod, idx) => {
        console.log(prod);
        if(prod.delete) {
            axios.delete(productsUrl + prod.id)
                .then(res => {

                }).catch(err => {
                    swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
                })
        } else if(!prod.id || prod.updated) {
            prod.reference = '/' + baseUrl + '/' + objId;
            prod.product = '/products/' + prod.product;
             
            var promise = undefined;
            if (!prod.id) {
                promise = axios.post(productsUrl, prod);
            } else {
                promise = axios.patch(productsUrl + prod.id, prod);
            }

            promise.then(res => {
                prod.id = res.data.id;
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