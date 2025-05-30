



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

    route.either("GET /UserProfile/:userId", async({req, user, params, userId, page})=>{
        const justLoggedIn = req.session.justLoggedIn;
        delete req.session.justLoggedIn;
        const pageUser = await Owner.findOne({ _id: params.userId });
        return page(200, "display/UserProfile", {viewer:user, myProfile:userId === params.userId, userId, user:pageUser, justLoggedIn});
    });

    async function pagnate(table, perPage, queries) {
        return await pagnation({
            table: table,
            sortStyle: queries.sortStyle || 'newest',
            perPage: perPage,
            pageX: parseInt(queries.page) || 1,
            jsObjects: true
        });
    }

    const {pagnation} = require('@MongooseAPI');

    route.either('GET /allUsers', async({
        user, userId,
        queries, page
    }) => {
        const pageData = await pagnate(Owner, 3, queries);
        const profiles = pageData.results.map(({
            profile, name, _id
        })=>{
            return{
                imageSrc: profile,
                name,
                link: `/UserProfile/${_id}`,
                size: 100,
                topLeft: ''
            }}
        );
        return page(200, 'data/AllUsers', {
            pageX: pageData.pageX,
            totalPages: pageData.totalPages,
            totalResults: pageData.totalResults,
            sortStyle: pageData.sortStyle,

            user, userId,
            profiles
        });
    });

    // make it so u can edit the dogs if you own them, or your own profile
    // make a person profile info function
    route.either('GET /allDogs', async({
        user, userId,
        queries, page
    }) => {
        const pageData = await pagnate(Dog, 6, queries);
        await Promise.all(
            pageData.results.map(async (dog) => {
                dog.offer = await Offer.OfferOfDog(dog._id);
            })
        );
        const profiles = pageData.results.map(({
            profile, name, _id, offer
        })=>{
            return{
                imageSrc: profile,
                name,
                link: `/DogProfile/${_id}`,
                size: 100,
                topLeft: offer ? '$$$' : ''
            }}
        );

        console.log(profiles)

        // dont forget the cascader
        return page(200, 'data/AllDogs', {
            pageX: pageData.pageX,
            totalPages: pageData.totalPages,
            totalResults: pageData.totalResults,
            sortStyle: pageData.sortStyle,

            user, userId,
            profiles
        });
    });


};
