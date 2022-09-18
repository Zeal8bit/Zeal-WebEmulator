/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 * 
 * SPDX-License-Identifier: Apache-2.0
 */

function UART(Zeal, PIO) {
    const zeal = Zeal;
    const pio = PIO;
    const IO_UART_RX_PIN = 3;
    const IO_UART_TX_PIN = 4;

    /* The baudrate is expressed in microseconds per bit sent/received */
    var tx_baudrate = 8.681;    // 115200
    var rx_baudrate = 17.361;   // 57600

    /* One bit in T-states */
    const tx_bit_tstates = us_to_tstates(tx_baudrate) + 1;
    const rx_bit_tstates = us_to_tstates(rx_baudrate);

    /* TX FIFO containing pairs of { tstates, bit } */
    var tx_fifo = [];

    function transferComplete() {
        /* Pop the first element, which must be 0 */
        const obj = tx_fifo.shift();
        console.assert(obj.bit == 0, "Invalid UART sequence");
        var time = obj.tstates;
        var line = 0;
        var value = 0;
        for (var i = 0; i < 8; i++) {
            time += tx_bit_tstates;
            /* Peek the next entry in the FIFO */
            while (tx_fifo.length > 0 && tx_fifo[0].tstates <= time) {
                const { bit } = tx_fifo.shift();
                line = bit;
            }
            value |= (line << i);
        }
        /* The terminal is a global variable */
        terminal.write([value]);
        /* Reset the FIFO in any case */
        tx_fifo = [];
    }

    /* Function called when a BIT is written to the UART, not a byte
     * The T-states will let us calculate the elapsed time between two write */
    function write_tx(read, pin, bit, transition) {
        console.assert(pin == IO_UART_TX_PIN);

        if (read) {
            return;
        }

        const tstates = zeal.getTstates();
        /* Ignore the case where a transfer hasn't been started and the line is set to 1 */
        if (bit == 1 && tx_fifo.length == 0) {
            /* Nothing to do */
        } else if (bit == 0 && tx_fifo.length == 0) {
            /* Register a callback in 10 UART bits */
            zeal.registerTstateCallback(transferComplete, Math.floor(9.1 * tx_bit_tstates));
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

    function start_shifting() {
        console.assert(shift_register != null);
        var callback = true;
        if (!shift_register.start) {
            /* Send a start bit */
            pio.pio_set_b_pin(IO_UART_RX_PIN, 0);
            shift_register.start = true;
        } else if (shift_register.stop) {
            /* Stop was sent, continue with the next register */
            if (received.length > 0) {
                shift_register = { data, start: false, stop: false, shifted: 0 };
                start_shifting();
                return;
            } else {
                shift_register = null;
                callback = false;
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
            zeal.registerTstateCallback(start_shifting, rx_bit_tstates);
        }
    }

    terminal.onData((data) => {
        /* Put the current bytes in the waiting list */
        for (var i = 0; i < data.length; i++){  
            received.push(data.charCodeAt(i) & 0xff);
        }

        if (shift_register == null) {
            /* Shift data right away */
            shift_register = { data: received.shift(), start: false, stop: false, shifted: 0 };
            start_shifting();
        }
    });

    function read_rx(read, pin, bit, transition) {
        /* Nothing to do if a read is occurring, we already notify the PIO of any changes (asynchronously) */
    }

    /* Connect the TX pin to the PIO */
    pio.pio_listen_b_pin(IO_UART_TX_PIN, write_tx);
    /* Connect the RX pin to the PIO */
    pio.pio_listen_b_pin(IO_UART_RX_PIN, read_rx);
}