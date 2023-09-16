/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/* Memdump related */
const byte_per_line = 0x20;

/**
 * Events for all menus and their content: breakpoints, CPU control, etc...
 */
 const right_arrow_src = "imgs/right-arrow.png";
 const down_arrow_src = "imgs/down-arrow.png";


$(".menutitle").click(function() {
    /* Check if the content is shown or hidden */
    const content = $(this).next(".menucontent");
    const title = $(this).children(".menuicon");

    var new_src = content.is(':visible') ? right_arrow_src : down_arrow_src;

    title.fadeOut(300, function () {
        title.attr('src', new_src);
        title.fadeIn(300);
    });
    content.toggle(500);
});

$("#theme").on("change", function() {
    $(":root").removeClass();
    $(":root").addClass($(this).val());
})