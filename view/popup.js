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

    /** Too ugly, don't use it now */
    function pop_confirm(message) {
        let html = `<div>${message}<button class="popconfirm">Ok</button><button class="popconfirm">Cancel</button></div>`
        const popup = $("#popup-message");

        popup.removeClass();
        popup.addClass("poplog");
        popup.html(html);
        popup.fadeIn(1000);
        setTimeout(() => {
            popup.fadeOut(1000);
        }, 3000);
    }

    this.error = pop_error;
    this.warn = pop_warn;
    this.log = pop_log;
    this.info = pop_info;
    this.confirm = pop_confirm;
}

// TODO: Add these APIs to popout object

function showMessagePopup(target)
{
    $("#blackbg").fadeIn(300);
    target.fadeIn(500);
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
    const target_elt = $("#" + target);
    if (target_elt) {
        showMessagePopup(target_elt);
    }
});
