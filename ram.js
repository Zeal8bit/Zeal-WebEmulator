function RAM() {
    const size = 512*KB;
    const bank_size = 16*KB;
    const from = 0x8000;
    const bank_from = 0xC000;
    
    /* RAM starts at 0x8000, first 16KB is non bankable */
    var nonbankable = new Array(16 * KB);
    var bankable = initialize();
    var bank = 0; 

    function initialize() {
        const banks = new Array(size / bank_size);
        for (var i = 0; i < banks.length; i++)
            banks[i] = new Array(bank_size);
        return banks;
    }

    function is_valid_address(read, address) {
        return address >= from;
    }

    function is_valid_port(read, port) {
        return port < 0x80;
    }
 
    function mem_read(address) {
        console.assert (address >= from, "Wrong address for SRAM");
        if (address >= bank_from)
            return bankable[bank][address - bank_from];
        return nonbankable[address - from];
    }

    function mem_write(address, value) {
        console.assert (address >= from, "Wrong address for SRAM");
        if (address >= bank_from)
            bankable[bank][address - bank_from] = value;
        nonbankable[address - from] = value;
    }

    function io_read(port) {
        /* Impossible to read the bank in real hardware */
        return 0;
    }

    function io_write(port, value) {
        console.assert (port < 0x80, "Wrong port for SRAM");
        bank = value;
    }

    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
}
