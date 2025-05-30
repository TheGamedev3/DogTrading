

const {siteEnvironment} = require('@TestSuite');

// need to also test sorting dogs and offers
// personal pages
// make each sequential registering be some time afterwards and sort by date added
// do real expecting instead of logging results

// Run with: npm run unit -- models/__test__/pagnation.test.cjs

const { Owner, Dog, Offer } = require('@Chemicals');

siteEnvironment('Simulated dog trading scenario', ({expect, MongooseAPI}) => {

  const {pagnation, seedDatabase, err_catcher, clearAll} = MongooseAPI;
  it('test page fetching', async () => {
    console.log('fetcher');
    const result = await err_catcher(async () => {
        await clearAll();

        await seedDatabase();

        console.log('page1',await pagnation({
            table:Dog,
            sortStyle:'oldest',
            perPage:3, pageX:1
        }))

        console.log('page2',await pagnation({
            table:Dog,
            sortStyle:'oldest',
            perPage:3, pageX:2
        }))

        console.log('non existant page',await pagnation({
            table:Dog,
            sortStyle:'oldest',
            perPage:3, pageX:90
        }))
    });

    if (result && result.err) {
      throw result;
    }

    expect(true).to.equal(true);
  });
  
});
