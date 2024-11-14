/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

$("#step").on("click",     () => zealcom.step());
$("#stepover").on("click", () => zealcom.step_over());
$("#reset").on("click",    () => zealcom.reset());
$("#continue").on("click", () => zealcom.cont());
$("#pause").on("click", () => zealcom.stop());
$("#clean").on("click",    () => {
    zealcom.restart();
    resetRom();
});


function showPauseView() {
    $("#continue").hide();
    $("#pause").show();
}

function showContinueView() {
    $("#continue").show();
    $("#pause").hide();
}

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

$('#web-serial-connect').on('click', (e) => {
    const $button = $(e.currentTarget);
    $button.blur();
    if(zealcom.uart.type == 'web-serial' && zealcom.uart.opened) {
        return zealcom.uart.close().then(() => {
            $button.text("Connect Serial");

            $('#uart-tab').show();
            $('#uartview').show();
        });
    }

    // const usbVendorId = 0xabcd;
    navigator.serial
        // .requestPort({ filters: [{ usbVendorId }] })
        .requestPort()
        .then(async (port) => {
            console.log('requested', port);
            port.open({
                baudRate: 57600,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                flowControl: 'none',
                bufferSize: 1,
            }).then(() => {
                zealcom.set_serial('web-serial');
                zealcom.uart.open(port).then(() => {
                    $button.text("Disconnect Serial");

                    $('#uartview').fadeOut();
                    $('#uart-tab').fadeOut();
                    $('.tabs :first-child').trigger('click');
                })
            });
        })
        .catch((e) => {
            // The user didn't select a port.
            console.warn('user failed to select a port, ignoring');
        });
});

$('#canvas-smooth-val').on('change', (e) => {
    const smooth = e.currentTarget.checked;
    localStorage.setItem('canvas-smooth', JSON.stringify(smooth));
    if(smooth) {
        $('#screen').addClass('no-pixels');
    } else {
        $('#screen').removeClass('no-pixels');
    }
})

$('#t-state-logger-val').on('change', (e) => {
    const tstate = e.currentTarget.checked;
    localStorage.setItem('t-state-logger', tstate);
    TStateLogger = tstate;
});

$('#screen-capture').on('click', () => {
    console.log('capture screen');
    const canvas = document.getElementById('screen');
    const image = canvas.toDataURL();
    console.log('image', image);

    const link = document.createElement('a');
    link.href = image;
    link.download = 'zeal-screenshot.png';
    link.click();
});

$('#theater-mode').on('click', () => {
    console.log('theater-mode', 'click');

    $('#toppanel').toggleClass('theater-mode');
});

$('#container .close').on('click', () => {
    $('#toppanel').toggleClass('theater-mode');
})

jQuery(() => {
    $('#continue').hide();
    $('#pause').show();

    let menus = JSON.parse(localStorage.getItem('menus')) ?? {};
    Object.entries(menus).map((entry) => {
        const [k,v] = entry;
        if(v) $(`#${k}`).addClass('visible');
    });


    const smooth = JSON.parse(localStorage.getItem('canvas-smooth') ?? false);
    $('#canvas-smooth-val').attr('checked', smooth).trigger('change');

    const tstate = JSON.parse(localStorage.getItem('t-state-logger') ?? false);
    $('#t-state-logger-val').attr('checked', tstate).trigger('change');

    if(!navigator || !navigator.serial) {
        // disable web serial, only supported in latest Chrome, Edge and Opera
        $('#web-serial-settings').hide();
    }
});