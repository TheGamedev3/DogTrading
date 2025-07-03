


const {Offer} = require('@Chemicals');

module.exports = function createRoutes({route}){
    
    route('POST /makeOffer/:dogId', async({userId, json, params})=>{
        return await json(200, async()=>await Offer.makeOffer(userId, params.dogId));
    });
    route('DELETE /deleteOffer/:offerId', async({userId, json, params})=>{
        return await json(200, async()=>await Offer.deleteOffer(userId, params.offerId));
    });
    route('POST /buyOffer/:offerId', async({userId, json, params, req})=>{
        return await json(200, async()=>{
            const offer = await Offer.buyOffer(userId, params.offerId);
            req.session.message = {
                text: `🐾 Thanks for adopting me!`,
                bg: 'blue',
                color: 'white'
            };
            return offer;
        });
    });

};

