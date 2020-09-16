const Sequelize = require('sequelize');

// Initialize your own Postgres DB in advance and adjust the credentials accordingly
const sequelize = new Sequelize('chat-challenge', 'postgres', 'anyPasswordYouChoose', {
    logging: false,
    host: 'localhost',
    dialect: 'postgres',
});

module.exports = sequelize;
