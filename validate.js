function Validator (options) {

    let selectorRules = {};

    function getParent(element, selector) {
        if(!element.parentElement) return
        if(element.parentElement.matches(selector)){
            return element.parentElement;
        }

        return getParent(element.parentElement, selector)
    }

    function validate (inputElement, rule,errorElement) {
        let errorMessage;
        
        const rules = selectorRules[rule.selector]
        
        for(let i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value)
            if(errorMessage) break;
        }
        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formgroup).classList.add('invalid');
        }else{
            errorElement.innerText = '';
            getParent(inputElement, options.formgroup).classList.remove('invalid');
        }

        return !errorMessage
    }

    const formElement = document.querySelector(options.form)
    if(formElement){
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            let isFormValid = true;

            options.rules.forEach((rule) => {
                const inputElement = formElement.querySelector(rule.selector)
                const errorElement = getParent(inputElement, options.formgroup).querySelector(options.errorSelector)
                const isValid = validate(inputElement,rule,errorElement)
                if(!isValid) isFormValid = false
            })

            if(isFormValid) {
                if(typeof options.onSubmit === 'function'){
                    const InputList = formElement.querySelectorAll(options.input)

                    const formValues = Array.from(InputList).reduce((values, input) => {
                        values[input.name] = input.value
                        return values;
                    },{})
                    options.onSubmit(formValues)
                }
            }
            
        })

        
    }
    if(formElement) {
        options.rules.forEach((rule) => {
            const inputElement = formElement.querySelector(rule.selector)
            const errorElement = getParent(inputElement, options.formgroup).querySelector(options.errorSelector)
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            if(inputElement) {
                inputElement.addEventListener('blur', () => {
                    validate(inputElement, rule,errorElement)
                })

                inputElement.addEventListener('input', () => {
                    errorElement.innerText = '';
                    getParent(inputElement, options.formgroup).classList.remove('invalid');
                })
            }
        })
    }
}

Validator.isRequired = function (selector,message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}

Validator.isEmail = function (selector,message) {
    return {
        selector: selector,
        test: function (value) {
            const regrex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            
            return regrex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    }
}

Validator.minLength = function (selector,min,message) {
    return {
        selector: selector,
        test: function (value) {
            
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}

Validator.isConfirmed = function (selector,getConfirmValue,message) {
    return {
        selector: selector,
        test: function (value) {
            
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không phù hợp';
        }
    }
}