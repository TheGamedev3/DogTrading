// Run with: npm run unit -- Site/__test__/erase/deleteDog.test.cjs

const { siteEnvironment } = require('@TestSuite');

siteEnvironment('erase', ({ expect, Agent, resetDB }) => {

  it('delete offer test', async () => {
    await resetDB();

    // Ryan logs in
    const { requester: ryanAgent } = Agent();

    await ryanAgent('POST /login', {
      body: { email: 'ryan@gmail.com', password: '444421' }
    });

    // See if Shamool is under Ryan
    const ryanPage = (await ryanAgent('GET /UserByName/ryan')).pageUser;
    let shamool = ryanPage.myDogs.find(d => d.name === 'Shamool');
    expect(shamool).to.exist;

    // Dog exists
    let shamoolPage = (await ryanAgent(`GET /DogByName/shamool`)).dog;
    const offer = shamoolPage.offer;
    expect(shamoolPage.err).to.equal(undefined);

    // Another user (Aaron) tries — and fails — to delete it
    const { requester: aaronAgent } = Agent();

    await aaronAgent('POST /login', {
      body: { email: 'aaron@gmail.com', password: '223121212' }
    });

    // of course, someone who doesn't own the dog can't delete it
    await aaronAgent(`DELETE /unregisterDog/${shamoolPage._id}`, {
      assume: 'fail'
    });

    // Dog still exists
    shamoolPage = (await ryanAgent(`GET /DogByName/shamool`)).dog;
    expect(shamoolPage !== undefined).to.equal(true);

    // ──────────────────────────────────────────────────────────────

    // Ryan unregisters his own dog
    await ryanAgent(`DELETE /unregisterDog/${shamoolPage._id}`, {
      assume: 'success'
    });

    // Dog should be unregistered/deleted
    shamoolPage = (await ryanAgent(`GET /DogByName/shamool`)).dog;
    expect(shamoolPage.err).to.equal(true);

    // Aaron can't purchase the dog anymore
    const tradeGoneErr = await aaronAgent(`POST /buyOffer/${offer._id}`, {assume:'fail'});
    expect(tradeGoneErr.offerId).to.equal("Offer does not exist");
  });

});
