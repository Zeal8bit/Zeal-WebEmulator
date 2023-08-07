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

function Assembler() {
    const compile = function(mode) {
        let src = localStorage.getItem("code");
        let asm80obj = this.compile_obj(src, Z80ASM);
        switch (asm80obj[0]) {
            case undefined:
                showErrorPopup("Internal error - " + asm80obj[0]);
                break;
            case null:
                var opcodes = asm80obj[1];
                switch (mode) {
                    case 1:
                        return this.make_sna(opcodes[0]);
                    case 2:
                        return this.make_tap(opcodes[0]);
                    case 3:
                        return this.make_bin(opcodes[0]);
                    case "debug":
                        console.log(opcodes[0]);
                        break;
                }
                break;
            default:
                showErrorPopup(asm80obj[0].msg + "\nLine: " + asm80obj[0].s.numline);
        }
    };

    const compile_obj = function(src, cpu) {
        return ASM.compile(src, cpu);
    };

    const make_sna = function(asm80obj) {
        return makeSNA(asm80obj);
    };

    const make_tap = function(asm80obj) {
        return makeTAP(asm80obj);
    };

    const make_bin = function(asm80obj) {
        return ASM.buff(asm80obj);
    };

    this.compile = compile;
    this.compile_obj = compile_obj;
    this.make_sna = make_sna;
    this.make_tap = make_tap;
    this.make_bin = make_bin;
}