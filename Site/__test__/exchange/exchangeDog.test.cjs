

// Run with: npm run unit -- Site/__test__/exchange/exchangeDog.test.cjs

const {siteEnvironment} = require('@TestSuite');

siteEnvironment('exchange', ({expect, Agent, resetDB}) => {

    it('trade cycle test', async () => {
        
        // create two sessions, the buyer (ryan), and the trader (aaron)
        await resetDB();
        const buyer = Agent();
        const trader = Agent();

        /////////////////////////////////////

        // login into Ryan's account
        const ryan = (await buyer.requester("POST /login", {body:
            {email:"ryan@gmail.com", password:"444421"}
        }));
        expect(ryan.name).to.equal("Ryan");
        expect(ryan.email).to.equal("ryan@gmail.com");
        const ryanInfo = async()=>(await buyer.requester("GET /UserByName/ryan")).pageUser;

        // login into Aaron's account
        const aaron = (await trader.requester("POST /login", {body:
            {email:"aaron@gmail.com", password:"223121212"},
            assume:'success'
        }));
        expect(aaron.name).to.equal("Aaron");
        expect(aaron.email).to.equal("aaron@gmail.com");
        const aaronInfo = async()=>(await buyer.requester("GET /UserByName/Aaron")).pageUser;

        /////////////////////////////////////


        // check aaron's inventory for the dog Rocket
        let rocket = (await aaronInfo()).myDogs.find(dog=>dog.name==="Rocket");
        expect(rocket.name).to.equal("Rocket");

        // rocket isn't traded yet of course
        expect(rocket.offer).to.eql(undefined);

        // ryan doesn't have that dog however
        rocket = (await ryanInfo()).myDogs.find(dog=>dog.name==="Rocket");
        expect(rocket).to.equal(undefined);

        // aaron puts his dog for sale
        rocket = (await trader.requester("GET /DogByName/rocket")).dog;
        let rocketOffer = await trader.requester(`POST /makeOffer/${rocket._id}`);
        
        // the dog is indeed for sale
        rocket = (await trader.requester("GET /DogByName/rocket")).dog;
        expect(rocketOffer._id).to.equal(rocket.offer._id);

        // of course, aaron cannot purchase his own dog he is selling
        await trader.requester(
            `POST /buyOffer/${rocketOffer._id}`,
            {assume:'fail'}
        );

        // ryan buys aaron's dog
        await buyer.requester(`POST /buyOffer/${rocketOffer._id}`);

        // it no longer belongs to aaron
        rocket = (await aaronInfo()).myDogs.find(dog=>dog.name==="Rocket");
        expect(rocket).to.equal(undefined);

        // it now belongs to ryan
        rocket = (await ryanInfo()).myDogs.find(dog=>dog.name==="Rocket");
        expect(rocket.name).to.equal("Rocket");

        // the dog is no longer for sale
        expect(rocket.offer).to.eql(undefined);

        // of course, nothing happens when someone tries to take the offer again
        await buyer.requester(
            `POST /buyOffer/${rocketOffer._id}`,
            {assume:'fail'}
        );
        //////////////////////////////////////////

        // aaron buys an existing traded dog named maximus
        const maximusOffer = (await trader.requester("GET /DogByName/maximus")).dog.offer._id;
        await trader.requester(`POST /buyOffer/${maximusOffer}`);

        // check aaron's inventory for dog
        let maximus = (await aaronInfo()).myDogs.find(dog=>dog.name==="Maximus");
        expect(maximus.name).to.equal("Maximus");
    });

});

