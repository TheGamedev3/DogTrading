// Run with: npm run unit -- Site/__test__/erase/deleteOwner.test.cjs

const { siteEnvironment } = require('@TestSuite');

siteEnvironment('erase', ({ expect, Agent, resetDB }) => {

  it('delete offer test', async () => {
    await resetDB();

    const{requester} = Agent();

    // of course nothing happens when you attempt to delete your own account if you aren't logged in, as it just routes to 404
    await requester(`DELETE /deleteAccount`);

    // Ryan logs in
    await requester('POST /login', {
      body: { email: 'ryan@gmail.com', password: '444421' }
    });

    // See if Shamool is under Ryan
    let ryanPage = (await requester('GET /UserByName/ryan')).pageUser;
    let shamool = ryanPage.myDogs.find(d => d.name === 'Shamool');
    expect(shamool).to.exist;

    // Dog exists
    let shamoolPage = (await requester(`GET /DogByName/shamool`)).dog;
    const offer = shamoolPage.offer;
    expect(shamoolPage.err).to.equal(undefined);
    
    // Dog still exists
    shamoolPage = (await requester(`GET /DogByName/shamool`)).dog;
    expect(shamoolPage !== undefined).to.equal(true);

    // ──────────────────────────────────────────────────────────────

    // Ryan deletes his own account in his session
    await requester(`DELETE /deleteAccount`, {assume: 'success'});

    // Ryan shouldn't be registered anymore
    ryanPage = (await requester('GET /UserByName/ryan')).pageUser;
    expect(ryanPage.err).to.equal(true);

    // Dog should be unregistered/deleted
    shamoolPage = (await requester(`GET /DogByName/shamool`)).dog;
    expect(shamoolPage.err).to.equal(true);

    // ──────────────────────────────────────────────────────────────

    // now Aaron logs in
    await requester('POST /login', {
      body: { email: 'aaron@gmail.com', password: '223121212' }
    });

    // Aaron can't purchase the dog anymore
    const tradeGoneErr = await requester(`POST /buyOffer/${offer._id}`, {assume:'fail'});
    expect(tradeGoneErr.offerId).to.equal("Offer does not exist");
  });

});
