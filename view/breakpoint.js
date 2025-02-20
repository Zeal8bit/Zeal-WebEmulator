/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

var breakpoints = [];
var breakpointOnVBlank = false;

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
    var written = $("#bpaddr").val();
    /* Empty the text field */
    $("#bpaddr").val("");
    newBreakpoint(written);
});

function newBreakpoint(value) {
    if (value.length < 1) return;
    /* Remove the 0x prefix if it exists */
    if (value.startsWith('0x')) {
        value = value.slice(2);
    }
    /* Check if the string only contains valid hex digits */
    var result = 0;
    if (isValidHexadecimal(value)) {
        result = parseInt(value, 16);
    } else {
        /* Could be a label, let's check this */
        const addr = disassembler.labelAddress(value);
        if (addr === null) {
            return;
        }
        result = addr;
    }
    /* Only add the breakpoint if not in the list */
    if (!getBreakpoint(result)) {
        addBreakpoint({ address: result});
    }
}

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
function addBreakpoint(options) {
    const { address, enabled = true, autodelete = false } = options;
    /* Find the breakpoint object in the breakpoint list */
    var bkrobj = breakpoints.find(element => element.address == address);

    if (bkrobj != undefined) {
        /* This may be possible if the former breakpoint was "hidden" (auto-delete)
         * If it was clicked by the user, it will become a regular breakpoint, else, it won't change */
        bkrobj.autodelete = autodelete;
    } else if (address <= 0xFFFF) {
        bkrobj = { address, enabled, autodelete };
        breakpoints.push(bkrobj);
    }

    /* Only add the breakpoint to the list if it was manually added by the user, not if step over was clicked */
    if (! bkrobj?.autodelete) {
        $li = $(`<li data-addr="${address}">${hex(address)}</li>`);
        if(!enabled) {
            $li.addClass('disabled');
        }
        $delete = $('<span>x</span>').on('click', () => {
            deleteBreakpoint(address);
        })
        $li.append($delete);
        $("#bps").append($li);
        /* If the line is currently being disassembled, mark it as a breakpoint */
        $(`.dumpline[data-addr='${address}']`).addClass("brk");
    }

    localStorage.setItem('breakpoints', JSON.stringify(breakpoints));
}

function toggleBreakpoint(brkaddr) {
    /* Find the breakpoint object in the breakpoint list */
    const bkrobj = breakpoints.find(element => element.address == brkaddr);

    $(`#bps li[data-addr='${brkaddr}']`).toggleClass("disabled");
    $(`.dumpline[data-addr='${brkaddr}']`).toggleClass("brk");

    /* Toggle enabled field in the breakpoint */
    if (bkrobj != undefined) {
        bkrobj.enabled ^= true;
    }
    localStorage.setItem('breakpoints', JSON.stringify(breakpoints));
}

function deleteBreakpoint(brkaddr) {
    /* Find the breakpoint object in the breakpoint list */
    const index = breakpoints.findIndex(element => element.address == brkaddr);

    if(index >= 0) {
        breakpoints.splice(index, 1);
        $(`#bps li[data-addr='${brkaddr}']`).remove();
        $(`.dumpline[data-addr='${brkaddr}']`).toggleClass("brk");
    }
    localStorage.setItem('breakpoints', JSON.stringify(breakpoints));
}

function getBreakpoint(addr) {
    /* Find the breakpoint object in the breakpoint list */
    const bkrobj = breakpoints.find(element => element.address == addr);
    return (bkrobj != undefined && !bkrobj.autodelete) ? bkrobj : null;
}


/**
 * @brief Function called when a breakpoint is triggered
 */
function triggeredBreakpoint(bkrobj) {
    if (bkrobj?.autodelete) {
        breakpoints = breakpoints.filter(element => element.address !== bkrobj.address);
    }
}

function enableBreakpoint(bkrobj) {
    bkrobj.enabled = true;
}

function enableBreakOnVBlank(doBreak) {
    breakpointOnVBlank = doBreak;
}

$('#breakpoint-vblank').on('change', function(e) {
    enableBreakOnVBlank($(this).prop('checked'));
});

jQuery(() => {
    const storage = localStorage.getItem('breakpoints');
    if(storage) {
        const points = JSON.parse(storage);
        points.map((point) => {
            addBreakpoint(point);
        });
    }
})

// electron
if (typeof electronAPI != 'undefined') {
    electronAPI.on("breakpoint", (breakpoints) => {
        for (let i = 0; i < breakpoints.length; i++) {
            newBreakpoint(breakpoints[i]);
        }
    });
}

