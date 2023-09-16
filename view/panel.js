/**
 * SPDX-FileCopyrightText: 2022-2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

var mousepressed = false;

$("#step").on("click",     () => zealcom.step());
$("#stop").on("click",     () => zealcom.stop());
$("#stepover").on("click", () => zealcom.step_over());
$("#continue").on("click", () => zealcom.cont());
$("#reset").on("click",    () => zealcom.reset());
$("#clean").on("click",    () => zealcom.restart());

$(".tab").on("click", function(){
    const index = $(this).index();
    $(".tab").removeClass("active");
    $(".bottompanel .panel").addClass("hidden");
    $(".bottompanel .panel").eq(index).removeClass("hidden");
    $(this).addClass("active");
});

$(".regaddr").click(function() {
    const virtaddr = parseInt($(this).text(), 16);
    if (virtaddr || virtaddr == 0) {
        const size = 256;
        setRAMView(virtaddr, size);
        $("#memory-tab").click();
    }
});

$("#dumpnow").on("click", function() {
    const virtaddr = parseInt($("#dumpaddr").val(), 16);
    const size = parseInt($("#dumpsize").val());
    setRAMView(virtaddr, size);
});

$("#dumpcontent").on("mouseleave", ".membytes div", function() {
    setClassToASCIIChar($(this), "activefield", false);
});

$("#dumpcontent").on("mouseenter", ".membytes div", function() {
    setClassToASCIIChar($(this), "activefield", true);
    setMemoryByteAddress($(this));
});

$("#dumpcontent").on("mouseleave", ".asciichars div", function() {
    setClassToMemoryByte($(this), "activefield", false);
});

$("#dumpcontent").on("mouseenter", ".asciichars div", function() {
    setClassToMemoryByte($(this), "activefield", true);
});

$(".membytes").on("mousedown", "div", function() {
    mousepressed = true;
    $(".membytes .selected").removeClass("selected");
    $(this).toggleClass("selected");
});

$(".membytes").on("mouseup", "div", function() {
    mousepressed = false;
});

$(".membytes").on("mouseenter", "div", function() {
    if (mousepressed) {
        $(this).toggleClass("selected");
    }
});

/**
 * Add a listener on each disassembled line. On click, we can toggle the breakpoints.
 * Because these dumplines are geenrated at runtime, we must install the listener on the
 * parent element.
 */
$("#memdump").on("click", ".dumpline", function() {
    const brkaddr = $(this).data("addr");
    /* If the address is not in the breakpoint list, add it */
    const brk = getBreakpoint(brkaddr);
    if (brk == null) {
        addBreakpoint(brkaddr);
    } else {
        toggleBreakpoint(brkaddr);
    }
});

/* It is possible to send files as raw binary data on the UART, place
 * a listener on the send button for that */
$("#uart-file-send").on("click", function() {
    /* Read the binary executable */
    let file = $("#uart-file")[0].files[0];
    let reader = new FileReader();
    reader.addEventListener('load', function(e) {
        let binary = e.target.result;
        setTimeout(function() {
            zealcom.uart.send_binary_array(binary);
        }, 10);
    });
    if (typeof file !== "undefined") {
        reader.readAsBinaryString(file);
    }
});

$("#clearterm").on("click", function() {
    terminal.reset();
});

$("#baudrate").on("change", function() {
    const baudrate = $(this).val();
    uart.set_baudrate(baudrate);
});

function updateRegistersHTML() {
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
    updateAndShowRAM();
}

function updateAndShowRAM () {
    /* Get ASM updates */
    setASMView();
    //setMMUView();
    //$("#memdump").toggleClass("hide");
}

function setRAMView(virtaddr, size) {
    // TODO: Add the addr to a watchlist that will be updates after a breakpoint is reached
    const physaddr = zealcom.mmu.get_ext_addr(virtaddr);
    const dumptxt = dumpRamContent(virtaddr, physaddr, size / byte_per_line);
    $("#dumpcontent").html(dumptxt);
}

function setMMUView() {
    /* MMU panel */
    var mmuresult = "";
    for (var i = 0 ; i < 4; i++) {
        const ext_addr = mmu.get_ext_addr(16*1024*i);
        mmuresult += "<section>Page " + i + ": " + ext_addr.toString(16) + "</section>";
    }
    $("#dumpcontent").html(mmuresult);
}

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

    const result = instr_arr.map(entry => {
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

    $("#memdump").html(result);
}

function dumpRamContent(virtaddr, physaddr, lines) {
    var result = "";
    for (var i = 0; i < lines * byte_per_line; i += byte_per_line) {
        let ascii = [];

        result += '<section class="memline">' +
                    '<section class="memaddr">' +
                    hex(virtaddr + i, true) + " (" + hex(physaddr + i, true, 6) + ")" +
                    '</section>' +
                  '<section class="membytes">';
        for (var j = 0; j < byte_per_line; j++) {
            const virt = virtaddr + i + j
            var byte = zealcom.mem_read(virt);
            if (isPrintable(byte)) {
                ascii.push(String.fromCharCode(byte));
            } else {
                ascii.push('.');
            }
            str = byte.toString(16);
            if (str.length == 1)
                str = "0" + str;
            result += '<div data-byte="' + byte + '" data-addr="' + virt + '">' + str + '</div>';
        }
        result += '</section>';
        /* Generate the ASCII result */
        ascii = ascii.map(c => c == ' ' ? '&nbsp;' : c);
        ascii = ascii.map(c => '<div class="asciichar">' + c + '</div>');
        result += '<section class="asciichars">' + ascii.join('') + '</section>';
        result += '</section>';
    }
    return result;
}

function setClassToASCIIChar(object, classname, add) {
    const index = object.index();
    /* Add/Remove classname to the ascii cahracter corresponding to the current address */
    const asciiline = object.parent().next();
    /* ascii line is made out of divs, get the children */
    if (add) {
        asciiline.children().eq(index).addClass(classname);
    } else {
        asciiline.children().eq(index).removeClass(classname);
    }
}

function setClassToMemoryByte(object, classname, add) {
    const index = object.index();
    /* Add/Remove classname to the ascii cahracter corresponding to the current address */
    const memoryline = object.parent().prev();
    /* Memory bytes is made out of divs, get the children */
    const child = memoryline.children().eq(index);
    if (add) {
        child.addClass(classname);
        setMemoryByteAddress(child);
    } else {
        child.removeClass(classname);
    }
}

function setMemoryByteAddress(object) {
    const str = parseInt(object.attr("data-addr"));
    const val = hex(str, true, 4);
    $("#current_memaddr").text(val);
}
