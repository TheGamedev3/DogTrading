
const { db_object, FieldError, err_catcher } = require('@MongooseAPI');
const { Owner } = require('./Owner');
const { Dog } = require('./Dog');

module.exports = {
  Offer: db_object(
    'Offer',
    {
      seller: {
        type: 'ObjectId',
        ref: 'Owner',
        required: true
      },
      buyer: {
        type: 'ObjectId',
        ref: 'Owner',
        required: false
      },
      dog: {
        type: 'ObjectId',
        ref: 'Dog',
        required: true
      },
      status: {
        type: String,
        default: 'available',
        required: true
      },
      created: {
          type: Date,
          default: Date.now
      }
    },
    {
      async makeOffer(whoOwner, whatDog){
        return await err_catcher(async()=>{

            const dog = await Dog.findOne({ _id: whatDog });
            if(!dog)throw new FieldError('dogId', 'Dog does not exist');
            if (await this.exists({ dog: whatDog, status: 'available' }))
              throw new FieldError('dogId', 'Dog already has an active offer!');

            if(!(await Owner.isReal(whoOwner)))throw new FieldError('whoOwner', 'Owner does not exist');
            if(dog.owner.toString() !== whoOwner.toString())throw new FieldError('whoOwner', "Owner Can't Sell Dog He Doesn't Own!");

            return await this.create({ seller: whoOwner, dog: whatDog, status:'available' });
        });
      },
      async deleteOffer(whoOwner, offerId){
        return await err_catcher(async()=>{

            if(!(await this.exists({ _id: offerId })))throw new FieldError('offerId', 'Offer does not exist');
            const offer = await this.findOne({ _id: offerId });

            if(!(await Owner.isReal(whoOwner)))throw new FieldError('whoOwner', 'Owner does not exist');
            if(offer.seller.toString() !== whoOwner.toString())throw new FieldError('whoOwner', "Owner Can't Cancel an Offer that isn't Theirs!");

            return await this.deleteOne({ _id: offerId });
        });
      },
      async buyOffer(buyerId, offerId){
        return await err_catcher(async()=>{

            if(!(await this.exists({ _id: offerId })))throw new FieldError('offerId', 'Offer does not exist');
            const offer = await this.findOne({ _id: offerId });
            if(offer.status !== 'available')throw new FieldError('offerId', 'Offer no longer valid');

            if(!(await Owner.isReal(buyerId)))throw new FieldError('buyerId', 'Buyer does not exist');

            const dog = await Dog.findOne({ _id: offer.dog });
            if(dog.owner.toString() === buyerId.toString())throw new FieldError('buyerId', "Buyer already owns this dog!");

            // const dogTransfered =
            await Dog.setOwner(offer.dog, buyerId);
            // console.log('dog transfered', dogTransfered)
            offer.status = 'purchased';
            offer.buyer = buyerId;
            await offer.save();
            return offer;
        });
      },
      async OffersOf(ownerId){
        return await err_catcher(async()=>{
            if(!(await Owner.isReal(ownerId)))
            {throw new FieldError('ownerId', 'Owner does not exist')}

            return await this.find({ seller: ownerId });
        });
      },
      async OfferOfDog(dogId){
        if(!(await Dog.isReal(dogId)))
        {throw new FieldError('dogId', 'Dog does not exist')}

        return await this.findOne({ dog: dogId, status: 'available' });
      },

      // used for debug/seeding
      async createDummy(props){
          return await this.create(props);
      },

      async getIconData(offers){
        const{Dog} = require('./Dog');
        await Promise.all(
            offers.map(async (offer) => {
                offer.dog = await Dog.findOne({_id: offer.dog});
            })
        );
        return offers.map((offer)=>{
            const{
                profile, name, _id
            } = offer.dog;
            return{
                imageSrc: profile,
                name,
                link: `/DogProfile/${_id}`,
                size: 100,
                topLeft: '$$$',
                offer
            }
        });
      }
    }
  )
};
