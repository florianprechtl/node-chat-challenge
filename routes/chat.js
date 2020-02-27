const express = require('express');
const router = express.Router();

const chatController = require('../controller/chat');

const checkAuthentification = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        return res.redirect('/');
    }
};

router.get('', checkAuthentification, chatController.getChat);

module.exports = router;
