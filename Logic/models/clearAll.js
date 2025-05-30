
module.exports = {
  async clearAll() {
    // Safety switch: only allow mass-deletion in a *test* database
    if (process.env.NODE_ENV !== 'test') {
      throw new Error("Refusing to clear a non-test database!");
    }

    const tables = require('@Chemicals');

    await Promise.all(
      Object.values(tables).map((model) => model.deleteMany({}))
    );
  }
};
