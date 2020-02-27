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

const socket = io({
    query: {
        token: token,
        type: 'private',
        chatId: $('#chatId').val(),
    },
});

const appendAndScrollDown = newMessage => {
    $(newMessage)
        .hide()
        .appendTo('#chat_feed')
        .slideDown(200);
    $('#chat_feed').animate({ scrollTop: $('#chat_feed').prop('scrollHeight') }, 1000);
};

$(document).ready(function() {
    // Scroll down to last message
    $('#chat_feed').scrollTop($('#chat_feed').prop('scrollHeight'));
    // Receive new message
    socket.on('private-message', (message, user) => {
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
        event.preventDefault();
        event.stopPropagation();
        const token = sessionStorage.getItem('auth-token-optware-chat');
        const message = document.getElementById('chat_input').value;

        // Send message to server
        socket.emit('private-message', message, token);

        // Post message to the left side of the chat feed and scroll down
        const date = new Date();
        const time =
            (date.getHours() < 10 ? '0' : '') +
            date.getHours() +
            ':' +
            (date.getMinutes() < 10 ? '0' : '') +
            date.getMinutes();
        const newMessage = $(`
            <div class="chat-message-container message-left">
                <p class="chat-sender optware-green">Du</p>
                <p class="chat-message">${message}</p>
                <p class="chat-message-time">${time}</p>
            </div>`);
        appendAndScrollDown(newMessage);
        $('#chat_input').val('');
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
