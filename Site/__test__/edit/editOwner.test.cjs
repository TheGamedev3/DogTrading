
// Run with: npm run unit -- Site/__test__/edit/editOwner.test.cjs

const { siteEnvironment } = require('@TestSuite');

siteEnvironment('edit', ({ expect, Agent, resetDB }) => {

  it('edit owner profile test', async () => {

    await resetDB();
    const { requester } = Agent();

    // picture URLs from seed data
    const peoplePictures = {
      1: 'https://th.bing.com/th/id/OIP.8_HvWJEZbwr3hkUuZL0jMgAAAA?rs=1&pid=ImgDetMain',
      3: 'https://static.vecteezy.com/system/resources/thumbnails/037/983/656/small_2x/ai-generated-confident-brunette-business-woman-student-with-folded-arms-photo.jpg',
    };

    //  Ryan’s public page (before editing)
    let ryanPage = (await requester('GET /UserByName/ryan')).pageUser;
    expect(ryanPage.name).to.equal('Ryan');
    expect(ryanPage.profile).to.equal(peoplePictures[1]);

    //  Anonymous users cannot edit an owner profile
    await requester('PATCH /editMyProfile', {body: { name: 'RyGuy' }});

    // nothing happens
    ryanPage = (await requester('GET /UserByName/ryan')).pageUser;
    expect(ryanPage.name).to.equal('Ryan');
    expect(ryanPage.profile).to.equal(peoplePictures[1]);

    //  Log-in as Ryan
    const ryan = await requester('POST /login', {
      body: { email: 'ryan@gmail.com', password: '444421' }
    });
    expect(ryan.name).to.equal('Ryan');
    expect(ryan.email).to.equal('ryan@gmail.com');

    //  Successful edit (name & profile picture change)
    await requester('PATCH /editMyProfile', {
      body: {
        name: 'RyGuy',
        profile: peoplePictures[3]
      },
      assume: 'success'
    });

    //  Old name should no longer resolve
    ryanPage = await requester('GET /UserByName/ryan').pageUser;
    expect(ryanPage).to.equal(undefined);

    //  New data should be persisted
    ryanPage = (await requester('GET /UserByName/ryguy')).pageUser;
    expect(ryanPage.name).to.equal('RyGuy');
    expect(ryanPage.profile).to.equal(peoplePictures[3]);

    //  Blank name is rejected
    const blankNameErr = await requester('PATCH /editMyProfile', {
      body: { name: '' },
      assume: 'fail'
    });
    expect(blankNameErr.name).to.equal("username can't be blank!");

    //  Profile remains unchanged after failed edit
    ryanPage = (await requester('GET /UserByName/ryguy')).pageUser;
    expect(ryanPage.name).to.equal('RyGuy');
  });

});

