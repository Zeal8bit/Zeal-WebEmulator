const rom = new ROM();
const ram = new RAM();
const vchip = new VideoChip();
const pio = new PIO();

const devices = [ rom, ram, vchip, pio ];

const breakpoints = [];
var running = true;
var registers = null;

const zpu = new Z80({ mem_read, mem_write, io_read, io_write });


function mem_read(address) {
    var rd = 0;
    var found = false;
 
    devices.forEach(function (device) {
        if (device.is_valid_address(true, address)) {
            console.assert(found == false, "Two devices have valid address " + address);
            rd = device.mem_read(address);
            found = true;
        }
    });

    console.assert(found, "No device replied to memory read");

    return rd;
}

function mem_write(address, value) {
    devices.forEach(function (device) {
        if (device.is_valid_address(false, address))
            device.mem_write(address, value);
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
    return "0x" + str.toString(16).toUpperCase();
}

function hex16(high, lower) {
    const value = (high << 8) + lower;
    return "0x" + value.toString(16).toUpperCase();
}

function updateRegistersHTML() {
    document.querySelector("#rega").innerText = hex(registers.a);
    document.querySelector("#regb").innerText = hex(registers.b);
    document.querySelector("#regc").innerText = hex(registers.c);
    document.querySelector("#regd").innerText = hex(registers.d);
    document.querySelector("#rege").innerText = hex(registers.e);
    document.querySelector("#regh").innerText = hex(registers.h);
    document.querySelector("#regl").innerText = hex(registers.l);
    document.querySelector("#regix").innerText = hex(registers.ix);
    document.querySelector("#regiy").innerText = hex(registers.iy);
    document.querySelector("#regbc").innerText = hex16(registers.b, registers.c);
    document.querySelector("#regde").innerText = hex16(registers.d, registers.e);
    document.querySelector("#reghl").innerText = hex16(registers.h, registers.l);
    document.querySelector("#regpc").innerText = hex(registers.pc);
    document.querySelector("#regsp").innerText = hex(registers.sp);
    document.querySelector("#flags").innerText = JSON.stringify(registers.flags);
    /* Update RAM view */
    var result = "";
    for (var i = 0xc155; i <= 0xc155 + 0x20; i += 0x10 ) {
        result += "<section class=\"memline\">" +
                  "<section class=\"memaddr\">$" +
                        i.toString(16) +
                  "</section>" + 
                  "<section class=\"membytes\">";
        for (var j = 0; j < 0x10; j++) {
            var str = ram.mem_read(i + j);
            str = str.toString(16);
            if (str.length == 1)
                str = "0" + str
            result += str + " ";
        }
        result += "</section></section>"
    }
    document.querySelector("#memdump").innerHTML = result;
}

function step_cpu() {
    var t_state = 0;
    for (var i = 0; i < 10000 && running; i++) {
        t_state += zpu.run_instruction();
        registers = zpu.getState();
        if (breakpoints.includes(registers.pc)) {
            running = false;
        }
    }

    if (running)
        setTimeout(step_cpu, 0);
    else
        updateRegistersHTML();
}

function step () {
    var pc = registers.pc;
    while (registers.pc == pc) {
        zpu.run_instruction();
        registers = zpu.getState();
    }
    updateRegistersHTML();
}

function cont() {
    running = true;
    step_cpu();
}

function bp(addr) {
    if (breakpoints.includes(addr))
        breakpoints = breakpoints.filter(e => e != addr);
    else
        breakpoints.push(addr);
}

document.querySelector("#read-button").addEventListener('click', function() {
    let file = document.querySelector("#file-input").files[0];
    let reader = new FileReader();
    reader.addEventListener('load', function(e) {
	let binary = e.target.result;
	rom.loadFile(binary);
        step_cpu();
    });
    reader.readAsBinaryString(file);
});


document.querySelector("#screen").addEventListener("keydown", function(e) {
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
});

document.querySelector("#addbp").addEventListener("click", function (){
    const written = document.querySelector("#bpaddr").value;
    if (written.length < 1) return;
    const result = parseInt(written, 16);
    breakpoints.push(result);
    document.querySelector("#bps").append(hex(result));
});

document.querySelector("#step").addEventListener("click", step);
document.querySelector("#continue").addEventListener("click", cont);
