function PIO() {

    const fifo = [];
    
    function is_valid_address(read, address) {
        return false;
    }

    function is_valid_port(read, port) {
        return read && port == 0xE1;
    }

    function mem_read(address) {
        return false;
    }

    function mem_write(address, value) {
        return false;
    }

    function io_read(port) {
        console.assert (port == 0xE1, "Invalid IO read port");
        return fifo.shift();
    }

    const mapping = [0x45, 0x16, 0x1E, 0x26, 0x25, 0x2E, 0x36, 0x3D, 0x3E, 0x46 ];

    const mapletters = [ 0x1C, 0x32, 0x21, 0x23, 0x24, 0x2B, 0x34, 0x33, 0x43, 0x3B,
                         0x42, 0x4B, 0x3A, 0x31, 0x44, 0x4D, 0x15, 0x2D, 0x1B, 0x2C,
                         0x3C, 0x2A, 0x1D, 0x22, 0x35, 0x1A];
    const arrows = [0x6B, 0x75, 0x74, 0x72];
    
    function key_pressed(code) {
        if (code >= 65 && code <= 90) {
            const ps2code = mapletters[code - 65];
            fifo.push(ps2code);
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
        }
    }
    
    function io_write(port, value) {
    }

    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
    this.key_pressed = key_pressed;
}
