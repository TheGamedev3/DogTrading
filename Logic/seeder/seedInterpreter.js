

// trigger this when the database is empty/cleared/fresh
module.exports = {
    async seedDatabase(){
        const seedArray = require('./seeds');

        // give parents
        let currentOwner = null;
        for(const db_object of seedArray){
            if(db_object.object === 'Owner'){currentOwner = db_object}
            if(db_object.object === 'Dog'){
                db_object.parent = currentOwner;
            }
        }

        // mongoose insert all of these objects in
        const owners = seedArray.filter(({object})=>object === 'Owner');
        const dogs = seedArray.filter(({object})=>object === 'Dog');

        const{Owner, Dog, Offer} = require('@Chemicals');

        // August 1st 2024
        const baseDate = new Date('2024-08-01T00:00:00Z');

        await Promise.all(
            owners.map(async (owner, x) => {

                // (Each next person is registered a day after)
                const newDate = new Date(baseDate.getTime() + x * 24 * 60 * 60 * 1000);

                owner.db = await Owner.createDummy({
                    email: owner.email,
                    password: owner.password,

                    name: owner.name,
                    profile: owner.picture,
                    
                    created: newDate
                });
            })
        );

        let lastOwnerId = null;
        let minuteShift = 0;

        await Promise.all(
            dogs.map(async (dog) => {
                const currentOwnerId = dog.parent.db._id.toString();

                // Reset minuteShift if owner changed
                if (lastOwnerId !== currentOwnerId) {
                    minuteShift = 0;
                    lastOwnerId = currentOwnerId;
                }

                // Base date + minuteShift
                const baseCreated = new Date(dog.parent.db.created);
                const created = new Date(baseCreated.getTime() + minuteShift * 60 * 1000);

                // each dog under the same owner is created a minute afterwards
                minuteShift++;

                // Create dog
                dog.db = await Dog.createDummy({
                    name: dog.name,
                    owner: dog.parent.db._id,
                    profile: dog.picture,
                    created
                });

                // Create offer if traded
                if (dog.traded) {
                    dog.offer_db = await Offer.createDummy({
                        seller: dog.parent.db._id,
                        dog: dog.db._id,
                        created
                    });
                }
            })
        );


    }
}