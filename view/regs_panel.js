/**
 * SPDX-FileCopyrightText: 2022-2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function setRegView() {
    const tstates = zealcom.getTstates();
    let regs = zealcom.getCPUState();
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
    /* Special treatment for the flags */
    var flags = (regs.flags.S == 1 ? "S" : "") +
                (regs.flags.Z == 1 ? "Z" : "") +
                (regs.flags.Y == 1 ? "Y" : "") +
                (regs.flags.H == 1 ? "H" : "") +
                (regs.flags.X == 1 ? "X" : "") +
                (regs.flags.P == 1 ? "P" : "") +
                (regs.flags.N == 1 ? "N" : "") +
                (regs.flags.C == 1 ? "C" : "");

    $("#flags").text(flags);

    /* Toggle RAM */
    setASMView();
}

$(".regaddr").click(function() {
    const virtaddr = parseInt($(this).text(), 16);
    if (virtaddr || virtaddr == 0) {
        const size = 256;
        setRAMView(virtaddr, size);
        $("#memory-tab").click();
    }
});
