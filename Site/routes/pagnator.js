



module.exports = function createRoutes(route){

    // route the user's page to their user Id
    const{Owner, Dog, Offer} = require('@Chemicals');

    const {pagnation} = require('@MongooseAPI');
    async function pagnate(table, perPage, queries) {
        return await pagnation({
            table: table,
            sortStyle: queries.sortStyle || 'newest',
            perPage: perPage,
            pageX: parseInt(queries.page) || 1,
            jsObjects: true
        });
    }
    function PagerFunction(pageRoute, header, table, perPage, transformer, profiler){
        const pager = async({
            user, userId,
            queries, page
        }) => {
            let pageData = await pagnate(table, perPage, queries);
            if(transformer){await transformer(pageData)}
            const profiles = pageData.results.map(profiler);
            return page(200, 'data/Pagnator', {
                pagnatorTitle: header,
                pageX: pageData.pageX,
                totalPages: pageData.totalPages,
                totalResults: pageData.totalResults,
                sortStyle: pageData.sortStyle,

                user, userId,
                profiles
            });
        }
        return route.either(`GET /${pageRoute}`, pager);
    }

    PagerFunction('allUsers', 'All Users', Owner, 3,
        null,
        ({
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

    // dont forget the cascader
    PagerFunction('allDogs', 'All Dogs', Dog, 6,
        async(pageData)=>await Promise.all(
            pageData.results.map(async (dog) => {
                dog.offer = await Offer.OfferOfDog(dog._id);
            })
        ),
        ({
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

    // make it so u can edit the dogs if you own them, or your own profile
    // make a person profile info function

    PagerFunction('allOffers', 'All Offers', Offer, 6,
        async(pageData)=>await Promise.all(
            pageData.results.map(async (offer) => {
                offer.dog = await Dog.findOne({_id: offer.dog});
            })
        ),
        (offer)=>{
            const{
                profile, name, _id
            } = offer.dog;
            return{
                imageSrc: profile,
                name,
                link: `/DogProfile/${_id}`,
                size: 100,
                topLeft: '$$$',
                offer
            }
        }
    );

};
