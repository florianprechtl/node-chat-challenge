$(document).ready(function() {
    $('.private-chat-list-item')
        .on('click', event => {
            const id = event.target.id;
            const chatId = id.substr(15);
            window.location.href = '/private-chat/' + chatId;
        })
        .children()
        .on('click', function(event) {
            event.target.parentElement.click();
            event.stopPropagation();
        });
});
