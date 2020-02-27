const express = require('express');
const router = express.Router();

const authController = require('../controller/auth');

const checkAuthentificationNegative = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        next();
    } else {
        return res.redirect('/chat');
    }
};

router.get('/login', checkAuthentificationNegative, authController.getLogin);

router.get('/signup', checkAuthentificationNegative, authController.getSignup);

router.post('/signup', authController.postSignup);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/', checkAuthentificationNegative, authController.redirectToLogin);

module.exports = router;
