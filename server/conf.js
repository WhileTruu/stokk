const path = require('path');

module.exports = {
  database: {
    dialect: 'sqlite',
    name: 'stokk',
    path: path.join(__dirname, '/database.sqlite'),
    user: 'JBOY',
    password: 'JEKATERINA_JAYLORD2',
  },
};