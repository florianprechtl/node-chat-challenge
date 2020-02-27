const express = require('express');
const router = express.Router();
const profileController = require('../controller/profile');

const checkAuthentification = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        return res.redirect('/');
    }
};

router.get('', checkAuthentification, profileController.getProfile);

router.post('/update', checkAuthentification, profileController.postProfile);

module.exports = router;
