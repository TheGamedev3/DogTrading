
const mongoose = require('mongoose');

module.exports.onConnect=async function(){

    let uri = process.env.MONGODB_URI;
    if(!uri){throw new Error("ENV NOT CONFIGURED WITH A MONGO_DB URI!\nrun with 'npm run mini' to run the preview version instead")}
    const testMode = process.env.NODE_ENV === 'test';

    // use the "_test" database if in .env test mode
    uri = testMode
        ? uri.replace(/([^/]+)$/, '$1_test')
        : uri;
        
    try {
        await mongoose.connect(uri);
        if(!testMode){ // (tests are seeded manually)
            const{DB_Info} = require('@Chemicals');
            const singleton = await DB_Info.fetchSingleton();
            if(singleton.seeded === false){
                const{seedDatabase} = require('@MongooseAPI');
                await seedDatabase();
                await DB_Info.modify({seeded: true});
            }
        }
    } catch (err) {
        console.error('Mongo connection failed:', err);
        throw err;
    }
}
