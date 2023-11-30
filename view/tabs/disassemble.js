/**
 * SPDX-FileCopyrightText: 2022-2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function setASMView() {
    let regs = zealcom.getCPUState();
    /* Get the PC, which is a virtual address */
    const pc = regs != null ? (regs.pc) : 0;
    /* Set the number of instructions we need to disassemble and show */
    const instructions = 20;
    /* The average number of bytes per instruction is 2 or 3 */
    const bytes = instructions * 3;

    /* Read "bytes" bytes from the Z80 virtual memory */
    var memory = [];
    /* Add 4 bytes so that if the last instruction is a 4 byte instruction, we won't go out of
     * bounds when disassembling */
    for (var i = 0; i < bytes + 4; i++) {
        memory.push(zealcom.mem_read(pc + i));
    }

    /* Disassemble this part of the memory */
    const instr_arr = disassembler.disassemble(memory, bytes, pc);

    const dumptxt = instr_arr.map(entry => {
        var cssclass = (entry.instruction && (entry.addr == pc)) ? "activeline" : "";
        var text = "";

        if (entry.label) {
            cssclass += " labelline";
            text = entry.label
        } else {
            cssclass += " dumpline";
            text = entry.instruction;
        }

        /* Check if the current address has a breakpoint */
        const breakpoint = getBreakpoint(entry.addr);
        const brk = breakpoint == null ? "" : "brk";

        return `<div data-addr="${entry.addr}" class="${cssclass} ${brk}">${text}</div>`;
    });

    $("#memdump").html(dumptxt);
}