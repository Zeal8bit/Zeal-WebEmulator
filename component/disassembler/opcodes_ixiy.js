/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const intructions_iy_op = 0xFD;
const intructions_ix_op = 0xDD;


/* The following object doesn't include CB nor LD (r+n), r which are special cases */
const dd_fd_intructions = {
    0x8E: {
        text: (thrd_op) => `ADC    A,(r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x86: {
        text: (thrd_op) => `ADD    A,(r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x09: {
        text: () => `ADD    r,BC`,
        size: 2
    },
    0x19: {
        text: () => `ADD    r,DE`,
        size: 2
    },
    0x29: {
        text: () => `ADD    r,r`,
        size: 2
    },
    0x39: {
        text: () => `ADD    r,SP`,
        size: 2
    },
    0xA6: {
        text: (thrd_op) => `AND    (r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0xBE: {
        text: (thrd_op) => `CP     (r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x35: {
        text: (thrd_op) => `DEC    (r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x2B: {
        text: () => `DEC    r`,
        size: 2
    },
    0xE3: {
        text: () => `EX (SP),r`,
        size: 2
    },
    0x34: {
        text: (thrd_op) => `INC    (r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x23: {
        text: () => `INC    r`,
        size: 2
    },
    0xE9: {
        text: () => `JP (r)`,
        size: 2
    },
    0x36: {
        text: (thrd_op, forth_op) => `LD     (r+\$${hex8(thrd_op)}),\$${hex8(forth_op)}`,
        size: 4
    },
    0x22: {
        text: (thrd_op, forth_op) => `LD     (\$${hex16(forth_op, thrd_op)}),r`,
        size: 4
    },
    0x7E: {
        text: (thrd_op) => `LD     A,(r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x46: {
        text: (thrd_op) => `LD     B,(r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x4E: {
        text: (thrd_op) => `LD     C,(r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x56: {
        text: (thrd_op) => `LD     D,(r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x5E: {
        text: (thrd_op) => `LD     E,(r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x66: {
        text: (thrd_op) => `Ld     H,(r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x2A: {
        text: (thrd_op, forth_op) => `LD     r,(\$${hex16(forth_op, thrd_op)})`,
        size: 4
    },
    0x21: {
        text: (thrd_op, forth_op) => `LD     r,\$${hex16(forth_op, thrd_op)}`,
        size: 4
    },
    0x6E: {
        text: (thrd_op) => `LD     L,(r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0xF9: {
        text: () => `LD     SP,r`,
        size: 2
    },
    0xB6: {
        text: (thrd_op) => `OR     (r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0xE1: {
        text: () => `POP    r`,
        size: 2
    },
    0xE5: {
        text: () => `PUSH   r`,
        size: 2
    },
    0x96: {
        text: (thrd_op) => `SUB    (r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0xAE: {
        text: (thrd_op) => `XOR    (r+\$${hex8(thrd_op)})`,
        size: 3
    },
    0x9E: {
        text: (thrd_op) => `SBC    A,(r+\$${hex8(thrd_op)})`,
        size: 3
    },

    /* Undocumented opcodes */
    0x24: {
        text: () => `INC    rh`,
        size: 2
    },
    0x25: {
        text: () => `DEC    rh`,
        size: 2
    },
    0x26: {
        text: (thrd_op) => `LD     rh, \$${hex8(thrd_op)}`,
        size: 3
    },

    0x2C: {
        text: () => `INC    rl`,
        size: 2
    },
    0x2D: {
        text: () => `DEC    rl`,
        size: 2
    },
    0x2E: {
        text: (thrd_op) => `LD     rl, \$${hex8(thrd_op)}`,
        size: 3
    },

    0x44: {
        text: () => `LD     B, rh`,
        size: 2
    },
    0x45: {
        text: () => `LD     B, rl`,
        size: 2
    },
    0x4C: {
        text: () => `LD     C, rh`,
        size: 2
    },
    0x4D: {
        text: () => `LD     C, rl`,
        size: 2
    },
    0x54: {
        text: () => `LD     D, rh`,
        size: 2
    },
    0x55: {
        text: () => `LD     D, rl`,
        size: 2
    },
    0x5C: {
        text: () => `LD     E, rh`,
        size: 2
    },
    0x5D: {
        text: () => `LD     E, rl`,
        size: 2
    },


    0x60: {
        text: () => `LD     rh, B`,
        size: 2
    },
    0x61: {
        text: () => `LD     rh, C`,
        size: 2
    },
    0x62: {
        text: () => `LD     rh, D`,
        size: 2
    },
    0x63: {
        text: () => `LD     rh, E`,
        size: 2
    },
    0x64: {
        text: () => `LD     rh, rh`,
        size: 2
    },
    0x65: {
        text: () => `LD     rh, rl`,
        size: 2
    },
    0x67: {
        text: () => `LD     rh, A`,
        size: 2
    },


    0x68: {
        text: () => `LD     rl, B`,
        size: 2
    },
    0x69: {
        text: () => `LD     rl, C`,
        size: 2
    },
    0x6A: {
        text: () => `LD     rl, D`,
        size: 2
    },
    0x6B: {
        text: () => `LD     rl, E`,
        size: 2
    },
    0x6C: {
        text: () => `LD     rl, rh`,
        size: 2
    },
    0x6D: {
        text: () => `LD     rl, rl`,
        size: 2
    },
    0x6F: {
        text: () => `LD     rl, A`,
        size: 2
    },



    0x7C: {
        text: () => `LD     A, rh`,
        size: 2
    },
    0x7D: {
        text: () => `LD     A, rl`,
        size: 2
    },

    0x84: {
        text: () => `ADD    A, rh`,
        size: 2
    },
    0x85: {
        text: () => `ADD    A, rl`,
        size: 2
    },
    0x8C: {
        text: () => `ADC    A, rh`,
        size: 2
    },
    0x8D: {
        text: () => `ADC    A, rl`,
        size: 2
    },
    0x94: {
        text: () => `SUB    rh`,
        size: 2
    },
    0x95: {
        text: () => `SUB    rl`,
        size: 2
    },
    0x9C: {
        text: () => `SBC    A, rh`,
        size: 2
    },
    0x9D: {
        text: () => `SBC    A, rl`,
        size: 2
    },
    0xA4: {
        text: () => `AND    rh`,
        size: 2
    },
    0xA5: {
        text: () => `AND    rl`,
        size: 2
    },
    0xAC: {
        text: () => `XOR    rh`,
        size: 2
    },
    0xAD: {
        text: () => `XOR    rl`,
        size: 2
    },
    0xB4: {
        text: () => `OR     rh`,
        size: 2
    },
    0xB5: {
        text: () => `OR     rl`,
        size: 2
    },
    0xBC: {
        text: () => `CP     rh`,
        size: 2
    },
    0xBD: {
        text: () => `CP     rl`,
        size: 2
    }
};


function opcode_DD_FD_CB_x(third, fourth)
{
    switch (fourth){
        case 0x06: return `RLC (r+\$${hex8(third)})`;
        case 0x0e: return `RRC (r+\$${hex8(third)})`;
        case 0x16: return `RL  (r+\$${hex8(third)})`;
        case 0x1e: return `RR  (r+\$${hex8(third)})`;
        case 0x26: return `SLA (r+\$${hex8(third)})`;
        case 0x2e: return `SRA (r+\$${hex8(third)})`;
        case 0x3e: return `SRL (r+\$${hex8(third)})`;
        default:
            if ((fourth & 0xc7) == 0x46) {
                const bit = (fourth >> 3) & 0x7;
                return `BIT ${bit},(r+\$${hex8(third)})`;
            } else if ((fourth & 0xc7) == 0x86) {
                return `RES ${(fourth >> 3) & 0x7},(r+\$${hex8(third)})`;
            } else if ((fourth & 0xc7) == 0xc6) {
                return `SET ${(fourth >> 3) & 0x7},(r+\$${hex8(third)})`;
            }
            return 'ILL';
    };
}


/**
 * @brief Process the given opcodes, regardless of IX or IY since the instructions are the same.
 *
 * @returns Object of the form:
        { text: <disassembled_instruction>, size: n }
 */
function opcode_DD_FD_x(second, third, fourth) {
    const entry = dd_fd_intructions[second];

    /* Check if the entry exists for the given 'second' opcode, if not, check for the special cases */
    if (entry) {

        /* Execute the text() function part of the entry */
        return { text: entry.text(third, fourth), size: entry.size };

    } else if (second == 0xCB) {

        const text = opcode_DD_FD_CB_x(third, fourth);
        return { text, size: 4 };

    } else if ((second & 0xf8) == 0x70) {

        /* Special case because the opcode contains the parameter */
        const reg_idx = ["B", "C", "D", "E", "H", "L", "UNK", "A"];

        const text = `LD     (r+\$${hex8(third)}), ${reg_idx[second & 0x7]}`;
        return { text, size: 3 };

    }

    /* Unknown instruction */
    return { text: 'ILL', size: '2' };
}


/**
 * @brief Get the string equivalent of the given opcode (which is preceded by 0xDD)
 *
 * @returns Object of the form:
 *          { text: <disassembled_instruction>, size: n }
 */
function opcode_DD_x(second, third, fourth) {
    const { text, size } = opcode_DD_FD_x(second, third, fourth);
    /* Replace 'r' with IX */
    return { text: text.replace(/r/g, 'IX'), size };
}


/**
 * @brief Get the string equivalent of the given opcode (which is preceded by 0xDD)
 *
 * @returns Object of the form:
 *          { text: <disassembled_instruction>, size: n }
 */
function opcode_FD_x(second, third, fourth) {
    const { text, size } = opcode_DD_FD_x(second, third, fourth);
    /* Replace 'r' with IY */
    return { text: text.replace(/r/g, 'IY'), size };
}