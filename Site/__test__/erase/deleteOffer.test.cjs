// Run with: npm run unit -- Site/__test__/erase/deleteOffer.test.cjs

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

    // Dog should be flagged as traded to start with in the seed data
    let shamoolPage = (await ryanAgent(`GET /DogByName/shamool`)).dog;
    let offer = shamoolPage.offer;
    expect(offer !== null).to.equal(true);

    // Another user (Aaron) tries — and fails — to delete it
    const { requester: aaronAgent } = Agent();

    await aaronAgent('POST /login', {
      body: { email: 'aaron@gmail.com', password: '223121212' }
    });

    // of course, someone who doesn't own the dog or the offer can't delete the offer
    await aaronAgent(`DELETE /deleteOffer/${offer._id}`, {
      assume: 'fail'
    });

    // Offer still exists → dog remains traded
    shamoolPage = (await ryanAgent(`GET /DogByName/shamool`)).dog;
    offer = shamoolPage.offer;
    expect(offer !== null).to.equal(true);

    // Ryan deletes his own offer
    await ryanAgent(`DELETE /deleteOffer/${offer._id}`, {
      assume: 'success'
    });

    // Dog should be unavailable again
    shamoolPage = (await ryanAgent(`GET /DogByName/shamool`)).dog;
    expect(shamoolPage.offer === null).to.equal(true);

    // Aaron can't purchase the dog anymore
    const tradeGoneErr = await aaronAgent(`POST /buyOffer/${offer._id}`, {assume:'fail'});
    expect(tradeGoneErr.offerId).to.equal("Offer does not exist");

    // ──────────────────────────────────────────────────────────────

    // let's retry!
    await resetDB();

    await aaronAgent('POST /login', {
      body: { email: 'aaron@gmail.com', password: '223121212' }
    });

    shamoolPage = (await aaronAgent(`GET /DogByName/shamool`)).dog;

    // otherwise, Aaron would've been able to purchase the dog!
    await aaronAgent(`POST /buyOffer/${shamoolPage.offer._id}`, {assume:'success'});
  });

});
