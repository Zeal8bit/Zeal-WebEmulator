/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>; JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function Zeal8bitComputer() {
    /* Sorted List of all the callbacks */
    var tstates_callbacks = {
        length : 0,
        head : null,
        insert : function (data) {
            if (!data) {
                return;
            }

            this.length++;

            /* If the list in empty, insert it as the head */
            if (this.head == null) {
                data.next = null;
                data.prev = null;
                this.head = data;
                return;
            }

            /* Else, look for its place in the list */
            let current = this.head;
            let previous = null;
            while (current && data.tstates >= current.tstates) {
                previous = current;
                current = current.next;
            }

            if (!current) {
                /* Insert `data` at the end of the list */
                previous.next = data;
                data.prev = previous;
                data.next = null;
            } else if (!previous) {
                /* Insert `data` at the beginning of the list */
                data.next = current;
                data.prev = null;
                current.prev = data;
                this.head = data;
            } else {
                data.next = current;
                data.prev = previous;
                previous.next = data;
                current.prev = data;
            }
          },

        remove : function (data) {

            if (!data.prev) {
                this.pop();
                return;
            }

            this.length--;
            data.prev.next = data.next;
            /* data.next can be null if data is the tail of the list */
            if (data.next) {
                data.next.prev = data.prev;
            }

            /* Clear the fields */
            data.next = null;
            data.prev = null;
        },

        peek : function() {
            return this.head;
        },

        pop : function () {
            if (this.head) {
                this.length--;

                const original = this.head;
                this.head = original.next;

                if (this.head) {
                    this.head.prev = null;
                }

                original.next = null;
                original.prev = null;
            }
        }
    };
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

            const state = tstatesutils.addTstates;
            /* Kind-of static variable within function scope */
            state.in_callback = state.in_callback || false;

            /* Check if any callback can be called, if we aren't in any */
            if (!state.in_callback) {
                for (var i = 0; i < tstates_callbacks.length; i++) {
                    const entry = tstates_callbacks.peek();
                    if (entry.tstates <= t_state) {
                        /* Remove the entry from the list in all cases */
                        tstates_callbacks.pop();
                        state.in_callback = true;
                        entry.callback();
                        if (entry.period != 0) {
                            entry.tstates += entry.period;
                            tstates_callbacks.insert(entry);
                        }
                        state.in_callback = false;
                    } else {
                        /* The first item of the list is bigger than the current amount of T-states */
                        break;
                    }
                }
            }
        },

        /**
         * Get the earliest callback out of the list.
         */
        getEarliestCallback: function() {
            return tstates_callbacks.peek();
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
            tstates_callbacks.insert(obj);

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
            tstates_callbacks.insert(obj);
            return obj;
        },

        removeTstateCallback: function(callback) {
            if (callback) {
                tstates_callbacks.remove(callback);
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

        const length = devices.length;
        for (var i = 0; i < length; i++) {
            const device = devices[i];
            if (device.is_valid_address(true, ext_addr)) {
                if (found) {
                    // This is much faster than using a console.assert!
                    console.log("Two devices replied to address " + ext_addr);
                }
                rd = device.mem_read(ext_addr);
                found = true;
            }
        }

        if (!found) {
            console.log("No device replied to memory read: " + ext_addr);
        }

        return rd;
    }

    function mem_write(address, value) {
        const ext_addr = mmu.get_ext_addr(address);

        const length = devices.length;
        for (var i = 0; i < length; i++) {
            const device = devices[i];
            if (device.is_valid_address(false, ext_addr))
                device.mem_write(ext_addr, value);
        }
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
                    /* Check whether the current PC is part of the breakpoints list */
                    const pc = zpu.getPC();
                    for (var i = 0; i < breakpoints.length; i++) {
                        const bk = breakpoints[i];
                        if (bk.enabled && bk.address == pc) {
                            running = false;
                            setRegView();
                            if (bk.callback) {
                                bk.callback(bk);
                            }
                        }
                    }

                    if (zpu.isHalted() && t_state <= end) {
                        tstatesutils.adjustTStatesWhenHalted(end);
                    }
                }

                /* Render the screen now */
                vchip.renderScreen();
            }, 16.666);
        }
    }

    function step () {
        if (zpu.isHalted() || running) {
            return;
        }
        const pc = zpu.getPC();
        while (zpu.getPC() == pc) {
            /* TODO: check if jr/jp to self instruction */
            tstatesutils.addTstates(zpu.run_instruction());
        }
        setRegView();
    }

    function step_over () {
        /* If the CPU is running, step is meaningless */
        if (running) {
            return;
        }

        /* Ideally, we would need the size of the instruction, to know where to put the breakpoint
         * but as we don't have such thing yet, we can put 4 breakpoints, one after each byte.
         * TODO: refactor once we have a working disassembler. */
        var pc = zpu.getPC();
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
        setRegView();
        running = false;
    }

    function restart(resetinterval=true) {
        running = false;
        vchip.clear();
        terminal.clear();
        zealcom = new Zeal8bitComputer();
        if (resetinterval == true) {
            clearInterval(interval);
            interval = null;
        }
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