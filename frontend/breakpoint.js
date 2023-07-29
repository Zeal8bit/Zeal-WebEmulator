/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Before initializing the components/peripherals, create the callback set.
 * Indeed, one of them may need to register a callback on init. */

var breakpoints = [];
var running = true;
var registers = null;
var count = 0;
var stop_cpu = false;
var interval = null;

$("#step").on("click", step);
$("#stop").on("click", stop);
$("#stepover").on("click", step_over);
$("#continue").on("click", cont);
$("#bps").on("click", "li", function() {
    /* Get the breakpoint address */
    const bkpaddr = $(this).data("addr");
    toggleBreakpoint(bkpaddr);
});

$("#addbp").on("click", function (){
    const written = $("#bpaddr").val();
    /* Empty the text field */
    $("#bpaddr").val("");
    if (written.length < 1) return;
    var result = parseInt(written, 16);
    if (isNaN(result)) {
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

function addBreakpoint(addr) {
    if (!breakpoints.includes(addr) && addr <= 0xFFFF) {
        breakpoints.push({ address: addr, enabled: true });
        $("#bps").append(`<li data-addr="${addr}">${hex(addr)}</li>`);
        /* If the line is currently being disassembled, mark it as a breakpoint */
        $(`.dumpline[data-addr='${addr}']`).addClass("brk");
    }
}

$("#bpaddr").on('keydown', function(event) {
    if (event.key === "Enter") {
        $("#addbp").click();
    }
});

function toggleBreakpoint(brkaddr) {
    $(`#bps li[data-addr='${brkaddr}']`).toggleClass("disabled");
    $(`.dumpline[data-addr='${brkaddr}']`).toggleClass("brk");

    /* Find the breakpoint object in the breakpoint list */
    const bkrobj = breakpoints.find(element => element.address == brkaddr);
    /* Toggle enabled field in the breakpoint */
    if (bkrobj != undefined)
        bkrobj.enabled ^= true;
}

function step_cpu() {
    running = true;

    if (interval == null) {
        /* Execute the CPU every 16ms */
        interval = setInterval(() => {
            /* In 16ms, the number of T-states the CPU could execute is Math.floor(16666.666 / TSTATES_US) */
            const to_execute = us_to_tstates(16666.666);
            const end = t_state + to_execute;

            /* t_state is global and will be incremented by addTstates */
            while (t_state <= end && running) {
                addTstates(zpu.run_instruction());
                registers = zpu.getState();
                /* Check whether the current PC is part of the breakpoints list */
                const filtered = breakpoints.find(elt => elt.address == registers.pc);
                if (filtered != undefined && filtered.enabled) {
                    running = false;
                    updateRegistersHTML();
                    if (filtered.callback) {
                        filtered.callback(filtered);
                    }
                }

                if (registers.halted && t_state <= end) {
                    adjustTStatesWhenHalted(end);
                }
            }
        }, 16.666);
    }
}

function step () {
    if (registers.halted || running) {
        return;
    }
    var pc = registers.pc;
    while (registers.pc == pc) {
        /* TODO: check if jr/jp to self instruction */
        addTstates(zpu.run_instruction());
        registers = zpu.getState();
    }
    updateRegistersHTML();
}

function step_over () {
    /* If the CPU is running, step is meaningless */
    if (running) {
        return;
    }

    /* Ideally, we would need the size of the instruction, to know where to put the breakpoint
     * but as we don't have such thing yet, we can put 4 breakpoints, one after each byte.
     * TODO: refactor once we have a working disassembler. */
    var pc = registers.pc;
    var former_breakpoints = [...breakpoints];
    /* Define the callback that will be called when reaching one of the breakpoints */
    const callback = (obj) => {
        /* Restore the breakpoints list */
        breakpoints = former_breakpoints;
    };

    for (var i = 1; i <= 4; i++) {
        var brk = getBreakpoint(pc + i);
        if (brk == null) {
            breakpoints.push({ address: pc + i, enabled: true, callback });
        } else {
            /* Enable it */
            brk.enabled = true;
        }
    }

    step_cpu();
}

function cont() {
    step_cpu();
}

function stop() {
    /* Clear the interval that executes the CPU */
    clearInterval(interval);
    interval = null;
    updateRegistersHTML();
    running = false;
}

function adjustTStatesWhenHalted(end) {
    const earliest = getEarliestCallback();
    if (earliest == null || earliest.tstates > end) {
        /* No callback or no near callback. Increment the T-states and exit */
        t_state = end;
        return;
    }
    /* Here, the number of T-state the callback is meant to be executed is in the range
     * [t_state;end], so it is meant to happen during this iteration.
     * Jump to that amount and execute instructions following it directly. */
    t_state = earliest.tstates;
}

function getBreakpoint(addr) {
    /* Find the breakpoint object in the breakpoint list */
    const bkrobj = breakpoints.find(element => element.address == addr);
    return (bkrobj != undefined) ? bkrobj : null;
}

/**
 * Get the earliest callback out of the list.
 */
function getEarliestCallback() {
    var earliest = null;

    tstates_callbacks.forEach((entry) => {
        if (earliest == null || entry.tstates < earliest.tstates) {
            earliest = entry;
        }
    });

    return earliest;
}