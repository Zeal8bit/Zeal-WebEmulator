const rom = new ROM();
const ram = new RAM();
const vchip = new VideoChip();
const pio = new PIO(this);
const mmu = new MMU();

/* Memdump related */
const byte_per_line = 0x20;

const devices = [ rom, ram, vchip, pio, mmu ];

const breakpoints = [];
var running = true;
var registers = null;

const zpu = new Z80({ mem_read, mem_write, io_read, io_write });


function mem_read(address) {
    var rd = 0;
    var found = false;
    const ext_addr = mmu.get_ext_adrr(address);
 
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
    const ext_addr = mmu.get_ext_adrr(address);

    devices.forEach(function (device) {
        if (device.is_valid_address(false, ext_addr))
            device.mem_write(ext_addr, value);
    });
}

function io_read(port) {
    var rd = 0;
    var found = false;
    port = port & 0xff;
    
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

function hex(str) {
    const leading = ('000' + str.toString(16).toUpperCase()).substr(-4);
    return "0x" + leading;
}

function hex16(high, lower) {
    const value = (high << 8) + lower;
    return "0x" + value.toString(16).toUpperCase();
}

function isprint(char) {
    return !( /[\x00-\x08\x0E-\x1F\x80-\xFF]/.test(char));
}

function setRAMView() {
    $("#memdump").removeClass("hide");

    /* Update RAM view */
    var result = "";

    for (var i = 0 ; i < 4; i++) {
        const ext_addr = mmu.get_ext_adrr(16*1024*i);
        result += "<section>Page " + i + ": " + ext_addr.toString(16) + "</section>";
    }

    for (var i = 0x08_0000; i < 0x08_0100; i += byte_per_line ) {
        result += '<section class="memline">' +
                    '<section class="memaddr">' +
                            i.toString(16) +
                    '</section>' + 
                  '<section class="membytes" data-addr="' + i + '">';
        for (var j = 0; j < byte_per_line; j++) {
            var byte = ram.mem_read(i + j);
            str = byte.toString(16);
            if (str.length == 1)
                str = "0" + str
            result += '<div data-byte="' + byte + '">' + str + '</div>';
        }
        result += '</section></section>';
    }
    /*
    for (var i = 0xBF00; i < 0xC000; i += byte_per_line ) {
        result += '<section class="memline">' +
                    '<section class="memaddr">' +
                            i.toString(16) +
                    '</section>' + 
                  '<section class="membytes" data-addr="' + i + '">';
        for (var j = 0; j < byte_per_line; j++) {
            var byte = ram.mem_read(i + j);
            str = byte.toString(16);
            if (str.length == 1)
                str = "0" + str
            result += '<div data-byte="' + byte + '">' + str + '</div>';
        }
        result += '</section></section>';
    }*/
    $("#memdump").html(result);
}

function updateAndShowRAM () {
    /* Get RAM updates */
    setRAMView();
    //$("#memdump").toggleClass("hide");
}

function updateRegistersHTML() {
    $("#rega").text(hex(registers.a));
    $("#regb").text(hex(registers.b));
    $("#regc").text(hex(registers.c));
    $("#regd").text(hex(registers.d));
    $("#rege").text(hex(registers.e));
    $("#regh").text(hex(registers.h));
    $("#regl").text(hex(registers.l));
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

function step_cpu() {
    var t_state = 0;
    for (var i = 0; i < 10000 && running; i++) {
        t_state += zpu.run_instruction();

        registers = zpu.getState();

        /* Check whether the current PC is part of the breakpoints list */
        const filtered = breakpoints.find(elt => elt.address == registers.pc);
        if (filtered != undefined && filtered.enabled) {
            running = false;
        }

    }

    if (!registers.halted) {
        if (running)
            setTimeout(step_cpu, 0);
        else
            updateRegistersHTML();
    }
}

function step () {
    if (registers.halted) {
        return;
    }
    var pc = registers.pc;
    while (registers.pc == pc) {
        zpu.run_instruction();
        registers = zpu.getState();
    }
    updateRegistersHTML();
}

function step_over () {
    var pc = registers.pc;
    while (registers.pc != pc + 3) {
        zpu.run_instruction();
        registers = zpu.getState();
    }
    updateRegistersHTML();
}

function cont() {
    running = true;
    step_cpu();
}

function interrupt() {
    //zpu.interrupt(false, 0);
    //step_cpu();
}

$("#read-button").on('click', function() {
    let file = $("#file-input")[0].files[0];
    let reader = new FileReader();
    const isos = $("#os").prop("checked");
    reader.addEventListener('load', function(e) {
        let binary = e.target.result;
        if (isos) {
            rom.loadFile(binary);
            step_cpu();
        } else {
            ram.loadFile(0x100, binary);
        }
    });
    reader.readAsBinaryString(file);
});


$("#screen").on("keydown", function(e) {
    const intcount = pio.key_pressed(e.keyCode);
    if (intcount == 0) {
        return;
    }
    zpu.interrupt(false, 0);
    e.preventDefault();
    if (intcount != 1) {
        for (var i = 0; i < 256; i++) {
            zpu.run_instruction();
        }
        zpu.interrupt(false, 0);
    }
    cont();
});

$("#addbp").on("click", function (){
    const written = $("#bpaddr").val();
    if (written.length < 1) return;
    const result = parseInt(written, 16);
    /* Only add the breakkpooint if not in the list */
    if (!breakpoints.includes(result) && result <= 0xFFFF) {
        breakpoints.push({ address: result, enabled: true });
        $("#bps").append('<li data-addr="' + result + '">' + hex(result) + '</li>');
    }
});

function togglebreakpoint() {
    /* Get the breakpoint address */
    const bkpaddr = $(this).data("addr");
    /* Same, for the DOM */
    $(this).toggleClass("disabled");

    /* Find the braeakpoint object in the breakpoint list */
    const bkrobj = breakpoints.find(element => element.address == bkpaddr);
    /* Toggle enabled field in the breakpoint */
    if (bkrobj != undefined)
        bkrobj.enabled ^= true;
}

$("#step").on("click", step);
$("#stepover").on("click", step_over);
$("#continue").on("click", cont);
$("#bps").on("click", "li", togglebreakpoint);
//setRAMView();

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