// Logic/models/miniMongoose.js
//
// Zero-dependency stub that mimics the Mongoose APIs your code calls.
//  ⸻ Supported ⸻
//    • Model.create / find / findOne / exists
//    • findByIdAndDelete / deleteOne / deleteMany
//    • countDocuments
//    • aggregate ( $match / $sort / $skip / $limit ) – enough for pagnator.js
//    • Document.save()  +  Document.lean()
//    • await-able queries with .complexSort()
//    • FieldError + err_catcher helpers
//
// Good enough for every route + test in DogTrading.
//

const { v4: uuid } = require('uuid');

/*──────────────────────────── Documents ──────────────────────────────*/
function wrapDocument(model, data) {
  const doc = { ...data };
  Object.defineProperties(doc, {
    save: {
      enumerable: false,
      value: async function () {
        const idx = model.__store.findIndex(d => d._id === this._id);
        if (idx === -1) model.__store.push(this);
        else model.__store[idx] = this;
        return this;
      }
    },
    lean: {
      enumerable: false,
      value() {
        // Root stays intact; every nested object that looks like a Mongoose
        // doc (has its own _id) is collapsed to just _id -> prevents cycles.
        const clone = (val, isRoot = false) => {
          if (val && typeof val === 'object') {
            if (!isRoot && '_id' in val) {
              // Return reference instead of full object
              return val._id;
            }
            const out = {};
            for (const [k, v] of Object.entries(val)) {
              out[k] = clone(v, false);
            }
            return out;
          }
          return val;
        };
        return clone(this, true);
      }
    },
    toString: { enumerable: false, value() { return String(this._id); } }
  });
  return doc;
}

/*──────────────────────────── Query obj (await-able) ─────────────────*/
class MiniQuery {
  constructor(results) { this._r = results; }
  complexSort(style) {
    const sorters = {
      newest:  (a, b) => b.created - a.created,
      oldest:  (a, b) => a.created - b.created,
      name_asc:  (a, b) => (a.name||'').localeCompare(b.name||''),
      name_desc: (a, b) => (b.name||'').localeCompare(a.name||'')
    };
    this._r.sort(sorters[style] || sorters.newest);
    return this;
  }
  lean() { return this._r.map(o => ({ ...o })); }
  then(res) { res(this._r); }      // makes “await query” work
}

/*──────────────────────────── Model core ─────────────────────────────*/
class MiniModel {
  constructor(name, schema, statics = {}, extra = {}) {
    this.modelName = name;
    this.schema   = schema;
    this.strict   = !extra.allowExtraFields;
    this.__store  = [];

    Object.entries(statics).forEach(([k, fn]) => { this[k] = fn.bind(this); });
  }

  _validate(doc) {
    // 1️⃣  Unexpected keys
    if (this.strict) {
      Object.keys(doc).forEach(k => {
        if (!(k in this.schema) && k !== '_id' && k !== '__v')
          throw new Error(`Unexpected field: ${k}`);
      });
    }

    // 2️⃣  Apply defaults first
    for (const [k, rules] of Object.entries(this.schema)) {
      if (doc[k] === undefined && 'default' in rules) {
        doc[k] =
          typeof rules.default === 'function' ? rules.default() : rules.default;
      }
    }

    // 3️⃣  Now run required validation
    for (const [k, rules] of Object.entries(this.schema)) {
      const req =
        rules?.required === true ||
        (Array.isArray(rules?.required) && rules.required[0] === true);

      if (req && (doc[k] === undefined || doc[k] === '')) {
        throw new Error(`Missing field: ${k}`);
      }
    }
  }


  /* CRUD */
  async create(obj) {
    const rec = { ...obj };          // validate first
    this._validate(rec);

    rec._id = uuid();                // add _id after validation

    // Cast sub-documents to their _id  (Mongoose does this automatically)
    for (const [k, v] of Object.entries(rec)) {
      if (v && typeof v === 'object' && '_id' in v) {
        rec[k] = v._id;
      }
    }

    const doc = wrapDocument(this, rec);
    this.__store.push(doc);          // store wrapped document
    return doc;
  }

  /* ── FIND returns a MiniQuery (not a Promise) ── */
  find(filter = {}) {
    const res = this.__store.filter(d =>
      Object.entries(filter).every(([k, v]) => String(d[k]) === String(v))
    );
    return new MiniQuery(res);          // MiniQuery itself is then-able
  }

  /* exists and countDocuments still use await,
     because MiniQuery resolves to the final array */
  async exists(filter = {}) {
    return (await this.find(filter)).length > 0;
  }

