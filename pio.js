/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 * 
 * SPDX-License-Identifier: Apache-2.0
 */

function PIO(Zeal) {
    const zeal = Zeal;
    const fifo = [];
    var state = 0xf0;
    var port_a_int_vector = 0;
    var port_b_int_vector = 0;
    /* Object to convert JavaScript keycodes to PS/2 */
    const js_to_ps2 = {}

    const IO_I2C_SDA_OUT_PIN = 0;
    const IO_I2C_SCL_OUT_PIN = 1;
    const IO_I2C_SDA_IN_PIN  = 2;
    const IO_UART_RX_PIN     = 3;
    const IO_UART_TX_PIN     = 4;
    const IO_HBLANK_PIN      = 6; // Hardware BUG on the FPGA board
    const IO_VBLANK_PIN      = 5; // Hardware BUG on the FPGA board
    const IO_KEYBOARD_PIN    = 7;
    
    const KB_IO_ADDRESS = 0xE8;
    const IO_PIO_DATA_A = 0xd0;
    const IO_PIO_DATA_B = 0xd1;
    const IO_PIO_CTRL_A = 0xd2;
    const IO_PIO_CTRL_B = 0xd3;

    function is_valid_address(read, address) {
        return false;
    }

    function is_valid_port(read, port) {
        port &= 0xff;
        return (port >= IO_PIO_DATA_A && port <= IO_PIO_CTRL_B)  || port == 0xE8;
    }

    function mem_read(address) {
        return false;
    }

    function mem_write(address, value) {
        return false;
    }

    function io_read(port) {
        port &= 0xff;
        if (port == KB_IO_ADDRESS)
            return fifo.shift();
        else if (port == IO_PIO_DATA_B) {
            /* Clear all bits */
            var st = state;
            state = 0xf0;
            if (fifo.length != 0) {
                st &= ~(1 << IO_KEYBOARD_PIN);
            }
            return st;
        }
        return 0xf0;
    }
    
    /* Flag marking whether the interval timer has already been started or not.
     * (for VBlank generation) */
    let time = false;
    /* We have to wait for a bitmask when the CPU sends a CTRL data for
     * activating the interrupts on certain bits (BIT mode only) */
    let port_a_waiting_bit_mask = false;
    let port_b_waiting_bit_mask = false;

    function io_write(port, value) {
        if (port == IO_PIO_CTRL_B && port_b_waiting_bit_mask) {
            port_b_waiting_bit_mask = false;
            if (((value >> IO_VBLANK_PIN) & 1) == 0) {
                /* Activate the VBlank counter */
                if (time)
                    return;
                setInterval(function() {
                    state &= ~(1 << IO_VBLANK_PIN);
                    zeal.interrupt(port_b_int_vector);
                }, 80);
                time = true;
            }
            return;
        }

        if (port == IO_PIO_CTRL_A && port_a_waiting_bit_mask) {
            port_a_waiting_bit_mask = false;
            /* TODO: Handle the request */
            return;
        }

        if (port == IO_PIO_CTRL_B && (value & 7) == 7) {
            /* Activating the interrupts with features
             * TODO: check and save these features (AND/OR, etc...)
             * FIXME: Check that we are in mode 3 (bit/control mode) */
             port_b_waiting_bit_mask = true;
        } else if (port == IO_PIO_CTRL_A && (value & 7) == 7) {
            /* Same as above */
             port_a_waiting_bit_mask = true;
        } else if (port == IO_PIO_CTRL_B && (value & 1) == 0) {
            /* When the LSB is 0, it means the interrupt vector is being programmed */
            port_b_int_vector = value & 0xff;
        } else if (port == IO_PIO_CTRL_A && (value & 1) == 0) {
            port_a_int_vector = value & 0xff;
        } else if (port == IO_PIO_DATA_B) {
            console.log("Port B: 0x" + value.toString(16) + " (" + value.toString(2) + ")");
        } else if (port == IO_PIO_DATA_A) {
            console.log("Port A: 0x" + value.toString(16) + " (" + value.toString(2) + ")");
        }
    }

    function get_interrupt_vector() {
        /* The keyboard's interrupt vector is Port B's one */
        return port_b_int_vector;
    }

    /* PS/2 Keyboard related */
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
    const KEYCODE_OPENBRACKET = 219;
    const KEYCODE_BACKSLASH = 220;
    const KEYCODE_CLOSEBRAKET = 221;
    const KEYCODE_SINGLEQUOTE = 222;

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
    }

    /* Returns the PS/2 code of a Javascript keyboard key.
     * MAKE A COPY OF THE ARRAY OF KEYS TO AVOID MODIFICATIONS
     */ 
    function get_ps2_code(code) {
        return [...js_to_ps2[code]];
    }

    function key_pressed(code) {
        /* This is not optimal is term of emulation. The keyboard sends characters based on
         * on a timing, not based on the internal FIFO */
        if (fifo.length != 0) {
            return 0;
        }

        /* TODO: Generate the release key codes too */
        const entry = get_ps2_code(code);
        if (entry != null && entry !== undefined) {
            const len = entry.length;
            while(entry.length != 0)
                fifo.push(entry.shift());
            return len;
        }

        return 0;
    }

    /* Initialize the Javascript to PS/2 keyboard now */
    init_js_to_ps2();

    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
    this.key_pressed = key_pressed;
    this.interrupt_vector = get_interrupt_vector;
}
