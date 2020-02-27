const getCookie = cname => {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
};

const token = getCookie('auth-token-optware-chat');
console.log(token);
const socket = io({
    query: {
        token: token,
        type: 'group',
    },
});

const appendAndScrollDown = newMessage => {
    $(newMessage)
        .hide()
        .appendTo('#chat_feed')
        .slideDown(200);
    $('#chat_feed').animate({ scrollTop: $('#chat_feed').prop('scrollHeight') }, 1000);
};

const appendConnectedUser = user => {
    $('#chat-connected-users').append(
        `
            <div class="connected-user-container" style="color: ${user.usercolor}" id="id_${user.userId}">
                <p>${user.username}</p>
            </div>`
    );
    $(`#id_${user.userId}`).on('click', event => {
        window.location.href = `/private-chat/user/${user.userId}`;
        event.stopPropagation();
    });
};

const removeDisconnectedUser = user => {
    $(`#id_${user.userId}`).remove();
};

$(document).ready(function() {
    let connectedUsers = [];

    // Get infored about already connected users
    socket.on('already-connected-users', users => {
        connectedUsers = users;
        for (let user of connectedUsers) {
            appendConnectedUser(user);
        }
    });

    // Get infored about newly connected users
    socket.on('user-connected', user => {
        connectedUsers.push(user);
        console.table(connectedUsers);
        appendConnectedUser(user);
    });

    // Get infored about disconnected users
    socket.on('user-disconnected', disconnectedUser => {
        connectedUsers.splice(connectedUsers.findIndex(user => user.userId === disconnectedUser.userId), 1);
        console.table(connectedUsers);
        removeDisconnectedUser(disconnectedUser);
    });

    // Receive new message
    socket.on('broadcast-message', (message, user) => {
        // Post message to the right side of the chat feed and scroll down
        const newMessage = $(`
            <div class="chat-message-container message-right">
                <p class="chat-sender" style="color: ${user.usercolor}">${user.username}</p>
                <p class="chat-message">${message}</p>
                <p class="chat-message-time">12:34</p>
            </div>`);
        appendAndScrollDown(newMessage);
    });

    // Send new broadcast-message to everyone
    $('#chat_form').on('submit', function() {
        const token = sessionStorage.getItem('auth-token-optware-chat');
        const message = document.getElementById('chat_input').value;

        // Send message to server
        socket.emit('message', message, token);

        // Post message to the left side of the chat feed and scroll down
        const newMessage = $(`
            <div class="chat-message-container message-left">
                <p class="chat-sender optware-green">Du</p>
                <p class="chat-message">${message}</p>
                <p class="chat-message-time">12:34</p>
            </div>`);
        appendAndScrollDown(newMessage);
        $('#chat_input').val('');
        event.preventDefault();
    });

    $('#chat_input').keydown(function(e) {
        // Enter was pressed without shift key
        if (e.keyCode == 13 && !e.shiftKey) {
            // prevent default behavior
            $('#chat_button').click();
            e.preventDefault();
        }
    });
});
