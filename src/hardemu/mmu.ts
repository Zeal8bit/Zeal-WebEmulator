/**
 * SPDX-FileCopyrightText: 2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { VirtAddr, PhysAddr, MemoryMapper, IODevice } from "./types/memoryregion";

export class MMU implements MemoryMapper, IODevice {
    private pages: Array<number> = [0, 0, 0, 0];

    io_read(port: number, upper: number): number {
        /* Check the upper 2 bits */
        const index = (upper >> 6) & 3;
        return this.pages[index];
    }

    io_write(port: number, value: number): void {
        const idx = port & 0x3;
        this.pages[idx] = value;
    }

    get_physical_addr(address: VirtAddr): PhysAddr {
        /* Get 22-bit address from 16-bit address */
        const idx = (address >> 14) & 0x3;
        const highest = this.pages[idx];
        /* Highest bits are from the page, remaining 16KB are from address */
        return (highest << 14) | (address & 0x3fff);
    }

    io_region_size = 0x10;

    io_region = {
        write: this.io_write,
        read: this.io_read,
        size: this.io_region_size
    };
}