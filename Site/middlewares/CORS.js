

const cors = require('cors');
const { link } = require('../launcher');

module.exports = cors({
  origin: [link], // allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
});
