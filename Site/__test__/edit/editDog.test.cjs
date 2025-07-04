

// Run with: npm run unit -- Site/__test__/edit/editDog.test.cjs

const {siteEnvironment} = require('@TestSuite');

siteEnvironment('edit', ({expect, Agent, resetDB}) => {

    it('edit dog test', async () => {
        
        await resetDB();
        const{requester} = Agent();

        // profile picture seed data
        const dogPictures = {
            poodle: 'https://th.bing.com/th/id/OIP.aO3Li7pGawt1Uy6Q3hosmgHaE8?w=288&h=192&c=7&r=0&o=5&pid=1.7',
            dalmatian: 'https://tse4.mm.bing.net/th/id/OIP.LJI1EcXSCoLpbRM0BDE0JwHaE7?rs=1&pid=ImgDetMain'
        };

        // you fetch the dog
        let shamool = (await requester("GET /DogByName/shamool")).dog;
        expect(shamool.name).to.equal("Shamool");
        expect(shamool.profile).to.equal(dogPictures.poodle);
        expect(shamool.owner.name).to.equal("Ryan");

        // of course, you can't edit a dog that you dont own
        await requester(`PATCH /editDog/${shamool._id}`,{body:{name:"Shamoolius"}});

        // the dog is still named shamool!
        shamool = (await requester("GET /DogByName/shamool")).dog;
        expect(shamool.name).to.equal("Shamool");

        // login into Ryan's account
        const ryan = (await requester("POST /login", {body:
            {email:"ryan@gmail.com", password:"444421"}
        }));
        expect(ryan.name).to.equal("Ryan");
        expect(ryan.email).to.equal("ryan@gmail.com");

        // you can edit the dog now that you're logged in as its owner
        await requester(`PATCH /editDog/${shamool._id}`,{
            body:{
                name:"Shamoolius",
                profile:dogPictures.dalmatian
            },
            assume:"success"
        });

        // shamool is renamed!
        shamool = (await requester("GET /DogByName/shamool"),{assume:"fail"}).dog;
        expect(shamool).to.equal(undefined);

        shamool = (await requester("GET /DogByName/shamoolius")).dog;
        expect(shamool.name).to.equal("Shamoolius");
        expect(shamool.profile).to.equal(dogPictures.dalmatian);
        expect(shamool.owner.name).to.equal("Ryan");

        // blank username error!
        const blankUserNameErr = await requester(`PATCH /editDog/${shamool._id}`,{
            body:{name:""},
            assume:"fail"
        });
        expect(blankUserNameErr.name).to.match(/name.*blank|required/i);

        // still named shamool
        shamool = (await requester("GET /DogByName/shamoolius")).dog;
        expect(shamool.name).to.equal("Shamoolius");
    });

});

