const Sequelize = require('sequelize');
const conf = require('./conf').database;

const sequelize = new Sequelize(conf.name, conf.user, conf.password, {
  dialect: conf.dialect,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  storage: conf.path,
});

module.exports = sequelize;
