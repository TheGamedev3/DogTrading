

// Run with: npm run unit -- Site/pagnation.test.cjs

const { siteEnvironment } = require('@TestSuite');

siteEnvironment('Paginate All Users', ({ mainAgent, expect, MongooseAPI }) => {
  it('should login and paginate page 1 sorted by newest', async () => {

    const {seedDatabase, clearAll} = MongooseAPI;
      await clearAll();
      await seedDatabase();

    // login
    const login = await mainAgent
      .post('/login')
      .send({ email: 'ryan@gmail.com', password: '444421' });

    expect(login).to.have.status(200);

    // check page 1
    const res = await mainAgent
      .get('/allOffers')
      .query({ page: 1, sortStyle: 'newest' });

    console.log('Paginated Response:', res.body);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('results');
    expect(res.body.results).to.be.an('array');
  });
});
