



module.exports = function createRoutes({ Webpage }){

    // route the user's page to their user Id
    const{Owner, Dog} = require('@Chemicals');
    const { err_catcher } = require('@MongooseAPI');

    Webpage(
        "/DogProfile/:dogId",
        "display/DogProfile",
        {
            injectInfo: async({params, setFile})=>{
                const dogId = params.dogId;
                const [found, dog] = await err_catcher(async()=>await Dog.pageData(dogId));
                if(!found){setFile("display/Dog404")}
                return {dog, found, dogId};
            }
        }
    );

    Webpage(
        "/UserProfile/:userId",
        "display/UserProfile",
        {
            injectInfo: async({userId, params, setFile})=>{
                const pageUserId = params.userId;
                const [found, pageUser] = await err_catcher(async()=>await Owner.pageData(pageUserId));
                if(!found){setFile("display/User404")}
                return {
                    myProfile: userId === pageUserId,
                    pageUserId, pageUser, found
                };
            }
        }
    );

    Webpage(
        "/createDog",
        "display/CreateDog"
    );

};
