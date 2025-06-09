


const {Dog} = require('@Chemicals');

module.exports = function createRoutes({route}){
    route('GET /dog/:dogId', async({json, params})=>{
        return json(200, await Dog.pageData(params.dogId));
    });
    route('POST /registerDog', async({inputs, req, json, userId})=>{
        // replace this with an err catcher forum thingy

        const result = await Dog.registerDog(inputs.name, userId, inputs.profile);
        if(result && result.err !== true){
            const dog = result;
            return json(200, dog);
        }else{
            return json(500, result);
        }
    });
    route('PATCH /editDog/:dogId', async({json, params, inputs})=>{
        // use an error catcher thing here later
        return json(200, await Dog.modify(params.dogId, inputs));
    });
    route('PATCH /testPatch', async ({ json, inputs }) => {
        console.log('✅ PATCH /testPatch hit');
        console.log('BODY:', inputs);
        return json(200, { received: inputs });
    });


    route('DELETE /unregisterDog/:dogId', async({userId, json, params})=>{
        // use an error catcher thing here later
        const dogId = params.dogId;
        if(!Dog.selfOwnsDog(userId, dogId)){return json(500, new Error('you dont own this dog!'))}
        return json(200, await Dog.delete(dogId));
    });
};
