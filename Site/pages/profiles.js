



module.exports = function createRoutes({route, Webpage}){

    // route the user's page to their user Id
    const{Owner, Dog} = require('@Chemicals');

    Webpage(
        "/DogProfile/:dogId",
        "display/DogProfile",
        {
            injectInfo: async({params})=>{
                return { dog: await Dog.pageData(params.dogId) };
            }
        }
    );

    route.either("GET /UserProfile/:userId", async({req, user, params, userId, page})=>{
        const justLoggedIn = req.session.justLoggedIn;
        delete req.session.justLoggedIn;

        // get dogs of in order of creation
        return page(200, "display/UserProfile", {
            user, userId,
            myProfile:userId === params.userId,

            justLoggedIn,

            pageUser: await Owner.pageData(params.userId)
        });
    });

};
