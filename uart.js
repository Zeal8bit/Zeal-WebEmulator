/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 * 
 * SPDX-License-Identifier: Apache-2.0
 */
function UART(Zeal, PIO) {
    const zeal = Zeal;
    const pio = PIO;

    /* The baudrate is expressed in microseconds per bit sent/received */
    var tx_baudrate = 8.681;    // 115200
    var rx_baudrate = 17.361;   // 57600

    /* One bit in T-states */
    const tx_bit_tstates = us_to_tstates(tx_baudrate) + 1;

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
    function write(bit, tstates) {
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

    this.write = write;
}