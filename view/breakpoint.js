/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

var breakpoints = [];

$("#bps").on("click", "li", function() {
    /* Get the breakpoint address */
    const bkpaddr = $(this).data("addr");
    toggleBreakpoint(bkpaddr);
});

function isValidHexadecimal(str) {
    const regexp = /^[0-9A-Fa-f]+$/;
    return regexp.test(str);
}

$("#addbp").on("click", function (){
    const written = $("#bpaddr").val();
    /* Empty the text field */
    $("#bpaddr").val("");
    if (written.length < 1) return;
    /* Check if the string only contains valid hex digits */
    var result = 0;
    if (isValidHexadecimal(written)) {
        result = parseInt(written, 16);
    } else {
        /* Could be a label, let's check this */
        const addr = disassembler.labelAddress(written);
        if (addr === null) {
            return;
        }
        result = addr;
    }
    /* Only add the breakpoint if not in the list */
    addBreakpoint(result);
});

$("#bpaddr").on('keydown', function(event) {
    if (event.key === "Enter") {
        $("#addbp").click();
    }
});


/**
 * @brief Add a breakpoint to the global breakpoint list
 *
 * @param addr Virtual address to break on
 * @param autodelete Flag to mark whether the breakpoint should be auto deleted once triggered (false by default)
 */
function addBreakpoint(addr, autodelete = false) {
    if (!breakpoints.includes(addr) && addr <= 0xFFFF) {
        breakpoints.push({ address: addr, enabled: true, autodelete });
        $("#bps").append(`<li data-addr="${addr}">${hex(addr)}</li>`);
        /* If the line is currently being disassembled, mark it as a breakpoint */
        $(`.dumpline[data-addr='${addr}']`).addClass("brk");
    }
}

function toggleBreakpoint(brkaddr) {
    $(`#bps li[data-addr='${brkaddr}']`).toggleClass("disabled");
    $(`.dumpline[data-addr='${brkaddr}']`).toggleClass("brk");

    /* Find the breakpoint object in the breakpoint list */
    const bkrobj = breakpoints.find(element => element.address == brkaddr);
    /* Toggle enabled field in the breakpoint */
    if (bkrobj != undefined) {
        bkrobj.enabled ^= true;
    }
}

function getBreakpoint(addr) {
    /* Find the breakpoint object in the breakpoint list */
    const bkrobj = breakpoints.find(element => element.address == addr);
    return (bkrobj != undefined) ? bkrobj : null;
}


function arrayRemoveElement(array, index) {
    if (index > -1 && index < array.length) {
        array.splice(index, 1);
    }
    return array;
}


/**
 * @brief Function called when a breakpoint is triggered
 */
function triggeredBreakpoint(bkrobj) {
    if (bkrobj?.autodelete) {
        arrayRemoveElement(breakpoints, bkrobj.address);
    }
}

function enableBreakpoint(bkrobj) {
    bkrobj.enabled = true;
}