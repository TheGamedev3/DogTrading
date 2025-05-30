// Run with: npm run unit -- Site/trade.test.cjs

const { siteEnvironment } = require('@TestSuite');

siteEnvironment('Trade Route Tests', ({ createAgent, expect, MongooseAPI }) => {
  it('should register dog, offer it, and let another user buy it', async () => {
    const { clearAll, seedDatabase } = MongooseAPI;
    await clearAll();
    await seedDatabase();

    const seller = createAgent();
    const buyer = createAgent();

    // Sign up Seller
    await seller.post('/signup').send({
      email: 'seller@example.com',
      password: '123456'
    });

    // Sign up Buyer
    await buyer.post('/signup').send({
      email: 'buyer@example.com',
      password: 'abcdef'
    });

    // Seller registers dog
    const dogRes = await seller.post('/registerDog').send({
      name: 'Rex',
      profile: '🐶'
    });
    console.log(dogRes.body)
    expect(dogRes).to.have.status(200);
    const dogId = dogRes.body._id;

    // Seller makes offer
    const offerRes = await seller.post(`/makeOffer/${dogId}`);
    console.log(offerRes.body)
    expect(offerRes).to.have.status(200);
    const offerId = offerRes.body._id;

    // Buyer purchases offer
    const buyRes = await buyer.post(`/buyOffer/${offerId}`);
    console.log(buyRes.body)
    expect(buyRes).to.have.status(200);
    console.log('Buy Result:', buyRes.body);
  });
});
