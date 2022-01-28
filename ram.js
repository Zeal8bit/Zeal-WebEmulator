function RAM() {
    const size = 512*KB;
    const from = 0x08_0000;
    const to = 0x10_0000;
    
    var ram = new Array(size);

    for (var i = 0; i < ram.length; i++)
        ram[i] = 0;

    function initialize() {
        const banks = new Array(size / bank_size);
        for (var i = 0; i < banks.length; i++)
            banks[i] = new Array(bank_size).fill(0);
        return banks;
    }

    function is_valid_address(read, address) {
        return address >= from && address < to;
    }

    function is_valid_port(read, port) {
        return false;
    }
 
    function mem_read(address) {
        console.assert (address >= from && address < to, "Wrong read address for SRAM");
        return ram[address - from];
    }

    function mem_write(address, value) {
        console.assert (address >= from && address < to, "Wrong write address for SRAM");
        if (address == 0x8fb11) {
            console.log(registers.pc.toString(16) + " writing scroll_y to " + value);
        }
        ram[address - from] = value;
    }

    function io_read(port) {
        /* Impossible to read the bank in real hardware */
        console.assert (false, "IO read invalid for SRAM");
        return 0;
    }

    function io_write(port, value) {
        console.assert (false, "IO write invalid for SRAM");
    }

    function loadFile(offset, binary) {
        for (var i = 0; i < binary.length; i++) {
            ram[offset + i ] = binary.charCodeAt(i);
        }
    }

    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
    this.loadFile = loadFile;
}
