/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */
var debug_keydown = false;

$("#screen").on("keydown", function(e) {
    if (debug_keydown) {
        console.log(`Code: ${e.keyCode}, key: ${e.key}`);
    }

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