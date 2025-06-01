



module.exports = function createRoutes({PagerPage}){

    // route the user's page to their user Id
    const{Owner, Dog, Offer} = require('@Chemicals');

    PagerPage('allUsers', 'All Users', Owner, 3);

    // dont forget the cascader
    PagerPage('allDogs', 'All Dogs', Dog, 6);

    // make it so u can edit the dogs if you own them, or your own profile
    // make a person profile info function

    PagerPage('allOffers', 'All Offers', Offer, 6);

};
