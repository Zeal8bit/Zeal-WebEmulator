/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function RAM(size) {
    /* Create a 512KB RAM by default */
    size = size | (512*KB);

    var ram = new Array(size);

    for (var i = 0; i < ram.length; i++) {
        ram[i] = 0;
    }

    function mem_read(address) {
        return ram[address];
    }

    function mem_write(address, value) {
        ram[address] = value;
    }

    function loadFile(binary, offset) {
        for (var i = 0; i < binary.length; i++) {
            ram[offset + i ] = binary.charCodeAt(i);
        }
    }

    /* Memory region required by the machine */
    this.mem_region = {
        write: mem_write,
        read: mem_read,
        size: size
    };

    this.loadFile = loadFile;
}
