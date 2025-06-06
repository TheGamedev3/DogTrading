
const { v4: uuidv4 } = require('uuid');

class MiniModel {
  constructor(name, schemaDef, methods = {}, extraSettings = {}) {
    this.name = name;
    this.data = [];
    this.schemaDef = schemaDef;
    this.methods = methods;
    this.allowExtraFields = extraSettings.allowExtraFields;
    Object.assign(this, methods);
  }

  normalizeFieldSchema(schemaEntry) {
    return typeof schemaEntry === 'object' && schemaEntry !== null && 'type' in schemaEntry
      ? schemaEntry
      : { type: schemaEntry };
  }

  validate(doc) {
    for (const key in doc) {
      if (!(key in this.schemaDef) && !this.allowExtraFields) {
        throw new Error("Unexpected field: " + key);
      }
    }

    for (const key in this.schemaDef) {
      const schemaEntry = this.normalizeFieldSchema(this.schemaDef[key]);
      const isRequired = schemaEntry.required === true;
      const hasValue = doc[key] !== undefined;

      if (isRequired && !hasValue) {
        throw new Error(`Missing required field: ${key}`);
      }
    }
  }

  applyDefaults(doc) {
    for (const key in this.schemaDef) {
      const schemaEntry = this.normalizeFieldSchema(this.schemaDef[key]);
      if (doc[key] === undefined && 'default' in schemaEntry) {
        doc[key] = typeof schemaEntry.default === 'function'
          ? schemaEntry.default()
          : schemaEntry.default;
      }
    }
  }

  bindSave(doc) {
    if (!doc || typeof doc !== 'object') return doc;
    if (typeof doc.save === 'function') return doc;
    const bound = { ...doc };
    bound.save = async () => {
      const index = this.data.findIndex(d => d._id === bound._id);
      if (index !== -1) {
        this.data[index] = { ...bound };
      } else {
        this.data.push({ ...bound });
      }
      return bound;
    };
    return bound;
  }

  async _exec_find(query) {
    return this.data.filter(item =>
      Object.entries(query).every(([k, v]) => item[k] === v)
    );
  }

  async _exec_findOne(query) {
    return this.data.find(item =>
      Object.entries(query).every(([k, v]) => item[k] === v)
    ) || null;
  }

  async _exec_exists(query) {
    return this.data.some(item =>
      Object.entries(query).every(([k, v]) => item[k] === v)
    );
  }

  async _exec_findByIdAndDelete(id) {
    const index = this.data.findIndex(item => item._id === id);
    if (index !== -1) {
      const [deleted] = this.data.splice(index, 1);
      return deleted;
    }
    return null;
  }

  find(query = {}) {
    return new MiniQuery(this, 'find', query);
  }

  findOne(query = {}) {
    return new MiniQuery(this, 'findOne', query);
  }

  exists(query = {}) {
    return new MiniQuery(this, 'exists', query);
  }

  findByIdAndDelete(id) {
    return new MiniQuery(this, 'findByIdAndDelete', id);
  }

  async create(doc) {
    this.applyDefaults(doc);
    this.validate(doc);
    const entry = { ...doc, _id: uuidv4() };
    if (!entry.created) entry.created = new Date();
    this.data.push(entry);
    return this.bindSave(entry);
  }

  async deleteMany(query = {}) {
    const before = this.data.length;
    this.data = this.data.filter(item => !Object.entries(query).every(([k, v]) => item[k] === v));
    return { deletedCount: before - this.data.length };
  }

  async countDocuments() {
    return this.data.length;
  }
}

class MiniQuery {
  constructor(model, op, criteria) {
    this.model = model;
    this.op = op;
    this.criteria = criteria;
    this._useLean = false;
    this._sort = null;
    this._skip = 0;
    this._limit = Infinity;
  }

  sort(obj) {
    this._sort = obj;
    return this;
  }

  skip(num) {
    this._skip = num;
    return this;
  }

  limit(num) {
    this._limit = num;
    return this;
  }

  lean() {
    this._useLean = true;
    return this;
  }

  async exec() {
    let results = await this.model[`_exec_${this.op}`](this.criteria);
    if (Array.isArray(results)) {
      if (this._sort) {
        const [key, dir] = Object.entries(this._sort)[0];
        results.sort((a, b) => dir * ((a[key] > b[key]) ? 1 : (a[key] < b[key]) ? -1 : 0));
      }
      results = results.slice(this._skip, this._skip + this._limit);
      return this._useLean ? results.map(r => ({ ...r })) : results.map(r => this.model.bindSave(r));
    }
    return this._useLean ? { ...results } : this.model.bindSave(results);
  }

  then(res, rej) {
    return this.exec().then(res, rej);
  }
}

function db_object(name, schemaDef, methods = {}, extraSettings = {}) {
  const model = new MiniModel(name, schemaDef, methods, extraSettings);
  for (const key in methods) {
    if (typeof methods[key] === 'function') {
      model[key] = methods[key].bind(model);
    }
  }
  return model;
}


async function onConnect() {
  // No-op for offline mode
  const { DB_Info } = require('@Chemicals');
  const { seedDatabase } = require('@MongooseAPI');
  await seedDatabase();
  await DB_Info.modify({ seeded: true });
  return true;
}


module.exports = { db_object };
