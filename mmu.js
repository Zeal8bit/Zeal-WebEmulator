function MMU() {
    var pages = [0, 0, 0, 0];
    
    function is_valid_address(read, address) {
        return false;
    }

    function is_valid_port(read, port) {
        return port >= 0xF8 && port <= 0xFB;
    }
 
    function mem_read(address) {
        console.assert (false, "Invalid read for MMU");
        return 0;
    }

    function mem_write(address, value) {
        console.assert (false, "Invalid write for MMU");
    }

    function io_read(port) {
        /* Impossible to read the bank in real hardware */
        console.assert (false, "IO read invalid for MMU");
        return 0;
    }

    function io_write(port, value) {
        pages[port - 0xF8] = value & 0xff;
    }

    function get_ext_adrr(address) {
        /* Get 22-bit address from 16-bit address */
        const idx = (address >> 14) & 0x3;
        const highest = pages[idx];
        /* Highest bits are from the page, remaining 16KB are from address */
        return (highest << 14) | (address & 0x3fff);
    }

    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
    this.get_ext_adrr = get_ext_adrr;
}
