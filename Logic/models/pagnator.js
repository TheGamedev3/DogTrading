


async function pagnation({
    table, perPage=9, pageX=1,
    sortStyle='newest',

    jsObjects=true
}){
    let sortOption = {};
    switch (sortStyle) {
        case 'name_asc':  sortOption = { name:  1 }; break;
        case 'name_desc': sortOption = { name: -1 }; break;
        case 'newest':    sortOption = { created: -1 }; break;
        case 'oldest':    sortOption = { created:  1 }; break;
        default:          sortOption = { created: -1 }; break;
    }

    const skip = (pageX - 1) * perPage;

    let query = table.find().sort(sortOption).skip(skip).limit(perPage);
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
