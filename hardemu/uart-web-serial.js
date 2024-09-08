/**
 * SPDX-FileCopyrightText: 2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function UART_WebSerial(Zeal, PIO) {
    const zeal = Zeal;
    const pio = PIO;
    const IO_UART_RX_PIN = 3;
    const IO_UART_TX_PIN = 4;

    /* The baudrate is expressed in microseconds per bit sent/received */
    var baudrate_us = 17.361;    // Default to 57600 baud

    /* One bit in T-states */
    var bit_tstates = us_to_tstates(baudrate_us) + 1;

    /* TX FIFO containing pairs of { tstates, bit } */
    var tx_fifo = [];

    var openedPort;
    var reader;
    var writer;
    var active = false;

    function set_baudrate(baudrate) {
        baudrate_us = 1000000/baudrate;
        bit_tstates = us_to_tstates(baudrate_us) + 1;
    }

    function transferComplete() {
        /* Pop the first element, which must be 0 */
        const obj = tx_fifo.shift();
        console.assert(obj.bit == 0, "Invalid UART sequence");
        var time = obj.tstates;
        var line = 0;
        var value = 0;
        for (var i = 0; i < 8; i++) {
            time += bit_tstates;
            /* Peek the next entry in the FIFO */
            while (tx_fifo.length > 0 && tx_fifo[0].tstates <= time) {
                const { bit } = tx_fifo.shift();
                line = bit;
            }
            value |= (line << i);
        }

        send_binary_array([value]);
        /* Reset the FIFO in any case */
        tx_fifo = [];
    }

    /* Function called when a BIT is written to the UART, not a byte
     * The T-states will let us calculate the elapsed time between two write */
    function write_tx(read, pin, bit, transition) {
        if(!active) return;
        console.assert(pin == IO_UART_TX_PIN);

        if (read) {
            return;
        }

        const tstates = zeal.getTstates();

        /* Trace this change if the value changed */
        if (transition) {
            g_tracevcd.change(tstates, trace_tx_handle, bit);
        }

        /* Ignore the case where a transfer hasn't been started and the line is set to 1 */
        if (bit == 1 && tx_fifo.length == 0) {
            /* Nothing to do */
        } else if (bit == 0 && tx_fifo.length == 0) {
            /* Register a callback in 10 UART bits */
            zeal.registerTstateCallback(transferComplete, Math.floor(9.1 * bit_tstates));
            tx_fifo.push({ tstates, bit });
        } else {
            tx_fifo.push({ tstates, bit });
        }
    }

    /* On the real hardware, there is no FIFO. All the byte received on the UART must be done
     * synchronously. Else, data will be lost. In any case, let's do the same thing in this emulation.
     * As soon as we have data coming from the UART (Terminal), we are going to shift them in the PIO,
     * bit by bit. */
    var received = [];
    var shift_register = null;
    var success_callback = null;

    function start_shifting () {
        if(!active) return;
        console.assert(shift_register != null);
        var callback = true;
        if (!shift_register.start) {
            /* Send a start bit */
            pio.pio_set_b_pin(IO_UART_RX_PIN, 0);
            shift_register.start = true;
        } else if (shift_register.stop) {
            /* Stop was sent, continue with the next register */
            if (received.length > 0) {
                shift_register = { data: received.shift(), start: false, stop: false, shifted: 0 };
                start_shifting();
                return;
            } else {
                shift_register = null;
                callback = false;
                const tocall = success_callback;
                success_callback = null;
                if (tocall) {
                    tocall();
                }
            }
        } else if (shift_register.shifted == 8) {
            /* Stop bit */
            pio.pio_set_b_pin(IO_UART_RX_PIN, 1);
            shift_register.stop = true;
        } else {
            pio.pio_set_b_pin(IO_UART_RX_PIN, shift_register.data & 1);
            shift_register.data >>= 1
            shift_register.shifted++;
        }

        /* If we have to register a callback, do it now */
        if (callback) {
            zeal.registerTstateCallback(start_shifting, bit_tstates - 1);
        }
    }

    function start_transfer() {
        if (shift_register == null) {
            /* Shift data right away */
            shift_register = { data: received.shift(), start: false, stop: false, shifted: 0 };
            start_shifting();
        }
    }

    async function readLoop() {
        while(openedPort && reader) {
            // Connect to `port` or add it to the list of available ports.
            try {
                while(true) {
                    const { value, done } = await reader.read();
                    if(done) break;

                    // const str = new TextDecoder().decode(value);
                    for(var i = 0; i < value.length; i++) {
                        for(b of value) {
                            const __val = b & 0xff;
                            // console.log('byte', {hex: __val.toString(16), dec: __val});
                            received.push(__val);
                            start_transfer();
                        }
                    }
                }
            } catch(err) {
                console.warn('serial error', err);
            }
        }
    }

    function read_rx(read, pin, bit, transition) {
        /* Nothing to do if a read is occurring, we already notify the PIO of any changes (asynchronously) */
    }

    function send_binary_array(binary, callback = null) {
        if(openedPort && writer) {
            let data = new Uint8Array(binary);
            if (typeof binary === "string") {
                const encoder = new TextEncoder();
                data = encoder.encode(binary);
            }

            writer.write(data).then(() => {
                if(callback) callback();
            });
        }
    }

    async function close() {
        if(reader) { reader.releaseLock(); reader = null };
        if(writer) { writer.releaseLock(); writer = null };

        return openedPort.forget().then(() => {
            this.openedPort = null;
            this.opened = false;
            zealcom.set_serial('emulated');
        });
    };

    async function open(port) {
        openedPort = port;
        this.opened = true;

        if(openedPort.readable) {
            reader = await openedPort.readable.getReader();
            readLoop(openedPort);
        }
        if(openedPort.writable) writer = await openedPort.writable.getWriter();
        return Promise.resolve(true);
    }

    /* Set RX pin to 1 (idle) */
    pio.pio_set_b_pin(IO_UART_RX_PIN, 1);

    /* Add the TX pin to the VCD dumper */
    trace_tx_handle = g_tracevcd.addWire("TX", 1);

    /* Set the baudrate */
    this.set_baudrate = set_baudrate;

    /* Send a binary array to the UART */
    this.send_binary_array = send_binary_array;

    this.close = close;
    this.open = open;

    this.opened = false;
    this.type = 'web-serial';
    this.setActive = (state) => {
        // console.log(this.type, state);
        active = state;

        if(active) {
            /* Connect the TX pin to the PIO */
            pio.pio_listen_b_pin(IO_UART_TX_PIN, write_tx);
            /* Connect the RX pin to the PIO */
            pio.pio_listen_b_pin(IO_UART_RX_PIN, read_rx);

        } else {
            /* Connect the TX pin to the PIO */
            pio.pio_unlisten_b_pin(IO_UART_TX_PIN);
            /* Connect the RX pin to the PIO */
            pio.pio_unlisten_b_pin(IO_UART_RX_PIN);
        }
    }
}