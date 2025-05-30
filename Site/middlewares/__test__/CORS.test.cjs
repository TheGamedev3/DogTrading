

/*

(node:14004) [DEP0066] DeprecationWarning: OutgoingMessage.prototype._headers is deprecated
(Use `node --trace-deprecation ...` to show where the warning was created)

These deprciated warnings are probably from the outdated version of chaihttp being used

*/

// Run with: npm run unit -- middlewares/__test__/CORS.test.cjs

const {siteEnvironment} = require('@TestSuite');

siteEnvironment('CORS Header Test', ({
  link,
  mainAgent,
  expect
}) => {
  it('should have CORS headers on OPTIONS preflight', async () => {
    const res = await mainAgent
      .options('/verified')
      .set('Origin', link)
      .set('Access-Control-Request-Method', 'POST');

    expect(res).to.have.status(204); // or 200 depending on config
    expect(res).to.have.header('access-control-allow-origin');
    expect(res.headers['access-control-allow-origin']).to.equal(link);
  });

  it('should allow cross-origin GET requests', async () => {
    const res = await mainAgent
      .get('/verified')
      .set('Origin', link);

    expect(res).to.have.status(200);
    expect(res).to.have.header('access-control-allow-origin');
    expect(res.headers['access-control-allow-origin']).to.equal(link);
  });

  it('should NOT allow unauthorized origins', async () => {
    const res = await mainAgent
      .get('/verified')
      .set('Origin', 'http://unauthorized.com');

    // CORS middleware should not add CORS headers for this
    expect(res.headers['access-control-allow-origin']).to.be.undefined;
  });

});
