const rom = new ROM();
const ram = new RAM();
const vchip = new VideoChip();

const devices = [ rom, ram, vchip ];

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
            device.io_read(port);
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
    const t_state = zpu.run_instruction();
    setTimeout(step_cpu, 1);
}

step_cpu();
