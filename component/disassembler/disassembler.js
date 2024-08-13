/**
 * SPDX-FileCopyrightText: 2022-2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function Disassembler() {
    const m_opcodes = {
        0x00: ()         => ({ text: `NOP`, size: 1 }),
        0x01: (snd, trd) => ({ text: `LD     BC, ${hex16(trd, snd)}`, size: 3 }),
        0x02: ()         => ({ text: `LD     (BC), A`, size: 1 }),
        0x03: ()         => ({ text: `INC    BC`, size: 1 }),
        0x04: ()         => ({ text: `INC    B`, size: 1 }),
        0x05: ()         => ({ text: `DEC    B`, size: 1 }),
        0x06: (snd)      => ({ text: `LD     B, ${hex8(snd)}`, size: 2 }),
        0x07: ()         => ({ text: `RLCA`, size: 1 }),
        0x08: ()         => ({ text: `EX     AF, AF'`, size: 1 }),
        0x09: ()         => ({ text: `ADD    HL, BC`, size: 1 }),
        0x0a: ()         => ({ text: `LD     A, (BC)`, size: 1 }),
        0x0b: ()         => ({ text: `DEC    BC`, size: 1 }),
        0x0c: ()         => ({ text: `INC    C`, size: 1 }),
        0x0d: ()         => ({ text: `DEC    C`, size: 1 }),
        0x0e: (snd)      => ({ text: `LD     C, ${hex8(snd)}`, size: 2 }),
        0x0f: ()         => ({ text: `RRCA`, size: 1 }),
        /* 'label' field tells the disassembler the destination may be an existing label
         * 'offset' tells it is not a hardcoded address
         * The `0x` in `text` field will be replaced by the caller */
        0x10: (snd)      => ({ text: `DJNZ   0x`, size: 2, label: true, offset: snd }),
        0x11: (snd, trd) => ({ text: `LD     DE, ${hex16(trd, snd)}`, size: 3 }),
        0x12: ()         => ({ text: `LD     (DE), A`, size: 1 }),
        0x13: ()         => ({ text: `INC    DE`, size: 1 }),
        0x14: ()         => ({ text: `INC    D`, size: 1 }),
        0x15: ()         => ({ text: `DEC    D`, size: 1 }),
        0x16: (snd)      => ({ text: `LD     D, ${hex8(snd)}`, size: 2 }),
        0x17: ()         => ({ text: `RLA`, size: 1 }),
        0x18: (snd)      => ({ text: `JR     0x`, size: 2, label: true, offset: snd }),
        0x19: ()         => ({ text: `ADD    HL, DE`, size: 1 }),
        0x1a: ()         => ({ text: `LD     A,(DE)`, size: 1 }),
        0x1b: ()         => ({ text: `DEC    DE`, size: 1 }),
        0x1c: ()         => ({ text: `INC    E`, size: 1 }),
        0x1d: ()         => ({ text: `DEC    E`, size: 1 }),
        0x1e: (snd)      => ({ text: `LD     E, ${hex8(snd)}`, size: 2 }),
        0x1f: ()         => ({ text: `RRA`, size: 1 }),
        0x20: (snd)      => ({ text: `JR     NZ, 0x`, size: 2, label: true, offset: snd }),
        0x21: (snd, trd) => ({ text: `LD     HL, ${hex16(trd, snd)}`, size: 3 }),
        0x22: (snd, trd) => ({ text: `LD     (${hex16(trd, snd)}), HL`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0x23: ()         => ({ text: `INC    HL`, size: 1 }),
        0x24: ()         => ({ text: `INC    H`, size: 1 }),
        0x25: ()         => ({ text: `DEC    H`, size: 1 }),
        0x26: (snd)      => ({ text: `LD     H, ${hex8(snd)}`, size: 2 }),
        0x27: ()         => ({ text: `DAA`, size: 1 }),
        0x28: (snd)      => ({ text: `JR     Z, 0x`, size: 2, label: true, offset: snd }),
        0x29: ()         => ({ text: `ADD    HL, HL`, size: 1 }),
        0x2a: (snd, trd) => ({ text: `LD     HL, (${hex16(trd, snd)})`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0x2b: ()         => ({ text: `DEC    HL`, size: 1 }),
        0x2c: ()         => ({ text: `INC    L`, size: 1 }),
        0x2d: ()         => ({ text: `DEC    L`, size: 1 }),
        0x2e: (snd)      => ({ text: `LD     L, ${hex8(snd)}`, size: 2 }),
        0x2f: ()         => ({ text: `CPL`, size: 1 }),
        0x30: (snd)      => ({ text: `JR     NC, 0x`, size: 2, label: true, offset: snd }),
        0x31: (snd, trd) => ({ text: `LD     SP, ${hex16(trd, snd)}`, size: 3 }),
        0x32: (snd, trd) => ({ text: `LD     (${hex16(trd, snd)}), A`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0x33: ()         => ({ text: `INC    SP`, size: 1 }),
        0x34: ()         => ({ text: `INC    (HL)`, size: 1 }),
        0x35: ()         => ({ text: `DEC    (HL)`, size: 1 }),
        0x36: (snd)      => ({ text: `LD     (HL), ${hex8(snd)}`, size: 2 }),
        0x37: ()         => ({ text: `SCF`, size: 1 }),
        0x38: (snd)      => ({ text: `JR     C, 0x`, size: 2, label: true, offset: snd }),
        0x39: ()         => ({ text: `ADD    HL, SP`, size: 1 }),
        0x3a: (snd, trd) => ({ text: `LD     A, (${hex16(trd, snd)})`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0x3b: ()         => ({ text: `DEC    SP`, size: 1 }),
        0x3c: ()         => ({ text: `INC    A`, size: 1 }),
        0x3d: ()         => ({ text: `DEC    A`, size: 1 }),
        0x3e: (snd)      => ({ text: `LD     A, ${hex8(snd)}`, size: 2 }),
        0x3f: ()         => ({ text: `CCF`, size: 1 }),
        0x40: ()         => ({ text: `LD     B, B`, size: 1 }),
        0x41: ()         => ({ text: `LD     B, C`, size: 1 }),
        0x42: ()         => ({ text: `LD     B, D`, size: 1 }),
        0x43: ()         => ({ text: `LD     B, E`, size: 1 }),
        0x44: ()         => ({ text: `LD     B, H`, size: 1 }),
        0x45: ()         => ({ text: `LD     B, L`, size: 1 }),
        0x46: ()         => ({ text: `LD     B, (HL)`, size: 1 }),
        0x47: ()         => ({ text: `LD     B, A`, size: 1 }),
        0x48: ()         => ({ text: `LD     C, B`, size: 1 }),
        0x49: ()         => ({ text: `LD     C, C`, size: 1 }),
        0x4a: ()         => ({ text: `LD     C, D`, size: 1 }),
        0x4b: ()         => ({ text: `LD     C, E`, size: 1 }),
        0x4c: ()         => ({ text: `LD     C, H`, size: 1 }),
        0x4d: ()         => ({ text: `LD     C, L`, size: 1 }),
        0x4e: ()         => ({ text: `LD     C, (HL)`, size: 1 }),
        0x4f: ()         => ({ text: `LD     C, A`, size: 1 }),
        0x50: ()         => ({ text: `LD     D, B`, size: 1 }),
        0x51: ()         => ({ text: `LD     D, C`, size: 1 }),
        0x52: ()         => ({ text: `LD     D, D`, size: 1 }),
        0x53: ()         => ({ text: `LD     D, E`, size: 1 }),
        0x54: ()         => ({ text: `LD     D, H`, size: 1 }),
        0x55: ()         => ({ text: `LD     D, L`, size: 1 }),
        0x56: ()         => ({ text: `LD     D, (HL)`, size: 1 }),
        0x57: ()         => ({ text: `LD     D, A`, size: 1 }),
        0x58: ()         => ({ text: `LD     E, B`, size: 1 }),
        0x59: ()         => ({ text: `LD     E, C`, size: 1 }),
        0x5a: ()         => ({ text: `LD     E, D`, size: 1 }),
        0x5b: ()         => ({ text: `LD     E, E`, size: 1 }),
        0x5c: ()         => ({ text: `LD     E, H`, size: 1 }),
        0x5d: ()         => ({ text: `LD     E, L`, size: 1 }),
        0x5e: ()         => ({ text: `LD     E, (HL)`, size: 1 }),
        0x5f: ()         => ({ text: `LD     E, A`, size: 1 }),
        0x60: ()         => ({ text: `LD     H, B`, size: 1 }),
        0x61: ()         => ({ text: `LD     H, C`, size: 1 }),
        0x62: ()         => ({ text: `LD     H, D`, size: 1 }),
        0x63: ()         => ({ text: `LD     H, E`, size: 1 }),
        0x64: ()         => ({ text: `LD     H, H`, size: 1 }),
        0x65: ()         => ({ text: `LD     H, L`, size: 1 }),
        0x66: ()         => ({ text: `LD     H, (HL)`, size: 1 }),
        0x67: ()         => ({ text: `LD     H, A`, size: 1 }),
        0x68: ()         => ({ text: `LD     L, B`, size: 1 }),
        0x69: ()         => ({ text: `LD     L, C`, size: 1 }),
        0x6a: ()         => ({ text: `LD     L, D`, size: 1 }),
        0x6b: ()         => ({ text: `LD     L, E`, size: 1 }),
        0x6c: ()         => ({ text: `LD     L, H`, size: 1 }),
        0x6d: ()         => ({ text: `LD     L, L`, size: 1 }),
        0x6e: ()         => ({ text: `LD     L, (HL)`, size: 1 }),
        0x6f: ()         => ({ text: `LD     L, A`, size: 1 }),
        0x70: ()         => ({ text: `LD     (HL), B`, size: 1 }),
        0x71: ()         => ({ text: `LD     (HL), C`, size: 1 }),
        0x72: ()         => ({ text: `LD     (HL), D`, size: 1 }),
        0x73: ()         => ({ text: `LD     (HL), E`, size: 1 }),
        0x74: ()         => ({ text: `LD     (HL), H`, size: 1 }),
        0x75: ()         => ({ text: `LD     (HL), L`, size: 1 }),
        0x76: ()         => ({ text: `HALT`, size: 1 }),
        0x77: ()         => ({ text: `LD     (HL), A`, size: 1 }),
        0x78: ()         => ({ text: `LD     A, B`, size: 1 }),
        0x79: ()         => ({ text: `LD     A, C`, size: 1 }),
        0x7a: ()         => ({ text: `LD     A, D`, size: 1 }),
        0x7b: ()         => ({ text: `LD     A, E`, size: 1 }),
        0x7c: ()         => ({ text: `LD     A, H`, size: 1 }),
        0x7d: ()         => ({ text: `LD     A, L`, size: 1 }),
        0x7e: ()         => ({ text: `LD     A, (HL)`, size: 1 }),
        0x7f: ()         => ({ text: `LD     A, A`, size: 1 }),
        0x80: ()         => ({ text: `ADD    A, B`, size: 1 }),
        0x81: ()         => ({ text: `ADD    A, C`, size: 1 }),
        0x82: ()         => ({ text: `ADD    A, D`, size: 1 }),
        0x83: ()         => ({ text: `ADD    A, E`, size: 1 }),
        0x84: ()         => ({ text: `ADD    A, H`, size: 1 }),
        0x85: ()         => ({ text: `ADD    A, L`, size: 1 }),
        0x86: ()         => ({ text: `ADD    A, (HL)`, size: 1 }),
        0x87: ()         => ({ text: `ADD    A, A`, size: 1 }),
        0x88: ()         => ({ text: `ADC    A, B`, size: 1 }),
        0x89: ()         => ({ text: `ADC    A, C`, size: 1 }),
        0x8a: ()         => ({ text: `ADC    A, D`, size: 1 }),
        0x8b: ()         => ({ text: `ADC    A, E`, size: 1 }),
        0x8c: ()         => ({ text: `ADC    A, H`, size: 1 }),
        0x8d: ()         => ({ text: `ADC    A, L`, size: 1 }),
        0x8e: ()         => ({ text: `ADC    A, (HL)`, size: 1 }),
        0x8f: ()         => ({ text: `ADC    A, A`, size: 1 }),
        0x90: ()         => ({ text: `SUB    B`, size: 1 }),
        0x91: ()         => ({ text: `SUB    C`, size: 1 }),
        0x92: ()         => ({ text: `SUB    D`, size: 1 }),
        0x93: ()         => ({ text: `SUB    E`, size: 1 }),
        0x94: ()         => ({ text: `SUB    H`, size: 1 }),
        0x95: ()         => ({ text: `SUB    L`, size: 1 }),
        0x96: ()         => ({ text: `SUB    (HL)`, size: 1 }),
        0x97: ()         => ({ text: `SUB    A`, size: 1 }),
        0x98: ()         => ({ text: `SBC    A, B`, size: 1 }),
        0x99: ()         => ({ text: `SBC    A, C`, size: 1 }),
        0x9a: ()         => ({ text: `SBC    A, D`, size: 1 }),
        0x9b: ()         => ({ text: `SBC    A, E`, size: 1 }),
        0x9c: ()         => ({ text: `SBC    A, H`, size: 1 }),
        0x9d: ()         => ({ text: `SBC    A, L`, size: 1 }),
        0x9e: ()         => ({ text: `SBC    A, (HL)`, size: 1 }),
        0x9f: ()         => ({ text: `SBC    A, A`, size: 1 }),
        0xa0: ()         => ({ text: `AND    B`, size: 1 }),
        0xa1: ()         => ({ text: `AND    C`, size: 1 }),
        0xa2: ()         => ({ text: `AND    D`, size: 1 }),
        0xa3: ()         => ({ text: `AND    E`, size: 1 }),
        0xa4: ()         => ({ text: `AND    H`, size: 1 }),
        0xa5: ()         => ({ text: `AND    L`, size: 1 }),
        0xa6: ()         => ({ text: `AND    (HL)`, size: 1 }),
        0xa7: ()         => ({ text: `AND    A`, size: 1 }),
        0xa8: ()         => ({ text: `XOR    B`, size: 1 }),
        0xa9: ()         => ({ text: `XOR    C`, size: 1 }),
        0xaa: ()         => ({ text: `XOR    D`, size: 1 }),
        0xab: ()         => ({ text: `XOR    E`, size: 1 }),
        0xac: ()         => ({ text: `XOR    H`, size: 1 }),
        0xad: ()         => ({ text: `XOR    L`, size: 1 }),
        0xae: ()         => ({ text: `XOR    (HL)`, size: 1 }),
        0xaf: ()         => ({ text: `XOR    A`, size: 1 }),
        0xb0: ()         => ({ text: `OR     B`, size: 1 }),
        0xb1: ()         => ({ text: `OR     C`, size: 1 }),
        0xb2: ()         => ({ text: `OR     D`, size: 1 }),
        0xb3: ()         => ({ text: `OR     E`, size: 1 }),
        0xb4: ()         => ({ text: `OR     H`, size: 1 }),
        0xb5: ()         => ({ text: `OR     L`, size: 1 }),
        0xb6: ()         => ({ text: `OR     (HL)`, size: 1 }),
        0xb7: ()         => ({ text: `OR     A`, size: 1 }),
        0xb8: ()         => ({ text: `CP     B`, size: 1 }),
        0xb9: ()         => ({ text: `CP     C`, size: 1 }),
        0xba: ()         => ({ text: `CP     D`, size: 1 }),
        0xbb: ()         => ({ text: `CP     E`, size: 1 }),
        0xbc: ()         => ({ text: `CP     H`, size: 1 }),
        0xbd: ()         => ({ text: `CP     L`, size: 1 }),
        0xbe: ()         => ({ text: `CP     (HL)`, size: 1 }),
        0xbf: ()         => ({ text: `CP     A`, size: 1 }),
        0xc0: ()         => ({ text: `RET    NZ`, size: 1 }),
        0xc1: ()         => ({ text: `POP    BC`, size: 1 }),
        0xc2: (snd, trd) => ({ text: `JP     NZ, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xc3: (snd, trd) => ({ text: `JP     ${hex16(trd, snd)}`,     size: 3, label: true, address: ((trd << 8) | snd) }),
        0xc4: (snd, trd) => ({ text: `CALL   NZ, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xc5: ()         => ({ text: `PUSH   BC`, size: 1 }),
        0xc6: (snd)      => ({ text: `ADD    A, ${hex8(snd)}`, size: 2 }),
        0xc7: ()         => ({ text: `RST    00`, size: 1 }),
        0xc8: ()         => ({ text: `RET    Z`, size: 1 }),
        0xc9: ()         => ({ text: `RET`, size: 1 }),
        0xca: (snd, trd) => ({ text: `JP     Z, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xcc: (snd, trd) => ({ text: `CALL   Z, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xcd: (snd, trd) => ({ text: `CALL   ${hex16(trd, snd)}`,    size: 3, label: true, address: ((trd << 8) | snd) }),
        0xce: (snd)      => ({ text: `ADC    A, ${hex8(snd)}`, size: 2 }),
        0xcf: ()         => ({ text: `RST    08`, size: 1 }),
        0xd0: ()         => ({ text: `RET    NC`, size: 1 }),
        0xd1: ()         => ({ text: `POP    DE`, size: 1 }),
        0xd2: (snd, trd) => ({ text: `JP     NC, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xd3: (snd)      => ({ text: `OUT    ${hex8(snd)}, A`, size: 2 }),
        0xd4: (snd, trd) => ({ text: `CALL   NC, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xd5: ()         => ({ text: `PUSH   DE`, size: 1 }),
        0xd6: (snd)      => ({ text: `SUB    ${hex8(snd)}`, size: 2 }),
        0xd7: ()         => ({ text: `RST    10`, size: 1 }),
        0xd8: ()         => ({ text: `RET    C`, size: 1 }),
        0xd9: ()         => ({ text: `EXX`, size: 1 }),
        0xda: (snd, trd) => ({ text: `JP     C, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xdb: (snd)      => ({ text: `IN     A, ${hex8(snd)}`, size: 2 }),
        0xdc: (snd, trd) => ({ text: `CALL   C, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xde: (snd)      => ({ text: `SBC    A, ${hex8(snd)}`, size: 2 }),
        0xdf: ()         => ({ text: `RST    18`, size: 1 }),
        0xe0: ()         => ({ text: `RET    PO`, size: 1 }),
        0xe1: ()         => ({ text: `POP    HL`, size: 1 }),
        0xe2: (snd, trd) => ({ text: `JP     PO, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xe3: ()         => ({ text: `EX     (SP), HL`, size: 1 }),
        0xe4: (snd, trd) => ({ text: `CALL   PO, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xe5: ()         => ({ text: `PUSH   HL`, size: 1 }),
        0xe6: (snd)      => ({ text: `AND    ${hex8(snd)}`, size: 2 }),
        0xe7: ()         => ({ text: `RST    20`, size: 1 }),
        0xe8: ()         => ({ text: `RET    PE`, size: 1 }),
        0xe9: ()         => ({ text: `JP     (HL)`, size: 1 }),
        0xea: (snd, trd) => ({ text: `JP     PE, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xeb: ()         => ({ text: `EX     DE, HL`, size: 1 }),
        0xec: (snd, trd) => ({ text: `CALL   PE, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xee: (snd)      => ({ text: `XOR    ${hex8(snd)}`, size: 2 }),
        0xef: ()         => ({ text: `RST    28`, size: 1 }),
        0xf0: ()         => ({ text: `RET    P`, size: 1 }),
        0xf1: ()         => ({ text: `POP    AF`, size: 1 }),
        0xf2: (snd, trd) => ({ text: `JP     P, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xf3: ()         => ({ text: `DI`, size: 1 }),
        0xf4: (snd, trd) => ({ text: `CALL   P, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xf5: ()         => ({ text: `PUSH   AF`, size: 1 }),
        0xf6: (snd)      => ({ text: `OR     ${hex8(snd)}`, size: 2 }),
        0xf7: ()         => ({ text: `RST    30`, size: 1 }),
        0xf8: ()         => ({ text: `RET    M`, size: 1 }),
        0xf9: ()         => ({ text: `LD     SP, HL`, size: 1 }),
        0xfa: (snd, trd) => ({ text: `JP     M, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xfb: ()         => ({ text: `EI`, size: 1 }),
        0xfc: (snd, trd) => ({ text: `CALL   M, ${hex16(trd, snd)}`, size: 3, label: true, address: ((trd << 8) | snd) }),
        0xfe: (snd)      => ({ text: `CP     ${hex8(snd)}`, size: 2 }),
        0xff: ()         => ({ text: `RST    38`, size: 1 }),

        /* Special cases */
        0xcb: opcode_CB_x,
        0xdd: opcode_DD_x,
        0xed: opcode_ED_x,
        0xfd: opcode_FD_x,
    };


    const m_labels = {
        /* One address can point to several labels/names */
        by_addr: {},
        /* One label/name can only point to a single address */
        by_name: {}
    };


    function expandString(str, n) {
        const difference = n - str.length;

        if (difference <= 0) {
            return str;
        }

        return str + ' '.repeat(difference);
    }

    /**
     * @brief Calculate the destination address of an instruction (for branches)
     */
    function addrFromOpcodeEntry(pc, entry)
    {
        console.assert(entry.label);
        if (typeof entry.address !== 'undefined')
            return entry.address;

        console.assert(entry.offset);
        const offset = entry.offset + 2;
        const signed = offset >= 128 ? offset - 256 : offset;
        return pc + signed;
    }


    /**
     * @brief Disassemble a portion of memory which represents a binary Z80 program.
     *
     * @param memory Array of bytes to disassemble
     * @param size Maximum number of bytes to disassemble
     * @param virt_addr Virtual address of the first opcode to disassemble (optional)
     *
     * @returns Array of object of the form:
     *  [
     *      { addr: 0xa000, instruction: "add a, a" },
     *      { addr: 0xa001, label: "my_routine:" },
     *      ...
     *  ]
     */
    function disassembleMemory(memory, size, virt_addr)
    {
        /* Define the first virtual address as 0 if virt_addr is undefined */
        const from = virt_addr || 0;
        var i = 0;
        var remaining = size;
        var instructions = [];

        const indent = '                    ';
        const postfix_location = 60;

        while (remaining > 0) {
            /* Virtual address of the current instruction */
            const curaddr = from + i;

            const byte = memory[i];
            /* Get the instruction text and size */
            const lambda = m_opcodes[byte];
            /* If the entry doesn't exist, ignore it */
            var size = 1;
            var text = "ILL";

            if (lambda) {
                const entry = lambda(memory[i+1], memory[i+2], memory[i+3]);
                size = entry.size;
                text = entry.text;

                /* Check if the current instruction could refer to a label */
                if (entry.label) {
                    const dest = addrFromOpcodeEntry(curaddr, entry);
                    const label = m_labels.by_addr[dest] || [];
                    if (label.length > 0) {
                        /* Always use the last label if multiple defined */
                        const name = label[label.length - 1];
                        /* Replace it in the instruction */
                        text = text.replace(/0x[0-9a-fA-F]*/, name);
                    }
                    /* If we couldn't find a label and the instruction refers to an offset, calculate the destination */
                    else if (entry.offset) {
                        text = text.replace(/0x[0-9a-fA-F]*/, "0x" + dest.toString(16));
                    }
                }
            }

            /* Check if we have any label for this address and push them */
            const labels = m_labels.by_addr[curaddr] || [];
            labels.forEach(lab => {
                instructions.push({ addr: curaddr, label: lab + ':' });
            });

            /* Add the instruction in the final array */
            var instruction = indent + text;
            instruction = expandString(instruction, postfix_location);
            instruction += `; [${hex(curaddr, true)}] `;
            for (var idx = 0; idx < size; idx++) {
                instruction += hex8(memory[i + idx], true) + ' ';
            }
            instruction = instruction.toLowerCase();

            instructions.push({ addr: curaddr, instruction });

            remaining -= size;
            i += size;
        }

        return instructions;
    }


    /**
     * @brief Get the size of the given instruction
     *
     * @param memory Array of bytes to disassemble, must be of size 4
     *
     * @returns Size of the instruction in bytes
     */
    function getInstructionSize(memory)
    {
        const lambda = m_opcodes[memory[0]];
        /* If the entry doesn't exist, ignore it */
        var size = 1;

        if (lambda) {
            const entry = lambda(memory[1], memory[2], memory[3]);
            size = entry.size;
        }

        return size;
    }


    /**
     * @brief Load symbols from a map file generated by z88dk-z80asm, which has the form:
     *      symbol          = $0011 ; addr|const
     *      ...
     * (const will be ignored)
     *
     * @returns true on success, false on error
     */
    function loadSymbols(content)
    {
        var lines = content.split("\n");
        /* Filter the comments by removing the ones containing 'const' */
        lines = lines.filter(e => e.indexOf('; const') == -1);

        for (var line of lines) {
            /* Remove the comment */
            line = line.split(';')[0];
            /* Split with '=', the first element is the label, the second one is a hex value */
            const data = line.split('=');
            /* Ignore malformed lines */
            if (data.length == 1) {
                continue;
            }
            const label = data[0].trim();
            var addr = data[1].trim().replace('$', '0x');
            addr = parseInt(addr, 16);

            if (!isNaN(addr)) {
                /* One address can point to several labels/names */
                var lablist = m_labels.by_addr[addr] || [];
                lablist.push(label);
                m_labels.by_addr[addr] = lablist;

                m_labels.by_name[label] = addr;
            }
        }

        return true;
    }


    /**
     * @brief Search for a label and return its address, or null if it doesn't exist
     */
    function labelAddress(label)
    {
        return m_labels.by_name[label] || null;
    }


    this.disassemble = disassembleMemory;
    this.loadSymbols = loadSymbols;
    this.loadFile = loadSymbols;
    this.labelAddress = labelAddress;
    this.getInstructionSize = getInstructionSize;
}