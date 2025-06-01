


async function pagnation({
    table, perPage=9, pageX=1,
    sortStyle='newest',

    jsObjects=true
}){

    const skip = (pageX - 1) * perPage;

    let query = table.find().complexSort(sortStyle).skip(skip).limit(perPage);
    if (jsObjects) query = query.lean();  // apply .lean() before awaiting

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
