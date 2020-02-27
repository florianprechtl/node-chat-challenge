const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getProfile = (req, res, next) => {
    User.findOne({
        where: { id: req.session.user.id },
        raw: true,
    }).then(user => {
        res.render('profile/profile', {
            pageTitle: 'Dein Profil',
            path: '/profile',
            authenticated: req.session.isLoggedIn,
            user: user,
            currentUser: req.session.user,
        });
    });
};

exports.postProfile = (req, res, next) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const newPasswordRepeat = req.body.newPasswordRepeat;
    const name = req.body.name;
    const chatcolor = req.body.chatColor;
    const id = req.session.user.id;
    const imagePath = req.file ? req.file.filename : null;

    const updatedBody = {};

    if (name) {
        updatedBody.name = name;
    }
    if (chatcolor) {
        updatedBody.chatcolor = chatcolor.toUpperCase();
    }
    if (imagePath) {
        updatedBody.imagePath = imagePath;
    }
    if (oldPassword && newPassword && newPasswordRepeat) {
        bcrypt
            .compare(oldPassword, req.session.user.password)
            .then(doMatch => {
                if (doMatch) {
                    if (newPasswordRepeat === newPassword) {
                        return bcrypt
                            .hash(newPassword, 12)
                            .then(hashedPassword => {
                                updatedBody.password = hashedPassword;
                                return updateProfile(updatedBody, id);
                            })
                            .then(result => {
                                for (let key in updatedBody) {
                                    req.session.user[key] = updatedBody[key];
                                }
                                const user = req.session.user;
                                const token = jwt.sign(
                                    {
                                        username: user.name,
                                        usercolor: user.chatcolor ? user.chatcolor : '',
                                        useremail: user.email,
                                        userid: user.id,
                                    },
                                    'My Secret'
                                );
                                res.setHeader('Set-Cookie', 'auth-token-optware-chat=' + token + ';Path=/');
                                res.status(200).redirect('/profile');
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(400);
                            });
                    }
                } else {
                    res.status(400);
                }
            })
            .catch(err => {
                console.log(err);
                res.status(400);
            });
    } else {
        updateProfile(updatedBody, id)
            .then(result => {
                for (let key in updatedBody) {
                    req.session.user[key] = updatedBody[key];
                }
                const user = req.session.user;
                const token = jwt.sign(
                    {
                        username: user.name,
                        usercolor: user.chatcolor ? user.chatcolor : '',
                        useremail: user.email,
                        userid: user.id,
                    },
                    'My Secret'
                );
                res.setHeader('Set-Cookie', 'auth-token-optware-chat=' + token + ';Path=/');
                res.status(200).redirect('/profile');
            })
            .catch(err => {});
    }
};

const updateProfile = (updatedBody, id) => {
    return User.update(updatedBody, {
        where: { id: id },
    });
};
