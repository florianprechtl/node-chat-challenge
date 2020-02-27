const express = require('express');
const router = express.Router();
const usersController = require('../controller/users');

const checkAuthentification = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        return res.redirect('/');
    }
};

router.get('/', checkAuthentification, usersController.getUsers);

module.exports = router;
