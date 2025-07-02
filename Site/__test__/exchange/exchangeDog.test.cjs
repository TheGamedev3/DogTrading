

// Run with: npm run unit -- Site/__test__/exchange/exchangeDog.test.cjs

const {siteEnvironment} = require('@TestSuite');

siteEnvironment('exchange', ({expect, Agent, resetDB}) => {

    it('trade cycle test', async () => {
        
        await resetDB();
        const user1 = Agent();
        const user2 = Agent();

        /////////////////////////////////////

        // login into Ryan's account
        const ryan = (await user1.requester("POST /login", {body:
            {email:"ryan@gmail.com", password:"444421"}
        }));
        expect(ryan.name).to.equal("Ryan");
        expect(ryan.email).to.equal("ryan@gmail.com");

        /////////////////////////////////////

        const aaron = (await user2.requester("POST /login", {body:
            {email:"aaron@gmail.com", password:"223121212"}, // correct password is 223121212
            assume:'success'
        }));
        expect(aaron.name).to.equal("Aaron");
        expect(aaron.email).to.equal("aaron@gmail.com");

        /////////////////////////////////////


        // check aaron's inventory for dog

        // aaron puts his dog for sale

        // ryan buys aaron's dog

        // it now belongs to ryan, and the dog is no longer for sale


    });

});

