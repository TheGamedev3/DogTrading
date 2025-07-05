



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
                if(!found){setFile("display/Dog404"); console.warn(dog)}
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
                if(!found){setFile("display/User404"); console.warn(pageUser)}
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

    const testMode = process.env.NODE_ENV === 'test';
    if(testMode){
        // exclusive test mode routes for easy of use/debugging redirectTo
        Webpage(
            "/UserByName/:name",
            "",
            {
                injectInfo: async({params, redirectTo})=>{
                    const pageName = params.name;
                    const pageUser = await Owner.findOne({ name: new RegExp(`^${pageName}$`, 'i') });
                    return redirectTo(`/UserProfile/${pageUser?._id || -1}`);
                }
            }
        );

        Webpage(
            "/DogByName/:name",
            "",
            {
                injectInfo: async({params, redirectTo})=>{
                    const pageName = params.name;
                    const pageDog = await Dog.findOne({ name: new RegExp(`^${pageName}$`, 'i') });
                    return redirectTo(`/DogProfile/${pageDog?._id || -1}`);
                }
            }
        );
    }
};
