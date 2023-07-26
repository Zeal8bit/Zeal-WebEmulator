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

var compile = function(e) {
    var t = localStorage.getItem("code")
      , n = ASM.compile(t, Z80ASM);
    if (n[0]) {
        if (void 0 == n[0].s)
            return void alert("Internal error - " + n[0]);
        alert(n[0].msg + "\nLine: " + n[0].s.numline)
    } else {
        var a = n[1];
        1 == e && mkdown(makeSNA(a[0]), "asm80.sna"),
        2 == e && mkdown(makeTAP(a[0]), "asm80.tap"),
        3 == e && mkdown(ASM.buff(a[0]), "asm80.bin"),
        "debug" == e && console.log(a[0]);
    }
}