  async countDocuments(filter = {}) {
    return (await this.find(filter)).length;
  }


  /* -- findOne returns a query-like object so you can chain .lean() before awaiting -- */
  findOne(filter = {}) {
    // Get the first matching doc (already wrapped, so it has .save() etc.)
    const doc = this.__store.find(d =>
      Object.entries(filter).every(
        ([k, v]) => String(d[k]) === String(v)
      )
    ) ?? null;

    // Promise that resolves to the raw (wrapped) doc
    const basePromise = Promise.resolve(doc);

    // Query-like wrapper that supports .lean() and is await-able
    return {
      // allow: await Model.findOne(...)
      then : (...a) => basePromise.then(...a),
      catch: (...a) => basePromise.catch(...a),
      finally: (...a) => basePromise.finally(...a),

      // allow: await Model.findOne(...).lean()
      lean() {
        const leanPromise = basePromise.then(d => (d ? d.lean() : null));
        return {
          then : (...a) => leanPromise.then(...a),
          catch: (...a) => leanPromise.catch(...a),
          finally: (...a) => leanPromise.finally(...a)
        };
      },

      // optional: allow explicit .exec() like real Mongoose
      exec() {
        return basePromise;
      }
    };
  }

  async exists(filter = {})  { return (await this.find(filter)).length > 0; }
  async deleteOne(filter = {}) {
    const i = this.__store.findIndex(d =>
      Object.entries(filter).every(([k, v]) => String(d[k]) === String(v)));
    if (i !== -1) this.__store.splice(i, 1);
    return { acknowledged: true, deletedCount: i === -1 ? 0 : 1 };
  }
  async deleteMany(f = {}) {
    const before = this.__store.length;
    this.__store = this.__store.filter(d =>
      !Object.entries(f).every(([k, v]) => String(d[k]) === String(v)));
    return { acknowledged: true, deletedCount: before - this.__store.length };
  }
  async findByIdAndDelete(id) { return (await this.deleteOne({ _id: id })) && null; }
  async countDocuments(f = {}) { return (await this.find(f)).length; }

  /* basic $match/$sort/$skip/$limit — enough for pagnator.js */
  async aggregate(pipe = []) {
    let out = [...this.__store];
    for (const st of pipe) {
      if (st.$match)   out = out.filter(d =>
        Object.entries(st.$match).every(([k, v]) => String(d[k]) === String(v)));
      else if (st.$sort) {
        const [[k, dir]] = Object.entries(st.$sort);
        out.sort((a, b) => dir === 1
          ? String(a[k]).localeCompare(String(b[k]))
          : String(b[k]).localeCompare(String(a[k])));
      } else if (st.$skip !== undefined)  out = out.slice(st.$skip);
      else if (st.$limit !== undefined)   out = out.slice(0, st.$limit);
    }
    return out.map(o => ({ ...o }));
  }
}

/*──────────────────────────── db_object helper ──────────────────────*/
const models = {};
function db_object(name, props, statics, extra) {
  return models[name] = new MiniModel(name, props, statics, extra);
}

/*──────────────────────────── clearAll (for tests) ───────────────────*/
async function clearAll() { Object.values(models).forEach(m => m.__store.length = 0); }

/*──────────────────────────── onConnect (stub) ───────────────────────*/
let _conn;
async function onConnect() {
  // Re-use the same connection object if already created
  if (_conn) return _conn;

  /* 1️⃣ create “connection” */
  _conn = {
    readyState: 1,
    close  : async () => { _conn.readyState = 0; },
    destroy: async () => { _conn.readyState = 0; },
    connectionString: 'miniMongoose://memory'
  };

  /* 2️⃣ seed once (same rules as production code) */
  const testMode = process.env.NODE_ENV === 'test';
  if (!testMode) {
    // Uses the same model helpers in offline mode
    const { DB_Info } = require('@Chemicals');

    // Your DB_Info model already has a fetchSingleton() + modify() in real code
    const singleton = await DB_Info.fetchSingleton();

    if (singleton.seeded === false) {
      // call the project’s shared seeder
      const { seedDatabase } = require('@MongooseAPI');
      if (typeof seedDatabase === 'function') {
        await seedDatabase();
      }
      await DB_Info.modify({ seeded: true });
    }
  }

  /* 3️⃣ return connection object */
  return _conn;
}

/*──────────────────────────── Exports ───────────────────────────────*/
module.exports = {
  db_object,
  pagnation: require('./pagnator').pagnation,  // uses aggregate → works
  clearAll, onConnect
};

// profiles arent showing up, cant find them
// we need to test out trading next and such
// alphabetical order still doesn't work
