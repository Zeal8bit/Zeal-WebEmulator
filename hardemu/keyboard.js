/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function Keyboard(Zeal, PIO) {

    /* PS/2 Keyboard related */
    const BREAK_CODE = 0xF0;
    const KEYCODE_BACKSPACE = 8;
    const KEYCODE_TAB = 9;
    const KEYCODE_ENTER = 13;
    const KEYCODE_SHIFT = 16;
    const KEYCODE_CTRL = 17;
    const KEYCODE_ALT = 18;
    const KEYCODE_PAUSE = 19;
    const KEYCODE_CAPSLOCK = 20;
    const KEYCODE_ESCAPE = 27;
    const KEYCODE_PAGEUP = 33;
    const KEYCODE_SPACE = 32;
    const KEYCODE_PAGEDOWN = 34;
    const KEYCODE_END = 35;
    const KEYCODE_HOME = 36;
    const KEYCODE_ARROWLEFT = 37;
    const KEYCODE_ARROWUP = 38;
    const KEYCODE_ARROWRIGHT = 39;
    const KEYCODE_ARROWDOWN = 40;
    const KEYCODE_PRINTSCREEN = 44;
    const KEYCODE_INSERT = 45;
    const KEYCODE_DELETE = 46;
    const KEYCODE_0 = 48;
    const KEYCODE_1 = 49;
    const KEYCODE_2 = 50;
    const KEYCODE_3 = 51;
    const KEYCODE_4 = 52;
    const KEYCODE_5 = 53;
    const KEYCODE_6 = 54;
    const KEYCODE_7 = 55;
    const KEYCODE_8 = 56;
    const KEYCODE_9 = 57;
    const KEYCODE_A = 65;
    const KEYCODE_B = 66;
    const KEYCODE_C = 67;
    const KEYCODE_D = 68;
    const KEYCODE_E = 69;
    const KEYCODE_F = 70;
    const KEYCODE_G = 71;
    const KEYCODE_H = 72;
    const KEYCODE_I = 73;
    const KEYCODE_J = 74;
    const KEYCODE_K = 75;
    const KEYCODE_L = 76;
    const KEYCODE_M = 77;
    const KEYCODE_N = 78;
    const KEYCODE_O = 79;
    const KEYCODE_P = 80;
    const KEYCODE_Q = 81;
    const KEYCODE_R = 82;
    const KEYCODE_S = 83;
    const KEYCODE_T = 84;
    const KEYCODE_U = 85;
    const KEYCODE_V = 86;
    const KEYCODE_W = 87;
    const KEYCODE_X = 88;
    const KEYCODE_Y = 89;
    const KEYCODE_Z = 90;
    const KEYCODE_LEFTWINDOWKEY = 91;
    const KEYCODE_RIGHTWINDOWKEY = 92;
    const KEYCODE_SELECTKEY = 93;
    const KEYCODE_NUMPAD0 = 96;
    const KEYCODE_NUMPAD1 = 97;
    const KEYCODE_NUMPAD2 = 98;
    const KEYCODE_NUMPAD3 = 99;
    const KEYCODE_NUMPAD4 = 100;
    const KEYCODE_NUMPAD5 = 101;
    const KEYCODE_NUMPAD6 = 102;
    const KEYCODE_NUMPAD7 = 103;
    const KEYCODE_NUMPAD8 = 104;
    const KEYCODE_NUMPAD9 = 105;
    const KEYCODE_MULTIPLY = 106;
    const KEYCODE_ADD = 107;
    const KEYCODE_SUBTRACT = 109;
    const KEYCODE_DECIMALPOINT = 110;
    const KEYCODE_DIVIDE = 111;
    const KEYCODE_F1 = 112;
    const KEYCODE_F2 = 113;
    const KEYCODE_F3 = 114;
    const KEYCODE_F4 = 115;
    const KEYCODE_F5 = 116;
    const KEYCODE_F6 = 117;
    const KEYCODE_F7 = 118;
    const KEYCODE_F8 = 119;
    const KEYCODE_F9 = 120;
    const KEYCODE_F10 = 121;
    const KEYCODE_F11 = 122;
    const KEYCODE_F12 = 123;
    const KEYCODE_NUMLOCK = 144;
    const KEYCODE_SCROLLLOCK = 145;
    const KEYCODE_MYCOMPUTER = 182;
    const KEYCODE_MYCALCULATOR = 183;
    const KEYCODE_SEMI_COLON = 186;
    const KEYCODE_EQUALSIGN = 187;
    const KEYCODE_COMMA = 188;
    const KEYCODE_DASH = 189;
    const KEYCODE_PERIOD = 190;
    const KEYCODE_FORWARDSLASH = 191;
    const KEYCODE_BACKQUOTE = 192;
    const KEYCODE_OPENBRACKET = 219;
    const KEYCODE_BACKSLASH = 220;
    const KEYCODE_CLOSEBRAKET = 221;
    const KEYCODE_SINGLEQUOTE = 222;

    /* Object to convert JavaScript keycodes to PS/2 */
    const js_to_ps2 = {}

    function init_js_to_ps2() {
        js_to_ps2[KEYCODE_BACKSPACE] = [0x66];
        js_to_ps2[KEYCODE_TAB] = [0x0D];
        js_to_ps2[KEYCODE_ENTER] = [0x5A];
        js_to_ps2[KEYCODE_SHIFT] = [0x59];
        js_to_ps2[KEYCODE_CTRL] = [0xE0, 0x14];
        js_to_ps2[KEYCODE_ALT] = [0xE0, 0x11];
        js_to_ps2[KEYCODE_PAUSE] = [0xE1, 0x14, 0x77, 0xE1, 0xF0, 0x14, 0xE0, 0x77];
        js_to_ps2[KEYCODE_CAPSLOCK] = [0x58];
        js_to_ps2[KEYCODE_ESCAPE] = [0x76];
        js_to_ps2[KEYCODE_PAGEUP] = [0xE0, 0x7D];
        js_to_ps2[KEYCODE_SPACE] = [0x29];
        js_to_ps2[KEYCODE_PAGEDOWN] = [0xE0, 0x7A];
        js_to_ps2[KEYCODE_END] = [0xE0, 0x69];
        js_to_ps2[KEYCODE_HOME] = [0xE0, 0x6C];
        js_to_ps2[KEYCODE_ARROWLEFT] = [0xE0, 0x6B];
        js_to_ps2[KEYCODE_ARROWUP] = [0xE0, 0x75];
        js_to_ps2[KEYCODE_ARROWRIGHT] = [0xE0, 0x74];
        js_to_ps2[KEYCODE_ARROWDOWN] = [0xE0, 0x72];
        js_to_ps2[KEYCODE_PRINTSCREEN] = [0xE0, 0x12, 0xE0, 0x7C];
        js_to_ps2[KEYCODE_INSERT] = [0xE0, 0x70];
        js_to_ps2[KEYCODE_DELETE] = [0xE0, 0x71];
        js_to_ps2[KEYCODE_0] = [0x45];
        js_to_ps2[KEYCODE_1] = [0x16];
        js_to_ps2[KEYCODE_2] = [0x1E];
        js_to_ps2[KEYCODE_3] = [0x26];
        js_to_ps2[KEYCODE_4] = [0x25];
        js_to_ps2[KEYCODE_5] = [0x2E];
        js_to_ps2[KEYCODE_6] = [0x36];
        js_to_ps2[KEYCODE_7] = [0x3D];
        js_to_ps2[KEYCODE_8] = [0x3E];
        js_to_ps2[KEYCODE_9] = [0x46];
        js_to_ps2[KEYCODE_A] = [0x1C];
        js_to_ps2[KEYCODE_B] = [0x32];
        js_to_ps2[KEYCODE_C] = [0x21];
        js_to_ps2[KEYCODE_D] = [0x23];
        js_to_ps2[KEYCODE_E] = [0x24];
        js_to_ps2[KEYCODE_F] = [0x2B];
        js_to_ps2[KEYCODE_G] = [0x34];
        js_to_ps2[KEYCODE_H] = [0x33];
        js_to_ps2[KEYCODE_I] = [0x43];
        js_to_ps2[KEYCODE_J] = [0x3B];
        js_to_ps2[KEYCODE_K] = [0x42];
        js_to_ps2[KEYCODE_L] = [0x4B];
        js_to_ps2[KEYCODE_M] = [0x3A];
        js_to_ps2[KEYCODE_N] = [0x31];
        js_to_ps2[KEYCODE_O] = [0x44];
        js_to_ps2[KEYCODE_P] = [0x4D];
        js_to_ps2[KEYCODE_Q] = [0x15];
        js_to_ps2[KEYCODE_R] = [0x2D];
        js_to_ps2[KEYCODE_S] = [0x1B];
        js_to_ps2[KEYCODE_T] = [0x2C];
        js_to_ps2[KEYCODE_U] = [0x3C];
        js_to_ps2[KEYCODE_V] = [0x2A];
        js_to_ps2[KEYCODE_W] = [0x1D];
        js_to_ps2[KEYCODE_X] = [0x22];
        js_to_ps2[KEYCODE_Y] = [0x35];
        js_to_ps2[KEYCODE_Z] = [0x1A];
        js_to_ps2[KEYCODE_LEFTWINDOWKEY] = [0xE0, 0x1F];
        js_to_ps2[KEYCODE_RIGHTWINDOWKEY] = [0xE0, 0x27];
        js_to_ps2[KEYCODE_NUMPAD0] = [0x70];
        js_to_ps2[KEYCODE_NUMPAD1] = [0x69];
        js_to_ps2[KEYCODE_NUMPAD2] = [0x72];
        js_to_ps2[KEYCODE_NUMPAD3] = [0x7A];
        js_to_ps2[KEYCODE_NUMPAD4] = [0x6B];
        js_to_ps2[KEYCODE_NUMPAD5] = [0x73];
        js_to_ps2[KEYCODE_NUMPAD6] = [0x74];
        js_to_ps2[KEYCODE_NUMPAD7] = [0x6C];
        js_to_ps2[KEYCODE_NUMPAD8] = [0x75];
        js_to_ps2[KEYCODE_NUMPAD9] = [0x7D];
        js_to_ps2[KEYCODE_MULTIPLY] = [0x7C];
        js_to_ps2[KEYCODE_ADD] = [0x79];
        js_to_ps2[KEYCODE_SUBTRACT] = [0x7B];
        js_to_ps2[KEYCODE_DECIMALPOINT] = [0x71];
        js_to_ps2[KEYCODE_DIVIDE] = [0xE0, 0x4A];
        js_to_ps2[KEYCODE_F1] = [0x05];
        js_to_ps2[KEYCODE_F2] = [0x06];
        js_to_ps2[KEYCODE_F3] = [0x04];
        js_to_ps2[KEYCODE_F4] = [0x0C];
        js_to_ps2[KEYCODE_F5] = [0x03];
        js_to_ps2[KEYCODE_F6] = [0x0B];
        js_to_ps2[KEYCODE_F7] = [0x83];
        js_to_ps2[KEYCODE_F8] = [0x0A];
        js_to_ps2[KEYCODE_F9] = [0x01];
        js_to_ps2[KEYCODE_F10] = [0x09];
        js_to_ps2[KEYCODE_F11] = [0x78];
        js_to_ps2[KEYCODE_F12] = [0x07];
        js_to_ps2[KEYCODE_NUMLOCK] = [0x77];
        js_to_ps2[KEYCODE_SCROLLLOCK] = [0x7E];
        js_to_ps2[KEYCODE_SEMI_COLON] = [0x4C];
        js_to_ps2[KEYCODE_EQUALSIGN] = [0x55];
        js_to_ps2[KEYCODE_COMMA] = [0x41];
        js_to_ps2[KEYCODE_DASH] = [0x4E];
        js_to_ps2[KEYCODE_PERIOD] = [0x49];
        js_to_ps2[KEYCODE_FORWARDSLASH] = [0x4A];
        js_to_ps2[KEYCODE_OPENBRACKET] = [0x54];
        js_to_ps2[KEYCODE_BACKSLASH] = [0x5D];
        js_to_ps2[KEYCODE_CLOSEBRAKET] = [0x5B];
        js_to_ps2[KEYCODE_SINGLEQUOTE] = [0x52];
        js_to_ps2[KEYCODE_BACKQUOTE] = [0x0E]
    }

    /* Attributes related to PIO */
    const KB_IO_ADDRESS = 0xe8;
    const pio = PIO;
    const zeal = Zeal;
    const IO_KEYBOARD_PIN = 7;
    /* There is no FIFO on the real hardware, only a single shift register */
    var shift_register = 0;
    var transfer_active = false;

    /* Returns the PS/2 code of a Javascript keyboard key.
     * MAKE A COPY OF THE ARRAY OF KEYS TO AVOID MODIFICATIONS
     */
    function get_ps2_code(code) {
        return [...js_to_ps2[code]];
    }

    /* FIFO containing the pressed keys to send to the hardware */
    var ps2_fifo = [];

    /**
     * Call this function whenever a key is pressed in the emulator.
     * The key code corresponds to Javascript keyboard key code.
     *
     * Returns true if the key is valid, false else.
     */
    function key_pressed(keycode) {
        /* Get the PS/2 code for the key pressed */
        const list = get_ps2_code(keycode);

        if (list === undefined || list == null || !list || list.length == 0) {
            return false;
        }

        /* Enqueue the scan codes list */
        ps2_fifo.push({ keycode, list, delay: 0 });
        send_next_keypress();

        return true;
    }

    /**
     * Call this function whenever a key is released in the emulator.
     * The key code corresponds to Javascript keyboard key code.
     *
     * Returns true if the key is valid, false else.
     */
    function key_released(keycode) {
        /* Get the PS/2 code for the key pressed */
        const list = get_ps2_code(keycode);

        if (list === undefined || list == null || !list || list.length == 0) {
            return false;
        }

        /* Create a list where we add the BREAK scan code */
        /* PAUSE has no break code */
        if (keycode != KEYCODE_PAUSE) {
            /* The release code happens 79ms after the first code is issued */
            const PS2_RELEASE_DELAY = us_to_tstates(79000);

            var list_break = list;
            /* If the list starts with 0xE0, the break character shall be right after */
            if (list_break[0] == 0xE0) {
                /* Insert another 0xE0 in the front */
                list_break.unshift(0xE0);
                /* Modify the original 0xE0 */
                list_break[1] = BREAK_CODE;
            } else {
                /* Insert it at the beginning else */
                list_break.unshift(BREAK_CODE);
            }

            /* Send the bytes on the PS/2 bus with a delay */
            ps2_fifo.push({ keycode, list: list_break, delay: PS2_RELEASE_DELAY });
            send_next_keypress();
        }

        return true;
    }

    function str_press(str) {
        for (let i = 0; i < str.length; i++) {
            let ascii = str.charCodeAt(i);
            key_pressed(ascii);
        }
    }

    function send_next_keypress() {
        /* If the fifo is empty or a transfer is on-going, do nothing */
        if (ps2_fifo.length == 0 || transfer_active) {
            return;
        }

        const { list, delay } = ps2_fifo.shift();
        transfer_active = true;
        ps2_send_byte_list(list, delay);
    }

    function send_finished() {
        /* If the FIFO is not empty, do not terminated the transfer */
        if (ps2_fifo.length == 0) {
            transfer_active = false;
        } else {
            /* Schedule the next key in 1ms */
            zeal.registerTstateCallback(() => {
                transfer_active = false;
                send_next_keypress();
            }, us_to_tstates(1000));
        }
    }

    /* Function to simulate a key press on the PS/2 bus. A key can be composed of several scancodes.
     * Take that scancode list as a parameter. */
    function ps2_send_byte_list(scancodes, delay, end_callback) {
        /* On the real hardware, the active signal stays on for 19.7 microseconds */
        const PS2_SCANCODE_DURATION = us_to_tstates(19.7);
        /* We have a delay of 3.9ms between each scancode */
        const PS2_KEY_TIMING = us_to_tstates(3900);

        for (var i = 0; i < scancodes.length; i++) {
            const index = i;
            zeal.registerTstateCallback(() => {
                /* Prepare the next scancode */
                shift_register = scancodes[index];
                /* Assert the keyboard signal */
                pio.pio_set_b_pin(IO_KEYBOARD_PIN, 0);
            } , i * PS2_KEY_TIMING + delay);

            zeal.registerTstateCallback(() => {
                /* Reset the keyboard signal */
                pio.pio_set_b_pin(IO_KEYBOARD_PIN, 1);
                /* Disable the flag too */
                if (index == scancodes.length - 1) {
                    send_finished();
                }
            }, i * PS2_KEY_TIMING + PS2_SCANCODE_DURATION + delay);
        }
    }

    /* Initialize the Javascript to PS/2 keyboard on init */
    init_js_to_ps2();

    /* Default state for keyboard is high */
    pio.pio_set_b_pin(IO_KEYBOARD_PIN, 1);

    /* Public function */
    this.key_pressed = key_pressed;
    this.key_released = key_released;
    this.str_press = str_press;

    this.is_valid_port = function(read, port) {
        /* Can only read from the keyboard */
        return read && (port & 0xff) == KB_IO_ADDRESS;
    }

    this.io_read = function(port) {
        return shift_register;
    }

    this.io_write = () => { console.assert(false); };

    this.is_valid_address = () => false;
    this.mem_read = () => { console.assert(false); return 0; };
    this.mem_write = () => { console.assert(false); };

}