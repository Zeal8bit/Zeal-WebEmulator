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


const frequency = 5 * KB * KB;

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
}

function step () {
    var pc = registers.pc;
    while (registers.pc == pc) {
        zpu.run_instruction();
        registers = zpu.getState();
    }
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
    zpu.interrupt(false, 0);
    if (intcount != 1) {
        for (var i = 0; i < 256; i++) {
            zpu.run_instruction();
        }
        zpu.interrupt(false, 0);
    }
});
