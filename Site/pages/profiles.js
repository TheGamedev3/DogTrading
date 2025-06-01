



module.exports = function createRoutes({route, Webpage}){

    // route the user's page to their user Id
    const{Owner, Dog, Offer} = require('@Chemicals');

    Webpage(
        "/DogProfile/:dogId",
        "display/DogProfile",
        {
            injectInfo: async({params, userId})=>{
                const pageDog = await Dog.findOne({ _id: params.dogId }).lean();
                // else page dog unavaliable!!!

                const dogOwner = await Owner.findOne({ _id: pageDog.owner }).lean();
                // impossible not to have an owner!

                pageDog.owner = dogOwner;
                pageDog.ownerLink = `/UserProfile/${dogOwner._id}`;

                pageDog.traded = await Offer.OfferOfDog(pageDog._id);

                return {
                    myDog:userId.toString() === dogOwner._id.toString(),
                    dog: pageDog
                };
            }
        }
    );

    route.either("GET /UserProfile/:userId", async({req, user, params, queries, userId, page})=>{
        const justLoggedIn = req.session.justLoggedIn;
        delete req.session.justLoggedIn;
        const pageUser = await Owner.findOne({ _id: params.userId }).lean();
        const myDogs = await Dog.getIconData(await Dog.DogsOf(pageUser._id, queries.sortStyle || "newest"));
        const myOffers = await Offer.getIconData(await Offer.OffersOf(pageUser._id, queries.sortStyle || "newest"));

        // get dogs of in order of creation
        return page(200, "display/UserProfile", {
            viewer:user, userId,
            myProfile:userId === params.userId,

            user:pageUser, username:pageUser.name||'Unnamed User',
            justLoggedIn,

            myOffers, myDogs
        });
    });

};
