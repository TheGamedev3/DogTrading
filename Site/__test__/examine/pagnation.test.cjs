

// Run with: npm run unit -- Site/__test__/examine/pagnation.test.cjs

const {siteEnvironment} = require('@TestSuite');

siteEnvironment('examine', ({expect, Agent, resetDB}) => {

    it('test page fetching', async () => {

        await resetDB();
        const {requester} = Agent();

        async function pageTest({
            route, sortStyle = "oldest", page = 0,
            index = "name", compareArray,
            expectSuccess = true
        }) {
            const names = (await requester(`GET ${route}`, {
                query: { page, sortStyle }
            })).profiles.map(obj => obj[index]);

            if (compareArray) {
                if (expectSuccess) {
                    expect(names).to.eql(compareArray);
                } else {
                    expect(names).to.not.eql(compareArray);
                }
            }
        }

        const testCases = [

            // (each page on the site shows up to 6 dogs)
            {
                route: "/allDogs",
                sortStyle: "oldest",
                page: 1,
                compareArray: ["Jamool", "Shamool", "Cupcake", "Rocket", "Roofus", "Penny"]
            },

            {
                route: "/allDogs",
                sortStyle: "oldest",
                page: 2,
                compareArray: ["Zipper", "Maximus", "Muffin", "Sarge", "Peanut"]
            },

            {
                route: "/allDogs",
                sortStyle: "newest",
                page: 1,
                compareArray: ["Peanut", "Sarge", "Muffin", "Maximus", "Zipper", "Penny"]
            },

            // (nothing on page 5)
            {
                route: "/allDogs",
                sortStyle: "oldest",
                page: 5,
                compareArray: []
            },

            {
                route: "/allDogs",
                sortStyle: "oldest",
                page: 1,
                compareArray: ["Jerry"],
                expectSuccess: false
            },

            // (each page on the site shows up to 3 users)
            {
                route: "/allUsers",
                sortStyle: "oldest",
                page: 1,
                compareArray: ["Ryan", "Aaron", "Sarah"]
            },

            {
                route: "/allUsers",
                sortStyle: "oldest",
                page: 2,
                compareArray: ["Gary", "Maurice", "Laura"]
            },

            {
                route: "/allUsers",
                sortStyle: "newest",
                page: 1,
                compareArray: ["Miranda", "Frank", "Laura"]
            },

            // (each page on the site shows up to 6 offers)
            {
                route: "/allOffers",
                sortStyle: "oldest",
                page: 1,
                compareArray: ["Shamool", "Cupcake", "Penny", "Maximus", "Sarge"]
            }

        ];

        await Promise.all(testCases.map(async(struct)=>pageTest(struct)));
    });

});

