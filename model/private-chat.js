const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const PrivateChat = sequelize.define('privatechat', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
});

module.exports = PrivateChat;
