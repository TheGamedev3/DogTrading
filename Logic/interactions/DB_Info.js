const { db_object } = require('@MongooseAPI');

module.exports = {
  DB_Info: db_object(
    'DB_Info',
    {
      seeded: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    {
      async fetchSingleton() {
        let doc = await this.findOne();
        if (!doc) {
          doc = await this.create({});
        }
        return doc;
      },

      async modify(props) {
        const doc = await this.fetchSingleton();
        Object.assign(doc, props);
        return await doc.save();
      }
    },
    { allowExtraFields: true }
  )
};
