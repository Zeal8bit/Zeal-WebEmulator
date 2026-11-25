/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function saveMenuState() {
    const menus = {};
    $('.menu').each(function() {
        const id = $(this).attr('id');
        menus[id] = $(this).hasClass('visible');
    });
    localStorage.setItem('menus', JSON.stringify(menus));
}

/**
 * Events for all menus and their content: breakpoints, CPU control, etc...
 */
 const right_arrow_src = "imgs/right-arrow.png";
 const down_arrow_src = "imgs/down-arrow.png";


$(".menutitle").on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    $(this).parent().toggleClass('visible');
    saveMenuState();
});

$("#theme").on("change", function() {
    $(":root").removeClass();
    $(":root").addClass($(this).val());
})

$('#canvas-smooth-val').on('change', (e) => {
    const smooth = e.currentTarget.checked;
    localStorage.setItem('canvas-smooth', JSON.stringify(smooth));
    if(smooth) {
        $('#zeal-screen').addClass('no-pixels');
    } else {
        $('#zeal-screen').removeClass('no-pixels');
    }
})

$('#screen-capture').on('click', () => {
    console.log('capture screen');
    const canvas = document.getElementById('zeal-screen');
    const image = canvas.toDataURL();
    console.log('image', image);

    const link = document.createElement('a');
    link.href = image;
    link.download = 'zeal-screenshot.png';
    link.click();
});

$('#theater-mode').on('click', () => {
    $('#toppanel').toggleClass('theater-mode');
});

window.fullscreenMode = false;
$('#fullscreen-mode').on('click', () => {
    const canvas = document.querySelector('#container canvas');

    if(document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
    } else {
        if(canvas && canvas.requestFullscreen) {
            canvas.requestFullscreen({
                navigationUI: "hide",
            });
        }
    }
});

$('#container .close').on('click', () => {
    $('#toppanel').toggleClass('theater-mode');
})

jQuery(() => {
    let menus = JSON.parse(localStorage.getItem('menus')) ?? {};
    Object.entries(menus).map((entry) => {
        const [k,v] = entry;
        if(v) $(`#${k}`).addClass('visible');
    });


    const smooth = JSON.parse(localStorage.getItem('canvas-smooth') ?? false);
    $('#canvas-smooth-val').attr('checked', smooth).trigger('change');

    const canvas = document.querySelector('#container canvas');
    if(canvas && canvas.requestFullscreen) {
        $('#fullscreen-mode').show();
    }

});
