/**
 * SPDX-FileCopyrightText: 2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export type VirtAddr = number;

export type PhysAddr = number;

export type VirtPhysMapper = (address: VirtAddr) => PhysAddr;

export type IODevice = {
    io_read: (port: number, upper: number) => number;
    io_write: (port: number, value: number, upper: number) => void;
    io_region_size: number;
}

export type MemDevice = {
    mem_read: (address: number) => number;
    mem_write: (address: number, value: number) => void;
    mem_region_size: number;
}

export type MemoryMapper = {
    get_physical_addr: VirtPhysMapper;
}
