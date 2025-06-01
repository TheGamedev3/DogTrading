
const { db_object, FieldError, err_catcher } = require('@MongooseAPI');
const { Owner } = require('./Owner');

module.exports = {
  Dog: db_object(
    'Dog',
    {
      name: {
        type: String,
        required: false
      },
      owner: {
        type: 'ObjectId',
        ref: 'Owner',
        required: true, // all dogs must be owned by someone or some entity
      },
      profile: {
          type: String,
          required: false
      },
      created: {
          type: Date,
          default: Date.now
      }
    },
    {
      async setOwner(dogId, newOwnerId){
        return await err_catcher(async()=>{
            const dog = await this.findOne({ _id: dogId });
            if(!dog)throw new FieldError('dogId', 'Dog does not exist');
            if(dog.owner.toString() === newOwnerId.toString())throw new FieldError('newOwnerId', 'Owner Already Owns Dog!');

            if(!(await Owner.isReal(newOwnerId)))throw new FieldError('newOwnerId', 'Owner does not exist');

            dog.owner = newOwnerId; await dog.save();
            return dog;
        });
      },
      async registerDog(name, ownerId, image=''){
        return await err_catcher(async()=>{
            if(ownerId !== undefined && !(await Owner.isReal(ownerId)))
            {throw new FieldError('ownerId', 'Owner does not exist')}

            const object = { name, owner: ownerId };
            if(image){object.profile = image}
            return await this.create(object);
        });
      },
      async DogsOf(ownerId, sortStyle){
        return await err_catcher(async()=>{
            if(!(await Owner.isReal(ownerId)))
            {throw new FieldError('ownerId', 'Owner does not exist')}

            return await this.find({ owner: ownerId }).complexSort(sortStyle);
        });
      },
      async modify(dogId, props){
          const dog = await this.findOne({ _id: dogId });
          if(!dog)throw new FieldError('dogId', 'Dog does not exist');

          const cantModify = ['_id', 'owner'];
          const keys = Object.keys(props);
          const notAllowed = cantModify.filter(item=>keys.includes(item));
          if(notAllowed.length > 0)throw new FieldError('props', `Attempted to modify: ${notAllowed.join(', ')} under Dog!`);

          Object.assign(dog, props);
          return await dog.save();
      },

      async selfOwnsDog(ownerId, dogId){
          if(ownerId !== undefined && !(await Owner.isReal(ownerId)))
          {throw new FieldError('ownerId', 'Owner does not exist')}

          const dog = await this.findOne({ _id: dogId });
          if(!dog)throw new FieldError('dogId', 'Dog does not exist');
          return dog.owner.toString() === ownerId.toString();
      },

      async isReal(id){
          if(id === undefined){return id}
          return await this.exists({ _id: id });
      },

      // used for debug/seeding
      async createDummy(props){
          return await this.create(props);
      },

      async delete(dogId){
        const deleted = await this.findByIdAndDelete(dogId);
        if (!deleted) throw new FieldError('dogId', 'Dog does not exist or was already deleted');
        return deleted;
      },

      async getIconData(dogs){
        const{Offer} = require('./Offer');
        await Promise.all(
            dogs.map(async (dog) => {
                dog.offer = await Offer.OfferOfDog(dog._id);
            })
        );
        return dogs.map(({
            profile, name, _id, offer
          })=>{
          return{
              imageSrc: profile,
              name,
              link: `/DogProfile/${_id}`,
              size: 100,
              topLeft: offer ? '$$$' : ''
          }}
        );
      }

    }
  )
};
