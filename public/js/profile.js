$(document).ready(function() {
    changeColor();

    $('#chat_color').on('keyup', changeColor);

    $('#chat_color').on('keypress', function() {
        const val = $(this).val();
        if (val.substr(0, 1) !== '#' && event.key !== '#') {
            $(this).val('#' + val);
        }
    });

    $('#chat_color').on('keypress', function() {
        const val = $(this).val();
        if (val.substr(0, 1) !== '#' && event.key !== '#') {
            $(this).val('#' + val);
        }
    });
});

const changeColor = () => {
    const color = $('#chat_color').val();
    let r = parseInt(color.substr(1, 2), 16);
    r = r ? r : 0;
    let g = parseInt(color.substr(3, 2), 16);
    g = g ? g : 0;
    let b = parseInt(color.substr(5, 2), 16);
    b = b ? b : 0;
    $('#chat_color').css('background-color', `rgb(${r}, ${g}, ${b})`);
    $('#chat_color').css('color', `rgb(${255 - r}, ${255 - g}, ${255 - b})`);
    console.log(r, g, b);
};
