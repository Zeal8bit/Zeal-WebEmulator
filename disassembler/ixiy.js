/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 * 
 * SPDX-License-Identifier: Apache-2.0
 */

const intructions_iy_op = 0xFD;
const intructions_ix_op = 0xDD;

const hex = str => str.toString(16)
const reg_idx = ["B", "C", "D", "E", "H", "L", "A"];

const intructions = [
    {
        name: "ADC A,(r+o)",
        check: (snd_op) => snd_op == 0x8E,
        text: (thrd_op) => `ADC A,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "ADD A,(r+o)",
        check: (snd_op) => snd_op == 0x86,
        text: (thrd_op) => `ADD A,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "ADD r,BC",
        check: (snd_op) => snd_op == 0x9,
        text: () => `ADD r,BC`,
        size: 2
    },
    {
        name: "ADD r,DE",
        check: (snd_op) => snd_op == 0x19,
        text: () => `ADD r,DE`,
        size: 2
    },
    {
        name: "ADD r,r",
        check: (snd_op) => snd_op == 0x29,
        text: () => `ADD r,r`,
        size: 2
    },
    {
        name: "ADD r,SP",
        check: (snd_op) => snd_op == 0x39,
        text: () => `ADD r,SP`,
        size: 2
    },
    {
        name: "AND (r+o)",
        check: (snd_op) => snd_op == 0xA6,
        text: (thrd_op) => `AND (r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "BIT b,(r+o)",
        check: (snd_op, thrd_op, forth_op) =>
            snd_op == 0xCB && (forth_op & 0xc7) == 0x46,
        text: (thrd_op, for_op) => `BIT ${(0x7e / 8) & 0x7},(r+\$${hex(thrd_op)})`,
        size: 4
    },
    {
        name: "CP (r+o)",
        check: (snd_op) => snd_op == 0xBE,
        text: (thrd_op) => `CP (r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "DEC (r+o)",
        check: (snd_op) => snd_op == 0x35,
        text: (thrd_op) => `DEC (r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "DEC r",
        check: (snd_op) => snd_op == 0x2B,
        text: () => `DEC r`,
        size: 2
    },
    {
        name: "EX (SP),r",
        check: (snd_op) => snd_op == 0xE3,
        text: () => `EX (SP),r`,
        size: 2
    },
    {
        name: "INC (r+o)",
        check: (snd_op) => snd_op == 0x34,
        text: (thrd_op) => `INC (r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "INC r",
        check: (snd_op) => snd_op == 0x23,
        text: () => `INC r`,
        size: 2
    },
    {
        name: "JP (r)",
        check: (snd_op) => snd_op == 0xE9,
        text: () => `JP (r)`,
        size: 2
    },
    {
        name: "LD (r+o),n",
        check: (snd_op) => snd_op == 0x36,
        text: (thrd_op, forth_op) => `LD (r+\$${hex(thrd_op)}),\$${hex(forth_op)}`,
        size: 4
    },
    {
        name: "LD (r+o),r",
        check: (snd_op) => (snd_op & 0xf8) == 0x70,
        text: (thrd_op) => `LD (r+\$${hex(thrd_op)}),{0}`,
        post: (str, snd) => str.replace("{0}", reg_idx[snd & 0x7]),
        size: 3
    },
    {
        name: "LD (nn),r",
        check: (snd_op) => snd_op == 0x22,
        text: (thrd_op, forth_op) => `LD (\$${hex(forth << 8 | thrd_op)}),r`,
        size: 4
    },
    {
        name: "LD A,(r+o)",
        check: (snd_op) => snd_op == 0x7E,
        text: (thrd_op) => `LD A,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "LD B,(r+o)",
        check: (snd_op) => snd_op == 0x46,
        text: (thrd_op) => `LD B,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "LD C,(r+o)",
        check: (snd_op) => snd_op == 0x4E,
        text: (thrd_op) => `LD C,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "LD D,(r+o)",
        check: (snd_op) => snd_op == 0x56,
        text: (thrd_op) => `LD D,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "LD E,(r+o)",
        check: (snd_op) => snd_op == 0x5E,
        text: (thrd_op) => `LD E,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "LD H,(r+o)",
        check: (snd_op) => snd_op == 0x66,
        text: (thrd_op) => `Ld H,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "LD r,(nn)",
        check: (snd_op) => snd_op == 0x2A,
        text: (thrd_op, forth_op) => `LD r,(\$${hex(forth_op << 8 | thrd_op)})`,
        size: 4
    },
    {
        name: "LD r,nn",
        check: (snd_op) => snd_op == 0x21,
        text: (thrd_op, forth_op) => `LD r,\$${hex(forth_op << 8 | thrd_op)}`,
        size: 4
    },
    {
        name: "LD L,(r+o)",
        check: (snd_op) => snd_op == 0x6E,
        text: (thrd_op) => `LD L,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "LD SP,r",
        check: (snd_op) => snd_op == 0xF9,
        text: () => `LD SP,r`,
        size: 2
    },
    {
        name: "OR (r+o)",
        check: (snd_op) => snd_op == 0xB6,
        text: (thrd_op) => `OR (r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "POP r",
        check: (snd_op) => snd_op == 0xE1,
        text: () => `POP r`,
        size: 2
    },
    {
        name: "PUSH r",
        check: (snd_op) => snd_op == 0xE5,
        text: () => `PUSH r`,
        size: 2
    },
    {
        name: "RES b,(r+o)",
        opcode: "CB o 86+8*b",
        size: 4
    },
    {
        name: "RL (r+o)",
        check: (snd_op, thr_op, for_op) => snd_op == 0xCB && for_op == 0x16,
        text: (thrd_op) => `RL (r+\$${hex(thrd_op)})`,
        size: 4
    },
    {
        name: "RLC (r+o)",
        check: (snd_op, thr_op, for_op) => snd_op == 0xCB && for_op == 0x06,
        text: (thrd_op) => `RLC (r+\$${hex(thrd_op)})`,
        size: 4
    },
    {
        name: "RR (r+o)",
        check: (snd_op, thr_op, for_op) => snd_op == 0xCB && for_op == 0x1E,
        text: (thrd_op) => `RR (r+\$${hex(thrd_op)})`,
        size: 4
    },
    {
        name: "RRC (r+o)",
        check: (snd_op, thr_op, for_op) => snd_op == 0xCB && for_op == 0x0E,
        text: (thrd_op) => `RRC (r+\$${hex(thrd_op)})`,
        size: 4
    },
    {
        name: "SBC A,(r+o)",
        check: (snd_op) => snd_op == 0x9E,
        text: (thrd_op) => `SBC A,(r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "SET b,(r+o)",
        check: (snd_op, thr_op, for_op) =>
            snd_op == 0xCB && (forth_op & 0xc7) == 0xc6,
        text: (thrd_op, fort_op) =>
            `SET ${(fort_op >> 3) & 0x7},(r+\$${hex(thrd_op)})`,
        size: 4
    },
    {
        name: "SLA (r+o)",
        check: (snd_op, thr_op, for_op) => snd_op == 0xCB && for_op == 0x26,
        text: (thrd_op) => `SLA (r+\$${hex(thrd_op)})`,
        size: 4
    },
    {
        name: "SRA (r+o)",
        check: (snd_op, thr_op, for_op) => snd_op == 0xCB && for_op == 0x2E,
        text: (thrd_op) => `SRA (r+\$${hex(thrd_op)})`,
        size: 4
    },
    {
        name: "SRL (r+o)",
        check: (snd_op, thr_op, for_op) => snd_op == 0xCB && for_op == 0x3E,
        text: (thrd_op) => `SRL (r+\$${hex(thrd_op)})`,
        size: 4
    },
    {
        name: "SUB (r+o)",
        check: (snd_op) => snd_op == 0x96,
        text: (thrd_op) => `SUB (r+\$${hex(thrd_op)})`,
        size: 3
    },
    {
        name: "XOR (r+o)",
        check: (snd_op) => snd_op == 0xAE,
        text: (thrd_op) => `XOR (r+\$${hex(thrd_op)})`,
        size: 3
    }
];

function dis_ix_iy(binary, index) {
    const fst = binary[index + 0];
    const snd = binary[index + 1];
    const trd = binary[index + 2];
    const fot = binary[index + 3];

    if (opcode == intructions_iy_op || opcode == intructions_ix_op) {
        const reg = (opcode == intructions_iy_op) ? "IY" : "IX";
        for (var i = 0; i < intructions.length; i++) {
            const entry = instructions[0];
            if (entry.check(snd, trd, fot)) {
                return { text: entry.text(trd, fot), size: entry.size };
            }
        }
    }

    return null;
}
