import axios from 'axios';
import swal from 'sweetalert';
import { context_path, server_url } from '../../Common/constants';

export function saveProducts(baseUrl, objId, products, callBack) {
    var productsUrl = server_url + context_path + "api/" + baseUrl + '-products/';
   
    products.map((prod, idx) => {
        console.log("product==>",prod);
        // if(prod.delete) {
        //     console.log('Testsss .......');
        //     axios.delete(productsUrl + prod.id)
        //         .then(res => {

        //         }).catch(err => {
        //             swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
        //         })
        // } else if(!prod.id || prod.updated) {
        //     console.log('Testsss1 123456');
            prod.reference = '/' + baseUrl + '/' + objId;
            prod.product = '/products/' + prod.product;
             
            var promise = undefined;
            if (prod.status==='Approved') {
                console.log('!prod.id 123456 approveed==>',prod.product);
                promise = axios.post(productsUrl, prod);
            }
            // } else {
            //     console.log('else !prod.id 123456');
            //     promise = axios.patch(productsUrl + prod.id, prod);
            // }

            // promise.then(res => {
            //     prod.id = res.data.id;
            // }).catch(err => {
            //     swal("Unable to Save!", "Please resolve the errors", "error");
            // })
      //  }

        
    })
    //if(idx === products.length - 1) {
        setTimeout(() => {
            if(callBack) {
                callBack();
            }
        }, 500);
    //}
}