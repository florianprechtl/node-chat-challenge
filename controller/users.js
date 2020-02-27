const User = require('../model/user');

exports.getUsers = (req, res, next) => {
    User.findAll({
        order: [['id', 'ASC']],
    })
        .then(users => {
            users = users.map(user => {
                return {
                    name: user.name,
                    email: user.email,
                    id: user.id,
                    chatcolor: user.chatcolor,
                };
            });
            res.render('users/users', {
                path: '/users',
                pageTitle: 'Benutzerliste',
                authenticated: req.session.isLoggedIn,
                users: users,
                currentUser: req.session.user,
            });
        })
        .catch(err => {
            console.log(err);
        });
};
