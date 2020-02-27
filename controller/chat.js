exports.getChat = (req, res, next) => {
    res.render('chat/chat', {
        pageTitle: 'Chat',
        path: '/chat',
        authenticated: req.session.isLoggedIn,
        currentUser: req.session.user,
    });
};
