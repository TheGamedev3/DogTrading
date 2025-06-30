

// Run with: npm run unit -- Site/__test__/examine/pagnation.test.cjs

const {siteEnvironment} = require('@TestSuite');

siteEnvironment('Simulated dog trading scenario', ({expect, Agent, MongooseAPI}) => {

    const {clearAll, seedDatabase} = MongooseAPI;

    it('test page fetching', async () => {
        await clearAll();
        await seedDatabase();

        const{requester} = Agent();

        // (each page on the site shows 6 dogs)
        const page1OfDogs = (await requester("GET /allDogs",{
            query:{
                pageX:1,
                sortStyle: "newest"
            }
        })).profiles;
        console.log(page1OfDogs);
    });

});


// this also calls for a fetch profile link via name!

