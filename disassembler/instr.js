let instructions = [
    {
        name: "ADC A,(HL)",
        check: (fst) => fst == 0x8E
        size: 1,
    },
    {
        name: "ADC A,n",
        opcode: "CE n",
        size: 2
    },
    {
        name: "ADC A,r",
        opcode: "88+r",
        size: 1
    },
    {
        name: "ADC HL,BC",
        opcode: "ED 4A",
        size: 2
    },
    {
        name: "ADC HL,DE",
        opcode: "ED 5A",
        size: 2
    },
    {
        name: "ADC HL,HL",
        opcode: "ED 6A",
        size: 2
    },
    {
        name: "ADC HL,SP",
        opcode: "ED 7A",
        size: 2
    },
    {
        name: "ADD A,(HL)",
        opcode: "86",
        size: 1
    },
    {
        name: "ADD A,n",
        opcode: "C6 n",
        size: 2
    },
    {
        name: "ADD A,r",
        opcode: "80+r",
        size: 1
    },
    {
        name: "ADD HL,BC",
        opcode: "09",
        size: 1
    },
    {
        name: "ADD HL,DE",
        opcode: "19",
        size: 1
    },
    {
        name: "ADD HL,HL",
        opcode: "29",
        size: 1
    },
    {
        name: "ADD HL,SP",
        opcode: "39",
        size: 1
    },
    {
        name: "AND (HL)",
        opcode: "A6",
        size: 1
    },
    {
        name: "AND n",
        opcode: "E6 n",
        size: 2
    },
    {
        name: "AND r",
        opcode: "A0+r",
        size: 1
    },
    {
        name: "BIT b,(HL)",
        opcode: "CB 46+8*b",
        size: 2
    },
    {
        name: "BIT b,r",
        opcode: "CB 40+8*b+r",
        size: 2
    },
    {
        name: "CALL nn",
        opcode: "CD nn nn",
        size: 3
    },
    {
        name: "CALL C,nn",
        opcode: "DC nn nn",
        size: 3
    },
    {
        name: "CALL M,nn",
        opcode: "FC nn nn",
        size: 3
    },
    {
        name: "CALL NC,nn",
        opcode: "D4 nn nn",
        size: 3
    },
    {
        name: "CALL NZ,nn",
        opcode: "C4 nn nn",
        size: 3
    },
    {
        name: "CALL P,nn",
        opcode: "F4 nn nn",
        size: 3
    },
    {
        name: "CALL PE,nn",
        opcode: "EC nn nn",
        size: 3
    },
    {
        name: "CALL PO,nn",
        opcode: "E4 nn nn",
        size: 3
    },
    {
        name: "CALL Z,nn",
        opcode: "CC nn nn",
        size: 3
    },
    {
        name: "CCF",
        opcode: "3F",
        size: 1
    },
    {
        name: "CP (HL)",
        opcode: "BE",
        size: 1
    },
    {
        name: "CP n",
        opcode: "FE n",
        size: 2
    },
    {
        name: "CP r",
        opcode: "B8+r",
        size: 1
    },
    {
        name: "CPD",
        opcode: "ED A9",
        size: 2
    },
    {
        name: "CPDR",
        opcode: "ED B9",
        size: 2
    },
    {
        name: "CPI",
        opcode: "ED A1",
        size: 2
    },
    {
        name: "CPIR",
        opcode: "ED B1",
        size: 2
    },
    {
        name: "CPL",
        opcode: "2F",
        size: 1
    },
    {
        name: "DAA",
        opcode: "27",
        size: 1
    },
    {
        name: "DEC (HL)",
        opcode: "35",
        size: 1
    },
    {
        name: "DEC A",
        opcode: "3D",
        size: 1
    },
    {
        name: "DEC B",
        opcode: "05",
        size: 1
    },
    {
        name: "DEC BC",
        opcode: "0B",
        size: 1
    },
    {
        name: "DEC C",
        opcode: "0D",
        size: 1
    },
    {
        name: "DEC D",
        opcode: "15",
        size: 1
    },
    {
        name: "DEC DE",
        opcode: "1B",
        size: 1
    },
    {
        name: "DEC E",
        opcode: "1D",
        size: 1
    },
    {
        name: "DEC H",
        opcode: "25",
        size: 1
    },
    {
        name: "DEC HL",
        opcode: "2B",
        size: 1
    },
    {
        name: "DEC L",
        opcode: "2D",
        size: 1
    },
    {
        name: "DEC SP",
        opcode: "3B",
        size: 1
    },
    {
        name: "DI",
        opcode: "F3",
        size: 1
    },
    {
        name: "DJNZ o",
        opcode: "10 o",
        size: 2
    },
    {
        name: "EI",
        opcode: "FB",
        size: 1
    },
    {
        name: "EX (SP),HL",
        opcode: "E3",
        size: 1
    },
    {
        name: "EX AF,AF'",
        opcode: "08",
        size: 1
    },
    {
        name: "EX DE,HL",
        opcode: "EB",
        size: 1
    },
    {
        name: "EXX",
        opcode: "D9",
        size: 1
    },
    {
        name: "HALT",
        opcode: "76",
        size: 1
    },
    {
        name: "IM 0",
        opcode: "ED 46",
        size: 2
    },
    {
        name: "IM 1",
        opcode: "ED 56",
        size: 2
    },
    {
        name: "IM 2",
        opcode: "ED 5E",
        size: 2
    },
    {
        name: "IN A,(C)",
        opcode: "ED 78",
        size: 2
    },
    {
        name: "IN A,(n)",
        opcode: "DB n",
        size: 2
    },
    {
        name: "IN B,(C)",
        opcode: "ED 40",
        size: 2
    },
    {
        name: "IN C,(C)",
        opcode: "ED 48",
        size: 2
    },
    {
        name: "IN D,(C)",
        opcode: "ED 50",
        size: 2
    },
    {
        name: "IN E,(C)",
        opcode: "ED 58",
        size: 2
    },
    {
        name: "IN H,(C)",
        opcode: "ED 60",
        size: 2
    },
    {
        name: "IN L,(C)",
        opcode: "ED 68",
        size: 2
    },
    {
        name: "IN F,(C)",
        opcode: "ED 70",
        size: 2
    },
    {
        name: "INC (HL)",
        opcode: "34",
        size: 1
    },
    {
        name: "INC A",
        opcode: "3C",
        size: 1
    },
    {
        name: "INC B",
        opcode: "04",
        size: 1
    },
    {
        name: "INC BC",
        opcode: "03",
        size: 1
    },
    {
        name: "INC C",
        opcode: "0C",
        size: 1
    },
    {
        name: "INC D",
        opcode: "14",
        size: 1
    },
    {
        name: "INC DE",
        opcode: "13",
        size: 1
    },
    {
        name: "INC E",
        opcode: "1C",
        size: 1
    },
    {
        name: "INC H",
        opcode: "24",
        size: 1
    },
    {
        name: "INC HL",
        opcode: "23",
        size: 1
    },
    {
        name: "INC L",
        opcode: "2C",
        size: 1
    },
    {
        name: "INC SP",
        opcode: "33",
        size: 1
    },
    {
        name: "IND",
        opcode: "ED AA",
        size: 2
    },
    {
        name: "INDR",
        opcode: "ED BA",
        size: 2
    },
    {
        name: "INI",
        opcode: "ED A2",
        size: 2
    },
    {
        name: "INIR",
        opcode: "ED B2",
        size: 2
    },
    {
        name: "JP nn",
        opcode: "C3 nn nn",
        size: 3
    },
    {
        name: "JP (HL)",
        opcode: "E9",
        size: 1
    },
    {
        name: "JP C,nn",
        opcode: "DA nn nn",
        size: 3
    },
    {
        name: "JP M,nn",
        opcode: "FA nn nn",
        size: 3
    },
    {
        name: "JP NC,nn",
        opcode: "D2 nn nn",
        size: 3
    },
    {
        name: "JP NZ,nn",
        opcode: "C2 nn nn",
        size: 3
    },
    {
        name: "JP P,nn",
        opcode: "F2 nn nn",
        size: 3
    },
    {
        name: "JP PE,nn",
        opcode: "EA nn nn",
        size: 3
    },
    {
        name: "JP PO,nn",
        opcode: "E2 nn nn",
        size: 3
    },
    {
        name: "JP Z,nn",
        opcode: "CA nn nn",
        size: 3
    },
    {
        name: "JR o",
        opcode: "18 o",
        size: 2
    },
    {
        name: "JR C,o",
        opcode: "38 o",
        size: 2
    },
    {
        name: "JR NC,o",
        opcode: "30 o",
        size: 2
    },
    {
        name: "JR NZ,o",
        opcode: "20 o",
        size: 2
    },
    {
        name: "JR Z,o",
        opcode: "28 o",
        size: 2
    },
    {
        name: "LD (BC),A",
        opcode: "02",
        size: 1
    },
    {
        name: "LD (DE),A",
        opcode: "12",
        size: 1
    },
    {
        name: "LD (HL),n",
        opcode: "36 n",
        size: 2
    },
    {
        name: "LD (HL),r",
        opcode: "70+r",
        size: 1
    },
    {
        name: "LD (nn),A",
        opcode: "32 nn nn",
        size: 3
    },
    {
        name: "LD (nn),BC",
        opcode: "ED 43 nn nn",
        size: 4
    },
    {
        name: "LD (nn),DE",
        opcode: "ED 53 nn nn",
        size: 4
    },
    {
        name: "LD (nn),HL",
        opcode: "22 nn nn",
        size: 3
    },
    {
        name: "LD (nn),SP",
        opcode: "ED 73 nn nn",
        size: 4
    },
    {
        name: "LD A,(BC)",
        opcode: "0A",
        size: 1
    },
    {
        name: "LD A,(DE)",
        opcode: "1A",
        size: 1
    },
    {
        name: "LD A,(HL)",
        opcode: "7E",
        size: 1
    },
    {
        name: "LD A,(nn)",
        opcode: "3A nn nn",
        size: 3
    },
    {
        name: "LD A,n",
        opcode: "3E n",
        size: 2
    },
    {
        name: "LD A,r",
        opcode: "78+r",
        size: 1
    },
    {
        name: "LD A,I",
        opcode: "ED 57",
        size: 2
    },
    {
        name: "LD A,R",
        opcode: "ED 5F",
        size: 2
    },
    {
        name: "LD B,(HL)",
        opcode: "46",
        size: 1
    },
    {
        name: "LD B,n",
        opcode: "06 n",
        size: 2
    },
    {
        name: "LD B,r",
        opcode: "40+r",
        size: 1
    },
    {
        name: "LD BC,(nn)",
        opcode: "ED 4B nn nn",
        size: 4
    },
    {
        name: "LD BC,nn",
        opcode: "01 nn nn",
        size: 3
    },
    {
        name: "LD C,(HL)",
        opcode: "4E",
        size: 1
    },
    {
        name: "LD C,n",
        opcode: "0E n",
        size: 2
    },
    {
        name: "LD C,r",
        opcode: "48+r",
        size: 1
    },
    {
        name: "LD D,(HL)",
        opcode: "56",
        size: 1
    },
    {
        name: "LD D,n",
        opcode: "16 n",
        size: 2
    },
    {
        name: "LD D,r",
        opcode: "50+r",
        size: 1
    },
    {
        name: "LD DE,(nn)",
        opcode: "ED 5B nn nn",
        size: 4
    },
    {
        name: "LD DE,nn",
        opcode: "11 nn nn",
        size: 3
    },
    {
        name: "LD E,(HL)",
        opcode: "5E",
        size: 1
    },
    {
        name: "LD E,n",
        opcode: "1E n",
        size: 2
    },
    {
        name: "LD E,r",
        opcode: "58+r",
        size: 1
    },
    {
        name: "LD H,(HL)",
        opcode: "66",
        size: 1
    },
    {
        name: "LD H,n",
        opcode: "26 n",
        size: 2
    },
    {
        name: "LD H,r",
        opcode: "60+r",
        size: 1
    },
    {
        name: "LD HL,(nn)",
        opcode: "2A nn nn",
        size: 3
    },
    {
        name: "LD HL,nn",
        opcode: "21 nn nn",
        size: 3
    },
    {
        name: "LD I,A",
        opcode: "ED 47",
        size: 2
    },
    {
        name: "LD L,(HL)",
        opcode: "6E",
        size: 1
    },
    {
        name: "LD L,n",
        opcode: "2E n",
        size: 2
    },
    {
        name: "LD L,r",
        opcode: "68+r",
        size: 1
    },
    {
        name: "LD R,A",
        opcode: "ED 4F",
        size: 2
    },
    {
        name: "LD SP,(nn)",
        opcode: "ED 7B nn nn",
        size: 4
    },
    {
        name: "LD SP,HL",
        opcode: "F9",
        size: 1
    },
    {
        name: "LD SP,nn",
        opcode: "31 nn nn",
        size: 3
    },
    {
        name: "LDD",
        opcode: "ED A8",
        size: 2
    },
    {
        name: "LDDR",
        opcode: "ED B8",
        size: 2
    },
    {
        name: "LDI",
        opcode: "ED A0",
        size: 2
    },
    {
        name: "LDIR",
        opcode: "ED B0",
        size: 2
    },
    {
        name: "NEG",
        opcode: "ED 44",
        size: 2
    },
    {
        name: "NOP",
        opcode: "00",
        size: 1
    },
    {
        name: "OR (HL)",
        opcode: "B6",
        size: 1
    },
    {
        name: "OR n",
        opcode: "F6 n",
        size: 2
    },
    {
        name: "OR r",
        opcode: "B0+r",
        size: 1
    },
    {
        name: "OTDR",
        opcode: "ED BB",
        size: 2
    },
    {
        name: "OTIR",
        opcode: "ED B3",
        size: 2
    },
    {
        name: "OUT (C),A",
        opcode: "ED 79",
        size: 2
    },
    {
        name: "OUT (C),B",
        opcode: "ED 41",
        size: 2
    },
    {
        name: "OUT (C),C",
        opcode: "ED 49",
        size: 2
    },
    {
        name: "OUT (C),D",
        opcode: "ED 51",
        size: 2
    },
    {
        name: "OUT (C),E",
        opcode: "ED 59",
        size: 2
    },
    {
        name: "OUT (C),H",
        opcode: "ED 61",
        size: 2
    },
    {
        name: "OUT (C),L",
        opcode: "ED 69",
        size: 2
    },
    {
        name: "OUT (n),A",
        opcode: "D3 n",
        size: 2
    },
    {
        name: "OUTD",
        opcode: "ED AB",
        size: 2
    },
    {
        name: "OUTI",
        opcode: "ED A3",
        size: 2
    },
    {
        name: "POP AF",
        opcode: "F1",
        size: 1
    },
    {
        name: "POP BC",
        opcode: "C1",
        size: 1
    },
    {
        name: "POP DE",
        opcode: "D1",
        size: 1
    },
    {
        name: "POP HL",
        opcode: "E1",
        size: 1
    },
    {
        name: "PUSH AF",
        opcode: "F5",
        size: 1
    },
    {
        name: "PUSH BC",
        opcode: "C5",
        size: 1
    },
    {
        name: "PUSH DE",
        opcode: "D5",
        size: 1
    },
    {
        name: "PUSH HL",
        opcode: "E5",
        size: 1
    },
    {
        name: "RES b,(HL)",
        opcode: "CB 86+8*b",
        size: 2
    },
    {
        name: "RES b,r",
        opcode: "CB 80+8*b+r",
        size: 2
    },
    {
        name: "RET",
        opcode: "C9",
        size: 1
    },
    {
        name: "RET C",
        opcode: "D8",
        size: 1
    },
    {
        name: "RET M",
        opcode: "F8",
        size: 1
    },
    {
        name: "RET NC",
        opcode: "D0",
        size: 1
    },
    {
        name: "RET NZ",
        opcode: "C0",
        size: 1
    },
    {
        name: "RET P",
        opcode: "F0",
        size: 1
    },
    {
        name: "RET PE",
        opcode: "E8",
        size: 1
    },
    {
        name: "RET PO",
        opcode: "E0",
        size: 1
    },
    {
        name: "RET Z",
        opcode: "C8",
        size: 1
    },
    {
        name: "RETI",
        opcode: "ED 4D",
        size: 2
    },
    {
        name: "RETN",
        opcode: "ED 45",
        size: 2
    },
    {
        name: "RL (HL)",
        opcode: "CB 16",
        size: 2
    },
    {
        name: "RL r",
        opcode: "CB 10+r",
        size: 2
    },
    {
        name: "RLA",
        opcode: "17",
        size: 1
    },
    {
        name: "RLC (HL)",
        opcode: "CB 06",
        size: 2
    },
    {
        name: "RLC r",
        opcode: "CB 00+r",
        size: 2
    },
    {
        name: "RLCA",
        opcode: "07",
        size: 1
    },
    {
        name: "RLD",
        opcode: "ED 6F",
        size: 2
    },
    {
        name: "RR (HL)",
        opcode: "CB 1E",
        size: 2
    },
    {
        name: "RR r",
        opcode: "CB 18+r",
        size: 2
    },
    {
        name: "RRA",
        opcode: "1F",
        size: 1
    },
    {
        name: "RRC (HL)",
        opcode: "CB 0E",
        size: 2
    },
    {
        name: "RRC r",
        opcode: "CB 08+r",
        size: 2
    },
    {
        name: "RRCA",
        opcode: "0F",
        size: 1
    },
    {
        name: "RRD",
        opcode: "ED 67",
        size: 2
    },
    {
        name: "RST 0",
        opcode: "C7",
        size: 1
    },
    {
        name: "RST 8H",
        opcode: "CF",
        size: 1
    },
    {
        name: "RST 10H",
        opcode: "D7",
        size: 1
    },
    {
        name: "RST 18H",
        opcode: "DF",
        size: 1
    },
    {
        name: "RST 20H",
        opcode: "E7",
        size: 1
    },
    {
        name: "RST 28H",
        opcode: "EF",
        size: 1
    },
    {
        name: "RST 30H",
        opcode: "F7",
        size: 1
    },
    {
        name: "RST 38H",
        opcode: "FF",
        size: 1
    },
    {
        name: "SBC A,(HL)",
        opcode: "9E",
        size: 1
    },
    {
        name: "SBC A,n",
        opcode: "DE n",
        size: 2
    },
    {
        name: "SBC A,r",
        opcode: "98+r",
        size: 1
    },
    {
        name: "SBC HL,BC",
        opcode: "ED 42",
        size: 2
    },
    {
        name: "SBC HL,DE",
        opcode: "ED 52",
        size: 2
    },
    {
        name: "SBC HL,HL",
        opcode: "ED 62",
        size: 2
    },
    {
        name: "SBC HL,SP",
        opcode: "ED 72",
        size: 2
    },
    {
        name: "SCF",
        opcode: "37",
        size: 1
    },
    {
        name: "SET b,(HL)",
        opcode: "CB C6+8*b",
        size: 2
    },
    {
        name: "SET b,r",
        opcode: "CB C0+8*b+r",
        size: 2
    },
    {
        name: "SLA (HL)",
        opcode: "CB 26",
        size: 2
    },
    {
        name: "SLA r",
        opcode: "CB 20+r",
        size: 2
    },
    {
        name: "SRA (HL)",
        opcode: "CB 2E",
        size: 2
    },
    {
        name: "SRA r",
        opcode: "CB 28+r",
        size: 2
    },
    {
        name: "SRL (HL)",
        opcode: "CB 3E",
        size: 2
    },
    {
        name: "SRL r",
        opcode: "CB 38+r",
        size: 2
    },
    {
        name: "SUB (HL)",
        opcode: "96",
        size: 1
    },
    {
        name: "SUB n",
        opcode: "D6 n",
        size: 2
    },
    {
        name: "SUB r",
        opcode: "90+r",
        size: 1
    },
    {
        name: "XOR (HL)",
        opcode: "AE",
        size: 1
    },
    {
        name: "XOR n",
        opcode: "EE n",
        size: 2
    },
    {
        name: "XOR r",
        opcode: "A8+r",
        size: 1
    }
];


console.log(instructions);
