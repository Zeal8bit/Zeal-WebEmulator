/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const KB = 1024;
/* 10MHz frequency */
const CPUFREQ = 10000000;
const TSTATES_US = 1/CPUFREQ * 1000000;

function us_to_tstates(us) {
    return Math.floor(us / TSTATES_US);
}

const UART_SIZE = {
    cols: 80,
    rows: 24,
};

var terminal = new Terminal({
    ...UART_SIZE,
    screenKeys: true,
    convertEol: true,
    cursorBlink: true,
    fontSize: 14,
});
$('#uart-cols').val(UART_SIZE.cols);
$('#uart-rows').val(UART_SIZE.rows);
terminal.open(document.getElementById('terminal'));

// Init shortcut key
document.addEventListener('keydown', function(event) {
    var handled = false;
    const binding = {
        'F4': $("#theater-mode"),
        'F5': $("#fullscreen-mode"),
        'F9': $(".cpuexec:visible"),
        'F10': $("#step"),
        'F11': $("#stepover")
    };
    if (binding[event.key]) {
        binding[event.key].click();
        handled = true;
    }

    if (handled) {
        event.preventDefault();
    }
});

// Init Emulated hardware
var zealcom = new Zeal8bitComputer();
const disassembler = new Disassembler();
const popout = new Popup();

const params = parseQueryParams(window.location.search);

if (typeof electronAPI != 'undefined') {
    $(electronAPI.loaded);
}

$('#screen').focus();
$(window).on('focus', () => {
    $('#screen').focus();
})