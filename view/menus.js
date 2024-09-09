/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

$("#step").on("click",     () => zealcom.step());
$("#stepover").on("click", () => zealcom.step_over());
$("#reset").on("click",    () => zealcom.reset());
$("#clean").on("click",    () => {
    zealcom.restart();
    resetRom();
});

function togglePauseContinue() {
    $("#continue").toggleClass("hidden");
    $("#pause").toggleClass("hidden");
}

$("#continue").on("click", () => {
    zealcom.cont();
    togglePauseContinue();
});

$("#pause").on("click", () => {
    zealcom.stop();
    togglePauseContinue();
});

/**
 * Events for all menus and their content: breakpoints, CPU control, etc...
 */
 const right_arrow_src = "imgs/right-arrow.png";
 const down_arrow_src = "imgs/down-arrow.png";


$(".menutitle").on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    /* Check if the content is shown or hidden */
    const content = $(this).next(".menucontent");
    const title = $(this).children(".menuicon");

    const visible = content.hasClass('visible');
    var new_src = visible ? right_arrow_src : down_arrow_src;

    title.fadeOut(120, function () {
        title.attr('src', new_src);
        title.fadeIn(160);
    });
    if(visible) {
        content.removeClass('visible');
    } else {
        content.addClass('visible');
    }
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

jQuery(() => {
    if(!navigator || !navigator.serial) {
        // disable web serial, only supported in latest Chrome, Edge and Opera
        $('#web-serial-settings').hide();
    }
});