/**
 * SPDX-FileCopyrightText: 2023-2024 Zeal 8-bit Computer <contact@zeal8bit.com>; JasonMo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

class Z80Machine {
    constructor () {
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


        const zpu = new Z80({ mem_read, mem_write, io_read, io_write });
        this.zpu = zpu;
        this.getCPUState = zpu.getState;

        var get_physical_address = null;
        var m_alignment = 1;
        var m_mem_mapping = null;
        var m_io_mapping = null;

        /**
         * @brief Initialize the memory, including the I/O memory, for the machine.
         *
         * @param options Options which can have the followign fields:
         *          - physical_size, if the machine has more than 64KB
         *          - alignment, this can be used to optimize the device mapping (must be a power of two)
         *          - translator, callback called to convert a virtual address to physical
         */
        function machine_initialize_memory(options) {
            if (options.translator) {
                get_physical_address = options.translator;
            }

            /* Use a default alginment of 1KB for memory devices */
            m_alignment = options.alignment || (1 * KB);
            const phys_size = options.physical_size || (64*KB);
            const count = phys_size / m_alignment;
            m_mem_mapping = new Array(count);

            /* Always use the same amount for I/O: 256 */
            m_io_mapping = new Array(256);
        }

        /* To map a device on the system bus, a memory region shall be defined with the following
        * fields:
        *  - write
        *  - read
        *  - size (in bytes)
        */
        function machine_add_mem_device(phys_addr, region) {
            console.assert((phys_addr & (m_alignment - 1)) == 0, "Incorrect alignment for device!");
            const dev_idx = Math.floor(phys_addr / m_alignment);
            const count = Math.floor(region.size / m_alignment);
            const new_region = { ...region };
            new_region.from = phys_addr;

            for (var i = 0; i < count; i++)
                m_mem_mapping[dev_idx + i] = new_region;
        }

        /* Similarly for the I/O bus */
        function machine_add_io_device(addr, region) {
            console.assert(addr < 256 && addr + region.size <= 256, "Incorrect entry for I/O device");
            const new_region = { ...region };
            new_region.from = addr;

            const count = region.size;
            for (var i = 0; i < count; i++)
                m_io_mapping[addr + i] = new_region;
        }

        this.machine_initialize_memory = machine_initialize_memory;
        this.machine_add_mem_device    = machine_add_mem_device;
        this.machine_add_io_device     = machine_add_io_device;


        function mem_read(address) {
            const phys_addr = get_physical_address ? get_physical_address(address) : address;
            const idx = Math.floor(phys_addr / m_alignment);
            const entry = m_mem_mapping[idx];

            if (entry && entry.read) {
                return entry.read(phys_addr - entry.from);
            } else {
                console.log("No device replied to memory read: " + phys_addr);
                return 0;
            }
        }

        function mem_write(address, value) {
            const phys_addr = get_physical_address ? get_physical_address(address) : address;
            const idx = Math.floor(phys_addr / m_alignment);
            const entry = m_mem_mapping[idx];

            if (entry && entry.write) {
                return entry.write(phys_addr - entry.from, value);
            } else {
                console.log("No device replied to memory write: " + phys_addr);
                return 0;
            }
        }


        function io_read(address) {
            const low = address & 0xff;
            const high = (address >> 8) & 0xff;
            const entry = m_io_mapping[low];

            if (entry && entry.read) {
                return entry.read(low - entry.from, high);
            } else {
                console.log("No device replied to I/O read: " + low);
                return 0;
            }
        }


        function io_write(address, value) {
            const low = address & 0xff;
            const high = (address >> 8) & 0xff;
            const entry = m_io_mapping[low];

            if (entry && entry.write) {
                return entry.write(low - entry.from, value, high);
            } else {
                console.log("No device replied to I/O write: " + low);
                return 0;
            }
        }


        const outer_this = this;
        function instruction_loop() {
            // const now = performance.now();
            // const elpased = now - this.previous;
            // console.log("Called " + elpased + "ms ago");
            // this.previous = performance.now();

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
            outer_this.gfx_update();
        }


        function step_cpu() {
            running = true;

            if (interval == null) {
                /* Execute the CPU every 16ms */
                interval = setInterval(instruction_loop, 16.666);
            }
        }
        this.step_cpu = step_cpu;

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

        function interrupt(interrupt_vector) {
            zpu.interrupt(false, interrupt_vector);
            step_cpu();
        }

        function destroy() {
            clearInterval(interval);
            interval = null;
            running = false;
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
        this.interrupt = interrupt;
        this.destroy = destroy;
    }

    reset() {
        this.zpu.reset();
        terminal.clear();
        this.step_cpu();
    }

    gfx_update () {
    }
}
