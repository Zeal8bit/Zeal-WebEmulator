/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 * 
 * SPDX-License-Identifier: Apache-2.0
 */

 function MMU() {
    var pages = [0, 0, 0, 0];
    const mmu_io_addr = 0xf0;

    function is_valid_address(read, address) {
        return false;
    }

    function is_valid_port(read, port) {
        /* Only keep the 8-bit port */
        port &= 0xff;
        return port >= mmu_io_addr && port <= mmu_io_addr + 0xf;
    }
 
    function mem_read(address) {
        console.assert (false, "Invalid read for MMU");
        return 0;
    }

    function mem_write(address, value) {
        console.assert (false, "Invalid write for MMU");
    }

    function io_read(port) {
        const index = (port >> 14) & 3;
        port &= 0xff
        console.assert (port >= mmu_io_addr && port <= mmu_io_addr + 0xf, "IO write invalid for MMU");
        return pages[index];
    }

    function io_write(port, value) {
        port &= 0xff
        console.assert (port >= mmu_io_addr && port <= mmu_io_addr + 0xf, "IO write invalid for MMU");
        const idx = (port - mmu_io_addr) & 0x3;
        pages[idx] = value & 0xff;
    }

    function get_ext_addr(address) {
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
    this.get_ext_addr = get_ext_addr;
}
