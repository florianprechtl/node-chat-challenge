const express = require('express');
const router = express.Router();

const privateChatController = require('../controller/private-chat');

const checkAuthentification = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        return res.redirect('/');
    }
};

router.get('/', checkAuthentification, privateChatController.getPrivateChatList);

router.get('/:id', checkAuthentification, privateChatController.getPrivateChat);

router.get('/user/:id', checkAuthentification, privateChatController.createNewPrivateChat);

module.exports = router;
