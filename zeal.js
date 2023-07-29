/**
 * SPDX-FileCopyrightText: 2022-2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Before initializing the components/peripherals, create the callback set.
 * Indeed, one of them may need to register a callback on init. */

 /* Set of T-states callbacks Object: { tstates, callback, period }
 * In theory, a Binary Heap (min heap) would be better. In practice,
 * We won't have a lot on entries in here. At most 4.
 */
var tstates_callbacks = new Set();
var t_state = 0;
var breakpoints = [];
var running = true;
var registers = null;

/* Check which scale to use for the video */
var scale = 1;
if ($(window).height() > 920 && $(window).width() > 1280) {
    // scale = 2;
}

const mmu = new MMU();
const rom = new ROM(this);
const ram = new RAM();
const pio = new PIO(this);
/* Peripherals */
const vchip = new VideoChip(this, pio, scale);
const uart = new UART(this, pio);
const i2c = new I2C(this, pio);
const keyboard = new Keyboard(this, pio);
const ds1307 = new I2C_DS1307(this, i2c);
/* We could pass an initial content to the EEPROM, but set it to null for the moment */
const eeprom = new I2C_EEPROM(this, i2c, null);
const disassembler = new Disassembler();

/* Memdump related */
const byte_per_line = 0x20;

const devices = [ rom, ram, vchip, pio, keyboard, mmu ];

const zpu = new Z80({ mem_read, mem_write, io_read, io_write });

function mem_read(address) {
    var rd = 0;
    var found = false;
    const ext_addr = mmu.get_ext_addr(address);

    devices.forEach(function (device) {
        if (device.is_valid_address(true, ext_addr)) {
            console.assert(found == false, "Two devices have valid address " + ext_addr);
            rd = device.mem_read(ext_addr);
            found = true;
        }
    });

    if (!found) {
        console.log("No device replied to memory read: " + ext_addr);
    }

    return rd;
}

function mem_write(address, value) {
    const ext_addr = mmu.get_ext_addr(address);

    devices.forEach(function (device) {
        if (device.is_valid_address(false, ext_addr))
            device.mem_write(ext_addr, value);
    });
}

function io_read(port) {
    var rd = 0;
    var found = false;

    devices.forEach(function (device) {
        if (device.is_valid_port(true, port)) {
            console.assert(found == false, "Two devices have valid ports " + port);
            rd = device.io_read(port);
            found = true;
        }
    });

    return rd;
}

function io_write(port, value) {
    port = port & 0xff;
    devices.forEach(function (device) {
        if (device.is_valid_port(false, port))
            device.io_write(port, value);
    });
}

