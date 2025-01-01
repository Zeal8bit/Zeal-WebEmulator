/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

$("#step").on("click",     () => zealcom.step());
$("#stepover").on("click", () => zealcom.step_over());
$("#reset").on("click",    () => zealcom.reset());
$("#continue").on("click", () => zealcom.cont());
$("#pause").on("click", () => zealcom.stop());
$("#clean").on("click",    () => {
    zealcom.restart();
    resetRom();
});


function showPauseView() {
    $("#continue").hide();
    $("#pause").show();
}

function showContinueView() {
    $("#continue").show();
    $("#pause").hide();
}

function saveMenuState() {
    const menus = {};
    $('.menu').each(function() {
        const id = $(this).attr('id');
        menus[id] = $(this).hasClass('visible');
    });
    localStorage.setItem('menus', JSON.stringify(menus));
}

/**
 * Events for all menus and their content: breakpoints, CPU control, etc...
 */
 const right_arrow_src = "imgs/right-arrow.png";
 const down_arrow_src = "imgs/down-arrow.png";


$(".menutitle").on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    $(this).parent().toggleClass('visible');
    saveMenuState();
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

$('#canvas-smooth-val').on('change', (e) => {
    const smooth = e.currentTarget.checked;
    localStorage.setItem('canvas-smooth', JSON.stringify(smooth));
    if(smooth) {
        $('#screen').addClass('no-pixels');
    } else {
        $('#screen').removeClass('no-pixels');
    }
})

$('#t-state-logger-val').on('change', (e) => {
    const tstate = e.currentTarget.checked;
    localStorage.setItem('t-state-logger', tstate);
    TStateLogger = tstate;
});

$('#screen-capture').on('click', () => {
    console.log('capture screen');
    const canvas = document.getElementById('screen');
    const image = canvas.toDataURL();
    console.log('image', image);

    const link = document.createElement('a');
    link.href = image;
    link.download = 'zeal-screenshot.png';
    link.click();
});

$('#theater-mode').on('click', () => {
    $('#toppanel').toggleClass('theater-mode');
});

window.fullscreenMode = false;
$('#fullscreen-mode').on('click', () => {
    const canvas = document.querySelector('#container canvas');

    if(document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
    } else {
        if(canvas && canvas.requestFullscreen) {
            canvas.requestFullscreen({
                navigationUI: "hide",
            });
        }
    }
});

$('#hostfs-mount').on('click', () => {
    if(zealcom.hostfs.mounted()) {
        $('#hostfs-mount').text('Mount HostFS')
        zealcom.hostfs.unmount();
    } else {
        $('#hostfs-mount').text('Unmount HostFS')
        zealcom.hostfs.mount();
    }
});

