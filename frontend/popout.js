/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>; JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/* Add a listener on the popup that will close it on click */
$("#popup-message").on("click", function() {
    $(this).fadeOut(500);
});

/**
 * Manage the popup message
 */
function PopOut() {
    function pop_error(data) {
        console.error(data);
        const popup = $("#popup-message");

        popup.removeClass();
        popup.addClass("poperror");
        popup.html(data);
        popup.fadeIn(1000);
        setTimeout(() => {
            popup.fadeOut(1000);
        }, 3000);
    }

    function pop_warn(data) {
        console.warn(data);
        const popup = $("#popup-message");

        popup.removeClass();
        popup.addClass("popwarn");
        popup.html(data);
        popup.fadeIn(1000);
        setTimeout(() => {
            popup.fadeOut(1000);
        }, 3000);
    }

    function pop_log(data) {
        console.log(data);
        const popup = $("#popup-message");

        popup.removeClass();
        popup.addClass("poplog");
        popup.html(data);
        popup.fadeIn(1000);
        setTimeout(() => {
            popup.fadeOut(1000);
        }, 3000);
    }

    function pop_info(data) {
        pop_log(data);
    }

    this.error = pop_error;
    this.warn = pop_warn;
    this.log = pop_log;
    this.info = pop_info;
}