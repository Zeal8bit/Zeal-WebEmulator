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

    $("#current_memaddr").text(hex(virtaddr, true, 4));

    dumptxt += '<section class="memline heading">' +
        '<div class="memaddr">Physical Virt</div>' +
        '<div class="membytes">';
    for (var j = 0; j < byte_per_line; j++) {
        dumptxt += `<div>${hex(j, true, 2)}</div>`;
    }
    dumptxt += '</div><div></div></section>';

    for (var i = 0; i < lines * byte_per_line; i += byte_per_line) {
        let ascii = [];

        dumptxt +=  '<section class="memline">' +
                      '<section class="memaddr">' +
                      `(${hex(physaddr + i, true, 6)}) ${hex(virtaddr + i, true)}` +
                      '</section>' +
                    '<section class="membytes">';

        for (var j = 0; j < byte_per_line; j++) {
            const virt = virtaddr + i + j
            var byte = zealcom.mem_read(virt);

            // /* Generate the ASCII dumptxt */
            let c = '.';
            if (isPrintable(byte)) {
                c = String.fromCharCode(byte);
                // ascii = ascii.map((c) => c == ' ' ? '&nbsp;' : c);
                if(c == ' ') c = '&nbsp;';
            }
            ascii.push(`<div class="asciichar" data-addr="${virt}">${c}</div>`);

            str = byte.toString(16);
            if (str.length == 1)
                str = "0" + str;
            dumptxt += `<div contenteditable data-byte="${byte}" data-addr="${virt}">${str}</div>`;
        }
        dumptxt += '</section>';
        dumptxt += `<section class="asciichars">${ascii.join('')}</section>`;
        dumptxt += '</section>';
    }

    $("#dumpcontent").html(dumptxt);
}

const byte_per_line = 0x10;
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
    if(!str) return;
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

$('#dumpaddr, #dumpsize').on('keypress', (evt) => {
    if(evt.keyCode == 13) {
        $('#dumpnow').trigger('click');
    }
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


$("#dumpcontent").on("focusin focusout keyup keydown", ".membytes div[contenteditable]", function(evt) {
    var $this = $(this);
    var value = $this.text();
    switch(evt.type) {
        case 'keyup':
        case 'keydown':
            if(evt.keyCode >= 8 && evt.keyCode <= 9) return; // Backspace, Tab
            if(evt.keyCode == 13) { // ENTER
                evt.preventDefault();
                $this.blur();
                return;
            }

            // TODO: limit input to valid HEX values
            // if(!/^[a-fA-F0-9]+$/.test(value)) {
            // }

            if(value.length > 2) {
                evt.preventDefault();
                const t = $this.text().substr(2,1);
                $this.text($this.text().substr(0,2));
                $next = $this.next();
                $next.text(t).trigger('focus');
            }

            break;
        case 'focusin':
            var sel, range;
            range = document.createRange();
            if(value.length == 2) {
                range.selectNodeContents(evt.currentTarget);
            } else {
                range.setStart(evt.currentTarget, 1);
                // range.setEnd(evt.currentTarget, 0);
            }
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            break;
        case 'focusout':
            var addr = $this.data('addr');
            var previous = hex(parseInt($this.data('byte')), true, 2).toLowerCase();
            var current = $this.text().toLowerCase();
            if(current != previous) {
                var new_value = parseInt(current, 16);
                if(Number.isNaN(new_value)) {
                    popout.error(`Invalid value: 0x${$(this).text().toUpperCase()}, converting to 0xFF`);
                    new_value = 0xFF;
                }
                zealcom.mem_write(addr, new_value);

                var c = String.fromCharCode(new_value);
                // ascii = ascii.map((c) => c == ' ' ? '&nbsp;' : c);
                if(c == ' ') c = '&nbsp;';

                $this.closest('.memline').find(`.asciichars [data-addr=${addr}]`).html(c);
            }
            break;
    }
});

// $(() => {
//     $('#dumpaddr').val('4000');
//     $('#dumpsize').val('128');
//     setTimeout(() => {
//         $('#dumpnow').trigger('click');
//     }, 1200)
// });