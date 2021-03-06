import axios from 'axios';
import swal from 'sweetalert';
import { server_url, context_path, getUniqueCode } from '../../Common/constants';
import { saveProducts } from '../Common/AddProducts';
export function createOrder(type, obj, baseUrl) {
    var newObj = {...obj};
    newObj.code = getUniqueCode('OR');
    newObj.type = type;
    newObj.enquiryId = obj.id;
    newObj.id = undefined;
    newObj.status = 'On going';
    newObj.company = '/companies/' + newObj.company.id;
    newObj.terms = '';
    newObj.billingAddress = '';
    var products = newObj.products;
    newObj.products = null;
    var orderUsers  = [...newObj.users];
    newObj.users=null;
    var promise = axios.post(server_url + context_path + "api/orders", newObj);
    promise.then(res => {
        products.forEach((prod, idx) => {
            prod.id = null;
            prod.product = prod.product.id;
        });
        for(let i of orderUsers){
            let uId=i.user.id;
            axios.post(server_url + context_path + "api/orders-user/", {"reference": '/orders/' + res.data.id,"user" : '/users/'+ uId, "active": true}).then(res => {
                //this.setState({obj2: res.data, modalnegatation:false, loading: false, loadData:true }, ()=>console.log("After Setting Data==>>", this.state.obj2));
            })
            .catch(err=> console.log("saleApprovalData Error==>", err));
        }
        saveProducts('orders', res.data.id, products, function() {
            axios.patch(server_url + context_path + "api/" + baseUrl + "/" + newObj.enquiryId, {order: res.data.id})
            .then(res1 => {
                window.location.href = 'orders/' + res.data.id;                
            }).catch(err => {
                swal("Unable to update order!", err.response.data.globalErrors[0], "error");
            })
        });            
    }).finally(() => {
    }).catch(err => {
        swal("Unable to Convert to Order!", "Please resolve the errors", "error");
    })
}