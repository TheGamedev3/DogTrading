

// Run with: npm run unit -- Site/__test__/entry/login.test.cjs

const {siteEnvironment} = require('@TestSuite');

siteEnvironment('entry', ({expect, Agent, resetDB}) => {

    it('login test', async () => {
        
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

        // fail login into Aaron's account on a second session
        let aaronError = (await user2.requester("POST /login", {body:
            {email:"aaron1234@gmail.com", password:"223121212"}, // correct email is aaron@gmail.com
            assume:'fail'
        }));
        expect(aaronError.email).to.equal("incorrect email");

        aaronError = (await user2.requester("POST /login", {body:
            {email:"aaron@gmail.com", password:"1234"}, // correct password is 223121212
            assume:'fail'
        }));
        expect(aaronError.password).to.equal("incorrect password");


        const aaron = (await user2.requester("POST /login", {body:
            {email:"aaron@gmail.com", password:"223121212"}, // correct password is 223121212
            assume:'success'
        }));
        expect(aaron.name).to.equal("Aaron");
        expect(aaron.email).to.equal("aaron@gmail.com");

        /////////////////////////////////////

        // Aaron logs out
        (await user2.requester("POST /logout"));

    });

});

