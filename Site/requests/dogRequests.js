


const {Dog} = require('@Chemicals');

module.exports = function createRoutes({route}){
    route('GET /dog/:dogId', async({json, params})=>{
        return await json(200, async()=>await Dog.pageData(params.dogId));
    });
    route('POST /registerDog', async({inputs, json, userId})=>{
        return await json(200, async()=>await Dog.registerDog(inputs.name, userId, inputs.profile));
    });
    route('PATCH /editDog/:dogId', async({json, params, inputs})=>{
        // use an error catcher thing here later
        return await json(200, async()=>await Dog.modify(params.dogId, inputs));
    });

    route('DELETE /unregisterDog/:dogId', async({userId, json, params})=>{
        // use an error catcher thing here later
        const dogId = params.dogId;
        if(!(await Dog.selfOwnsDog(userId, dogId))){return await json(500, new Error('you dont own this dog!'))}
        return await json(200, async()=>await Dog.delete(dogId));
    });
};
