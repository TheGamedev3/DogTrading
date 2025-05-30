const mongoose = require('mongoose');

function db_object(name, propTypes, methods, extraSettings={}){

    let extraSchema = {strict: 'throw'}
    if(extraSettings.allowExtraFields){delete extraSchema.strict}

    const schema = new mongoose.Schema(propTypes, extraSchema);

    const saveAs = methods.saveAs;
    if(saveAs){
        schema.pre('save', async function(next){
            await saveAs.apply(this,[]);
            next();
        });
        delete methods.saveAs;
    }

    Object.assign(schema.statics, methods);

    return mongoose.model(name, schema);
}

module.exports = {db_object};