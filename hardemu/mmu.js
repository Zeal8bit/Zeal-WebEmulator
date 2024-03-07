/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

 function MMU() {
    var pages = [0, 0, 0, 0];

    function io_read(port, upper) {
        /* Check the upper 2 bits */
        const index = (upper >> 6) & 3;
        return pages[index];
    }

    function io_write(port, value) {
        const idx = port & 0x3;
        pages[idx] = value;
    }

    function get_ext_addr(address) {
        /* Get 22-bit address from 16-bit address */
        const idx = (address >> 14) & 0x3;
        const highest = pages[idx];
        /* Highest bits are from the page, remaining 16KB are from address */
        return (highest << 14) | (address & 0x3fff);
    }

    this.io_region = {
        write: io_write,
        read: io_read,
        size: 0x10
    };

    this.get_ext_addr = get_ext_addr;
}
