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
    function msg(data, instead, _class) {
        console[instead](data);
        const popup = $("#popup-message");
        popup.removeClass();
        popup.addClass(_class);
        popup.html(data);
        popup.fadeIn(1000);
        setTimeout(() => {
            popup.fadeOut(1000);
        }, 3000);
    }

    function doc(target) {
        if (!target) {
            error("Error while showing HTML");
        }
        target_elt = $("#" + target);
        $("#blackbg").fadeIn(300);
        target_elt.fadeIn(500);
    }

    this.error = (data)   => msg(data, "error", "poperror");
    this.warn  = (data)   => msg(data, "warn", "popwarn");
    this.info  = (data)   => msg(data, "log", "poplog");
    this.log   = (data)   => msg(data, "log", "poplog");
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
