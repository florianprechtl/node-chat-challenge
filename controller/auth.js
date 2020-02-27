const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        authenticated: req.session.isLoggedIn,
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        authenticated: req.session.isLoggedIn,
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findAll({
        limit: 1,
        where: {
            email: email,
        },
    })
        .then(users => {
            if (users.length === 0) {
                return res.redirect('/login');
            }
            const user = users[0];
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(() => {
                            const token = jwt.sign(
                                {
                                    username: user.name,
                                    usercolor: user.chatcolor,
                                    useremail: user.email,
                                    userId: user.id,
                                },
                                'My Secret'
                            );
                            res.setHeader('Set-Cookie', 'auth-token-optware-chat=' + token + ';Path=/');
                            res.redirect('/chat');
                        });
                    } else {
                        res.redirect('/login');
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (confirmPassword !== password) {
        res.status(400).redirect('/signup');
    }
    User.findAll({
        limit: 1,
        where: {
            email: email,
        },
    })
        .then(userDoc => {
            if (userDoc.length > 0) {
                console.log('user does already exist');
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        name: name,
                        email: email,
                        password: hashedPassword,
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

exports.redirectToLogin = (req, res, next) => {
    res.redirect('/login');
};
