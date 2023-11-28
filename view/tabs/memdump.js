/**
 * SPDX-FileCopyrightText: 2022-2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/* Memdump related */
function setRAMView(virtaddr, size) {
    // TODO: Add the addr to a watchlist that will be updates after a breakpoint is reached
    const physaddr = zealcom.mmu.get_ext_addr(virtaddr);
    const lines = size / byte_per_line;
    let dumptxt = "";
    for (var i = 0; i < lines * byte_per_line; i += byte_per_line) {
        let ascii = [];

        dumptxt +=  '<section class="memline">' +
                      '<section class="memaddr">' +
                        hex(virtaddr + i, true) + " (" + hex(physaddr + i, true, 6) + ")" +
                      '</section>' +
                    '<section class="membytes">';
        
        for (var j = 0; j < byte_per_line; j++) {
            const virt = virtaddr + i + j
            var byte = zealcom.mem_read(virt);
            if (isPrintable(byte)) {
                ascii.push(String.fromCharCode(byte));
            } 
            else {
                ascii.push('.');
            }
            str = byte.toString(16);
            if (str.length == 1)
                str = "0" + str;
            dumptxt += '<div data-byte="' + byte + '" data-addr="' + virt + '">' + str + '</div>';
        }
        dumptxt += '</section>';
        /* Generate the ASCII dumptxt */
        ascii = ascii.map(c => c == ' ' ? '&nbsp;' : c);
        ascii = ascii.map(c => '<div class="asciichar">' + c + '</div>');
        dumptxt += '<section class="asciichars">' + ascii.join('') + '</section>';
        dumptxt += '</section>';
    }

    $("#dumpcontent").html(dumptxt);
}

const byte_per_line = 0x20;
var mousepressed = false;

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
