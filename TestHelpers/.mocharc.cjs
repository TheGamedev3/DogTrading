

/*

when running tests DIRECTLY with mocha
like:

npm run unit -- middlewares/__test__/CORS.test.cjs

this script, helps expose all the _moduleAliases,
like '@TestSuite' to the tests!

*/

require('module-alias/register');

module.exports = {
  require: ['module-alias/register'],
  spec: ['middlewares/__test__/**/*.test.cjs']
};
