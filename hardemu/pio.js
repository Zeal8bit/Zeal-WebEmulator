/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */
const MODE_OUTPUT  = 0;
const MODE_INPUT   = 1;
const MODE_BIDIR   = 2;
const MODE_BITCTRL = 3;

const DIR_INPUT  = 1;
const DIR_OUTPUT = 0;

function PIO(Zeal) {
    const zeal = Zeal;
    var port_a = {
        mode: MODE_OUTPUT,
        state: 0xf0,        /* Current value of pins */
        dir: 0xff,          /* Direction of pins: input by default */
        int_vector: 0,
        int_enable: false,
        int_mask: 0,
        and_op: true,       /* True = AND, False = OR */
        active_high: false,  /* True = Active high, False = Active low */
        mask_follows: false,
        dir_follows: false,
        /* Each listener is a callback that needs to be called when a write or read occurs on a pin.
         * So we have a most 8 listeners */
        listeners: [],
    };
    var port_b = {
        mode: MODE_OUTPUT,
        state: 0xf0,        /* Current value of pins */
        dir: 0xff,          /* Direction of pins: input by default */
        int_vector: 0,
        int_enable: false,
        int_mask: 0xff,     /* Bit with 0 will be monitored for interrupts */
        and_op: true,       /* True = AND, False = OR */
        active_high: false, /* True = Active high, False = Active low */
        mask_follows: false,
        dir_follows: false,
        /* Each listener is a callback that needs to be called when a write or read occurs on a pin.
         * So we have a most 8 listeners */
        listeners: []
    };

    const IO_PIO_DATA_A = 0xd0;
    const IO_PIO_DATA_B = 0xd1;
    const IO_PIO_CTRL_A = 0xd2;
    const IO_PIO_CTRL_B = 0xd3;

    /* Private functions */
    function BIT(value, bit) {
        return (value >> bit) & 1;
    }

    /**
     * Check if the given pin (with the given new value) should trigger an interrupt, when mode is BITCTRL
     */
    function pio_check_bitctrl_interrupt(port, pin, value) {
        const activemask = port.active_high ? 0xff : 0;

        /* Check that BITCTRL mode is ON */
        return port.mode == MODE_BITCTRL &&
            /* Check if the pin is monitored */
            (port.int_mask & (1 << pin)) == 0 &&
            /* Check if the active state is not the same as the value */
            ((activemask & 1) == value) &&
            /* If the operation is an OR, we can already return true, else, the
            * port state must be either all 0 (if active low) or 0xff (active high)
            */
            (!port.and_op || (port.state == activemask));
    }

    function io_read(port) {
        /* Even ports represent A, else B */
        const hw_port = (port & 1) == 0 ? port_a : port_b;
        /* Control or data port? (0 and 1 = data, 2 and 3 = ctrl) */
        const ctrl = (port & 2) != 0;
        const data = !ctrl;

        if (ctrl) {
            /* TODO: Check on real hardware */
            return 0x43;
        } else {
            return hw_port.state;
        }
    }

    function io_write(port, value) {
        /* Even ports represent A, else B */
        const hw_port = (port & 1) == 0 ? port_a : port_b;
        /* Control or data port? (0 and 1 = data, 2 and 3 = ctrl) */
        const ctrl = (port & 2) != 0;
        const data = !ctrl;

        if (ctrl && hw_port.dir_follows) {
            /* BITCTRL mode was selected during the previous OUT/write */
            hw_port.dir_follows = false;
            hw_port.dir = value & 0xff;
        } else if (ctrl && hw_port.mask_follows) {
            hw_port.mask_follows = false;
            /* Save the mask */
            hw_port.int_mask = value & 0xff;
        } else if (ctrl && (value & 0xf) == 0xf) {
            /* Word Set */
            /* Upper two bits define the mode to operate in */
            hw_port.mode = (value >> 6) & 0x3;
            hw_port.dir_follows = (hw_port.mode == MODE_BITCTRL);
        } else if (ctrl && (value & 0xf) == 7) {
            /* Interrupt Control Word */
            hw_port.mask_follows = BIT(value, 4) == 1;
            hw_port.active_high  = BIT(value, 5) == 1;
            hw_port.and_op       = BIT(value, 6) == 1;
            hw_port.int_enable   = BIT(value, 7) == 1;
            /* As stated in the PIO User manual, if mask follows is set, the interrupt requests are
             * reset, in our case, let's just reset the mask we have */
            if (hw_port.mask_follows) {
                hw_port.int_mask = 0xff;
            }
        } else if (ctrl && (value & 0xf) == 3) {
            /* Disable the interrupt flip-flop */
            hw_port.int_enable = BIT(value, 7) == 1;
        }  else if (ctrl && (value & 1) == 0) {
            /* When the LSB is 0, it means the interrupt vector is being programmed */
            hw_port.int_vector = value & 0xff;
        } else if (data && hw_port.mode != MODE_INPUT) {
            /* Backup the state to check for transitions on pins */
            const former_state = hw_port.state;
            if (hw_port.mode == MODE_BIDIR || hw_port.mode == MODE_OUTPUT) {
                hw_port.state = value & 0xff;
            } else {
                /* Only modify the state of output pins, input are not modified.
                * Input pins are set to 1, so invert the direction register. */
                const new_out_val = value & (~hw_port.dir & 0xff);
                /* Clear the output pins value from the state and OR it with the new value */
                hw_port.state = (hw_port.state & hw_port.dir) | new_out_val;
            }

            for (var pin = 0; pin < 8; pin++) {
                const listener = hw_port.listeners[pin];
                if (BIT(hw_port.dir, pin) == DIR_OUTPUT && listener) {
                    /* Parameters(read, pin, value, transition) */
                    const transition = BIT(former_state, pin) != BIT(hw_port.state, pin);
                    listener(false, pin, BIT(hw_port.state, pin), transition);
                }
            }
        }
    }

    /**
     * Set the pin of a port to a certain value: 0 or 1.
     */
     function pio_set_pin(port, pin, value) {
        console.assert(pin >= 0 && pin <= 7);
        const previous_state = port.state;
        if (value == 0) {
            port.state &= (~(1 << pin)) & 0xff;
        } else {
            port.state |= (1 << pin);
        }
        /* Check if the bit actually changed */
        const changed = (previous_state ^ port.state) != 0;
        /* Check if an interrupt need to be generated */
        if (port.int_enable && changed &&
            port.mode != MODE_OUTPUT &&
            (port.mode != MODE_BITCTRL || pio_check_bitctrl_interrupt(port, pin, value)))
        {
            zeal.interrupt(port.int_vector);
        }
    }

    /**
     * Get the pin of a port.
     * Returns 0 or 1.
     */
     function pio_get_pin(port, pin) {
        console.assert(pin >= 0 && pin <= 7);
        return BIT(port.state, pin);
    }

    function pio_listen_pin(port, pin, callback) {
        /* If the pin is invalid or if there is already a listener (except if callback is null), fail */
        if (pin < 0 || pin > 7 || (callback != null && port.listeners[pin])) {
            return false;
        }
        port.listeners[pin] = callback;
    }

    this.io_region = {
        write: io_write,
        read: io_read,
        size: 0x10
    };


    this.pio_set_a_pin = (pin, value) => pio_set_pin(port_a, pin, value);
    this.pio_set_b_pin = (pin, value) => pio_set_pin(port_b, pin, value);
    this.pio_get_a_pin = (pin) => pio_get_pin(port_a, pin);
    this.pio_get_b_pin = (pin) => pio_get_pin(port_b, pin);
    this.pio_listen_a_pin = (pin, cb) => pio_listen_pin(port_a, pin, cb);
    this.pio_listen_b_pin = (pin, cb) => pio_listen_pin(port_b, pin, cb);
    this.pio_unlisten_a_pin = (pin) => pio_listen_pin(port_a, pin, null);
    this.pio_unlisten_b_pin = (pin) => pio_listen_pin(port_b, pin, null);
}
