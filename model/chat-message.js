const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ChatMessage = sequelize.define('chatmessage', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    message: Sequelize.STRING,
    read: Sequelize.BOOLEAN,
});

module.exports = ChatMessage;
