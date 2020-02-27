const jwt = require('jsonwebtoken');
const dns = require('dns');
ChatMessage = require('../model/chat-message');
PrivateChat = require('../model/private-chat');

exports.initServer = (io, http, app) => {
    const connectedUsers = [];
    // Socket Event Handling

    io.on('connection', async socket => {
        let decodedToken;
        // Initial connect
        if (socket && socket.handshake && socket.handshake.query) {
            const query = socket.handshake.query;
            if (query.token && query.token !== 'null') {
                console.log('a user connected');

                // Get token and decode user information
                const token = query.token;
                jwt.verify(token, 'My Secret', (err, decoded) => {
                    if (err) {
                        socket.emit('get-new-token');
                        return;
                    } else {
                        decodedToken = jwt.decode(token, 'My Secret');
                        if (!decodedToken || !decodedToken.username) {
                            console.log(decodedToken);
                            return;
                        }
                    }
                });
            } else {
                return;
            }
            if (query.type && query.type === 'group') {
                socket.join('group-chat');

                // Get list of all connected users and then inform all chats about the newly connected user
                socket.emit('already-connected-users', connectedUsers);
                socket.to('group-chat').emit('user-connected', {
                    username: decodedToken.username,
                    userId: decodedToken.userId,
                    usercolor: decodedToken.usercolor,
                });

                // Update own list of connected users
                connectedUsers.push({
                    username: decodedToken.username,
                    userId: decodedToken.userId,
                    usercolor: decodedToken.usercolor,
                });
                console.table(connectedUsers);

                // Disconnect
                socket.on('disconnect', function() {
                    console.log('user disconnected');

                    if (decodedToken && decodedToken.username) {
                        // Remove disconnected user from own list and inform other chats about the disconnect
                        const index = connectedUsers.findIndex(user => user.userId === decodedToken.userId);
                        socket.to('group-chat').emit('user-disconnected', {
                            username: decodedToken.username,
                            userId: decodedToken.userId,
                            usercolor: decodedToken.usercolor,
                        });
                        connectedUsers.splice(index, 1);
                        console.table(connectedUsers);
                    }
                });

                // Public chat message
                socket.on('message', function(message) {
                    if (decodedToken) {
                        socket.to('group-chat').broadcast.emit('broadcast-message', message, {
                            username: decodedToken.username,
                            userId: decodedToken.userid,
                            usercolor: decodedToken.usercolor,
                        });
                    }
                });
            }
            if (query.type && query.type === 'private') {
                if (query.chatId) {
                    const chat_Id = query.chatId;
                    let privateChat;

                    // Get private chat
                    try {
                        privateChat = await PrivateChat.findOne({
                            where: {
                                id: chat_Id,
                            },
                            raw: true,
                        });
                    } catch (err) {
                        console.log(err);
                    }

                    // Get receiver id
                    const receiver_Id =
                        privateChat.chatpartnerone_Id === decodedToken.userId
                            ? privateChat.chatpartnertwo_Id
                            : privateChat.chatpartnerone_Id;

                    // Join socket group
                    const group = `private-chat-${chat_Id}`;
                    socket.nickname = decodedToken.userId;
                    socket.join(group);
                    console.log(`user connected to ${group}`);

                    // Public chat message
                    socket.on('private-message', message => {
                        if (decodedToken) {
                            // Create chat message
                            // And check if receiver is online while sending
                            io.of('/').adapter.clients([group], (err, clients) => {
                                console.log(clients);
                                const read = clients.length === 2;
                                const chatMessage = new ChatMessage({
                                    message: message,
                                    sender_Id: decodedToken.userId,
                                    receiver_Id: receiver_Id,
                                    chat_Id: chat_Id,
                                    read: read,
                                });
                                // Send message to backend
                                try {
                                    chatMessage.save();
                                } catch (err) {
                                    console.log(err);
                                }
                            });

                            // broadcast message to other sockets, in case of future private group chats
                            socket.to(group).broadcast.emit('private-message', message, {
                                username: decodedToken.username,
                                userId: decodedToken.userId,
                                usercolor: decodedToken.usercolor,
                            });
                        }
                    });
                }
            }
        }
    });

    http.listen(80, function() {
        dns.lookup(require('os').hostname(), function(err, add, fam) {
            console.log(`listening on ${add}:80`);
        });
    });
};
