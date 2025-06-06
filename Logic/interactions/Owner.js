

const {db_object, FieldError, err_catcher} = require('@MongooseAPI');

const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

module.exports = {
    Owner: db_object(
        'Owner',
        {
            name: {
                type: String,
                required: false,
                unique: false
            },
            email: {
                type: String,
                required: [true, 'Please enter an email'],
                unique: true,
                lowercase: true,
                validate: [isEmail, 'Please enter a valid email']
            },
            password: {
                type: String,
                required: [true, 'Please enter a password'],
                minlength: [6, 'Minimum password length is 6 characters'],
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
            async saveAs(){
                const salt = await bcrypt.genSalt();
                this.password = await bcrypt.hash(this.password, salt);
            },
            async login(email, password){
                return await err_catcher(async()=>{
                    const user = await this.findOne({ email });
                    if (user) {
                        const auth = await bcrypt.compare(password, user.password);
                        if(auth)return user;
                        throw new FieldError('password', 'incorrect password');
                    }
                    throw new FieldError('email', 'incorrect email');
                });
            },
            async signup(email, password){
                return await err_catcher(async()=>{
                    return await this.create({email, password});
                },
                    {code: 11000, field: 'email', reason: 'this email is already registered!'}
                );
            },
            async fetchUser(id){
                return await this.findOne({ _id:id });
            },
            async isReal(id){
                if(id === undefined){return id}
                return await this.exists({ _id: id });
            },
            async modify(ownerId, props){
                const owner = await this.findOne({ _id: ownerId });
                if(!owner)throw new FieldError('ownerId', 'Owner does not exist');

                const cantModify = ['_id'];
                const keys = Object.keys(props);
                const notAllowed = cantModify.filter(item=>keys.includes(item));
                if(notAllowed.length > 0)throw new FieldError('props', `Attempted to modify: ${notAllowed.join(', ')} under Owner!`);

                if(props.password || props.email){
                    const oldPassword = props.oldPassword;
                    if(!oldPassword)throw new FieldError('password', 'must retype old password to change email or password!');
                    delete props.oldPassword;
                    const auth = await bcrypt.compare(oldPassword, owner.password);
                    if(!auth)throw new FieldError('oldPassword', 'incorrect old password!');
                }

                Object.assign(owner, props);
                return await owner.save();
            },

            // used for concatenating all the data needed to display a user's page
            async pageData(userId){
                const{Dog, Offer} = require('@Chemicals');

                const pageUser = await this.findOne({ _id: userId }).lean();
                pageUser.myDogs = await Dog.getIconData(await Dog.DogsOf(pageUser._id, "newest"));
                pageUser.myOffers = await Offer.getIconData(await Offer.OffersOf(pageUser._id, "newest"));
                return pageUser;
            },

            // used for debug/seeding
            async createDummy(props){
                return await this.create(props);
            },

            async delete(ownerId){
                const deleted = await this.findByIdAndDelete(ownerId);
                if (!deleted) throw new FieldError('ownerId', 'Owner does not exist or was already deleted');
                return deleted;
            },

            getIconData(owners){
                return owners.map(({
                    profile, name, _id
                })=>{
                return{
                    imageSrc: profile,
                    name,
                    link: `/UserProfile/${_id}`,
                    size: 100,
                    topLeft: ''
                }});
            }
        }
    )
};
