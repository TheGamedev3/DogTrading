



module.exports = function createRoutes({ Webpage }){

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

    Webpage(
        "/UserProfile/:userId",
        "display/UserProfile",
        {
            injectInfo: async({userId, params})=>{
                return {
                    myProfile: userId === params.userId,
                    pageUser: await Owner.pageData(params.userId)
                };
            }
        }
    );

    Webpage(
        "/createDog",
        "display/CreateDog"
    );

};
