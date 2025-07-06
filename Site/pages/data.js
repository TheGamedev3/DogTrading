



module.exports = function createRoutes({PagerPage}){

    // route the user's page to their user Id
    const{Owner, Dog, Offer} = require('@Chemicals');

    PagerPage('allUsers', 'All Users', Owner, 3);

    PagerPage('allDogs', 'All Dogs', Dog, 6);

    PagerPage('allOffers', 'All Offers', Offer, 6,
        {status:'available'},
        [
            {
            $lookup: {
                from: 'dogs',
                localField: 'dog',
                foreignField: '_id',
                as: 'dog'
            }
            },
            { $unwind: '$dog' },
            { $addFields: { name: '$dog.name' } } // makes the dog's name, the offer's "name"
        ]
    );


};
