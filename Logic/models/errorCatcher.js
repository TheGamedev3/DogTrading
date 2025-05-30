

async function err_catcher(func, ...fieldErrors){
    try{
        return await func();
    }catch(err){
        const errors = {err:true};
        if(err.name === "FieldError"){
            errors[err.field] = err.message;
        }
        for(const{code, field, reason} of fieldErrors){
            if(err.code !== code)continue;
            if(Object.keys(err.keyValue)[0] !== field)continue;
            errors[field] = reason;
        }
        if (err.message.includes('user validation failed')) {
            Object.values(err.errors).forEach(({ properties }) => {
                errors[properties.path] = properties.message;
            });
        }
        if(Object.keys(errors).length===1){
            errors.server = err.message;
        }
        return errors;
    }
}

class FieldError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "FieldError";
    this.field = field;
    this.message = message;
  }
}

module.exports = {FieldError, err_catcher};