


async function pagnation({
    table, perPage=9, pageX=1,
    sortStyle='newest',
    criteria={},

    jsObjects=true
}){

    const skip = (pageX - 1) * perPage;

    let query = table.find(criteria).complexSort(sortStyle).skip(skip).limit(perPage);

    // Mongoose lean, converts a mongodb object into a regular JS object
    // (apply .lean() before awaiting the chain)
    if (jsObjects) query = query.lean();

    const results = await query;
    const total = await table.countDocuments();

    return{
        table, pageX, perPage,
        sortStyle,

        results,
        totalPages: Math.ceil(total / perPage),
        totalResults: total
    };
}

module.exports = {pagnation};
