




const {pagnation} = require('@MongooseAPI');
async function pagnate(table, perPage, queries, criteria={}, aggregateExtras) {
    return await pagnation({
        table: table,
        sortStyle: queries.sortStyle || 'newest',
        perPage: perPage,
        pageX: parseInt(queries.page) || 1,
        criteria, aggregateExtras,
        jsObjects: true,
    });
}
const{route} = require('./routes');
module.exports = function PagerPage(pageRoute, header, table, perPage, criteria={}, aggregateExtras=[]){
    const pager = async({
        user, userId,
        queries, page
    }) => {
        let pageData = await pagnate(table, perPage, queries, criteria, aggregateExtras);
        const profiles = await table.getIconData(pageData.results);
        return page(200, 'data/Pagnator', {
            pagnatorTitle: header,
            pageX: pageData.pageX,
            totalPages: pageData.totalPages,
            totalResults: pageData.totalResults,
            sortStyle: pageData.sortStyle,

            user, userId,
            profiles,
            justLoggedIn:false
        });
    }
    return route.either(`GET /${pageRoute}`, pager);
}
