/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>; JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function Zeal8bitComputer() {
    var tstates_callbacks = new Set();
    var t_state = 0;
    var running = true;
    var interval = null;

    const tstatesutils = {
        /**
         * T-states related functions
         */
        getTstates: function() {
            return t_state;
        },

        addTstates: function(count) {
            t_state += count;

            /* Kind-of static variable within function scope */
            tstatesutils.addTstates.in_callback = tstatesutils.addTstates.in_callback || false;

            /* Check if any callback can be called, if we aren't in any */
            if (!tstatesutils.addTstates.in_callback) {
                tstates_callbacks.forEach(entry => {
                    if (entry.tstates <= t_state) {
                        tstatesutils.addTstates.in_callback = true;
                        entry.callback();
                        if (entry.period == 0) {
                            tstates_callbacks.delete(entry);
                        } else {
                            entry.tstates += entry.period;
                        }
                        tstatesutils.addTstates.in_callback = false;
                    }
                });
            }
        },

        /**
         * Get the earliest callback out of the list.
         */
        getEarliestCallback: function() {
            var earliest = null;

            tstates_callbacks.forEach((entry) => {
                if (earliest == null || entry.tstates < earliest.tstates) {
                    earliest = entry;
                }
            });

            return earliest;
        },

        /**
         * Register a callback that shall be called after the number of T-states
         * of the CPU given.
         * If the given number is less than 0, return an error.
         */
        registerTstateCallback: function(callback, call_tstates) {
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
        },

        /* Register a callback to be called every call_tstates T-states.
        * The delay parameter will let us, defer the start of the first call,
        * without altering the period. This is handy for period signal that changes
        * values for a short period of time (pulses)
        */
        registerTstateInterval: function(callback, call_tstates, delay) {
            if (call_tstates < 0) {
                return null;
            }

            /* If the delay parameter is not defined, set it to 0 */
            delay = delay || 0;

            const obj = { tstates: t_state + delay + call_tstates, callback, period: call_tstates };
            tstates_callbacks.add(obj);
            return obj;
        },

        removeTstateCallback: function(callback) {
            if (callback != null) {
                tstates_callbacks.delete(callback);
            }
        },

        adjustTStatesWhenHalted: function(end) {
            const earliest = tstatesutils.getEarliestCallback();
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
    }

    this.getTstates = tstatesutils.getTstates;
    this.addTstates = tstatesutils.addTstates;
    this.getEarliestCallback = tstatesutils.getEarliestCallback;
    this.registerTstateCallback = tstatesutils.registerTstateCallback;
    this.registerTstateInterval = tstatesutils.registerTstateInterval;
    this.removeTstateCallback = tstatesutils.removeTstateCallback;
    this.adjustTStatesWhenHalted = tstatesutils.adjustTStatesWhenHalted;

    /* Check which scale to use for the video */
    var scale = 1;

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
    const devices = [ rom, ram, vchip, pio, keyboard, mmu ];
    const zpu = new Z80({ mem_read, mem_write, io_read, io_write });

    this.mmu = mmu;
    this.rom = rom;
    this.ram = ram;
    this.pio = pio;
    this.vchip = vchip;
    this.uart = uart;
    this.i2c = i2c;
    this.keyboard = keyboard;
    this.ds1307 = ds1307;
    this.eeprom = eeprom;
    this.devices = devices;
    this.zpu = zpu;
    this.getCPUState = zpu.getState

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
                    tstatesutils.addTstates(zpu.run_instruction());
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
                        tstatesutils.adjustTStatesWhenHalted(end);
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
            tstatesutils.addTstates(zpu.run_instruction());
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

    function restart() {
        clearInterval(interval);
        interval = null;
        running = false;
        vchip.clear();
        terminal.clear();
        zealcom = new Zeal8bitComputer();
        /* Reset all the file inputs */
        $("#romfile [type=file]").val("");
        /* Remove the ticks from the ready list */
        $(".status").removeClass("ready");
        $("#romchoice").each(function(){
            $(this).find("option").eq(0).prop("selected",true)
        });
    }

    function reset() {
        zpu.reset();
        vchip.clear();
        terminal.clear();
        step_cpu();
    }

    function interrupt(interrupt_vector) {
        zpu.interrupt(false, interrupt_vector);
        step_cpu();
    }

    function destroy() {
        clearInterval(interval);
        interval = null;
        running = false;
    }

    function KeyboardKeyPressed(keycode) {
        return keyboard.key_pressed(keycode);
    }

    function KeyboardKeyReleased(keycode) {
        return keyboard.key_released(keycode);
    }

    this.mem_read = mem_read;
    this.mem_write = mem_write;

    this.io_read = io_read;
    this.io_write = io_write;

    this.step_cpu = step_cpu;
    this.step = step;
    this.step_over = step_over;
    this.cont = cont;
    this.stop = stop;
    this.restart = restart;
    this.reset = reset;
    this.interrupt = interrupt;
    this.destroy = destroy;
    this.KeyboardKeyPressed = KeyboardKeyPressed;
    this.KeyboardKeyReleased = KeyboardKeyReleased;
}