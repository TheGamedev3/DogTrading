


const {Dog, Offer} = require('@Chemicals');

module.exports = function createRoutes({route}){
    
    route('POST /makeOffer/:dogId', async({userId, json, params})=>{
        // use an error catcher thing here later
        const dogId = params.dogId;
        if(!Dog.selfOwnsDog(userId, dogId)){return await json(500, new Error('you dont own this dog!'))}
        
        return await json(200, async()=>await Offer.makeOffer(userId, dogId));
    });
    route('DELETE /deleteOffer/:offerId', async({userId, json, params})=>{
        // use an error catcher thing here later

        return await json(200, async()=>await Offer.deleteOffer(userId, params.offerId));
    });
    route('POST /buyOffer/:offerId', async({userId, json, params})=>{
        // use an error catcher thing here later

        return await json(200, async()=>await Offer.buyOffer(userId, params.offerId));
    });

};

