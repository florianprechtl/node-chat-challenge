const Sequelize = require('sequelize');

const sequelize = new Sequelize('chat-challenge', 'postgres', 'hanalkush4wr', {
    logging: false,
    host: 'localhost',
    dialect: 'postgres',
});

module.exports = sequelize;