function isPrintable(byteCode) {
    return byteCode >= 32 && byteCode <= 126;
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

function setASMView() {

    /* Get the PC, which is a virtual address */
    const pc = registers != null ? (registers.pc) : 0;

    /* Set the number of instructions we need to disassemble and show */
    const instructions = 20;
    /* The average number of bytes per instruction is 2 or 3 */
    const bytes = instructions * 3;

    /* Read "bytes" bytes from the Z80 virtual memory */
    var memory = []
    /* Add 4 bytes so that if the last instruction is a 4 byte instruction, we won't go out of
     * bounds when disassembling */
    for (var i = 0; i < bytes + 4; i++) {
        memory.push(mem_read(pc + i));
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

function updateAndShowRAM () {
    /* Get ASM updates */
    setASMView();
    //setMMUView();
    //$("#memdump").toggleClass("hide");
}

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

var stop_cpu = false;
var interval = null;


var count = 0;
var elapsed = 0;

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

/**
 * T-states related functions
 */
function getTstates() {
    return t_state;
}

function addTstates(count) {
    t_state += count;

    /* Kind-of static variable within function scope */
    addTstates.in_callback = addTstates.in_callback || false;

    /* Check if any callback can be called, if we aren't in any */
    if (!addTstates.in_callback) {
        tstates_callbacks.forEach(entry => {
            if (entry.tstates <= t_state) {
                addTstates.in_callback = true;
                entry.callback();
                if (entry.period == 0) {
                    tstates_callbacks.delete(entry);
                } else {
                    entry.tstates += entry.period;
                }
                addTstates.in_callback = false;
            }
        });
    }
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

/**
 * Register a callback that shall be called after the number of T-states
 * of the CPU given.
 * If the given number is less than 0, return an error.
 */
function registerTstateCallback(callback, call_tstates) {
    if (call_tstates < 0) {
        return null;
    }

    var obj = null;

    /* If the CPU is halted, not registering this event in the list
     * will make us completely miss it when function getEarliestCallback()
     * is called. Because of that, the CPU will miss this interrupt/event.
     * Keeping call_tstates as 0 should work, but let's be safe and make it
     * happen in the upcoming T-state.  */
    if (call_tstates == 0) {
        call_tstates = 1;
    }

    obj = { tstates: t_state + call_tstates, callback, period: 0 };
    tstates_callbacks.add(obj);

    return obj;
}

/* Register a callback to be called every call_tstates T-states.
 * The delay parameter will let us, defer the start of the first call,
 * without altering the period. This is handy for period signal that changes
 * values for a short period of time (pulses)
 */
function registerTstateInterval(callback, call_tstates, delay) {
    if (call_tstates < 0) {
        return null;
    }

    /* If the delay parameter is not defined, set it to 0 */
    delay = delay || 0;

    const obj = { tstates: t_state + delay + call_tstates, callback, period: call_tstates };
    tstates_callbacks.add(obj);
    return obj;
}

function removeTstateCallback(callback) {
    if (callback != null) {
        tstates_callbacks.delete(callback);
    }
}

function interrupt(interrupt_vector) {
    zpu.interrupt(false, interrupt_vector);
    step_cpu();
}

$("#read-button").on('click', function() {
    /* If a dump/map file was provided, try to load it */
    let fdump = $("#file-dump")[0].files[0];
    if (typeof fdump !== "undefined") {
        let rdump = new FileReader();
        rdump.addEventListener('load', (e) => {
            const success = disassembler.loadSymbols(e.target.result);
            if (success) {
                /* symbols are ready! */
                $("#symready").addClass("ready");
            }
        });
        rdump.readAsText(fdump);
    }

    /* Read the binary executable */
    let file = $("#file-input")[0].files[0];
    let reader = new FileReader();
    const isos = $("#os").prop("checked");
    reader.addEventListener('load', function(e) {
        let binary = e.target.result;
        if (isos) {
            rom.loadFile(binary);
            $("#binready").addClass("ready");
        } else {
            const addr = $("#address").val();
            const result = parseInt(addr, 16);
            ram.loadFile(result, binary);
        }
    });
    if (typeof file !== "undefined") {
        reader.readAsBinaryString(file);
    }

    /* Read the EEPROM image */
    file = $("#eeprom-bin")[0].files[0];
    let eepromr = new FileReader();
    eepromr.addEventListener('load', function(e) {
        let binary = e.target.result;
        eeprom.loadFile(binary);
        $("#eepromready").addClass("ready");
    });
    if (typeof file !== "undefined") {
        eepromr.readAsBinaryString(file);
    }
});


$("#screen").on("keydown", function(e) {
    const handled = keyboard.key_pressed(e.keyCode);

    if (handled) {
        e.preventDefault();
    }
});

$("#screen").on("keyup", function(e) {
    const handled = keyboard.key_released(e.keyCode);

    if (handled) {
        e.preventDefault();
    }
});

/**
 * Add listeners on the add breakpoint field
 */

$("#bpaddr").on('keydown', function(event) {
    if (event.key === "Enter") {
        $("#addbp").click();
    }
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

function getBreakpoint(addr) {
    /* Find the breakpoint object in the breakpoint list */
    const bkrobj = breakpoints.find(element => element.address == addr);
    return (bkrobj != undefined) ? bkrobj : null;
}

function toggleBreakpoint(brkaddr) {
    $(`#bps li[data-addr='${brkaddr}']`).toggleClass("disabled");
    $(`.dumpline[data-addr='${brkaddr}']`).toggleClass("brk");

    /* Find the breakpoint object in the breakpoint list */
    const bkrobj = breakpoints.find(element => element.address == brkaddr);
    /* Toggle enabled field in the breakpoint */
    if (bkrobj != undefined)
        bkrobj.enabled ^= true;
}

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


$("#step").on("click", step);
$("#stop").on("click", stop);
$("#stepover").on("click", step_over);
$("#continue").on("click", cont);
$("#bps").on("click", "li", function() {
    /* Get the breakpoint address */
    const bkpaddr = $(this).data("addr");
    toggleBreakpoint(bkpaddr);
});

$("#dumpnow").on("click", function() {
    const virtaddr = parseInt($("#dumpaddr").val(), 16);
    const size = parseInt($("#dumpsize").val());
    setRAMView(virtaddr, size);
});

var mousepressed = false;

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

$(".tab").on("click", function(){
    const index = $(this).index();
    $(".tab").removeClass("active");
    $(".bottompanel .panel").addClass("hidden");
    $(".bottompanel .panel").eq(index).removeClass("hidden");
    $(this).addClass("active");
});

$("#clearterm").on("click", function() {
    terminal.reset();
});

$("#baudrate").on("change", function() {
    const baudrate = $(this).val();
    uart.set_baudrate(baudrate);
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

document.addEventListener('keydown', function(event) {
    const binding = {'F9': cont, 'F10': step, 'F11': step_over};
    if (binding[event.key]) {
        binding[event.key]();
    }
  });


$(".regaddr").click(function() {
    const virtaddr = parseInt($(this).text(), 16);
    if (virtaddr || virtaddr == 0) {
        const size = 256;
        setRAMView(virtaddr, size);
        $("#memory-tab").click();
    }
});


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
 * Manage the "advanced" link that shows all the files uploader
 * If the URL has "advanced" parameters, show these uploaders directly
 */
const urlGetParam = new URLSearchParams(window.location.search);
var advancedMode = urlGetParam.get("advanced") === "true";

if (advancedMode) {
    $("#romload").hide();
    $("#romfile").show();
}

$("#romadvanced a").click(() => {
    $("#romfile").toggle(500);
});

/**
 * Manage the popup message
 */

/* Add a listener on the popup that will close it on click */
$("#popup-message").on("click", function() {
    $(this).fadeOut(500);
});

function showErrorPopup(message) {
    const popup = $("#popup-message");

    popup.addClass("poperror");
    popup.html(message);
    popup.fadeIn(1000);
    setTimeout(() => {
        popup.fadeOut(1000);
    }, 3000);
}

function switchToAdvancedMode(error) {
    showErrorPopup("Could not fetch remote data, switched to advanced mode");

    /* Hide advanced link option and ROMs list */
    $("#romload").hide(250, function() {
        /* Show file uploaders */
        $("#romfile").show(250);
    });
}


/**
 * Manage the pre-built ROMs list. Available ROMs will be fetched from a remote JSON file that contains
 * names and links to all of the available ROMs, the first one will always be the default.
 */
const prebuilt_json_url = "https://zeal8bit.com/roms/index.json";

/* Process the index JSON object that contains all the ROMs available */
function processIndex(index) {
    /* Generate an HTML option out of each entry */
    const options = index.index.map(entry =>
        `<option value="${entry.urls}" data-version="${entry.version}" data-hash="${entry.hash}">${entry.name}</option>`
    );

    const all_options =
        `<option value="">Choose an image...</option>` +
        options.join("");

    $("#romchoice").html(all_options);
}

 /* Fetch the remote JSON file, and pass the content to the previous function */
 if (!advancedMode) {
    fetch(prebuilt_json_url)
        .then(response => response.json())
        .then(response => processIndex(response))
        .catch(switchToAdvancedMode);
}


function readBinaryFromURL(pburl) {
    return fetch(pburl)
        .then(response => response.blob())
        .then(res => new Response(res).arrayBuffer())
        .then(res => new Uint8Array(res));
}

/**
 * Add a listener to the romchoice list, load the ROM when selected
 */
$("#romchoice").on("change", function() {
    /* Get the URL of the current choice */
    const url = $(this).val();
    /* Get the hash for the current binary */
    const hash = $('#romchoice option:selected').data("hash");

    if (!url) {
        return;
    }

    $("#loading_img").visible();

    readBinaryFromURL(url)
    .then(data => {
        stop();
        rom.loadFile(data);
        $("#loading_img").invisible();
        cont();
    })
    .catch(switchToAdvancedMode);

});
