

async function err_catcher(func, ...fieldErrors){
  try{
    return [true, await func()];
  }catch(err){
    const errors = { err:true };

    /* ───── rename low-level messages -> friendlier text ───── */
    for(const { oldName, rename } of fieldErrors){
      if(oldName && rename && err.message.toLowerCase().includes(oldName.toLowerCase())){
        err.message = rename;
      }
    }

    /* ───── mongoose / custom field errors ───── */
    if(err.name === 'FieldError'){
      errors[err.field] = err.message;
    }
    for(const { code, field, reason } of fieldErrors){
      if(code && err.code !== code) continue;
      if(field && err.keyValue && Object.keys(err.keyValue)[0] !== field) continue;
      errors[field] = reason;
    }
    if(err.message.includes('user validation failed')){
      Object.values(err.errors).forEach(({ properties })=>{
        errors[properties.path] = properties.message;
      });
    }

    /* ───── summary message logic ───── */
    const detailKeys = Object.keys(errors).filter(k => k !== 'err');
    if(detailKeys.length === 0){                    // no field details ► plain message
      errors.message = err.message;
    }else if(detailKeys.length === 1){              // exactly one detail ► reuse it
      errors.message = errors[ detailKeys[0] ];
    }else{                                          // many details ► join with commas
      errors.message = detailKeys.map(k=>errors[k]).join(', ');
    }

    return [false, errors];
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