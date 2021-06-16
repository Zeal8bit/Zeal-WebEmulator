function ROM() {
    const size = 32*KB;

    const data = initialize();

    function _base64ToArrayBuffer(base64) {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    function initialize() {
        return _base64ToArrayBuffer("IQAAHjA+Yc1yAIN3Iz56zXIAg3cjPkHNcgCDdyM+Ws1yAIN3Iz4wzXIAg3cjPjnNcgCDdyM+Lc1yAIN3I3avIcMAzUwAzU0AdsNIAMnJyf4w+nAA/jr6bQD+QfpwAP5b+m0A/mH6cAD+e/ptAD4Bya/JR819AE94zYwAgcn+YfqKAP578ooAPgHJr8n+QfqZAP5b8pkAPgHJr8n+MPqoAP468qgAPgHJr8n+IMrAAP4JysAA/grKwAD+DcrAAK/JPgHJUFJJTlQgIkhlbGxvLCB3b3JsZCEiDAEXASABLAE2AUQBSgFKAUoBSgFKAUoBSgFKAUoBSwFTAVMBUwFTAVMBUwFTAVMBUwFTAQJBQlNOAEFTQ04AAUJJTkFSWU4AAkNBTExOAENMU04AAkRPTgBERUZOAAJFWElUTgBFUkFTRU4AAUZPUk4AAAFQUklOVE4AAA==");
    }

    function is_valid_address(read, address) {
        return read && address >= 0 && address < 0x8000;
    }

    function is_valid_port(read, port) {
        return false;
    }

    function mem_read(address) {
        console.assert (address >= 0 && address < 0x8000, "Wrong address for ROM");
        return data[address];
    }

    function mem_write(address, value) {
        console.assert (address >= 0 && address < 0x8000, "Wrong address for ROM");
        return data[address] = value;
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
}
