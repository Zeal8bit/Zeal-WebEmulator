function ROM() {
    const size = 32*KB;

    var data = [];

    function _base64ToArrayBuffer(base64) {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    function loadFile(binary) {
        data = binary;
    }
    
    function is_valid_address(read, address) {
        return read && address >= 0 && address < 0x8000;
    }

    function is_valid_port(read, port) {
        return false;
    }

    function mem_read(address) {
        console.assert (address >= 0 && address < 0x8000, "Wrong address for ROM");
        return data.charCodeAt(address);
    }

    function mem_write(address, value) {
        console.assert (false);
    }

    function io_read(port) {
        return 0;
    }

    function io_write(port, value) {
    }

    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
    this.loadFile = loadFile;
}
