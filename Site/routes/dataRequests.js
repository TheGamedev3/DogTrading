


const {pagnation} = require('@MongooseAPI');
const {Owner, Dog, Offer} = require('@Chemicals');

module.exports = function createRoutes(route){
    async function pagnate(table, perPage, queries) {
        return await pagnation({
            table: table,
            sortStyle: queries.sortStyle || 'newest',
            perPage: perPage,
            pageX: parseInt(queries.page) || 1
        });
    }
    route('GET /allUsersInfo', async({queries, json})=>{
        return json(200, await pagnate(Owner, 3, queries))
    });
    route('GET /allDogsInfo', async({queries, json})=>{
        return json(200, await pagnate(Dog, 6, queries))
    });
    route('GET /allOffersInfo', async({queries, json})=>{
        return json(200, await pagnate(Offer, 6, queries))
    });
};
