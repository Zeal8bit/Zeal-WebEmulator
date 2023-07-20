/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */
function I2C(Zeal, PIO) {
    const zeal = Zeal;
    const pio = PIO;
    const IO_I2C_SDA_OUT_PIN = 0;
    const IO_I2C_SCL_OUT_PIN = 1;
    const IO_I2C_SDA_IN_PIN  = 2;

    const STATE_IDLE = 0;
    const STATE_WAIT_ADDR = 1;
    const STATE_WR_REQ = 2;
    const STATE_RD_REQ = 3;

    /* List of devices connected to the I2C bus */
    const connected_devices = [];

    var state = STATE_IDLE;
    var shift_register = 0;
    var shift_register_out = 0;
    var sending_ack = false;
    var receiving_ack = false;
    var shifted = 0;
    var device = 0;
    var rd_fifo = [];
    var wr_fifo = [];

    function device_connect(address, device) {
        console.assert(address >= 0 && address <= 0x7f);
        connected_devices[address] = device;
    }

    function device_address_received(dev_addr) {
        /* The given address is an 8-bit one, get rid of the R/W one */
        const real_address = dev_addr >> 1;

        /* Check if address valid */
        if (!connected_devices[real_address]) {
            /* NACK */
            pio.pio_set_b_pin(IO_I2C_SDA_IN_PIN, 1);
            return;
        }

        /* Check if this is a write-read request.
         * If only the last bit changed and it's a 1 now, then we have a write-read request. */
        if ((dev_addr ^ device) == 1 && (dev_addr & 1) == 1) {
            rd_fifo = connected_devices[real_address].write_read(wr_fifo);
            shift_register_out = rd_fifo.length > 0 ? rd_fifo.shift() : 0;
        } else {
            wr_fifo = [];
            rd_fifo = [];
            shift_register = 0;
            shift_register_out = 0;

            /* If the new request is a read, inform the device */
            if ((dev_addr & 1) == 1) {
                rd_fifo = connected_devices[real_address].read();
            }
        }

        shifted = 0;
        sending_ack = false;
        receiving_ack = false;
        device = dev_addr;
        state = (dev_addr & 1) == 1 ? STATE_RD_REQ : STATE_WR_REQ;
        /* ACK */
        pio.pio_set_b_pin(IO_I2C_SDA_IN_PIN, 0);
    }

    function device_stop_signal(device, state, rd_fifo, wr_fifo) {
        const real_address = device >> 1;

        if (state == STATE_WR_REQ) {
            connected_devices[real_address].write(wr_fifo);
        }
    }

    /**
     * This callback will only be used to detect a START or a STOP
     */
    function write_sda(read, pin, bit, transition) {
        if (read || !transition) return;

        const scl = pio.pio_get_b_pin(IO_I2C_SCL_OUT_PIN);
        if (bit == 0 && scl == 1) {
            if (state == STATE_IDLE) {
                /* Start bit */
            } else if (state == STATE_WR_REQ || state == STATE_RD_REQ) {
                /* Restart occurred, flush the request to the devices? */
            }
            state = STATE_WAIT_ADDR;
            shift_register = 0;
            shifted = 0;
            sending_ack = false;
            receiving_ack = false;
        } else if (bit == 1 && scl == 1 && state != STATE_IDLE) {
            device_stop_signal(device, state, rd_fifo, wr_fifo);
            /* Stop bit, flush the request */
            state = STATE_IDLE;
            /* Re-init everything the FIFOs */
            rd_fifo = [];
            wr_fifo = [];
            device = 0;
            shift_register = 0;
            shifted = 0;
            sending_ack = false;
            receiving_ack = false;
        }
    }

    function write_scl(read, pin, bit, transition) {
        if (read || !transition) return;

        /* Check that the clock is switching to low, while start was given */
        if (bit == 0) {
            /* Can switch the SDA value according to the request */
            if (receiving_ack) {
                receiving_ack = false;
            } else if (state == STATE_RD_REQ) {
                /* After receiving the device read address, we have to send an ACK on the bus,
                 * thus, this flag would be set! */
                if (sending_ack) {
                    sending_ack = false;
                    return;
                }
                /* Read request */
                const bit = (shift_register_out >> (7 - shifted)) & 1;
                pio.pio_set_b_pin(IO_I2C_SDA_IN_PIN, bit);
                shifted++;
                if (shifted == 8) {
                    shifted = 0;
                    shift_register_out = (rd_fifo.length > 0) ? rd_fifo.shift() : 0;
                    receiving_ack = true;
                }
            }
        } else if (sending_ack) {
            /* One clock cycle for ACK bit */
            sending_ack = false;
        } else if (state == STATE_WAIT_ADDR) {
            const sda = pio.pio_get_b_pin(IO_I2C_SDA_OUT_PIN);
            /* Enqueue the value */
            shift_register = (shift_register << 1) | sda;
            shifted++;
            if (shifted == 8) {
                device_address_received(shift_register);
                shifted = 0;
                shift_register = 0;
                sending_ack = true;
            }
        } else if (state == STATE_WR_REQ) {
            const sda = pio.pio_get_b_pin(IO_I2C_SDA_OUT_PIN);
            /* Write request, save the bits */
            shift_register = (shift_register << 1) | sda;
            shifted++;
            if (shifted == 8) {
                wr_fifo.push(shift_register);
                shifted = 0;
                shift_register = 0;
                /* Received a byte, ACK on SDA line */
                pio.pio_set_b_pin(IO_I2C_SDA_IN_PIN, 0);
                sending_ack = true;
            }
        }
    }


    /* Connect the SCL pin to the PIO */
    pio.pio_listen_b_pin(IO_I2C_SCL_OUT_PIN, write_scl);
    /* Connect the SDA pin to the PIO */
    pio.pio_listen_b_pin(IO_I2C_SDA_OUT_PIN, write_sda);

    /* Set default pin SDA out pin to 1 */
    pio.pio_set_b_pin(IO_I2C_SDA_IN_PIN, 1);

    /* Public methods */
    this.device_connect = device_connect;
}

