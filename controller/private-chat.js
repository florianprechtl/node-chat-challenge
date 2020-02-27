const PrivateChat = require('../model/private-chat');
const User = require('../model/user');
const ChatMessage = require('../model/chat-message');
const Sequelize = require('sequelize');

exports.getPrivateChatList = (req, res, next) => {
    const userId = req.session.user.id;
    PrivateChat.findAll({
        where: Sequelize.or({ chatpartnertwo_Id: userId }, { chatpartnerone_Id: userId }),
        include: [
            {
                model: User,
                as: 'chatpartnerone',
            },
            {
                model: User,
                as: 'chatpartnertwo',
            },
        ],
    })
        .then(chats => {
            return chats.map(chat => {
                let chatPartner = null;
                if (req.session.user.id === chat.chatpartnerone_Id) {
                    chatPartner = chat.chatpartnertwo;
                } else {
                    chatPartner = chat.chatpartnerone;
                }
                return User.findOne({
                    where: { id: chatPartner.id },
                    raw: true,
                }).then(user => {
                    return {
                        id: chat.id,
                        chatPartner: user,
                    };
                });
            });
        })
        .then(chatsPromisses => {
            return Promise.all(chatsPromisses);
        })
        .then(chats => {
            return chats.map(chat => {
                return ChatMessage.findAll({
                    where: {
                        chat_Id: chat.id,
                        read: false,
                        receiver_Id: req.session.user.id,
                    },
                    raw: true,
                }).then(messages => {
                    return {
                        ...chat,
                        newMessagesCount: messages.length,
                    };
                });
            });
        })
        .then(chatsPromisses => {
            return Promise.all(chatsPromisses);
        })
        .then(chats => {
            res.render('private-chat/private-chat-list', {
                path: '/private-chat',
                pageTitle: 'Private Chat List',
                authenticated: req.session.isLoggedIn,
                chats: chats,
                currentUser: req.session.user,
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.createNewPrivateChat = (req, res, next) => {
    const chatPartnerOne = req.session.user.id;
    const chatPartnerTwo = req.params.id;

    PrivateChat.findOne({
        where: Sequelize.or(
            Sequelize.and(
                {
                    chatpartnerone_Id: chatPartnerOne,
                },
                {
                    chatpartnertwo_Id: chatPartnerTwo,
                }
            ),
            Sequelize.and(
                {
                    chatpartnerone_Id: chatPartnerTwo,
                },
                {
                    chatpartnertwo_Id: chatPartnerOne,
                }
            )
        ),
    }).then(chat => {
        if (!chat) {
            const privateChat = new PrivateChat({
                chatpartnerone_Id: chatPartnerOne,
                chatpartnertwo_Id: chatPartnerTwo,
            });
            privateChat
                .save()
                .then(result => {
                    User.findOne({ where: { id: chatPartnerTwo } }).then(user => {
                        loadOldMessages(result.id, req.session.user.id).then(oldMessages => {
                            res.render('private-chat/private-chat', {
                                path: `/private-chat/${result.id}`,
                                pageTitle: 'Private Chat',
                                authenticated: req.session.isLoggedIn,
                                chatPartner: user,
                                chatId: result.id,
                                userId: req.session.user.id,
                                oldMessages: oldMessages,
                                currentUser: req.session.user,
                            });
                        });
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        } else {
            User.findOne({ where: { id: chatPartnerTwo } }).then(user => {
                loadOldMessages(chat.id, req.session.user.id).then(oldMessages => {
                    res.render('private-chat/private-chat', {
                        path: `/private-chat/${chat.id}`,
                        pageTitle: 'Private Chat',
                        authenticated: req.session.isLoggedIn,
                        chatPartner: user,
                        chatId: chat.id,
                        userId: req.session.user.id,
                        oldMessages: oldMessages,
                        currentUser: req.session.user,
                    });
                });
            });
        }
    });
};

exports.getPrivateChat = (req, res, next) => {
    const chatId = req.params.id;
    PrivateChat.findOne({
        include: [
            {
                model: User,
                as: 'chatpartnerone',
            },
            {
                model: User,
                as: 'chatpartnertwo',
            },
        ],
        where: {
            id: chatId,
        },
    }).then(chat => {
        let chatPartner = null;
        if (req.session.user.id === chat.chatpartnerone_Id) {
            chatPartner = chat.chatpartnertwo;
        } else {
            chatPartner = chat.chatpartnerone;
        }
        loadOldMessages(chat.id, req.session.user.id).then(oldMessages => {
            res.render('private-chat/private-chat', {
                path: `/private-chat/${req.params.id}`,
                pageTitle: 'Private Chat',
                authenticated: req.session.isLoggedIn,
                chatPartner: chatPartner,
                chatId: chat.id,
                userId: req.session.user.id,
                oldMessages: oldMessages,
                currentUser: req.session.user,
            });
        });
    });
};

const loadOldMessages = (chat_Id, receiver_Id) => {
    ChatMessage.findAll({
        where: {
            chat_Id: chat_Id,
            receiver_Id: receiver_Id,
            read: false,
        },
    }).then(messages => {
        messages.forEach(message => {
            message.update({
                read: true,
            });
        });
    });

    return ChatMessage.findAll({ where: { chat_Id: chat_Id }, raw: true }).then(messages => {
        return messages.map(message => {
            const date = new Date(message.createdAt);
            const time =
                (date.getHours() < 10 ? '0' : '') +
                date.getHours() +
                ':' +
                (date.getMinutes() < 10 ? '0' : '') +
                date.getMinutes();
            return {
                message: message.message,
                sender_Id: message.sender_Id,
                time: time,
            };
        });
    });
};
