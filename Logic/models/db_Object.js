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

    // custom sorter function
    schema.query.complexSort = function (sortStyle) {
        let sortOption = {};
        switch (sortStyle) {
            case 'name_asc':  sortOption = { name:  1 }; break;
            case 'name_desc': sortOption = { name: -1 }; break;
            case 'newest':    sortOption = { created: -1 }; break;
            case 'oldest':    sortOption = { created:  1 }; break;
            default:          sortOption = { created: -1 }; break;
        }
        return this.sort(sortOption);
    };

    Object.assign(schema.statics, methods);

    return mongoose.model(name, schema);
}

module.exports = {db_object};