function I2C_DS1307(Zeal, I2C) {
    const zeal = Zeal;
    const i2c = I2C;
    const DEVICE_ADDR = 0x68;

    var pm_am = false;

    /* Connect to the bus directly */
    i2c.device_connect(DEVICE_ADDR, this);

    function dec_to_bcd(value) {
        return parseInt(value.toString(10), 16);
    }

    /* Generate the 8 BCD registers */
    function generate_time() {
        const d = new Date();
        const year = d.getFullYear() % 100;
        const month = d.getMonth() + 1;
        const date = d.getDate();
        const day = d.getDay();
        const seconds = d.getSeconds();
        const minutes = d.getMinutes();
        const hours = d.getHours();
        const regs = [seconds, minutes, hours, day, date, month, year];
        return regs.map(dec_to_bcd);
    }

    function read() {
        return generate_time();
    }

    function write(wr_fifo) {
        console.log("Write to RTC not supported yet.");
    }

    function write_read(wr_fifo) {
        const from = wr_fifo.length > 0 ? wr_fifo.shift() : 0;
        const time = generate_time();
        return time.slice(from);
    }

    this.read = read;
    this.write = write;
    this.write_read = write_read;
}


function I2C_EEPROM(Zeal, I2C, content) {
    const zeal = Zeal;
    const i2c = I2C;
    const DEVICE_ADDR = 0x50;
    const size = 64*KB;
    const page_size = 64;

    var data = new Array(size);

    for (var i = 0; i < size; i++) {
        if (content) {
            data[i] = content[i];
        } else {
            data[i] = 0;
        }
    }

    function loadFile(binary) {
        for (var i = 0; i < binary.length; i++)
            data[i] = binary.charCodeAt(i);
    }

    /* Format the EEPROM to use ZealFS */
    if (!content) {
        data[0] = 0x5A;
        data[1] = 0x01;
        data[2] = 0x20;
        data[3] = 0xFF;
        data[4] = 0x01;
    }

    function dumpToFile() {
        const array = new Uint8Array(data);
        const blob = new Blob([array], { type: "octet/stream" });
        const url = window.URL.createObjectURL(blob);
        $("#dump-eeprom-link").attr("href", url);
        $("#dump-eeprom-link")[0].click();
        window.URL.revokeObjectURL(url);
    }

    $("#dump-eeprom-button").click(dumpToFile);

    /* Connect to the bus directly */
    i2c.device_connect(DEVICE_ADDR, this);

    var acc = 0;
    function read() {
        return data[acc++];
    }

    function write(wr_fifo) {
        if (wr_fifo.length < 2) {
            console.log("Invalid WRITE request to I2C EEPROM");
            return;
        }
        const high = wr_fifo.shift();
        const low  = wr_fifo.shift();
        const address = ((high << 8) | low) & (size - 1);
        var page_index = 0;
        while (wr_fifo.length > 0) {
            data[address + page_index] = wr_fifo.shift();
            page_index = (page_index + 1) % page_size;
        }
    }

    function write_read(wr_fifo) {
        if (wr_fifo.length != 2) {
            console.log("Invalid WRITE-READ request to I2C EEPROM");
        }
        const high = wr_fifo.length > 0 ? wr_fifo.shift() : 0;
        const low  = wr_fifo.length > 0 ? wr_fifo.shift() : 0;
        const address = ((high << 8) | low) & (size - 1);
        /* Read from the EEPROM memory */
        return data.slice(address);
    }

    this.read = read;
    this.write = write;
    this.write_read = write_read;
    this.loadFile = loadFile;
}