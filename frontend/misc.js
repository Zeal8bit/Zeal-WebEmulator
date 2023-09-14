/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

$(".tab").on("click", function(){
    const index = $(this).index();
    $(".tab").removeClass("active");
    $(".bottompanel .panel").addClass("hidden");
    $(".bottompanel .panel").eq(index).removeClass("hidden");
    $(this).addClass("active");
});

$(".regaddr").click(function() {
    const virtaddr = parseInt($(this).text(), 16);
    if (virtaddr || virtaddr == 0) {
        const size = 256;
        setRAMView(virtaddr, size);
        $("#memory-tab").click();
    }
});

$("#screen").on("keydown", function(e) {
    const handled = zealcom.KeyboardKeyPressed(e.keyCode);

    if (handled) {
        e.preventDefault();
    }
});

$("#screen").on("keyup", function(e) {
    const handled = zealcom.KeyboardKeyReleased(e.keyCode);

    if (handled) {
        e.preventDefault();
    }
});