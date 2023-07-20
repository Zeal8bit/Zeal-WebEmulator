/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

var mousepressed = false;

$("#disnow").on("click", function() {
    setASMView();
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

$("#romadvanced").click(function () { $("#romfile").toggle(500); });

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


/* It is possible to send files as raw binary data on the UART, place
 * a listener on the send button for that */
$("#uart-file-send").on("click", function() {
    /* Read the binary executable */
    let file = $("#uart-file")[0].files[0];
    let reader = new FileReader();
    reader.addEventListener('load', function(e) {
        let binary = e.target.result;
        uart.send_binary_array(binary);
    });
    if (typeof file !== "undefined") {
        reader.readAsBinaryString(file);
    }
});

$("#baudrate").on("change", function() {
    const baudrate = $(this).val();
    uart.set_baudrate(baudrate);
});

var dump = {
    /* Stores all the lines of the dump file */
    lines: [],
    /* table will associate the virtual address (PC) of the virtual
     * machine to the line of the instruction in the previous field */
    table: [],
    labels: []
};

function updateRegistersHTML() {
    $("#rega").text(hex8(registers.a));
    $("#regb").text(hex8(registers.b));
    $("#regc").text(hex8(registers.c));
    $("#regd").text(hex8(registers.d));
    $("#rege").text(hex8(registers.e));
    $("#regh").text(hex8(registers.h));
    $("#regl").text(hex8(registers.l));
    $("#regix").text(hex(registers.ix));
    $("#regiy").text(hex(registers.iy));
    $("#regbc").text(hex16(registers.b, registers.c));
    $("#regde").text(hex16(registers.d, registers.e));
    $("#reghl").text(hex16(registers.h, registers.l));
    $("#regpc").text(hex(registers.pc));
    $("#regsp").text(hex(registers.sp));
    /* Special treatment for the flags */
    var flags = (registers.flags.S == 1 ? "S" : "") +
                (registers.flags.Z == 1 ? "Z" : "") +
                (registers.flags.Y == 1 ? "Y" : "") +
                (registers.flags.H == 1 ? "H" : "") +
                (registers.flags.X == 1 ? "X" : "") +
                (registers.flags.P == 1 ? "P" : "") +
                (registers.flags.N == 1 ? "N" : "") +
                (registers.flags.C == 1 ? "C" : "");

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
    const physaddr = mmu.get_ext_addr(virtaddr);
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

    /* Get the PC, which is a virtual address */
    const pc = registers != null ? (registers.pc) : 0;

    /* Set the number of instructions we need to disassemble and show */
    const instructions = 20;
    /* The average number of bytes per instruction is 2 or 3 */
    const bytes = instructions * 3;

    /* Read "bytes" bytes from the Z80 virtual memory */
    var memory = []
    for (var i = 0; i < bytes; i++) {
        memory.push(mem_read(pc + i));
    }

    /* Disassembly this part of the memory */
    const instr_arr = disassemble_memory(memory, bytes, pc);

    /* The first instruction is special, it's the "active" one, treat it separately from the rest */
    const first = `<div data-addr="${instr_arr[0].addr}" class="disline activeline">${instr_arr[0].instruction}</div>`;

    /* Remove the first element from the array */
    instr_arr.shift();

    /* Treat all other instructions */
    var result = instr_arr.map(entry => `<div data-addr="${entry.addr}" class="disline">${entry.instruction}</div>`);

    /* Put the "first" string at the beginning of the "result" array */
    result.unshift(first);

    $("#discontent").html(result);
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
            var byte = mem_read(virt);
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


