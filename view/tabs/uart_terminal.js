/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

let sending = false;
const sending_message = "Sending";
let dots_count = 3;

/* It is possible to send files as raw binary data on the UART, place
 * a listener on the send button for that */
$("#uart-file-send").on("click", function() {
    /* If we are already sending a file, do nothing */
    if (sending) {
        return;
    }

    /* Read the binary executable */
    let file = $("#uart-file")[0].files[0];
    let reader = new FileReader();
    reader.addEventListener('load', function(e) {
        let binary = e.target.result;
        sending = true;
        $("#sending").text(sending_message);
        $("#sending").visible();

        /* Animate the tailing dots */
        const interval = setInterval(function() {
            if (dots_count == 3) {
                dots_count = 0;
            } else {
                dots_count++;
            }
            const dots_str = '.'.repeat(dots_count);
            $("#sending").text(sending_message + dots_str);
        }, 333);

        setTimeout(function() {
            zealcom.uart.send_binary_array(binary, function() {
                sending = false;
                clearInterval(interval);
                $("#sending").invisible();
            });
        }, 10);

    });
    if (typeof file !== "undefined") {
        reader.readAsBinaryString(file);
    }
});

$("#clearterm").on("click", function() {
    terminal.reset();
});

$("#baudrate").on("change", function() {
    const baudrate = $(this).val();
    uart.set_baudrate(baudrate);
});