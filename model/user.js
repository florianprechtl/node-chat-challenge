const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    chatcolor: {
        type: Sequelize.STRING(7),
        defaultValue: '#000000',
    },
    imagePath: Sequelize.STRING,
});

module.exports = User;
