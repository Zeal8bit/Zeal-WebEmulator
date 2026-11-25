/**
 * SPDX-FileCopyrightText: 2022-2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function setRegView({ tstates, registers: regs }) {
    $("#rega").text(hex8(regs.a));
    $("#regb").text(hex8(regs.b));
    $("#regc").text(hex8(regs.c));
    $("#regd").text(hex8(regs.d));
    $("#rege").text(hex8(regs.e));
    $("#regh").text(hex8(regs.h));
    $("#regl").text(hex8(regs.l));
    $("#regix").text(hex(regs.ix));
    $("#regiy").text(hex(regs.iy));
    $("#regbc").text(hex16(regs.b, regs.c));
    $("#regde").text(hex16(regs.d, regs.e));
    $("#reghl").text(hex16(regs.h, regs.l));
    $("#regpc").text(hex(regs.pc));
    $("#regsp").text(hex(regs.sp));
    $("#tstates").text(tstates);
    const flagNames = 'SZYHXPNC';
    const flags = Array.from(flagNames).filter((_, index) => regs.f & (0x80 >> index));
    $("#flags").text(flags.join(''));
}


function clearRegView() {
    const views = ["#rega", "#regb", "#regc", "#regd", "#rege",
                   "#regh", "#regl", "#regix", "#regiy", "#regbc",
                   "#regde", "#reghl", "#regpc", "#regsp", "#tstates", "#flags"];
    const length = views.length;
    for (var i = 0; i < length; i++) {
        const reg = views[i];
        $(reg).text("");
    }
}
