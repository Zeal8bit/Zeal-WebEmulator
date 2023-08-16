/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

var tstates_callbacks = new Set();
var t_state = 0;

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

async function compareSpeeds(promises) {
    try {
        let results = await Promise.all(promises);
        let fastest = {speed: 0, url: ""};
        for (let j = 0; j < results.length; j++) {
            if (results[j].speed > fastest.speed) {
                fastest.speed = results[j].speed;
                fastest.url = results[j].url;
            }
        }
        return fastest;
    } catch (error) {
        throw error;
    }
}

async function testSpeed(url) {
    const startTime = Date.now();
    const response = await fetch(url);
    if (response.ok) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const speed = response.headers.get("content-length") / duration;
        return { speed, url };
    } else {
        return { speed: 999999999, url };
    }
};

async function readblobfromurl(pburl) {
    const response = await fetch(pburl);
    return await response.blob();
}

function filehash(file1, SHA2) {
    // Check for hash value
    const fileReader = new FileReader();
    fileReader.onloadend = (ev) => {
        const SHA256 = CryptoJS.SHA256(CryptoJS.enc.Latin1.parse(ev.target.result)).toString(CryptoJS.enc.Hex);
        // console.log("SHA256(Read): " + SHA256 + "\nSHA256(JSON): "+ SHA2);
        if (String(SHA256) == String(SHA2)) {
            read_owr(file1)
        }
        else {
            r = confirm("Warning: Hash values do not match. Continue?");
            if (r == true) {
                read_owr(file1);
            }
        }
    }
    fileReader.readAsBinaryString(file1);
}

 /* Set of T-states callbacks Object: { tstates, callback, period }
 * In theory, a Binary Heap (min heap) would be better. In practice,
 * We won't have a lot on entries in here. At most 4.
 */
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

// About hex

function disassembler_hex(n) {
    return "$" + n.toString(16);
}

function hex(str = "", noprefix = false, digits = 4) {
    const leading = `${"0".repeat(digits)}${str.toString(16).toUpperCase()}`.substr(-digits);
    return noprefix ? leading : `0x${leading}`;
}

function hex8(str, noprefix) {
    const value = hex(str, true);
    return `${noprefix ? "" : "0x"}${value.substring(2)}`;
}
  
function hex16(high, lower, noprefix) {
    const value = (high << 8) | lower;
    return `${noprefix ? "" : "0x"}${hex(value, true)}`;
}
