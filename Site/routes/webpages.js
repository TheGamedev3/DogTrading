



module.exports = function createRoutes(route){
    function newPage(name, file, args={}){
        const fullRoute = `GET /${name}`;
        async function pageRoute({user=null, userId=0, page}){
            const pageArgs={
                user, userId,
                justLoggedIn:false,
                ...args
            }
            return page(200, file, pageArgs);
        }
        if(args.preVerified){
            route.preVerified(fullRoute, pageRoute);
        }else{
            route.either(fullRoute, pageRoute);
        }
    }

    // entry
    newPage('signup', 'entry/Signup', {preVerified: true});
    newPage('login', 'entry/Login', {preVerified: true});

    const routes={

        // entry
        home: "entry/Home",

        // display
        DogProfile: "display/DogProfile/:dogId",

    }
    Object.entries(routes).forEach(
        ([name, file])=>newPage(name, file)
    );

    

    ////////// custom handling //////////

    // make home the default page
    route.either('GET /', ({res})=>res.redirect('/home'));

    // route the user's page to their user Id
    const{Owner, Dog, Offer} = require('@Chemicals');

    route.either("GET /DogProfile/:dogId", async({user, params, userId, page})=>{
        const pageDog = await Dog.findOne({ _id: params.dogId }).lean();
        // else page dog unavaliable!!!

        const dogOwner = await Owner.findOne({ _id: pageDog.owner }).lean();
        // impossible not to have an owner!

        pageDog.owner = dogOwner;
        pageDog.ownerLink = `/UserProfile/${dogOwner._id}`;

        return page(200, "display/DogProfile", {
            user, userId, myDog:userId === dogOwner._id,
            dog: pageDog
        });
    });

    route.either("GET /UserProfile/:userId", async({req, user, params, userId, page})=>{
        const justLoggedIn = req.session.justLoggedIn;
        delete req.session.justLoggedIn;
        const pageUser = await Owner.findOne({ _id: params.userId });
        return page(200, "display/UserProfile", {viewer:user, myProfile:userId === params.userId, userId, user:pageUser, justLoggedIn});
    });

};
