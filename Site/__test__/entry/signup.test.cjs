

// Run with: npm run unit -- Site/__test__/entry/signup.test.cjs

const {siteEnvironment} = require('@TestSuite');

siteEnvironment('entry', ({expect, Agent, resetDB}) => {

    it('signup test', async () => {
        
        await resetDB();
        const{requester} = Agent();

        // the purpose is to test out field errors for forms!

        // create a new account
        async function createAccountAttempt(name, profile, email, password){
            return (await requester("POST /signup", {body:
                {name, profile, email, password},
                assume:'any'
            }));
        }
        function expectError(errObject, errIndex, errMsg){
            expect(errObject.err).to.equal(true);
            expect(errObject[errIndex]).to.include(errMsg);
        }

        let James; const img = "https://tse4.mm.bing.net/th/id/OIP.IGNf7GuQaCqz_RPq5wCkPgHaLH?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";
    
        const errorTests = [
            // invalid email
            ["James", img, "james", "YY394221", "email", "Please enter a valid email"],

            // email taken
            ["James", img, "aaron@gmail.com", "YY394221", "email", "this email is already registered"],

            // name missing err
            ["",     img, "james@gmail.com", "YY394221", "name", "username can't be blank!"],

            // password too short err
            ["James", img, "james@gmail.com", "1234", "password", "password must be at minimum 6 characters!"]
        ];

        await Promise.all(errorTests.map(async ([name, profile, email, password, field, msg]) => {
            expectError(
                await createAccountAttempt(name, profile, email, password),
                field, msg
            );
        }));

        // success!
        James = await createAccountAttempt("James", img, "james@gmail.com", "YY394221");
        expect(James.name).to.equal("James");
        expect(James.email).to.equal("james@gmail.com");

        // logout
        await requester("POST /logout");

        // relogin with wrong password
        expectError(
            await requester("POST /login", {
                body: { email: "james@gmail.com", password: "wrongpass" },
                assume: "fail"
            }),
            'password', "incorrect password"
        );

        // relogin with correct password
        const jamesLogin = (await requester("POST /login", {
            body: { email: "james@gmail.com", password: "YY394221" },
            assume: "success"
        }));
        expect(jamesLogin.name).to.equal("James");
        expect(jamesLogin.email).to.equal("james@gmail.com");

    });

});

