
const {siteEnvironment} = require('@TestSuite');
const { Owner, Dog, Offer } = require('@Chemicals');

siteEnvironment('Simulated dog trading scenario', ({expect, MongooseAPI}) => {

  const {clearAll, err_catcher} = MongooseAPI;
  it('should simulate a full trade flow and print cookie', async () => {
    const result = await err_catcher(async () => {
      await clearAll();

      const printDogs = async (mike, steve) => {
        const mikes = await Dog.DogsOf(mike._id);
        const steves = await Dog.DogsOf(steve._id);
        console.log('inventories\n\n', '\nmike:', mikes, '\nsteve:', steves);
      };

      const mike = await Owner.signup('mike@gmail.com', '12345678');
      const steve = await Owner.signup('steve@gmail.com', '87654321');

      await printDogs(mike, steve); // no dogs

      const belle = await Dog.registerDog('belle', mike._id);
      await printDogs(mike, steve); // mike has belle

      const sellDog = await Offer.makeOffer(mike._id, belle._id);
      console.log('offer status (created):', sellDog);

      const sellDogStatusAfter = await Offer.buyOffer(steve._id, sellDog._id);
      console.log('offer status (after purchase):', sellDogStatusAfter);

      await printDogs(mike, steve); // belle belongs to steve now

      return '🍪...';
    });

    if (result && result.err) {
      throw result;
    }

    expect(result).to.equal('🍪...');
  });
  
});
