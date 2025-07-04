// Run with: npm run unit -- Site/__test__/entry/registerDog.test.cjs

const { siteEnvironment } = require('@TestSuite');

siteEnvironment('entry', ({ expect, Agent, resetDB }) => {

  it('register/create dog test', async () => {

    await resetDB();
    const { requester } = Agent();

    // Dog picture URLs from seeds.js so the assertions always stay in sync
    const dogPictures = {
      poodle:   'https://th.bing.com/th/id/OIP.aO3Li7pGawt1Uy6Q3hosmgHaE8?w=288&h=192&c=7&r=0&o=5&pid=1.7',
      lab:      'https://tse2.mm.bing.net/th/id/OIP.yxMbmHl7HDgEPqCSQd3DZwHaEW?rs=1&pid=ImgDetMain',
    };

    //  Anonymous users cannot register a dog
    await requester('POST /registerDog', {body: { name: 'Nugget', profile: dogPictures.lab }});
    
    // you fetch the dog but nothing happens since the route isnt accessible
    let nugget = (await requester("GET /DogByName/Nugget")).dog;
    expect(nugget.err).to.equal(true);

    //  Log-in as Ryan (seed data e-mail / password)
    const ryan = await requester('POST /login', {
      body: { email: 'ryan@gmail.com', password: '444421' }
    });
    expect(ryan.name).to.equal('Ryan');

    //  Successful registration
    const newDog = await requester('POST /registerDog', {
      body: {
        name: 'Nugget',
        profile: dogPictures.lab
      },
      assume: 'success'
    });

    // The endpoint returns the freshly created dog object ⬇
    expect(newDog.name).to.equal('Nugget');
    expect(newDog.picture ?? newDog.profile).to.equal(dogPictures.lab);

    //  Dog page should resolve & show the correct data
    nugget = (await requester("GET /DogByName/Nugget")).dog;
    expect(nugget.name).to.equal("Nugget");
    expect(nugget.profile).to.equal(dogPictures.lab);

    //  Blank dog name should be rejected
    const blankUserNameErr = await requester('POST /registerDog', {
      body: { name: '', profile: dogPictures.poodle },
      assume: 'fail'
    });
    expect(blankUserNameErr.name).to.match(/name.*blank|required/i);

    //  After failed attempt, Nugget still exists
    nugget = (await requester("GET /DogByName/Nugget")).dog;
    expect(nugget.name).to.equal("Nugget");
    expect(nugget.profile).to.equal(dogPictures.lab);
  });

});

