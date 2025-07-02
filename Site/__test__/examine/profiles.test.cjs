

// Run with: npm run unit -- Site/__test__/examine/profiles.test.cjs

const {siteEnvironment} = require('@TestSuite');

siteEnvironment('examine', ({expect, Agent, resetDB}) => {

    it('fetch profiles', async () => {
        
        await resetDB();
        const{requester} = Agent();

        // see if it retrieves the Owner Ryan
        const ryan = (await requester("GET /UserByName/ryan")).pageUser;
        expect(ryan.name).to.equal("Ryan");
        expect(ryan.email).to.equal("ryan@gmail.com");

        const shamool = ryan.myDogs.find(dog=>dog.name==="Shamool");
        expect(shamool.name).to.equal("Shamool");

        // see if it retrieves the Dog Cupcake
        const cupcake = (await requester("GET /DogByName/cupcake")).dog;
        expect(cupcake.name).to.equal("Cupcake");
        expect(cupcake.owner.name).to.equal("Aaron"); // (owned by Aaron)
    });

});

