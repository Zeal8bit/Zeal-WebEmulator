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
function Popup() {
    function msg(data, instead, _class, duration = 3000, speed = 1000) {
        console[instead](data);
        const popup = $("#popup-message");
        popup.removeClass();
        popup.addClass(_class);
        popup.html(data);
        popup.fadeIn(speed);
        setTimeout(() => {
            popup.fadeOut(speed);
        }, duration);
    }

    function doc(target) {
        if (!target) {
            error("Error while showing HTML");
        }
        target_elt = $("#" + target);
        $("#blackbg").fadeIn(300);
        target_elt.fadeIn(500);
    }

    this.error = (data, duration, speed)   => msg(data, "error", "poperror", duration, speed);
    this.warn  = (data, duration, speed)   => msg(data, "warn", "popwarn", duration, speed);
    this.info  = (data, duration, speed)   => msg(data, "log", "poplog", duration, speed);
    this.log   = (data, duration, speed)   => msg(data, "log", "poplog", duration, speed);
    this.doc   = (target) => doc(target);
}

$("#blackbg").click(function() {
    $("#blackbg").fadeOut(300);
    $(".popup").fadeOut(300);
});

/**
 * Add a listener on footer links
 */
$("footer a").on("click", function(){
    const target = $(this).data("target");
    popout.doc(target);
});
