/**
All other work is Copyright (C) 2013 Martin Maly, https://www.maly.cz/, published under terms
of MIT license (Not GPL!) as "source available software"

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

!function(e, t) {
    "undefined" != typeof module ? (module.exports = t(),
    Z80ASM = module.exports) : "function" == typeof define && "object" == typeof define.amd ? define(t) : this.Z80ASM = t()
}(0, function() {
    var e = {
        set: {
            DEC: [-1, -1, -1, -1, 5, -1, 11, -1, -1, -1, -1, -1, -1, -1],
            INC: [-1, -1, -1, -1, 4, -1, 3, -1, -1, -1, -1, -1, -1, -1],
            AND: [-1, -1, -1, -1, 160, 230, -1, -1, -1, -1, -1, -1, -1, -1],
            OR: [-1, -1, -1, -1, 176, 246, -1, -1, -1, -1, -1, -1, -1, -1],
            XOR: [-1, -1, -1, -1, 168, 238, -1, -1, -1, -1, -1, -1, -1, -1],
            SUB: [-1, -1, -1, -1, 144, 214, -1, -1, -1, -1, -1, -1, -1, -1],
            CP: [-1, -1, -1, -1, 184, 254, -1, -1, -1, -1, -1, -1, -1, -1],
            SLA: [-1, -1, -1, -1, 52e3, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            SRA: [-1, -1, -1, -1, 52008, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            SRL: [-1, -1, -1, -1, 52024, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RR: [-1, -1, -1, -1, 51992, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RL: [-1, -1, -1, -1, 51984, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RRC: [-1, -1, -1, -1, 51976, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RLC: [-1, -1, -1, -1, 51968, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            POP: [-1, -1, -1, -1, -1, -1, -1, 193, -1, -1, -1, -1, -1, -1],
            PUSH: [-1, -1, -1, -1, -1, -1, -1, 197, -1, -1, -1, -1, -1, -1],
            RET: [201, -1, -1, -1, -1, -1, -1, -1, 192, -1, -1, -1, -1, -1],
            IM: [-1, -1, -1, -1, -1, -1, -1, -1, -1, 60742, -1, -1, -1, -1],
            RST: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 199, -1, -1, -1],
            CALL: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 205, -1],
            JP: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 195, 233],
            DJNZ: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 16, -1, -1],
            JR: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 24, -1, -1],
            NOP: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            CCF: [63, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            CPD: [60841, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            CPDR: [60857, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            CPI: [60833, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            CPIR: [60849, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            CPL: [47, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            DAA: [39, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            DI: [243, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            EI: [251, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            EXX: [217, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            IND: [60842, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            INDR: [60858, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            INI: [60834, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            INIR: [60850, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            LDD: [60840, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            LDDR: [60856, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            LDI: [60832, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            LDIR: [60848, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            OUTD: [60843, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            OTDR: [60859, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            OUTI: [60835, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            OTIR: [60851, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            HALT: [118, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            NEG: [60740, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RETI: [60749, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RETN: [60741, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RLA: [23, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RLCA: [7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RLD: [60783, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RRA: [31, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RRCA: [15, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            RRD: [60775, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            SCF: [55, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
        },
        set2: {
            EX: [0],
            LD: [0],
            ADC: [136, 206, 60746],
            ADD: [128, 198, 9, 9],
            SBC: [152, 222, 60738],
            BIT: [-1, -1, -1, -1, 52032],
            RES: [-1, -1, -1, -1, 52096],
            SET: [-1, -1, -1, -1, 52160],
            CAL2: [-1, -1, -1, -1, -1, 196],
            JP2: [-1, -1, -1, -1, -1, 194],
            JR2: [-1, -1, -1, -1, -1, 32],
            IN: [60736, 219, -1, -1, -1, -1],
            OUT: [60737, 211, -1, -1, -1, -1]
        },
        R8: {
            DEC: 3,
            INC: 3
        },
        R16: {
            DEC: 4,
            INC: 4,
            POP: 4,
            PUSH: 4
        },
        parseOpcode: function(t) {
            var r, n, s, o = function(e) {
                var t = ["B", "C", "D", "E", "H", "L", "~", "A"].indexOf(e.toUpperCase());
                return "(HL)" == e.toUpperCase() ? 6 : t
            }, i = function(e) {
                return ["B", "C", "D", "E", "H", "L", "F", "A"].indexOf(e.toUpperCase())
            }, a = function(e) {
                return ["BC", "DE", "HL", "SP"].indexOf(e.toUpperCase())
            }, l = function(e) {
                return ["NZ", "Z", "NC", "C", "PO", "PE", "P", "M"].indexOf(e.toUpperCase())
            }, p = function(e) {
                return "(" == e[0] && ")" == e[e.length - 1] ? e.substr(1, e.length - 2) : null
            }, u = function(e) {
                var t = null
                  , r = null
                  , n = e.substr(0, 4).toUpperCase();
                return "(IX)" == n && (t = "0",
                r = 221,
                e = "(HL)"),
                "(IX+" == n && (t = e.substr(4, e.length - 5),
                r = 221,
                e = "(HL)"),
                "(IX-" == n && (t = "-" + e.substr(4, e.length - 5),
                r = 221,
                e = "(HL)"),
                "(IY)" == n && (t = "0",
                r = 253,
                e = "(HL)"),
                "(IY+" == n && (t = e.substr(4, e.length - 5),
                r = 253,
                e = "(HL)"),
                "(IY-" == n && (t = "-" + e.substr(4, e.length - 5),
                r = 253,
                e = "(HL)"),
                "IX" == n && (r = 221,
                e = "HL"),
                "IY" == n && (r = 253,
                e = "HL"),
                "IXL" == n && (r = 221,
                e = "L"),
                "IXH" == n && (r = 221,
                e = "H"),
                "IYL" == n && (r = 253,
                e = "L"),
                "IYH" == n && (r = 253,
                e = "H"),
                [e, t, r]
            }, h = e.set[t.opcode], f = e.set2[t.opcode], c = -1, d = 1, m = [], g = null, v = null;
            if (h && !f && (t.params ? t.params.length : 0) > 1 && "JP" !== t.opcode && "JR" !== t.opcode && "CALL" !== t.opcode)
                throw "One parameter needed";
            if (!h && f && (h = f,
            2 !== (t.params ? t.params.length : 0)))
                throw "Two parameters needed";
            if (h) {
                if (t.params && 0 !== t.params.length) {
                    if (1 == t.params.length) {
                        var b = t.params[0];
                        if (s = u(b),
                        b = s[0],
                        v = s[1],
                        g = s[2],
                        h[11] > 0)
                            return t.bytes = 2,
                            t.lens = [],
                            t.lens[0] = h[11],
                            t.lens[1] = function(e) {
                                var t = Parser.evaluate(b, e) - (e._PC + 2);
                                if (t > 127)
                                    throw "Target is out of relative jump reach";
                                if (t < -128)
                                    throw "Target is out of relative jump reach";
                                return t < 0 && (t = 256 + t),
                                t
                            }
                            ,
                            t;
                        if (h[12] > 0)
                            return t.lens = [],
                            "(HL)" == b.toUpperCase() && h[13] > 0 ? (s[2] ? (t.bytes = 2,
                            t.lens[0] = s[2],
                            t.lens[1] = h[13]) : (t.bytes = 1,
                            t.lens[0] = h[13]),
                            t) : (t.bytes = 3,
                            t.lens[0] = h[12],
                            t.lens[1] = function(e) {
                                return Parser.evaluate(b, e)
                            }
                            ,
                            t.lens[2] = null,
                            t);
                        if (h[9] > 0) {
                            switch (t.bytes = 2,
                            t.lens = [],
                            t.lens[0] = 237,
                            Parser.evaluate(b)) {
                            case 0:
                                return t.lens[1] = 70,
                                t;
                            case 1:
                                return t.lens[1] = 86,
                                t;
                            case 2:
                                return t.lens[1] = 94,
                                t
                            }
                            throw "Invalid interrupt mode"
                        }
                        if (h[10] > 0) {
                            switch (t.bytes = 1,
                            t.lens = [],
                            Parser.evaluate(b)) {
                            case 0:
                                return t.lens[0] = 199,
                                t;
                            case 8:
                                return t.lens[0] = 207,
                                t;
                            case 16:
                                return t.lens[0] = 215,
                                t;
                            case 24:
                                return t.lens[0] = 223,
                                t;
                            case 32:
                                return t.lens[0] = 231,
                                t;
                            case 40:
                                return t.lens[0] = 239,
                                t;
                            case 48:
                                return t.lens[0] = 247,
                                t;
                            case 56:
                                return t.lens[0] = 255,
                                t
                            }
                            throw "Invalid RST"
                        }
                        (r = l(b)) >= 0 && h[8] > 0 ? (c = h[8]) > 0 && (c += r << 3) : (r = a(b)) >= 0 && h[6] >= 0 ? (c = h[6]) > 0 && (e.R16[t.opcode] ? c += r << e.R16[t.opcode] : c += r) : (r = ["BC", "DE", "HL", "AF"].indexOf(b.toUpperCase())) >= 0 && h[7] >= 0 ? (c = h[7]) > 0 && (e.R16[t.opcode] ? c += r << e.R16[t.opcode] : c += r) : (r = o(b)) >= 0 && h[4] > 0 ? (c = h[4]) > 0 && (e.R8[t.opcode] ? c += r << e.R8[t.opcode] : c += r) : (c = h[5],
                        n = function(e) {
                            return Parser.evaluate(b, e)
                        }
                        )
                    } else if (2 == t.params.length) {
                        var C = t.params[0]
                          , x = t.params[1];
                        if ("EX" == t.opcode)
                            return "DE" == C.toUpperCase() && "HL" == x.toUpperCase() ? (t.lens = [235],
                            t.bytes = 1,
                            t) : "AF" == C.toUpperCase() && "AF'" == x.toUpperCase() ? (t.lens = [8],
                            t.bytes = 1,
                            t) : "(SP)" == C.toUpperCase() && "HL" == x.toUpperCase() ? (t.lens = [227],
                            t.bytes = 1,
                            t) : "(SP)" == C.toUpperCase() && "IX" == x.toUpperCase() ? (t.lens = [221, 227],
                            t.bytes = 2,
                            t) : "(SP)" == C.toUpperCase() && "IY" == x.toUpperCase() ? (t.lens = [253, 227],
                            t.bytes = 2,
                            t) : null;
                        if ("CALL" == t.opcode)
                            return h = e.set2.CAL2,
                            (r = l(C)) >= 0 && h[5] > 0 && (c = h[5]) > 0 ? (c += r << 3,
                            t.bytes = 3,
                            t.lens = [],
                            t.lens[0] = c,
                            t.lens[1] = function(e) {
                                return Parser.evaluate(x, e)
                            }
                            ,
                            t.lens[2] = null,
                            t) : null;
                        if ("JP" == t.opcode)
                            return h = e.set2.JP2,
                            (r = l(C)) >= 0 && h[5] > 0 && (c = h[5]) > 0 ? (c += r << 3,
                            t.bytes = 3,
                            t.lens = [],
                            t.lens[0] = c,
                            t.lens[1] = function(e) {
                                return Parser.evaluate(x, e)
                            }
                            ,
                            t.lens[2] = null,
                            t) : null;
                        if ("JR" == t.opcode)
                            return h = e.set2.JR2,
                            (r = l(C)) >= 0 && r < 4 && h[5] > 0 && (c = h[5]) > 0 ? (c += r << 3,
                            t.bytes = 2,
                            t.lens = [],
                            t.lens[0] = c,
                            t.lens[1] = function(e) {
                                var t = Parser.evaluate(x, e) - (e._PC + 2);
                                if (t > 127)
                                    throw "Target is out of relative jump reach";
                                if (t < -128)
                                    throw "Target is out of relative jump reach";
                                return t < 0 && (t = 256 + t),
                                t
                            }
                            ,
                            t) : null;
                        if ("IN" == t.opcode)
                            return "(C)" == x.toUpperCase() && (r = i(C)) >= 0 && h[0] ? (t.lens = [237, 64 + (r << 3)],
                            t.bytes = 2,
                            t) : "A" == C.toUpperCase() ? (t.lens = [h[1]],
                            t.lens[1] = function(e) {
                                return Parser.evaluate(x, e)
                            }
                            ,
                            t.bytes = 2,
                            t) : null;
                        if ("OUT" == t.opcode)
                            return "(C)" == C.toUpperCase() && (r = i(x)) >= 0 && h[0] ? (t.lens = [237, 65 + (r << 3)],
                            t.bytes = 2,
                            t) : "A" == x.toUpperCase() ? (t.lens = [h[1]],
                            t.lens[1] = function(e) {
                                return Parser.evaluate(C, e)
                            }
                            ,
                            t.bytes = 2,
                            t) : null;
                        if ("LD" == t.opcode) {
                            if ("A" == C.toUpperCase() && "R" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [237, 95],
                                t;
                            if ("A" == C.toUpperCase() && "I" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [237, 87],
                                t;
                            if ("R" == C.toUpperCase() && "A" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [237, 79],
                                t;
                            if ("I" == C.toUpperCase() && "A" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [237, 71],
                                t;
                            if ("HL" == C.toUpperCase() && "DE" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [98, 107],
                                t;
                            if ("HL" == C.toUpperCase() && "BC" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [96, 105],
                                t;
                            if ("DE" == C.toUpperCase() && "HL" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [84, 93],
                                t;
                            if ("DE" == C.toUpperCase() && "BC" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [80, 89],
                                t;
                            if ("BC" == C.toUpperCase() && "HL" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [68, 77],
                                t;
                            if ("BC" == C.toUpperCase() && "DE" == x.toUpperCase())
                                return t.bytes = 2,
                                t.lens = [66, 75],
                                t;
                            var A = u(C);
                            C = A[0],
                            v = A[1],
                            g = A[2];
                            var y = u(x);
                            if (x = y[0],
                            y[1] && v)
                                throw "Invalid parameters - two indexed";
                            if (y[1] && (v = y[1]),
                            y[2] && g)
                                throw "Invalid parameters - two prefixed";
                            y[2] && (g = y[2]);
                            var M = o(C)
                              , E = o(x);
                            if (m = [],
                            M >= 0 && E >= 0 && (t.bytes = 1,
                            m[0] = 64 + (M << 3) + E),
                            "A" == C.toUpperCase() && "(BC)" == x.toUpperCase())
                                return t.bytes = 1,
                                t.lens = [10],
                                t;
                            if ("A" == C.toUpperCase() && "(DE)" == x.toUpperCase())
                                return t.bytes = 1,
                                t.lens = [26],
                                t;
                            if ("A" == C.toUpperCase() && p(x) && 0 === t.bytes)
                                return t.bytes = 3,
                                t.lens = [58, function(e) {
                                    return Parser.evaluate(p(x), e)
                                }
                                , null],
                                t;
                            if ("(BC)" == C.toUpperCase() && "A" == x.toUpperCase())
                                return t.bytes = 1,
                                t.lens = [2],
                                t;
                            if ("(DE)" == C.toUpperCase() && "A" == x.toUpperCase())
                                return t.bytes = 1,
                                t.lens = [18],
                                t;
                            if (p(C) && "A" == x.toUpperCase() && 0 === t.bytes)
                                return t.bytes = 3,
                                t.lens = [50, function(e) {
                                    return Parser.evaluate(p(C), e)
                                }
                                , null],
                                t;
                            if (7 == M && E < 0 && "(" == x[0])
                                return t.bytes = 3,
                                m[0] = 58,
                                m[1] = function(e) {
                                    return Parser.evaluate(x, e)
                                }
                                ,
                                m[2] = null,
                                t;
                            if (M >= 0 && E < 0 && "(" == x[0])
                                throw "Invalid combination: general register and memory";
                            if (M >= 0 && E < 0 && (t.bytes = 2,
                            m[0] = 6 + (M << 3),
                            m[1] = function(e) {
                                return Parser.evaluate(x, e)
                            }
                            ),
                            0 === t.bytes) {
                                M = a(C),
                                E = a(x);
                                var S = p(C)
                                  , P = p(x);
                                M >= 0 && !P && (t.bytes = 3,
                                m = [1 + (M << 4), function(e) {
                                    return Parser.evaluate(x, e)
                                }
                                , null]),
                                M >= 0 && P && (t.bytes = [4, 4, 3, 4][M],
                                m = [237, 75 + (M << 4), function(e) {
                                    return Parser.evaluate(P, e)
                                }
                                , null],
                                3 == t.bytes && (m = [42, function(e) {
                                    return Parser.evaluate(P, e)
                                }
                                , null])),
                                S && E >= 0 && (t.bytes = [4, 4, 3, 4][E],
                                m = [237, 67 + (E << 4), function(e) {
                                    return Parser.evaluate(S, e)
                                }
                                , null],
                                3 == t.bytes && (m = [34, function(e) {
                                    return Parser.evaluate(S, e)
                                }
                                , null])),
                                3 == M && 2 == E && (t.bytes = 1,
                                m = [249])
                            }
                            return m.length ? (g && (m.unshift(g),
                            t.bytes++),
                            v && (3 == t.bytes && (m[3] = m[2],
                            m[2] = function(e) {
                                var t = Parser.evaluate(v, e);
                                if (t > 127 || t < -128)
                                    throw "Index out of range (" + t + ")";
                                return t
                            }
                            ,
                            t.bytes = 4),
                            2 == t.bytes && (m[2] = function(e) {
                                var t = Parser.evaluate(v, e);
                                if (t > 127 || t < -128)
                                    throw "Index out of range (" + t + ")";
                                return t
                            }
                            ,
                            t.bytes = 3)),
                            t.lens = m,
                            t) : null
                        }
                        if (h[4] >= 0) {
                            var w = parseInt(C, 10);
                            s = u(x),
                            x = s[0],
                            v = s[1],
                            g = s[2],
                            r = o(x),
                            c = h[4] + 8 * w + r
                        }
                        "A" == C.toUpperCase() && (s = u(x),
                        x = s[0],
                        v = s[1],
                        g = s[2],
                        (r = o(x)) >= 0 ? c = h[0] + r : (c = h[1],
                        n = function(e) {
                            return Parser.evaluate(x, e)
                        }
                        )),
                        "IX" == C.toUpperCase() && (r = ["BC", "DE", "IX", "SP"].indexOf(x.toUpperCase())) >= 0 && (c = h[2] + (r << 4),
                        g = 221),
                        "IY" == C.toUpperCase() && (r = ["BC", "DE", "IY", "SP"].indexOf(x.toUpperCase())) >= 0 && (c = h[2] + (r << 4),
                        g = 253),
                        "HL" == C.toUpperCase() && (r = a(x)) >= 0 && (c = h[2] + (r << 4))
                    }
                } else
                    c = h[0];
                if (c < 0)
                    throw "Bad addressing mode at line " + t.numline;
                return c > 255 ? (d++,
                m[0] = (65280 & c) >> 8,
                m[1] = 255 & c) : m[0] = 255 & c,
                g && (m.unshift(g),
                d++),
                null !== v && void 0 !== v && (3 == d && (m[3] = m[2],
                m[2] = function(e) {
                    var t = Parser.evaluate(v, e);
                    if (t > 127 || t < -128)
                        throw "Index out of range (" + t + ")";
                    return t
                }
                ,
                d = 4),
                2 == d && (m[2] = function(e) {
                    var t = Parser.evaluate(v, e);
                    if (t > 127 || t < -128)
                        throw "Index out of range (" + t + ")";
                    return t
                }
                ,
                d = 3)),
                n && (m.push(n),
                d++),
                t.lens = m,
                t.bytes = d,
                t
            }
            return null
        }
    };
    return e
}),
function(e, t) {
    "undefined" != typeof module ? (module.exports = t(),
    ASM = module.exports) : "function" == typeof define && "object" == typeof define.amd ? define(t) : this.ASM = t()
}(0, function() {
    "use strict";
    var e = null
      , t = null
      , r = {}
      , n = !1
      , s = function(e) {
        return e.map(function(e) {
            var t = e.line;
            for (t = (t = t.replace("&lt;", "<")).replace("&gt;", ">"); " " == t[t.length - 1]; )
                t = t.substr(0, t.length - 1);
            if (e.line = t,
            " " != t[0])
                return e;
            for (; " " == t[0]; )
                t = t.substr(1);
            return e.line = " " + t,
            e
        })
    }
      , o = function(e) {
        return e.filter(function(e) {
            for (var t = e.line; " " == t[0]; )
                t = t.substr(1);
            return !!t.length
        })
    }
      , i = function(e) {
        return e.map(function(e) {
            for (var t = e.line, r = {
                addr: 0,
                line: ";;;EMPTYLINE",
                numline: e.numline
            }; " " == t[0]; )
                t = t.substr(1);
            return t.length ? e : r
        })
    }
      , a = function(e) {
        var t = 1;
        return e.map(function(e) {
            return {
                line: e,
                numline: t++,
                addr: null,
                bytes: 0
            }
        })
    }
      , l = function(e) {
        return e.replace(/^\s+|\s+$/g, "")
    }
      , p = function(t, r, n, s) {
        var o = t.line
          , i = o.match(/^\s*(\@{0,1}[a-zA-Z0-9-_]+):\s*(.*)/);
        i && (t.label = i[1].toUpperCase(),
        o = i[2]);
        var a = o.match(/^\s*(\=)\s*(.*)/);
        if (a ? (t.opcode = a[1].toUpperCase(),
        o = a[2]) : (a = o.match(/^\s*([\.a-zA-Z0-9-_]+)\s*(.*)/)) && (t.opcode = a[1].toUpperCase(),
        o = a[2]),
        o) {
            for (; o.match(/"(.*?);(.*?)"/g); )
                o = o.replace(/"(.*?);(.*?)"/g, '"$1§$2"');
            var u = o.match(/^\s*([^;]*)(.*)/);
            if (u && u[1].length) {
                t.paramstring = u[1];
                for (var h = u[1]; h.match(/"(.*?),(.*?)"/g); )
                    h = h.replace(/"(.*?),(.*?)"/g, '"$1€$2"');
                for (; h.match(/'(.*?),(.*?)'/g); )
                    h = h.replace(/'(.*?),(.*?)'/g, '"$1€$2"');
                var f = h.match(/([0-9]+)\s*DUP\s*\((.*)\)/i);
                if (f) {
                    for (var c = parseInt(f[1]), d = "", m = 0; m < c; m++)
                        d += f[2] + ",";
                    h = d.substring(0, d.length - 1)
                }
                var g = h.split(/\s*,\s*/);
                t.params = g.map(function(e) {
                    return l(e.replace(/€/g, ",").replace(/§/g, ";"))
                }),
                o = u[2].replace(/§/g, ";")
            }
        }
        if (o) {
            var v = o.match(/^\s*;*(.*)/);
            v && (t.remark = v[1],
            t.remark || (t.remark = " "),
            o = "")
        }
        if (t.notparsed = o,
        "ORG" === t.opcode && (t.opcode = ".ORG"),
        ".ERROR" === t.opcode)
            throw {
                msg: t.paramstring,
                s: t
            };
        if (".EQU" === t.opcode && (t.opcode = "EQU"),
        ".ORG" === t.opcode)
            try {
                return t
            } catch (e) {
                throw {
                    msg: e.message,
                    s: t
                }
            }
        if ("DEFB" === t.opcode)
            return t.opcode = "DB",
            t;
        if (".BYTE" === t.opcode)
            return t.opcode = "DB",
            t;
        if (".DB" === t.opcode)
            return t.opcode = "DB",
            t;
        if (".WORD" === t.opcode)
            return t.opcode = "DW",
            t;
        if (".DW" === t.opcode)
            return t.opcode = "DW",
            t;
        if ("DEFW" === t.opcode)
            return t.opcode = "DW",
            t;
        if ("DEFS" === t.opcode)
            return t.opcode = "DS",
            t;
        if (".RES" === t.opcode)
            return t.opcode = "DS",
            t;
        if ("DEFM" === t.opcode)
            return t.opcode = "DS",
            t;
        if (".ALIGN" === t.opcode)
            return t.opcode = "ALIGN",
            t;
        if (".IF" === t.opcode)
            return t.opcode = "IF",
            t;
        if (".ELSE" === t.opcode)
            return t.opcode = "ELSE",
            t;
        if (".ENDIF" === t.opcode)
            return t.opcode = "ENDIF",
            t;
        if ("EQU" === t.opcode || "=" === t.opcode || "IF" === t.opcode || "IFN" === t.opcode || "ELSE" === t.opcode || "ENDIF" === t.opcode || ".INCLUDE" === t.opcode || ".INCBIN" === t.opcode || ".MACRO" === t.opcode || ".ENDM" === t.opcode || ".BLOCK" === t.opcode || ".ENDBLOCK" === t.opcode || ".REPT" === t.opcode || ".CPU" === t.opcode || ".ENT" === t.opcode || ".BINFROM" === t.opcode || ".BINTO" === t.opcode || ".ENGINE" === t.opcode || ".PRAGMA" === t.opcode || "END" === t.opcode || ".END" === t.opcode || "BSZ" === t.opcode || "FCB" === t.opcode || "FCC" === t.opcode || "FDB" === t.opcode || "FILL" === t.opcode || "RMB" === t.opcode || "ZMB" === t.opcode || ".M8" === t.opcode || ".X8" === t.opcode || ".M16" === t.opcode || ".X16" === t.opcode || ".PHASE" === t.opcode || ".DEPHASE" === t.opcode || "ALIGN" === t.opcode || ".CSTR" === t.opcode || ".ISTR" === t.opcode || ".PSTR" === t.opcode || ".CSEG" === t.opcode || ".DSEG" === t.opcode || ".ESEG" === t.opcode || ".BSSEG" === t.opcode || "DB" === t.opcode || "DS" === t.opcode || "DW" === t.opcode)
            return t;
        if (".DEBUGINFO" === t.opcode || ".MACPACK" === t.opcode || ".FEATURE" === t.opcode || ".ZEROPAGE" === t.opcode || ".SEGMENT" === t.opcode || ".SETCPU" === t.opcode)
            return t.opcode = "",
            t;
        if (!t.opcode && t.label)
            return t;
        try {
            var b = e.parseOpcode(t)
            // console.log(e)
        } catch (e) {
            throw {
                msg: e,
                s: t
            }
        }
        if (null !== b)
            return b;
        if (r[t.opcode])
            return t.macro = t.opcode,
            t;
        if (!t.label && !n) {
            var C = {
                line: t.line,
                numline: t.numline,
                addr: null,
                bytes: 0
            };
            if (t.remark && !t.opcode)
                return t;
            if (!t.params)
                throw {
                    msg: "Unrecognized instruction " + t.opcode,
                    s: t
                };
            if (!t.opcode)
                throw {
                    msg: "Unrecognized instruction " + t.opcode,
                    s: t
                };
            0 === t.params[0].indexOf(":=") && (t.params[0] = t.params[0].substr(1)),
            C.line = t.opcode + ": " + t.params.join();
            var x = p(C, r, !0, t);
            if (!x.opcode)
                throw {
                    msg: "Unrecognized instruction " + t.opcode,
                    s: t
                };
            return x
        }
        if (n)
            throw {
                msg: "Unrecognized instruction " + s.opcode,
                s: t
            };
        throw {
            msg: "Unrecognized instruction " + t.opcode,
            s: t
        }
    }
      , u = function(e, n) {
        var i, p, h = null;
        n = n || {};
        for (var f = {}, c = null, d = null, m = [], g = 0, v = e.length; g < v; g++)
            if (i = e[g].line,
            p = i.match(/\s*(\.[^\s]+)(.*)/)) {
                var b = p[1].toUpperCase()
                  , C = p[2].match(/^\s*([^;]*)(.*)/);
                if (C && C[1].length ? (C[1],
                h = C[1].split(/\s*,\s*/).map(l)) : h = null,
                ".INCLUDE" !== b || !n.noinclude)
                    if (".INCLUDE" !== b)
                        if (".ENDM" !== b)
                            if (".MACRO" !== b)
                                if (".REPT" !== b)
                                    m.push(e[g]);
                                else {
                                    if (!h[0])
                                        throw {
                                            msg: "No repeat count given",
                                            s: e[g]
                                        };
                                    if (!(d = Parser.evaluate(h[0])))
                                        throw {
                                            msg: "Bad repeat count given",
                                            s: e[g]
                                        };
                                    if (c = "*REPT" + e[g].numline,
                                    f[c])
                                        throw {
                                            msg: "Macro redefinition at line " + e[g].numline,
                                            s: e[g]
                                        };
                                    f[c] = []
                                }
                            else {
                                if (!h[0])
                                    throw {
                                        msg: "Bad macro name at line " + e[g].numline,
                                        s: e[g]
                                    };
                                if (c = h[0].toUpperCase(),
                                f[c])
                                    throw {
                                        msg: "Macro redefinition at line " + e[g].numline,
                                        s: e[g]
                                    };
                                f[c] = []
                            }
                        else {
                            if (!c)
                                throw {
                                    msg: "ENDM without MACRO at line " + e[g].numline,
                                    s: e[g]
                                };
                            if (d) {
                                m.push({
                                    numline: e[g].numline,
                                    line: ";rept unroll",
                                    addr: null,
                                    bytes: 0,
                                    remark: "REPT unroll"
                                });
                                for (var x = 0; x < d; x++)
                                    for (var A = 0; A < f[c].length; A++) {
                                        var y = f[c][A].line;
                                        m.push({
                                            numline: e[x].numline,
                                            line: y,
                                            addr: null,
                                            bytes: 0
                                        })
                                    }
                            }
                            c = null,
                            d = null
                        }
                    else {
                        if (!h || !h[0])
                            throw {
                                msg: "No file name given",
                                s: e[g]
                            };
                        if (r[h[0].replace(/\"/g, "")])
                            throw {
                                msg: "File " + h[0].replace(/\"/g, "") + " is already included elsewhere - maybe recursion",
                                s: e[g]
                            };
                        var M = t(h[0].replace(/\"/g, ""));
                        if (!M)
                            throw {
                                msg: "File " + h[0] + " not found",
                                s: e[g]
                            };
                        var E = a(M.split(/\n/));
                        E = o(E),
                        E = s(E);
                        for (var S = u(E), P = 0; P < S[0].length; P++)
                            S[0][P].includedFile = h[0].replace(/\"/g, ""),
                            m.push(S[0][P]);
                        for (P in S[1])
                            f[P] = S[1][P];
                        r[h[0].replace(/\"/g, "")] = M
                    }
            } else {
                if (c) {
                    f[c].push(e[g]);
                    continue
                }
                m.push(e[g])
            }
        if (c)
            throw {
                msg: "MACRO " + c + " has no appropriate ENDM",
                s: e[g]
            };
        return [m, f]
    }
      , h = function(e, t) {
        var r = {
            line: e.line,
            addr: e.addr,
            macro: e.macro,
            numline: e.numline
        };
        t = t || [];
        for (var n = 0; n < t.length; n++)
            r.line = r.line.replace("%%" + (n + 1), t[n]);
        return r
    }
      , f = function(e, t) {
        for (var r = [], n = 0; n < e.length; n++) {
            var s = e[n];
            if (s.macro)
                for (var o = t[s.macro], i = 0; i < o.length; i++) {
                    var a = p(h(o[i], s.params), t);
                    s.label && (a.label = s.label),
                    s.label = "",
                    a.remark = s.remark,
                    a.macro = s.macro,
                    s.macro = null,
                    s.remark = "",
                    r.push(a)
                }
            else
                r.push(s)
        }
        return r
    }
      , c = {}
      , d = function(e, t) {
        for (var r = e.toString(16); r.length < t; )
            r = "0" + r;
        return r.toUpperCase()
    }
      , m = function(e) {
        return d(255 & e, 2)
    }
      , g = function(e) {
        return d(e, 4)
    }
      , v = function(e) {
        return d(e, 6)
    }
      , b = function(e) {
        if (ASM.PRAGMAS.RELAX)
            return "string" == typeof e ? 255 & e.charCodeAt(0) : 255 & e;
        if ("string" == typeof e) {
            if (1 != e.length)
                throw "String parameter too long (" + e + ")";
            return 255 & e.charCodeAt(0)
        }
        if (e > 255)
            throw "Param out of bound (" + e + ")";
        if (e < -128)
            throw "Param out of bound (" + e + ")";
        return 255 & e
    }
      , C = function(e, t) {
        var r = ":"
          , n = t.length
          , s = 0;
        r += m(n),
        r += g(e),
        r += "00",
        s = n + Math.floor(e / 256) + Math.floor(e % 256);
        for (var o = 0; o < t.length; o++)
            r += m(t[o]),
            s += t[o];
        return r += m(256 - s % 256)
    }
      , x = function(e, t, r) {
        var n = 0
          , s = []
          , o = 16;
        r > 1 && (o = r);
        for (var i = "", a = 0; a < t.length; a++)
            s.push(t[a]),
            ++n === o && (i += C(e, s) + "\n",
            s = [],
            n = 0,
            e += o);
        return s.length && (i += C(e, s) + "\n"),
        i
    }
      , A = function(e, t) {
        var r = "S1"
          , n = t.length
          , s = 0;
        r += m(n + 3),
        r += g(e),
        s = n + 3 + Math.floor(e / 256) + Math.floor(e % 256);
        for (var o = 0; o < t.length; o++)
            r += m(t[o]),
            s += t[o];
        return r += m(256 - s % 256)
    }
      , y = function(e, t) {
        for (var r = 0, n = [], s = "", o = 0; o < t.length; o++)
            n.push(t[o]),
            16 == ++r && (s += A(e, n) + "\n",
            n = [],
            r = 0,
            e += 16);
        return n.length && (s += A(e, n) + "\n"),
        s
    }
      , M = function(e, t) {
        var r = "S2"
          , n = t.length
          , s = 0;
        r += m(n + 4),
        r += v(e),
        s = n + 4 + Math.floor(e / 65536) + Math.floor(e / 256) % 256 + Math.floor(e % 256);
        for (var o = 0; o < t.length; o++)
            r += m(t[o]),
            s += t[o];
        return r += m(255 - s % 256)
    }
      , E = function(e, t) {
        for (var r = 0, n = [], s = "", o = 0; o < t.length; o++)
            n.push(t[o]),
            16 == ++r && (s += M(e, n) + "\n",
            n = [],
            r = 0,
            e += 16);
        return n.length && (s += M(e, n) + "\n"),
        s
    };
    return {
        parse: function(t, i) {
            e = i,
            i.endian && (n = i.endian),
            r = {};
            var l = a(t.split(/\n/));
            l = o(l),
            l = s(l);
            var h = u(l);
            return l = h[0].map(function(e) {
                return p(e, h[1])
            }),
            l = f(l, h[1])
        },
        pass1: function(r, n) {
            var s = "CSEG"
              , o = function() {
                if ("BSSEG" === s)
                    throw h.opcode + " is not allowed in BSSEG"
            }
              , i = {}
              , a = 0
              , l = {};
            n && (l = n);
            for (var p, u, h = null, f = 0, d = 0, m = [], g = 0, v = 0, b = r.length; v < b; v++)
                if (h = r[v],
                ASM.WLINE = r[v],
                h.pass = 1,
                h.segment = s,
                h.addr = a,
                l._PC = a,
                0 !== g && (h.phase = g),
                "ENDIF" !== h.opcode)
                    if ("ELSE" !== h.opcode)
                        if (f)
                            h.ifskip = !0;
                        else if ("IF" !== h.opcode)
                            if ("IFN" !== h.opcode)
                                if (".BLOCK" !== h.opcode)
                                    if (".ENDBLOCK" !== h.opcode) {
                                        if (h.label) {
                                            var C = h.label
                                              , x = !1;
                                            if ("@" === C[0] && (x = !0,
                                            C = C.substr(1),
                                            h.label = C,
                                            h.beGlobal = !0),
                                            h.beGlobal && (x = !0),
                                            m.length > 0 && (C = m.join("/") + "/" + C,
                                            l["__" + m.join("/")].push(h.label)),
                                            !n && (l[C + "$"] || x && void 0 !== l[h.label]))
                                                throw {
                                                    msg: "Redefine label " + h.label + " at line " + h.numline,
                                                    s: h
                                                };
                                            l[h.label] ? l[C] = l[h.label] : x && (l[C] = a),
                                            c[h.label] = {
                                                defined: {
                                                    line: h.numline,
                                                    file: h.includedFile || "*main*"
                                                },
                                                value: a
                                            },
                                            l[C + "$"] = a,
                                            l[h.label] = a,
                                            x && (l[C] = a)
                                        }
                                        try {
                                            if (".ORG" === h.opcode) {
                                                a = Parser.evaluate(h.params[0], l),
                                                h.addr = a,
                                                i[s] = a;
                                                continue
                                            }
                                            if (".CSEG" === h.opcode && (i[s] = a,
                                            s = "CSEG",
                                            h.segment = s,
                                            a = i[s] || 0,
                                            h.addr = a),
                                            ".DSEG" === h.opcode && (i[s] = a,
                                            s = "DSEG",
                                            h.segment = s,
                                            a = i[s] || 0,
                                            h.addr = a),
                                            ".ESEG" === h.opcode && (i[s] = a,
                                            s = "ESEG",
                                            h.segment = s,
                                            a = i[s] || 0,
                                            h.addr = a),
                                            ".BSSEG" === h.opcode && (i[s] = a,
                                            s = "BSSEG",
                                            h.segment = s,
                                            a = i[s] || 0,
                                            h.addr = a),
                                            ".PHASE" === h.opcode) {
                                                if (g)
                                                    throw {
                                                        message: "PHASE cannot be nested"
                                                    };
                                                var A = Parser.evaluate(h.params[0], l);
                                                h.addr = a,
                                                g = A - a,
                                                a = A;
                                                continue
                                            }
                                            if (".DEPHASE" === h.opcode) {
                                                h.addr = a,
                                                a -= g,
                                                g = 0;
                                                continue
                                            }
                                            if ("EQU" === h.opcode) {
                                                try {
                                                    l[h.label] = Parser.evaluate(h.params[0], l)
                                                } catch (e) {
                                                    l[h.label] = null
                                                }
                                                c[h.label] = {
                                                    defined: {
                                                        line: h.numline,
                                                        file: h.includedFile || "*main*"
                                                    },
                                                    value: l[h.label]
                                                };
                                                continue
                                            }
                                            if ("=" === h.opcode || ":=" === h.opcode) {
                                                l[h.label] = Parser.evaluate(h.params[0], l),
                                                c[h.label] = {
                                                    defined: {
                                                        line: h.numline,
                                                        file: h.includedFile || "*main*"
                                                    },
                                                    value: l[h.label]
                                                };
                                                continue
                                            }
                                        } catch (e) {
                                            throw {
                                                msg: e.message,
                                                s: h
                                            }
                                        }
                                        if ("DB" === h.opcode || "FCB" === h.opcode)
                                            for (o(),
                                            h.bytes = 0,
                                            u = 0; u < h.params.length; u++)
                                                try {
                                                    if ("number" == typeof (p = Parser.evaluate(h.params[u], l))) {
                                                        h.bytes++;
                                                        continue
                                                    }
                                                    if ("string" == typeof p) {
                                                        h.bytes += p.length;
                                                        continue
                                                    }
                                                } catch (e) {
                                                    h.bytes++
                                                }
                                        if (".CSTR" === h.opcode || ".PSTR" === h.opcode || ".ISTR" === h.opcode) {
                                            for (o(),
                                            h.bytes = 0,
                                            u = 0; u < h.params.length; u++)
                                                try {
                                                    if ("number" == typeof (p = Parser.evaluate(h.params[u], l))) {
                                                        h.bytes++;
                                                        continue
                                                    }
                                                    if ("string" == typeof p) {
                                                        h.bytes += p.length;
                                                        continue
                                                    }
                                                } catch (e) {
                                                    h.bytes++
                                                }
                                            ".CSTR" !== h.opcode && ".PSTR" !== h.opcode || h.bytes++
                                        }
                                        if ("DS" !== h.opcode && "RMB" !== h.opcode)
                                            if ("ALIGN" !== h.opcode)
                                                if ("FILL" !== h.opcode)
                                                    if ("BSZ" !== h.opcode && "ZMB" !== h.opcode) {
                                                        if ("DW" === h.opcode || "FDB" === h.opcode)
                                                            for (o(),
                                                            h.bytes = 0,
                                                            u = 0; u < h.params.length; u++)
                                                                try {
                                                                    if ("number" == typeof (p = Parser.evaluate(h.params[u], l))) {
                                                                        h.bytes += 2;
                                                                        continue
                                                                    }
                                                                } catch (e) {
                                                                    h.bytes += 2
                                                                }
                                                        if (".INCBIN" !== h.opcode)
                                                            if (".M16" !== h.opcode)
                                                                if (".M8" !== h.opcode)
                                                                    if (".X16" !== h.opcode)
                                                                        if (".X8" !== h.opcode) {
                                                                            var y = e.parseOpcode(r[v], l);
                                                                            // console.log(e);
                                                                            y && (o(),
                                                                            h = y),
                                                                            void 0 === h.bytes && (h.bytes = 0),
                                                                            a += h.bytes
                                                                        } else
                                                                            l.__MX = 8;
                                                                    else
                                                                        l.__MX = 16;
                                                                else
                                                                    l.__AX = 8;
                                                            else
                                                                l.__AX = 16;
                                                        else {
                                                            if (o(),
                                                            !h.params[0])
                                                                throw {
                                                                    msg: "No file name given at line " + h.numline,
                                                                    s: h
                                                                };
                                                            var M = t(h.params[0], !0);
                                                            if (!M)
                                                                throw {
                                                                    msg: "Cannot find file " + h.params[0] + " for incbin",
                                                                    s: h
                                                                };
                                                            for (h.bytes = 0,
                                                            h.lens = [],
                                                            w = 0; w < M.length; w++) {
                                                                var E = M.charCodeAt(w);
                                                                E > 255 && (h.lens[h.bytes++] = E >> 8),
                                                                h.lens[h.bytes++] = E % 256
                                                            }
                                                            a += h.bytes
                                                        }
                                                    } else {
                                                        for (o(),
                                                        P = Parser.evaluate(h.params[0], l),
                                                        h.bytes = P,
                                                        h.lens = [],
                                                        w = 0; w < P; w++)
                                                            h.lens[w] = 0;
                                                        a += P
                                                    }
                                                else {
                                                    for (o(),
                                                    P = Parser.evaluate(h.params[1], l),
                                                    "string" == typeof (p = Parser.evaluate(h.params[0], l)) && (p = p.charCodeAt(0)),
                                                    h.bytes = P,
                                                    h.lens = [],
                                                    w = 0; w < P; w++)
                                                        h.lens[w] = p;
                                                    a += P
                                                }
                                            else {
                                                var S = Parser.evaluate(h.params[0], l);
                                                a += a % S > 0 ? S - a % S : 0
                                            }
                                        else {
                                            var P = Parser.evaluate(h.params[0], l);
                                            if (2 == h.params.length) {
                                                "string" == typeof (p = Parser.evaluate(h.params[1], l)) && (p = p.charCodeAt(0)),
                                                h.bytes = P,
                                                h.lens = [];
                                                for (var w = 0; w < P; w++)
                                                    h.lens[w] = p
                                            }
                                            a += P
                                        }
                                    } else {
                                        for (var I = l["__" + m.join("/")], R = 0; R < I.length; R++)
                                            l[I[R]] = l[m.join("/") + "/" + I[R]],
                                            l[m.join("/") + "/" + I[R]] = null;
                                        m.pop(),
                                        l.__blocks = JSON.stringify(m)
                                    }
                                else {
                                    m.push(h.numline);
                                    var N = m.join("/");
                                    l["__" + N] = []
                                }
                            else {
                                if (d)
                                    throw {
                                        msg: "Nested IFs are not supported",
                                        s: h
                                    };
                                try {
                                    Parser.evaluate(h.params[0], l) && (f = 1),
                                    d = 1
                                } catch (e) {
                                    throw {
                                        msg: "IF condition canot be determined",
                                        s: h
                                    }
                                }
                            }
                        else {
                            if (d)
                                throw {
                                    msg: "Nested IFs are not supported",
                                    s: h
                                };
                            try {
                                Parser.evaluate(h.params[0], l) || (f = 1),
                                d = 1
                            } catch (e) {
                                throw {
                                    msg: "IF condition canot be determined",
                                    s: h
                                }
                            }
                        }
                    else {
                        if (!d)
                            throw {
                                msg: "ELSE without IF",
                                s: h
                            };
                        f = f ? 0 : 1
                    }
                else {
                    if (!d)
                        throw {
                            msg: "ENDIF without IF",
                            s: h
                        };
                    f = 0,
                    d = 0
                }
            return [r, l]
        },
        pass2: function(e) {
            for (var t, r, s, o = e[0], i = e[1], a = null, l = null, p = [], u = 0, h = 0, f = o.length; h < f; h++)
                try {
                    if (a = o[h],
                    a.pass = 2,
                    "ENDIF" === a.opcode) {
                        u = 0;
                        continue
                    }
                    if ("ELSE" === a.opcode) {
                        u = u ? 0 : 1;
                        continue
                    }
                    if (u)
                        continue;
                    if ("IF" === a.opcode) {
                        Parser.evaluate(a.params[0], i);
                        try {
                            Parser.evaluate(a.params[0], i) || (u = 1)
                        } catch (e) {
                            throw {
                                message: "IF condition mismatched"
                            }
                        }
                        continue
                    }
                    if ("IFN" === a.opcode) {
                        try {
                            Parser.evaluate(a.params[0], i) && (u = 1)
                        } catch (e) {
                            throw {
                                message: "IF condition mismatched"
                            }
                        }
                        continue
                    }
                    i._PC = a.addr;
                    try {
                        for (var d = Parser.usage(a.params[0].toUpperCase(), i), m = 0; m < d.length; m++)
                            c[d[m]].usage || (c[d[m]].usage = []),
                            c[d[m]].usage.push({
                                line: a.numline,
                                file: a.includedFile || "*main*"
                            })
                    } catch (e) {}
                    try {
                        for (var d = Parser.usage(a.params[1].toUpperCase(), i), m = 0; m < d.length; m++)
                            c[d[m]].usage || (c[d[m]].usage = []),
                            c[d[m]].usage.push({
                                line: a.numline,
                                file: a.includedFile || "*main*"
                            })
                    } catch (e) {}
                    if (".BLOCK" === a.opcode) {
                        p.push(a.numline);
                        for (var g = i["__" + p.join("/")], v = 0; v < g.length; v++)
                            i[p.join("/") + "/" + g[v]] = i[g[v]],
                            i[g[v]] = i[p.join("/") + "/" + g[v] + "$"];
                        continue
                    }
                    if (".ENDBLOCK" === a.opcode) {
                        for (var g = i["__" + p.join("/")], v = 0; v < g.length; v++)
                            i[g[v]] = i[p.join("/") + "/" + g[v]],
                            void 0 === i[g[v]] && delete i[g[v]],
                            i[p.join("/") + "/" + g[v]] = null;
                        p.pop();
                        continue
                    }
                    if (".ENT" === a.opcode) {
                        ASM.ENT = Parser.evaluate(a.params[0], i);
                        continue
                    }
                    if (".BINFROM" === a.opcode) {
                        ASM.BINFROM = Parser.evaluate(a.params[0], i);
                        continue
                    }
                    if (".BINTO" === a.opcode) {
                        ASM.BINTO = Parser.evaluate(a.params[0], i);
                        continue
                    }
                    if (".ENGINE" === a.opcode) {
                        ASM.ENGINE = a.params[0];
                        continue
                    }
                    if (".PRAGMA" === a.opcode) {
                        ASM.PRAGMAS = ASM.PRAGMAS || [],
                        ASM.PRAGMAS.push(a.params[0].toUpperCase());
                        continue
                    }
                    if ("EQU" === a.opcode) {
                        i[a.label] = Parser.evaluate(a.params[0], i);
                        continue
                    }
                    if ("DB" === a.opcode || "FCB" === a.opcode) {
                        for (r = 0,
                        a.lens = [],
                        s = 0; s < a.params.length; s++)
                            if ("number" != typeof (t = Parser.evaluate(a.params[s], i)))
                                if ("string" != typeof t)
                                    ;
                                else
                                    for (C = 0; C < t.length; C++)
                                        a.lens[r++] = t.charCodeAt(C);
                            else
                                a.lens[r++] = Math.floor(t % 256);
                        continue
                    }
                    if (".CSTR" === a.opcode) {
                        for (r = 0,
                        a.lens = [],
                        s = 0; s < a.params.length; s++)
                            if ("number" != typeof (t = Parser.evaluate(a.params[s], i)))
                                if ("string" != typeof t)
                                    ;
                                else
                                    for (C = 0; C < t.length; C++)
                                        a.lens[r++] = t.charCodeAt(C);
                            else
                                a.lens[r++] = Math.floor(t % 256);
                        a.lens[r++] = 0;
                        continue
                    }
                    if (".PSTR" === a.opcode) {
                        for (r = 1,
                        a.lens = [],
                        s = 0; s < a.params.length; s++)
                            if ("number" != typeof (t = Parser.evaluate(a.params[s], i)))
                                if ("string" != typeof t)
                                    ;
                                else
                                    for (C = 0; C < t.length; C++)
                                        a.lens[r++] = t.charCodeAt(C);
                            else
                                a.lens[r++] = Math.floor(t % 256);
                        a.lens[0] = r - 1;
                        continue
                    }
                    if (".ISTR" === a.opcode) {
                        for (r = 0,
                        a.lens = [],
                        s = 0; s < a.params.length; s++)
                            if ("number" != typeof (t = Parser.evaluate(a.params[s], i)))
                                if ("string" != typeof t)
                                    ;
                                else
                                    for (var C = 0; C < t.length; C++)
                                        a.lens[r++] = 127 & t.charCodeAt(C);
                            else
                                a.lens[r++] = Math.floor(t % 128);
                        a.lens[r - 1] = 128 | a.lens[r - 1];
                        continue
                    }
                    if ("DW" === a.opcode || "FDB" === a.opcode) {
                        for (r = 0,
                        a.lens = [],
                        s = 0; s < a.params.length; s++)
                            "number" != typeof (t = Parser.evaluate(a.params[s], i)) || (n ? (a.lens[r++] = Math.floor(t / 256),
                            a.lens[r++] = Math.floor(t % 256)) : (a.lens[r++] = Math.floor(t % 256),
                            a.lens[r++] = Math.floor(t / 256)));
                        continue
                    }
                    if (a.lens && a.lens[1] && "function" == typeof a.lens[1] && ("addr24" === a.lens[2] ? (l = a.lens[1](i),
                    n ? (a.lens[3] = Math.floor(l % 256),
                    a.lens[2] = Math.floor((l >> 8) % 256),
                    a.lens[1] = Math.floor(l >> 16 & 255)) : (a.lens[1] = Math.floor(l % 256),
                    a.lens[2] = Math.floor((l >> 8) % 256),
                    a.lens[3] = Math.floor(l >> 16 & 255))) : null === a.lens[2] ? "string" == typeof (l = a.lens[1](i)) ? n ? (a.lens[1] = 255 & l.charCodeAt(0),
                    a.lens[2] = 255 & l.charCodeAt(1)) : (a.lens[2] = 255 & l.charCodeAt(0),
                    a.lens[1] = 255 & l.charCodeAt(1)) : n ? (a.lens[2] = Math.floor(l % 256),
                    a.lens[1] = Math.floor(l / 256)) : (a.lens[1] = Math.floor(l % 256),
                    a.lens[2] = Math.floor(l / 256)) : (l = a.lens[1](i),
                    a.lens[1] = b(l))),
                    a.lens && a.lens.length > 2 && "function" == typeof a.lens[2] && (l = a.lens[2](i),
                    null === a.lens[3] ? "string" == typeof (l = a.lens[2](i)) ? n ? (a.lens[2] = 255 & l.charCodeAt(0),
                    a.lens[3] = 255 & l.charCodeAt(1)) : (a.lens[3] = 255 & l.charCodeAt(0),
                    a.lens[2] = 255 & l.charCodeAt(1)) : n ? (a.lens[3] = 255 & l,
                    a.lens[2] = l >> 8) : (a.lens[2] = 255 & l,
                    a.lens[3] = l >> 8) : a.lens[2] = b(l)),
                    a.lens && a.lens.length > 3 && "function" == typeof a.lens[3] && (l = a.lens[3](i),
                    null === a.lens[4] ? "string" == typeof (l = a.lens[3](i)) ? n ? (a.lens[3] = 255 & l.charCodeAt(0),
                    a.lens[4] = 255 & l.charCodeAt(1)) : (a.lens[4] = 255 & l.charCodeAt(0),
                    a.lens[3] = 255 & l.charCodeAt(1)) : n ? (a.lens[4] = 255 & l,
                    a.lens[3] = l >> 8) : (a.lens[3] = 255 & l,
                    a.lens[4] = l >> 8) : a.lens[3] = b(l)),
                    a.lens && a.lens.length > 1) {
                        if ("string" == typeof a.lens[1] && (a.lens[1] = a.lens[1].charCodeAt(0)),
                        isNaN(a.lens[1]))
                            throw console.log(1201, a),
                            {
                                message: "param out of bounds, NaN"
                            };
                        if ((a.lens[1] > 255 || a.lens[1] < -128) && 2 == a.lens.length)
                            throw {
                                message: "param out of bounds - " + a.lens[1]
                            };
                        a.lens[1] < 0 && (a.lens[1] = 256 + a.lens[1])
                    }
                } catch (e) {
                    throw {
                        msg: e.message,
                        s: a,
                        e: e
                    }
                }
            return [o, i]
        },
        parseLine: p,
        ENT: null,
        WLINE: null,
        compile: function(e, t) {
            try {
                ASM.ENT = null,
                ASM.BINFROM = null,
                ASM.BINTO = null,
                ASM.ENGINE = null,
                ASM.PRAGMAS = [];
                var r = ASM.parse(e, t);
                c = {};
                var n = ASM.pass1(r);
                return n = ASM.pass1(n[0], n[1]),
                n = ASM.pass1(n[0], n[1]),
                n = ASM.pass1(n[0], n[1]),
                n = ASM.pass1(n[0], n[1]),
                n = ASM.pass1(n[0], n[1]),
                n = ASM.pass1(n[0], n[1]),
                n = ASM.pass2(n),
                [null, n, c]
            } catch (e) {
                console.log(e);
                var s = e.s || "Internal error";
                return e.e && (e = "object" == typeof e.e ? e.e : {
                    msg: e.e,
                    s: e.s
                }),
                !e.msg && e.message && (e.msg = e.message),
                e.msg ? (e.s || (e.s = s),
                [e, null]) : ["Cannot evaluate line " + ASM.WLINE.numline + ", there is some unspecified error (e.g. reserved world as label etc.)", null]
            }
        },
        compileAsync: function(e, t, r) {
            try {
                var n = ASM.parse(e, t)
                  , s = ASM.pass1(n);
                s = ASM.pass2(s),
                r(null, s)
            } catch (e) {
                r(e, null)
            }
        },
        lst: function(e, t, r, n, s) {
            var o, i, a = "";
            void 0 === n && (n = !1);
            for (var l = 0, p = e.length; l < p; l++) {
                if (i = e[l],
                o = "",
                i.macro && !r && (o += "        **MACRO UNROLL - " + i.macro + "\n"),
                void 0 === i.addr || i.ifskip || (o += g(i.addr),
                i.phase && (o += " @" + g(i.addr - i.phase)),
                o += n ? " " : "   "),
                i.lens && !i.ifskip)
                    for (var u = 0; u < i.lens.length; u++)
                        o += m(i.lens[u]) + " ";
                if (!n)
                    for (; o.length < 20; )
                        o += " ";
                if (n)
                    for (; o.length < 15; )
                        o += " ";
                if (i.label && (o += i.label + ":   "),
                !n)
                    for (; o.length < 30; )
                        o += " ";
                if (n)
                    for (; o.length < 22; )
                        o += " ";
                i.opcode && (o += i.opcode + (n ? " " : "   ")),
                i.params && (o += i.params + (n ? " " : "   ")),
                i.remark && (o += ";" + i.remark),
                a += o + "\n"
            }
            if (r)
                return a;
            a += "\n\n";
            for (var h in c)
                if (null !== c[h] && ("_" != h[0] || "_" != h[1]) && "$" !== h[h.length - 1]) {
                    for (o = "",
                    o += h + ": "; o.length < 20; )
                        o += " ";
                    if (o += g(c[h].value),
                    o += " DEFINED AT LINE " + c[h].defined.line,
                    "*main*" != c[h].defined.file && (o += " IN " + c[h].defined.file),
                    a += o + "\n",
                    c[h].usage)
                        for (p = 0; p < c[h].usage.length; p++)
                            a += "                    > USED AT LINE " + c[h].usage[p].line,
                            "*main*" != c[h].usage[p].file && (a += " IN " + c[h].usage[p].file),
                            a += "\n"
                }
            return a
        },
        html: function(e, t, r, n) {
            var s, o, i = "<html><head><meta charset=utf-8><body><table>";
            void 0 === n && (n = !1);
            for (var a = 0, l = e.length; a < l; a++) {
                if (o = e[a],
                s = '<tr id="ln' + o.numline + '">',
                o.macro && !r && (s += "        **MACRO UNROLL - " + o.macro + "\n"),
                void 0 !== o.addr ? (s += '<td><a name="ADDR' + g(o.addr) + '">' + g(o.addr) + "</a>",
                o.phase ? s += "</td><td>" + g(o.addr - o.phase) : s += "</td><td>",
                s += "</td>") : s += "<td></td><td></td>",
                o.lens) {
                    s += "<td>";
                    for (var p = 0; p < o.lens.length; p++)
                        s += m(o.lens[p]) + " ";
                    s += "</td>"
                } else
                    s += "<td></td>";
                o.label ? s += '<td><a name="LBL' + o.label + '">' + o.label + "</a></td>" : s += "<td></td>",
                o.opcode ? s += "<td>" + o.opcode + "</td>" : s += "<td></td>",
                o.params ? s += "<td>" + o.params.map(function(e) {
                    e += "";
                    for (var r in t)
                        if (null !== t[r] && ("_" != r[0] || "_" != r[1]) && "$" !== r[r.length - 1]) {
                            var n = new RegExp("^" + r + "$","i");
                            if (e.match(n))
                                return '<a href="#LBL' + r + '">' + e + "</a>"
                        }
                    return e
                }) + "</td>" : s += "<td></td>",
                o.remark ? s += "<td>;" + o.remark + "</td>" : s += "<td></td>",
                i += s + "</tr>\n"
            }
            return i += "</table>"
        },
        hex: function(e, t) {
            for (var r, n = null, s = 0, o = [], i = "", a = !1, l = 16, p = 0, u = e.length; p < u; p++)
                if (".PRAGMA" === (r = e[p]).opcode && (2 == r.params.length && "HEXLEN" == r.params[0].toUpperCase() && ((l = parseInt(r.params[1])) < 1 || l > 64) && (l = 16),
                1 == r.params.length && "SEGMENT" == r.params[0].toUpperCase() && (a = !0)),
                !(r.ifskip || a && (t || (t = "CSEG"),
                r.segment != t))) {
                    var h = r.addr;
                    if (r.phase && (h -= r.phase),
                    void 0 !== h && 0 === s && (n = h),
                    h != n + s && (s && (i += x(n, o, l)),
                    n = h,
                    s = 0,
                    o = []),
                    r.lens) {
                        for (var f = 0; f < r.lens.length; f++)
                            o.push(r.lens[f]);
                        s += r.lens.length
                    }
                }
            return o.length && (i += x(n, o, l)),
            i += ":00000001FF"
        },
        srec: function(e, t) {
            for (var r, n = null, s = 0, o = !1, i = [], a = "", l = 0, p = e.length; l < p; l++)
                if (".PRAGMA" === (r = e[l]).opcode && 1 == r.params.length && "SEGMENT" == r.params[0].toUpperCase() && (o = !0),
                !(r.ifskip || o && (t || (t = "CSEG"),
                r.segment != t))) {
                    var u = r.addr;
                    if (r.phase && (u -= r.phase),
                    void 0 !== u && 0 === s && (n = u),
                    u != n + s && (s && (a += y(n, i)),
                    n = u,
                    s = 0,
                    i = []),
                    r.lens) {
                        for (var h = 0; h < r.lens.length; h++)
                            i.push(r.lens[h]);
                        s += r.lens.length
                    }
                }
            i.length && (a += y(n, i));
            var f = ASM.ENT || 0
              , c = 3 + Math.floor(f / 256) + Math.floor(f % 256);
            return a += "S903" + g(f) + m(255 - c % 256)
        },
        srec28: function(e, t) {
            for (var r, n = null, s = 0, o = !1, i = [], a = "", l = 0, p = e.length; l < p; l++)
                if (".PRAGMA" === (r = e[l]).opcode && 1 == r.params.length && "SEGMENT" == r.params[0].toUpperCase() && (o = !0),
                !o || (t || (t = "CSEG"),
                r.segment == t)) {
                    var u = r.addr;
                    if (r.phase && (u -= r.phase),
                    void 0 !== u && 0 === s && (n = u),
                    u != n + s && (s && (a += E(n, i)),
                    n = u,
                    s = 0,
                    i = []),
                    r.lens) {
                        for (var h = 0; h < r.lens.length; h++)
                            i.push(r.lens[h]);
                        s += r.lens.length
                    }
                }
            i.length && (a += E(n, i));
            var f = ASM.ENT || 0
              , c = 3 + Math.floor(f / 256) + Math.floor(f % 256);
            return a += "S804" + v(f) + m(255 - c % 256) + "\n"
        },
        linemap: function(e) {
            for (var t, r = [], n = 0, s = e.length; n < s; n++)
                if ((t = e[n]).lens)
                    for (var o = 0; o < t.lens.length; o++)
                        r[t.addr + o] = n + 1;
            return r
        },
        beautify: function(t, r) {
            e = r;
            var n = a(t.split(/\n/));
            n = i(n),
            n = o(n),
            n = s(n);
            var l = u(n, {
                noinclude: !0
            });
            n = n.map(function(e) {
                return p(e, l[1])
            });
            for (var h, f, c = "", d = 0; d < n.length; d++)
                if (h = n[d],
                f = "",
                "EMPTYLINE" != h.remark)
                    if (h.label || h.opcode || !h.remark) {
                        for (h.label && (f += h.label,
                        "EQU" != h.opcode && "=" != h.opcode && (f += ":"),
                        f += " "); f.length < 12; )
                            f += " ";
                        for (h.opcode && (f += h.opcode + " "); f.length < 20; )
                            f += " ";
                        h.params && (f += h.params + " "),
                        h.remark && (f += ";" + h.remark),
                        c += f + "\n"
                    } else
                        c += ";" + h.remark + "\n";
                else
                    c += "\n";
            return c
        },
        buff: function(e) {
            // e: 输入数组
            // t: 用于存储输入数组中每个对象的临时变量
            // r: 用于存储在新数组中设置值的索引的临时变量
            // n: 由函数创建的新Uint8Array
            // s: 用于遍历输入数组中每个对象的计数器变量
            // o: 输入数组的长度
            for (var t, r, n = new Uint8Array(65536), s = 0, o = e.length; s < o; s++)
                if (t = e[s], r = t.addr, t.lens)
                    for (var i = 0; i < t.lens.length; i++)
                        n[r++] = t.lens[i];
            return n
        },
        fileGet: function(e) {
            t = e
        }
    }
}),
Array.indexOf || (Array.prototype.indexOf = function(e, t) {
    for (var r = t || 0; r < this.length; r++)
        if (this[r] === e)
            return r;
    return -1
}
);
var Parser = function(e) {
    function t(e) {
        function t() {}
        return t.prototype = e,
        new t
    }
    function r(e, t, r, n) {
        this.type_ = e,
        this.index_ = t || 0,
        this.prio_ = r || 0,
        this.number_ = void 0 !== n && null !== n ? n : 0,
        this.toString = function() {
            switch (this.type_) {
            case I:
                return this.number_;
            case R:
            case N:
            case k:
                return this.index_;
            case _:
                return "CALL";
            default:
                return "Invalid Token"
            }
        }
    }
    function n(e, t, r, n) {
        this.tokens = e,
        this.ops1 = t,
        this.ops2 = r,
        this.functions = n
    }
    function s(e) {
        return "string" == typeof e ? (U.lastIndex = 0,
        U.test(e) ? "'" + e.replace(U, function(e) {
            var t = D[e];
            return "string" == typeof t ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
        }) + "'" : "'" + e + "'") : e
    }
    function o(e) {
        for (var t = 0, r = 0; r < e.length; r++)
            t *= 256,
            t += e.charCodeAt(r);
        return t
    }
    function i(e, t) {
        return "string" == typeof e && (e = o(e)),
        "string" == typeof t && (t = o(t)),
        Number(e) + Number(t)
    }
    function a(e, t) {
        return Number(e) & Number(t)
    }
    function l(e, t) {
        return Number(e) | Number(t)
    }
    function p(e, t) {
        return Number(e) == Number(t) ? 1 : 0
    }
    function u(e, t) {
        return Number(e) == Number(t) ? 0 : 1
    }
    function h(e, t) {
        return Number(e) < Number(t) ? 1 : 0
    }
    function f(e, t) {
        return Number(e) > Number(t) ? 1 : 0
    }
    function c(e, t) {
        return Number(e) <= Number(t) ? 1 : 0
    }
    function d(e, t) {
        return Number(e) >= Number(t) ? 1 : 0
    }
    function m(e, t) {
        return "string" == typeof e && (e = o(e)),
        "string" == typeof t && (t = o(t)),
        Number(e) - Number(t)
    }
    function g(e, t) {
        if ("string" == typeof e) {
            for (var r = "", n = 0; n < t; n++)
                r += e;
            return r
        }
        return e * t
    }
    function v(e, t) {
        return e / t
    }
    function b(e, t) {
        return e % t
    }
    function C(e, t) {
        return "" + e + t
    }
    function x(e) {
        return -e
    }
    function A(e) {
        return Math.random() * (e || 1)
    }
    function y(e) {
        for (var t = e = Math.floor(e); e > 1; )
            t *= --e;
        return t
    }
    function M(e, t) {
        return Math.sqrt(e * e + t * t)
    }
    function E(e, t) {
        return "[object Array]" != Object.prototype.toString.call(e) ? [e, t] : ((e = e.slice()).push(t),
        e)
    }
    function S(e) {
        return e % 256
    }
    function P(e) {
        return e >> 8 & 255
    }
    function w() {
        this.success = !1,
        this.errormsg = "",
        this.expression = "",
        this.pos = 0,
        this.tokennumber = 0,
        this.tokenprio = 0,
        this.tokenindex = 0,
        this.tmpprio = 0,
        this.ops1 = {
            lsb: S,
            msb: P,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            sqrt: Math.sqrt,
            log: Math.log,
            abs: Math.abs,
            ceil: Math.ceil,
            floor: Math.floor,
            round: Math.round,
            "-": x,
            exp: Math.exp
        },
        this.ops2 = {
            "+": i,
            "-": m,
            "*": g,
            "/": v,
            "%": b,
            "#": b,
            "^": Math.pow,
            ",": E,
            "=": p,
            "!=": u,
            "<": h,
            ">": f,
            "<=": c,
            ">=": d,
            "&": a,
            "|": l,
            "||": C
        },
        this.functions = {
            random: A,
            fac: y,
            min: Math.min,
            max: Math.max,
            pyt: M,
            pow: Math.pow,
            atan2: Math.atan2
        },
        this.consts = {}
    }
    var I = 0
      , R = 1
      , N = 2
      , k = 3
      , _ = 4
      , U = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
      , D = {
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        "'": "\\'",
        "\\": "\\\\"
    };
    return n.prototype = {
        simplify: function(e) {
            e = e || {};
            var s, o, i, a, l = [], p = [], u = this.tokens.length, h = 0;
            for (h = 0; h < u; h++) {
                var f = (a = this.tokens[h]).type_;
                if (f === I)
                    l.push(a);
                else if (f === k && a.index_ in e)
                    a = new r(I,0,0,e[a.index_]),
                    l.push(a);
                else if (f === N && l.length > 1)
                    o = l.pop(),
                    s = l.pop(),
                    i = this.ops2[a.index_],
                    a = new r(I,0,0,i(s.number_, o.number_)),
                    l.push(a);
                else if (f === R && l.length > 0)
                    s = l.pop(),
                    i = this.ops1[a.index_],
                    a = new r(I,0,0,i(s.number_)),
                    l.push(a);
                else {
                    for (; l.length > 0; )
                        p.push(l.shift());
                    p.push(a)
                }
            }
            for (; l.length > 0; )
                p.push(l.shift());
            return new n(p,t(this.ops1),t(this.ops2),t(this.functions))
        },
        substitute: function(e, s) {
            s instanceof n || (s = (new w).parse(String(s)));
            var o, i = [], a = this.tokens.length, l = 0;
            for (l = 0; l < a; l++)
                if ((o = this.tokens[l]).type_ === k && o.index_ === e)
                    for (var p = 0; p < s.tokens.length; p++) {
                        var u = s.tokens[p]
                          , h = new r(u.type_,u.index_,u.prio_,u.number_);
                        i.push(h)
                    }
                else
                    i.push(o);
            return new n(i,t(this.ops1),t(this.ops2),t(this.functions))
        },
        evaluate: function(e) {
            e = e || {};
            var t, r, n, s, o = [], i = this.tokens.length, a = 0;
            for (a = 0; a < i; a++) {
                var l = (s = this.tokens[a]).type_;
                if (l === I)
                    o.push(s.number_);
                else if (l === N)
                    r = o.pop(),
                    t = o.pop(),
                    n = this.ops2[s.index_],
                    o.push(n(t, r));
                else if (l === k)
                    if (s.index_ = s.index_.toUpperCase(),
                    "<" === s.index_[0])
                        s.index_.substr(1)in e && o.push(e[s.index_.substr(1)] % 256);
                    else if (">" === s.index_[0])
                        s.index_.substr(1)in e && o.push(Math.floor(e[s.index_.substr(1)] / 256));
                    else if (s.index_ in e)
                        o.push(e[s.index_]);
                    else {
                        if (!(s.index_ in this.functions))
                            throw new Error("undefined variable: " + s.index_);
                        o.push(this.functions[s.index_])
                    }
                else if (l === R)
                    t = o.pop(),
                    n = this.ops1[s.index_],
                    o.push(n(t));
                else {
                    if (l !== _)
                        throw new Error("invalid Expression");
                    if (t = o.pop(),
                    !(n = o.pop()).apply || !n.call)
                        throw new Error(n + " is not a function");
                    "[object Array]" == Object.prototype.toString.call(t) ? o.push(n.apply(void 0, t)) : o.push(n.call(void 0, t))
                }
            }
            if (o.length > 1)
                throw new Error("invalid Expression (parity)");
            return o[0]
        },
        usage: function(e) {
            e = e || {};
            var t, r, n, s, o = [], i = [], a = this.tokens.length, l = 0;
            for (l = 0; l < a; l++) {
                var p = (s = this.tokens[l]).type_;
                if (p === I)
                    i.push(s.number_);
                else if (p === N)
                    r = i.pop(),
                    t = i.pop(),
                    n = this.ops2[s.index_],
                    i.push(n(t, r));
                else if (p === k)
                    if (s.index_ = s.index_.toUpperCase(),
                    "<" === s.index_[0])
                        s.index_.substr(1)in e && (i.push(e[s.index_.substr(1)] % 256),
                        o.push(s.index_.substr(1)));
                    else if (">" === s.index_[0])
                        s.index_.substr(1)in e && (i.push(Math.floor(e[s.index_.substr(1)] / 256)),
                        o.push(s.index_.substr(1)));
                    else if (s.index_ in e)
                        i.push(e[s.index_]),
                        o.push(s.index_);
                    else {
                        if (!(s.index_ in this.functions))
                            throw new Error("undefined variable: " + s.index_);
                        i.push(this.functions[s.index_]),
                        o.push(s.index_)
                    }
                else if (p === R)
                    t = i.pop(),
                    n = this.ops1[s.index_],
                    i.push(n(t));
                else {
                    if (p !== _)
                        throw new Error("invalid Expression");
                    if (t = i.pop(),
                    !(n = i.pop()).apply || !n.call)
                        throw new Error(n + " is not a function");
                    "[object Array]" == Object.prototype.toString.call(t) ? i.push(n.apply(void 0, t)) : i.push(n.call(void 0, t))
                }
            }
            if (i.length > 1)
                throw new Error("invalid Expression (parity)");
            return o
        },
        toString: function(e) {
            var t, r, n, o, i = [], a = this.tokens.length, l = 0;
            for (l = 0; l < a; l++) {
                var p = (o = this.tokens[l]).type_;
                if (p === I)
                    i.push(s(o.number_));
                else if (p === N)
                    r = i.pop(),
                    t = i.pop(),
                    n = o.index_,
                    e && "^" == n ? i.push("Math.pow(" + t + "," + r + ")") : i.push("(" + t + n + r + ")");
                else if (p === k)
                    i.push(o.index_);
                else if (p === R)
                    t = i.pop(),
                    "-" === (n = o.index_) ? i.push("(" + n + t + ")") : i.push(n + "(" + t + ")");
                else {
                    if (p !== _)
                        throw new Error("invalid Expression");
                    t = i.pop(),
                    n = i.pop(),
                    i.push(n + "(" + t + ")")
                }
            }
            if (i.length > 1)
                throw new Error("invalid Expression (parity)");
            return i[0]
        },
        variables: function() {
            for (var e = this.tokens.length, t = [], r = 0; r < e; r++) {
                var n = this.tokens[r];
                n.type_ === k && -1 == t.indexOf(n.index_) && t.push(n.index_)
            }
            return t
        },
        toJSFunction: function(e, t) {
            return new Function(e,"with(Parser.values) { return " + this.simplify(t).toString(!0) + "; }")
        }
    },
    w.parse = function(e) {
        return (new w).parse(e)
    }
    ,
    w.usage = function(e, t) {
        return w.parse(e).usage(t)
    }
    ,
    w.evaluate = function(e, t) {
        return w.parse(e).evaluate(t)
    }
    ,
    w.Expression = n,
    w.values = {
        lsb: function(e) {
            Math.floor(e % 256)
        },
        msb: function(e) {
            Math.floor(e / 256)
        },
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        sqrt: Math.sqrt,
        log: Math.log,
        abs: Math.abs,
        ceil: Math.ceil,
        floor: Math.floor,
        round: Math.round,
        random: A,
        fac: y,
        exp: Math.exp,
        min: Math.min,
        max: Math.max,
        pyt: M,
        pow: Math.pow,
        atan2: Math.atan2,
        E: Math.E,
        PI: Math.PI
    },
    w.prototype = {
        parse: function(e) {
            this.errormsg = "",
            this.success = !0;
            var s = []
              , o = [];
            this.tmpprio = 0;
            var i = 77
              , a = 0;
            for (this.expression = e,
            this.pos = 0; this.pos < this.expression.length; )
                if (this.isNumber())
                    0 == (1 & i) && this.error_parsing(this.pos, "unexpected number"),
                    l = new r(I,0,0,this.tokennumber),
                    o.push(l),
                    i = 50;
                else if (this.isOperator())
                    this.isSign() && 64 & i ? (this.isNegativeSign() && (this.tokenprio = 2,
                    this.tokenindex = "-",
                    a++,
                    this.addfunc(o, s, R)),
                    i = 77) : this.isComment() || (0 == (2 & i) && this.error_parsing(this.pos, "unexpected operator"),
                    a += 2,
                    this.addfunc(o, s, N),
                    i = 77);
                else if (this.isString())
                    0 == (1 & i) && this.error_parsing(this.pos, "unexpected string"),
                    l = new r(I,0,0,this.tokennumber),
                    o.push(l),
                    i = 50;
                else if (this.isLeftParenth())
                    0 == (8 & i) && this.error_parsing(this.pos, 'unexpected "("'),
                    128 & i && (a += 2,
                    this.tokenprio = -2,
                    this.tokenindex = -1,
                    this.addfunc(o, s, _)),
                    i = 333;
                else if (this.isRightParenth()) {
                    if (256 & i) {
                        var l = new r(I,0,0,[]);
                        o.push(l)
                    } else
                        0 == (16 & i) && this.error_parsing(this.pos, 'unexpected ")"');
                    i = 186
                } else if (this.isComma())
                    0 == (32 & i) && this.error_parsing(this.pos, 'unexpected ","'),
                    this.addfunc(o, s, N),
                    a += 2,
                    i = 77;
                else if (this.isConst()) {
                    0 == (1 & i) && this.error_parsing(this.pos, "unexpected constant");
                    var p = new r(I,0,0,this.tokennumber);
                    o.push(p),
                    i = 50
                } else if (this.isOp2())
                    0 == (4 & i) && this.error_parsing(this.pos, "unexpected function"),
                    this.addfunc(o, s, N),
                    a += 2,
                    i = 8;
                else if (this.isOp1())
                    0 == (4 & i) && this.error_parsing(this.pos, "unexpected function"),
                    this.addfunc(o, s, R),
                    a++,
                    i = 8;
                else if (this.isVar()) {
                    0 == (1 & i) && this.error_parsing(this.pos, "unexpected variable");
                    var u = new r(k,this.tokenindex,0,0);
                    o.push(u),
                    i = 186
                } else
                    this.isWhite() || ("" === this.errormsg ? this.error_parsing(this.pos, "unknown character in " + this.expression) : this.error_parsing(this.pos, this.errormsg));
            for ((this.tmpprio < 0 || this.tmpprio >= 10) && this.error_parsing(this.pos, 'unmatched "()"'); s.length > 0; ) {
                var h = s.pop();
                o.push(h)
            }
            return a + 1 !== o.length && this.error_parsing(this.pos, "parity"),
            new n(o,t(this.ops1),t(this.ops2),t(this.functions))
        },
        evaluate: function(e, t) {
            return this.parse(e).evaluate(t)
        },
        error_parsing: function(e, t) {
            throw this.success = !1,
            this.errormsg = "parse error [column " + e + "]: " + t,
            new Error(this.errormsg)
        },
        addfunc: function(e, t, n) {
            for (var s = new r(n,this.tokenindex,this.tokenprio + this.tmpprio,0); t.length > 0 && s.prio_ <= t[t.length - 1].prio_; )
                e.push(t.pop());
            t.push(s)
        },
        isNumber: function() {
            for (var e = !1, t = "", r = 0, n = 10, s = this.pos; this.pos < this.expression.length; ) {
                var o, i = this.expression.charCodeAt(this.pos);
                if (!(i >= 48 && i <= 57 || 46 === i || 0 === r && 36 === i || 0 === r && 37 === i || 1 === r && 88 === i || 1 === r && 120 === i || r > 0 && 72 === i || r > 0 && 104 === i || r > 0 && 66 === i || r > 0 && 98 === i || r > 0 && i >= 65 && i <= 70 || r > 0 && i >= 97 && i <= 102))
                    break;
                if (r++,
                t += this.expression.charAt(this.pos),
                this.pos++,
                o = t,
                "$" === t[0] && (o = "0x" + t.substr(1),
                n = 16),
                "x" !== t[1] && "X" !== t[1] || (n = 16),
                "h" !== t[t.length - 1] && "H" !== t[t.length - 1] || 10 != n && 2 != n || (o = "0x" + t.substr(0, t.length - 1),
                n = 16),
                "b" !== t[t.length - 1] && "B" !== t[t.length - 1] || 10 == n && (o = t.substr(0, t.length - 1),
                n = 2),
                "%" === t[0]) {
                    if (t.length < 2)
                        return this.pos = s,
                        !1;
                    o = t.substr(1),
                    n = 2
                }
                this.tokennumber = parseInt(o, n),
                e = !0
            }
            return "0x" === o ? (this.pos = s,
            !1) : e
        },
        unescape: function(e, t) {
            for (var r = [], n = !1, s = 0; s < e.length; s++) {
                var o = e.charAt(s);
                if (n) {
                    switch (o) {
                    case "'":
                        r.push("'");
                        break;
                    case "\\":
                        r.push("\\");
                        break;
                    case "/":
                        r.push("/");
                        break;
                    case "b":
                        r.push("\b");
                        break;
                    case "f":
                        r.push("\f");
                        break;
                    case "n":
                        r.push("\n");
                        break;
                    case "r":
                        r.push("\r");
                        break;
                    case "t":
                        r.push("\t");
                        break;
                    case "u":
                        var i = parseInt(e.substring(s + 1, s + 5), 16);
                        r.push(String.fromCharCode(i)),
                        s += 4;
                        break;
                    default:
                        throw this.error_parsing(t + s, "Illegal escape sequence: '\\" + o + "'")
                    }
                    n = !1
                } else
                    "\\" == o ? n = !0 : r.push(o)
            }
            return r.join("")
        },
        isString: function() {
            var e = !1
              , t = ""
              , r = this.pos;
            if (this.pos < this.expression.length && "'" == this.expression.charAt(this.pos) || '"' == this.expression.charAt(this.pos)) {
                var n = this.expression.charAt(this.pos);
                for (this.pos++; this.pos < this.expression.length; ) {
                    if (this.expression.charAt(this.pos) == n && "\\" != t.slice(-1)) {
                        this.pos++,
                        this.tokennumber = this.unescape(t, r),
                        e = !0;
                        break
                    }
                    t += this.expression.charAt(this.pos),
                    this.pos++
                }
            }
            return e
        },
        isConst: function() {
            return !1
        },
        isOperator: function() {
            var e = this.expression.charCodeAt(this.pos);
            if (43 === e)
                this.tokenprio = 0,
                this.tokenindex = "+";
            else if (45 === e)
                this.tokenprio = 0,
                this.tokenindex = "-";
            else if (124 === e)
                124 === this.expression.charCodeAt(this.pos + 1) ? (this.pos++,
                this.tokenprio = 0,
                this.tokenindex = "||") : (this.tokenprio = 5,
                this.tokenindex = "|");
            else if (42 === e)
                this.tokenprio = 1,
                this.tokenindex = "*";
            else if (47 === e)
                this.tokenprio = 2,
                this.tokenindex = "/";
            else if (37 === e)
                this.tokenprio = 2,
                this.tokenindex = "%";
            else if (35 === e)
                this.tokenprio = 2,
                this.tokenindex = "#";
            else if (94 === e)
                this.tokenprio = 3,
                this.tokenindex = "^";
            else if (38 === e)
                this.tokenprio = 4,
                this.tokenindex = "&";
            else if (61 === e)
                this.tokenprio = -1,
                this.tokenindex = "=";
            else if (33 === e)
                61 === this.expression.charCodeAt(this.pos + 1) ? (this.pos++,
                this.tokenprio = -1,
                this.tokenindex = "!=") : (this.tokenprio = 5,
                this.tokenindex = "!");
            else {
                if (63 !== e)
                    return !1;
                60 === this.expression.charCodeAt(this.pos + 1) && (this.pos++,
                61 === this.expression.charCodeAt(this.pos + 1) ? (this.pos++,
                this.tokenprio = -1,
                this.tokenindex = "<=") : (this.tokenprio = -1,
                this.tokenindex = "<")),
                62 === this.expression.charCodeAt(this.pos + 1) && (this.pos++,
                61 === this.expression.charCodeAt(this.pos + 1) ? (this.pos++,
                this.tokenprio = -1,
                this.tokenindex = ">=") : (this.tokenprio = -1,
                this.tokenindex = ">"))
            }
            return this.pos++,
            !0
        },
        isSign: function() {
            var e = this.expression.charCodeAt(this.pos - 1);
            return 45 === e || 43 === e
        },
        isPositiveSign: function() {
            return 43 === this.expression.charCodeAt(this.pos - 1)
        },
        isNegativeSign: function() {
            return 45 === this.expression.charCodeAt(this.pos - 1)
        },
        isLeftParenth: function() {
            return 40 === this.expression.charCodeAt(this.pos) && (this.pos++,
            this.tmpprio += 10,
            !0)
        },
        isRightParenth: function() {
            return 41 === this.expression.charCodeAt(this.pos) && (this.pos++,
            this.tmpprio -= 10,
            !0)
        },
        isComma: function() {
            return 44 === this.expression.charCodeAt(this.pos) && (this.pos++,
            this.tokenprio = -1,
            this.tokenindex = ",",
            !0)
        },
        isWhite: function() {
            var e = this.expression.charCodeAt(this.pos);
            return (32 === e || 9 === e || 10 === e || 13 === e) && (this.pos++,
            !0)
        },
        isOp1: function() {
            for (var e = "", t = this.pos; t < this.expression.length; t++) {
                var r = this.expression.charAt(t);
                if (r.toUpperCase() === r.toLowerCase() && (t === this.pos || "_" != r && (r < "0" || r > "9")))
                    break;
                e += r
            }
            return e.length > 0 && e in this.ops1 && (this.tokenindex = e,
            this.tokenprio = 5,
            this.pos += e.length,
            !0)
        },
        isOp2: function() {
            for (var e = "", t = this.pos; t < this.expression.length; t++) {
                var r = this.expression.charAt(t);
                if (r.toUpperCase() === r.toLowerCase() && (t === this.pos || "_" != r && (r < "0" || r > "9")))
                    break;
                e += r
            }
            return e.length > 0 && e in this.ops2 && (this.tokenindex = e,
            this.tokenprio = 5,
            this.pos += e.length,
            !0)
        },
        isVar: function() {
            for (var e = "", t = this.pos; t < this.expression.length; t++) {
                var r = this.expression.charAt(t);
                if ("$" === r) {
                    e = "_PC";
                    break
                }
                if (r.toUpperCase() === r.toLowerCase() && "<" !== r && ">" !== r && (t === this.pos || "_" != r && (r < "0" || r > "9")))
                    break;
                e += r
            }
            return e.length > 0 && (this.tokenindex = e,
            this.tokenprio = 4,
            "_PC" !== e ? this.pos += e.length : this.pos++,
            !0)
        },
        isComment: function() {
            return 47 === this.expression.charCodeAt(this.pos - 1) && 42 === this.expression.charCodeAt(this.pos) && (this.pos = this.expression.indexOf("*/", this.pos) + 2,
            1 === this.pos && (this.pos = this.expression.length),
            !0)
        }
    },
    e.Parser = w,
    w
}("undefined" == typeof exports ? {} : exports)
  , rle1Decode = function(e) {
    var t = [];
    return e.forEach(function(e) {
        if ("number" != typeof e)
            for (var r = 0; r < e[0]; r++)
                t.push(e[1]);
        else
            t.push(e)
    }),
    t
}
  , download = function(e, t) {
    var r = document.createElement("a");
    r.setAttribute("href", "data:text/plain;charset=utf-8," + t),
    r.setAttribute("download", e),
    document.body.appendChild(r),
    r.click(),
    document.body.removeChild(r)
}
  , downloadString = function(e, t) {
    for (var r = "", n = 0; n < t.length; n++)
        r += "%" + toHex2(t.charCodeAt(n));
    download(e, r)
}
  , makeSNA = function(e, t) {
    for (var r = [], n = rle1Decode([63, 56, 0, 184, 0, 15, 23, 68, 0, 168, 16, 185, 92, 33, 23, 58, 92, 212, 3, 4, 202, 92, 0, 240, 127, 1, 15, [4576, 0], 124, 60, 66, 120, 60, 66, 62, [2, 126], 0, 66, 60, 124, [3, 0], 16, 64, [238, 0], [2, 66], 98, 68, 66, 102, 8, 4, 64, 0, 66, 64, 66, 0, 56, 120, 56, 64, [238, 0], [2, 66], 82, [2, 66], 90, [2, 8], 124, 0, 66, 60, 66, 0, [2, 68], 16, 64, [238, 0], 124, 126, 74, [3, 66], 8, 16, 64, 0, 66, 2, 124, 0, 120, 68, 16, 64, [238, 0], 68, 66, 70, 68, [2, 66], 8, 32, 64, 0, [2, 66], 68, 0, 64, 68, 16, 64, [238, 0], [3, 66], 120, 60, 66, 62, [2, 126], 0, [2, 60], 66, 0, 60, 68, 12, 126, [270, 0], [753, 56], 184, [14, 56], [256, 0], 255, 0, 29, 249, 255, 0, 33, [2, 116], 35, 5, [5, 0], 1, 0, 6, 0, 11, 0, 1, 0, 1, 0, 6, 0, 16, [26, 0], 60, 64, 0, 255, 204, 1, 248, 127, 252, 127, [3, 0], 255, 254, 255, 1, 56, [2, 0], 203, 92, 218, 92, 182, 92, 182, 92, 203, 92, 234, 92, 202, 92, 212, 92, 217, 92, 233, 92, [2, 0], 219, 92, 219, 92, 219, 92, 0, 146, 92, 16, 2, [6, 0], 37, 74, 125, 26, [2, 0], 121, 10, 0, 88, 255, [2, 0], 33, 0, 91, 15, 23, 0, 64, 224, 80, 33, 24, 33, 23, 1, 56, 0, 56, [34, 0], 255, 127, [2, 255], 244, 9, 168, 16, 75, 244, 9, 196, 21, 83, 129, 15, 196, 21, 82, 244, 9, 196, 21, 80, 128, 165, 110, 244, [2, 0], 64, 156, 0, 128, 249, 192, 101, 110, 116, 13, 128, 110, [2, 48], 14, [2, 0], 64, 156, 0, 13, 128, [2, 0], 64, 156, [8918, 0], 243, 13, 206, 11, 236, 80, 206, 11, 237, 80, 20, 23, 220, 10, 206, 11, 241, 80, 16, 23, 220, 10, 215, 24, 56, 0, 56, 0, 13, 25, 217, 92, 169, 24, 219, 2, 77, 0, 185, 92, 219, 2, 77, 0, 184, 0, 15, 23, 254, 21, [2, 0], 225, 21, 59, 15, 127, 16, 252, 127, 180, 18, 0, 62, [32536, 0], 243, 13, 206, 11, 228, 80, 206, 11, 229, 80, 28, 23, 220, 10, 206, 11, 235, 80, 22, 23, 220, 10, 215, 24, 177, 51, 222, 92, 5, 0, 219, 2, 219, 2, 77, 0, 208, 82, 48, 0, 207, 82, 4, 2, 92, 14, 192, 87, 113, 14, 243, 13, 33, 23, 198, 30, 255, 127, 118, 27, 3, 19, 0, 62, 0, 60, [2, 66], 126, [2, 66], [2, 0], 124, 66, 124, [2, 66], 124, [2, 0], 60, 66, [2, 64], 66, 60, [2, 0], 120, 68, [2, 66], 68, 120, [2, 0], 126, 64, 124, [2, 64], 126, [2, 0], 126, 64, 124, [3, 64], [2, 0], 60, 66, 64, 78, 66, 60, [2, 0], [2, 66], 126, [3, 66], [2, 0], 62, [4, 8], 62, [2, 0], [3, 2], [2, 66], 60, [2, 0], 68, 72, 112, 72, 68, 66, [2, 0], [5, 64], 126, [2, 0], 66, 102, 90, [3, 66], [2, 0], 66, 98, 82, 74, 70, 66, [2, 0], 60, [4, 66], 60, [2, 0], 124, [2, 66], 124, [2, 64], [2, 0], 60, [2, 66], 82, 74, 60, [2, 0], 124, [2, 66], 124, 68, 66, [2, 0], 60, 64, 60, 2, 66, 60, [2, 0], 254, [5, 16], [2, 0], [5, 66], 60, 0]), s = 0; s < n.length; s++)
        r[s] = n[s];
    for (s = 0; s < e.length; s++) {
        var o = e[s]
          , i = o.addr;
        if (o.lens)
            for (var a = 0; a < o.lens.length; a++)
                r[a + i - 16384 + 27] = o.lens[a]
    }
    return ASM.ENT && (r[7403] = 255 & ASM.ENT,
    r[7404] = ASM.ENT >> 8 & 255),
    r
}
  , aconcat = function(e, t) {
    var r, n = [];
    for (r = 0; r < e.length; r++)
        n.push(e[r]);
    for (r = 0; r < t.length; r++)
        n.push(t[r]);
    return n
}
  , mkdown = function(e, t) {
    for (var r = function(e, t) {
        for (var r = e.toString(16); r.length < t; )
            r = "0" + r;
        return r.toUpperCase()
    }, n = "", s = 0; s < e.length; s++)
        n += "%" + function(e) {
            return r(255 & e, 2)
        }(e[s]);
    t || (t = "asm80.sna"),
    download(t, n)
}
  , tapdata = function(e, t) {
    var r, n = [], s = t;
    n[0] = t;
    for (var o = 0; o < e.length; o++)
        n.push(e[o]),
        s = 255 & (s ^ e[o]);
    return n.push(s),
    r = n.length,
    n.unshift(r >> 8),
    n.unshift(255 & r),
    n
}
  , makeTapBlock = function(e, t, r) {
    var n = t.length
      , s = [3, 67, 79, 68, 69, 48 + Math.floor(r / 10), 48 + r % 10, 32, 32, 32, 32, 255 & n, n >> 8, 255 & e, e >> 8, 0, 128];
    return aconcat(tapdata(s, 0), tapdata(t, 255))
}
  , makeTAP = function(e) {
    for (var t, r = null, n = 0, s = [], o = [], i = 0, a = 0, l = e.length; a < l; a++) {
        var p = (t = e[a]).addr;
        if (t.phase && (p -= t.phase),
        void 0 !== p && 0 === n && (r = p),
        p != r + n && (n && (o = aconcat(o, makeTapBlock(r, s, i++))),
        r = p,
        n = 0,
        s = []),
        t.lens) {
            for (var u = 0; u < t.lens.length; u++)
                s.push(t.lens[u]);
            n += t.lens.length
        }
    }
    return s.length && (o = aconcat(o, makeTapBlock(r, s, i++))),
    o
}
  , hextools = {
    RAM: [],
    hexLine: function(e, t) {
        if (":" != e[0])
            return !1;
        var r = parseInt(e[1] + e[2], 16)
          , n = parseInt(e[3] + e[4] + e[5] + e[6], 16)
          , s = parseInt(e[7] + e[8], 16);
        t = t || 0;
        var o;
        if (0 == s)
            for (i = 0; i < r; i++)
                hextools.RAM[n + i + t] = parseInt(e[9 + 2 * i] + e[10 + 2 * i], 16),
                o = n + i;
        return o
    },
    readHex: function(e, t) {
        for (var r = e.split(/\n/), n = 0, s = 0; s < r.length; s++) {
            var o = hextools.hexLine(r[s], t);
            o > n && (n = o)
        }
        return n
    },
    hex2com: function(e) {
        hextools.RAM = [];
        for (var t = hextools.readHex(e, 0) + 1, r = "", n = 256; n < t; n++)
            r += "%" + toHex2(hextools.RAM[n]);
        return r
    },
    hex2bin: function(e, t, r) {
        hextools.RAM = [],
        hextools.readHex(e, 0);
        for (var n = "", s = t; s < r + 1; s++)
            n += "%" + toHex2(hextools.RAM[s]);
        return n
    },
    hex2prg: function(e, t) {
        if (t < 2064)
            throw "ENT must be above $810";
        hextools.RAM = [];
        var r = hextools.readHex(e, 0) + 1
          , n = ""
          , s = t + "";
        hextools.RAM[2047] = 1,
        hextools.RAM[2048] = 8,
        hextools.RAM[2049] = 12,
        hextools.RAM[2050] = 8,
        hextools.RAM[2051] = 10,
        hextools.RAM[2052] = 0,
        hextools.RAM[2053] = 158,
        hextools.RAM[2054] = s.charCodeAt(0),
        hextools.RAM[2055] = s.charCodeAt(1),
        hextools.RAM[2056] = s.charCodeAt(2),
        hextools.RAM[2057] = s.charCodeAt(3),
        hextools.RAM[2058] = 0,
        hextools.RAM[2059] = 0,
        hextools.RAM[2060] = 0;
        for (var o = 2047; o < r; o++)
            n += "%" + toHex2(hextools.RAM[o]);
        return n
    }
}