// https://github.com/chriso/validator.js
import validator from 'validator';
/**
 * Helper methods to validate form inputs
 * using controlled components
 */
const FormValidator = {
    /**
     * Validate input element
     * @m.param element Dome element of the input
     * Uses the following attributes
     *     data-validate: array in json format with validation methods
     *     data-m.param: used to provide arguments for certain methods.
     */
    validate(element) {
        const isCheckbox = element.type === 'checkbox';
        const value = isCheckbox ? element.checked : element.value;
        const name = element.name;
        if (!name) throw new Error('Input name must not be empty.');
        // use getAttribute to support IE10+
         const validations = JSON.parse(element.getAttribute('data-validate'));
        let result = [];
        if(element.type === 'file' && element.required && element.files.length < 1){
            result.push({key:'required',msg:'Please select a file'});
        }
        if(validations && validations.length) {
            /*  Result of each validation must be true if the input is invalid
                and false if valid. */
            validations.forEach(m => {
                switch (m.key) {
                    case 'required':
                        if(isCheckbox ? value === false : validator.isEmpty(value)){
                            result.push({key:m.key,msg:m.msg?m.msg:'this field is required'});
                        }
                        break;
                    case 'phone':
                        var isValid3 =  !validator.isNumeric(value);
                        if(isValid3){
                            result.push({key:m.key,msg:'please enter valid mobile number'});
                        }
                        break;
                    case 'email':
                        if(!validator.isEmail(value)){
                            result.push({key:m.key,msg:'Please enter valid email'});
                        }
                        break;
                    case 'file':
                        if(element.files.length<1){
                            result.push({key:m.key,msg:m.msg?m.msg:'please select a file'});
                        }
                        console.log("file error is",element.files);
                        break;
                    case 'gstin':
                        if(isCheckbox ? value === false : validator.isEmpty(value)){
                            result.push({key:m.key,msg:'please enter valid gstin number'});
                        }
                        break;
                    case 'pan':
                        if(isCheckbox ? value === false : validator.isEmpty(value)){
                            result.push({key:m.key,msg:'please enter valid pan number'});
                        }
                        break;
                    case 'number':
                        var isValid3 =  !validator.isNumeric(value);
                        if(isValid3){
                            result.push({key:m.key,msg:'Field should be number'});
                        }
                        break;
                    case 'integer':
                        var isValid4 = !validator.isInt(value);
                        if(isValid4){
                            result.push({key:m.key,msg:'Field should be integer'});
                        }
                        break;
                    case 'alphanum':
                        var isValid5 = !validator.isAlphanumeric(value);
                        if(isValid5){
                            result.push({key:m.key,msg:'Field should be alpha numeric'});
                        }
                        break;
                    case 'url':
                        var isValid6 = !validator.isURL(value);
                        if(isValid6){
                            result.push({key:m.key,msg:'Field should be url'});
                        }
                        break;
                    case 'equalto':
                        // here we expect a valid ID as m.param
                        const value2 = document.getElementById(m.param).value;
                        var isValid7 = !validator.equals(value, value2);
                        if(isValid7){
                            result.push({key:m.key,msg:'Field should be match'});
                        }
                        break;
                    case 'minlen':
                        var isValid8 = !validator.isEmpty(value) && !validator.isLength(value, { min: Number(m.param) });
                        if(isValid8){
                            result.push({key:m.key,msg:'Field should have minimum length: '+m.param});
                        }
                        break;
                    case 'maxlen':
                        var isValid9 = !validator.isEmpty(value) && !validator.isLength(value, { max: Number(m.param) });
                        if(isValid9){
                            result.push({key:m.key,msg:'Field should have maximum length: '+m.param});
                        }
                        break;
                    case 'len':
                        const [min, max] = JSON.parse(m.param)
                        var isValid11 = !validator.isEmpty(value) &&  !validator.isLength(value, { min, max });
                        if(isValid11){
                            result.push({key:m.key,msg:'Field should have min length '+min+' maximum length: '+max})}
                        break;
                    case 'min':
                        var isValid12 = !validator.isInt(value, { min: validator.toInt(m.param) });
                        if(isValid12){
                        result.push({key:m.key,msg:'Field should have minimum characters'});
                        }
                        break;
                    case 'max':
                        var isValid13 = !validator.isInt(value, { max: validator.toInt(m.param) });
                        if(isValid13){
                            result.push({key:m.key,msg:'Field should not exceed maximum characters'});  
                    }
                        break;
                    case 'list':
                        const list = JSON.parse(m.param)
                        var isValid14 = !validator.isIn(value, list);
                        if(isValid14){
                            result.push({status:isValid14,message: isValid14?'Invalid value':''});  
                        }
                        break;
                    default:
                        throw new Error('Unrecognized validator.');
                }
            })
        }
        return result;
    },

    /**
     * Bulk validation of input elements.
     * Used with form elements collection.
     * @m.param  {Array} inputs Array for DOM element
     * @return {Object}       Contains array of error and a flag to
     *                        indicate if there was a validation error
     */
    bulkValidate(inputs) {
        let errors = {},
            hasError = false;
        inputs.forEach(input => {
            let result = this.validate(input)
            if (!hasError){
                hasError=result.length>0;
            } 
            errors = { ...errors, [input.name]: result }
        })
        return {
            errors,
            hasError
        }
    }
}
export default FormValidator;