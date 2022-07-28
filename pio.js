function PIO(Zeal) {

    const zeal = Zeal;
    const fifo = [];
    var state = 0xf0;

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
        
    let time = false;

    function io_write(port, value) {
        if (port == IO_PIO_CTRL_B && ((value >> IO_VBLANK_PIN) & 1) == 0) {
            /* Activate the VBlank counter */
            if (time)
                return;
            setInterval(function() {
                state &= ~(1 << IO_VBLANK_PIN);
                zeal.interrupt();
            }, 80);
            time = true;
        } else if (port == IO_PIO_DATA_B) {
            console.log("Port B: 0x" + value.toString(16) + " (" + value.toString(2) + ")");
        } else if (port == IO_PIO_DATA_A) {
            console.log("Port A: 0x" + value.toString(16) + " (" + value.toString(2) + ")");
        }
    }

    const mapping = [ 0x45, 0x16, 0x1E, 0x26, 0x25, 0x2E, 0x36, 0x3D, 0x3E, 0x46 ];

    const numbers = [ 0x45, 0x16, 0x1e, 0x26, 0x25, 0x2e, 0x36, 0x3d, 0x3e, 0x46 ];
    const mapletters = [ 0x1C, 0x32, 0x21, 0x23, 0x24, 0x2B, 0x34, 0x33, 0x43, 0x3B,
                         0x42, 0x4B, 0x3A, 0x31, 0x44, 0x4D, 0x15, 0x2D, 0x1B, 0x2C,
                         0x3C, 0x2A, 0x1D, 0x22, 0x35, 0x1A];
    const arrows = [0x6B, 0x75, 0x74, 0x72];
    
    function key_pressed(code) {
        /* This is not optimal is term of emulation. The keyboard sends characters based on
         * on a timing, not based on the internal FIFO */
        if (fifo.length != 0) {
            return 0;
        }

        if (code >= 65 && code <= 90) {
            const ps2code = mapletters[code - 65];
            fifo.push(ps2code);
            return 1;
        } else if (code >= 48 && code <= 57) {
            fifo.push(numbers[code - 48]);
            return 1;
        } else if (code >= 37 && code <= 40) {
            fifo.push(0xE0);
            fifo.push(arrows[code - 37]);
            return 2;
        } else if (code == 32) {
            /* Space character */
            fifo.push(0x29);
            return 1;
        } else if (code == 8) {
            /* Backspace */
            fifo.push(0x66);
            return 1;
	    } else if (code == 13) {
            /* Enter pressed */
            fifo.push(0x5A);
            return 1;
        } else if (code == 222) {
            /* character quote: ' */
            fifo.push(0x52);
            return 1;
        } else if (code == 188) {
            /* comma character */
            fifo.push(0x41);
            return 1;
        } else if (code == 20) {
            /* Caps lock */
            fifo.push(0x58);
            return 1;
        } else if (code == 187) {
            fifo.push(0x55);
            return 1;
        } else if (code == 16) {
            /* Left shift */
            fifo.push(0x12);
            return 1;
        } else if (code == 0xBE) {
            /* dot */
            fifo.push(0x49);
            return 1;
        }

        return 0;
    }

    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
    this.key_pressed = key_pressed;
}