const KC_SHIFT = 16;
const charsToKeycode = {
    " ": [32],
    "!": [KC_SHIFT, 49],
    "@": [KC_SHIFT, 50],
    "#": [KC_SHIFT, 50],
    "$": [KC_SHIFT, 52],
    "%": [KC_SHIFT, 53],
    "^": [KC_SHIFT, 54],
    "&": [KC_SHIFT, 55],
    "*": [KC_SHIFT, 56],
    "(": [KC_SHIFT, 57],
    ")": [KC_SHIFT, 48],
    "'": [222],
    "\"": [KC_SHIFT, 222],
    "=": [187],
    "+": [KC_SHIFT, 187],
    "-": [189],
    "/": [191],
    "0": [48],
    "1": [49],
    "2": [50],
    "3": [51],
    "4": [52],
    "5": [53],
    "6": [54],
    "7": [55],
    "8": [56],
    "9": [57],
    ";": [186],
    ":": [KC_SHIFT, 186],
    ",": [188],
    "<": [KC_SHIFT, 188],
    ".": [190],
    ">": [KC_SHIFT, 190],
    "?": [KC_SHIFT, 191],
    "A": [KC_SHIFT, 65],
    "B": [KC_SHIFT, 66],
    "C": [KC_SHIFT, 67],
    "D": [KC_SHIFT, 68],
    "E": [KC_SHIFT, 69],
    "F": [KC_SHIFT, 70],
    "G": [KC_SHIFT, 71],
    "H": [KC_SHIFT, 72],
    "I": [KC_SHIFT, 73],
    "J": [KC_SHIFT, 74],
    "K": [KC_SHIFT, 75],
    "L": [KC_SHIFT, 76],
    "M": [KC_SHIFT, 77],
    "N": [KC_SHIFT, 78],
    "O": [KC_SHIFT, 79],
    "P": [KC_SHIFT, 80],
    "Q": [KC_SHIFT, 81],
    "R": [KC_SHIFT, 82],
    "S": [KC_SHIFT, 83],
    "T": [KC_SHIFT, 84],
    "U": [KC_SHIFT, 85],
    "V": [KC_SHIFT, 86],
    "W": [KC_SHIFT, 87],
    "X": [KC_SHIFT, 88],
    "Y": [KC_SHIFT, 89],
    "Z": [KC_SHIFT, 90],
    "[": [219],
    "\\": [220],
    "]": [221],
    "_": [KC_SHIFT, 189],
    "`": [192],
    "a": [65],
    "b": [66],
    "c": [67],
    "d": [68],
    "e": [69],
    "f": [70],
    "g": [71],
    "h": [72],
    "i": [73],
    "j": [74],
    "k": [75],
    "l": [76],
    "m": [77],
    "n": [78],
    "o": [79],
    "p": [80],
    "q": [81],
    "r": [82],
    "s": [83],
    "t": [84],
    "u": [85],
    "v": [86],
    "w": [87],
    "x": [88],
    "y": [89],
    "z": [90],
    "{": [KC_SHIFT, 219],
    "|": [KC_SHIFT, 220],
    "}": [KC_SHIFT, 221],
    "~": [KC_SHIFT, 192],
    "\t": [9],
    "\n": [13], // Enter
  };

$("#console-paste").on("click", async () => {
    $('#console-paste').blur();
    let text = null;
    try {
        text = await navigator.clipboard.readText();
    } catch (err) {
        alert("Failed to read clipboard");
    }
    if (!text) return;

    console.log("paste", text);
    for (ch of text) {
        const keyCodes = charsToKeycode[ch] ?? [];
        for(keyCode of keyCodes) {
            // const e = jQuery.Event("keydown", { keyCode });
            // $("#screen").trigger(e);
            const handled = zealcom.KeyboardKeyPressed(keyCode);
        }
        for(let i = keyCodes.length; i > 0; i--) {
            keyCode = keyCodes[i-1];
            // const e = jQuery.Event("keyup", { keyCode });
            // $("#screen").trigger(e);
            const handled = zealcom.KeyboardKeyReleased(keyCode);
        }
    }
    $('#screen').focus();
});

$('#container .close').on('click', () => {
    $('#toppanel').toggleClass('theater-mode');
})

jQuery(() => {
    $('#continue').hide();
    $('#pause').show();

    let menus = JSON.parse(localStorage.getItem('menus')) ?? {};
    Object.entries(menus).map((entry) => {
        const [k,v] = entry;
        if(v) $(`#${k}`).addClass('visible');
    });


    const smooth = JSON.parse(localStorage.getItem('canvas-smooth') ?? false);
    $('#canvas-smooth-val').attr('checked', smooth).trigger('change');

    const tstate = JSON.parse(localStorage.getItem('t-state-logger') ?? false);
    $('#t-state-logger-val').attr('checked', tstate).trigger('change');

    if(!navigator || !navigator.serial) {
        // disable web serial, only supported in latest Chrome, Edge and Opera
        $('#web-serial-settings').hide();
    }

    const canvas = document.querySelector('#container canvas');
    if(canvas && canvas.requestFullscreen) {
        $('#fullscreen-mode').show();
    }

    window.addEventListener("hostfs", (e) => {
        const { mounted = false } = e.detail;
        if(mounted) {
            $('#hostfs-mount').text('Unmount HostFS')
        } else {
            $('#hostfs-mount').text('Mount HostFS')
        }
    });
});