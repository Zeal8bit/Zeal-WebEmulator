/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
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
    const uart = new UART(Zeal, this);
    const i2c = new I2C(Zeal, this);
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
        dir_follows: false
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
        dir_follows: false
    };

    const IO_I2C_SDA_OUT_PIN = 0;
    const IO_I2C_SCL_OUT_PIN = 1;
    const IO_I2C_SDA_IN_PIN  = 2;
    const IO_UART_RX_PIN     = 3;
    const IO_UART_TX_PIN     = 4;
    const IO_HBLANK_PIN      = 5;
    const IO_VBLANK_PIN      = 6;
    
    const IO_PIO_DATA_A = 0xd0;
    const IO_PIO_DATA_B = 0xd1;
    const IO_PIO_CTRL_A = 0xd2;
    const IO_PIO_CTRL_B = 0xd3;

    /* Private functions */
    function BIT(value, bit) {
        return (value >> bit) & 1;
    }

    var vblank_interval = null;
    var vblank_interval_end = null;

    function set_vblank_enabled(enabled) {
        /* 16.66ms in T-states */
        const VBLANK_TSTATES_PERIOD = us_to_tstates(16666.666) - 1;
        const VBLANK_TSTATES_PERIOD_END = us_to_tstates(63.55) - 1;

        /* When vblank_interval is not NULL, the interrupt is already enabled */
        if (enabled && vblank_interval == null) {
            /* TODO: Put this part in the video part */
            vblank_interval = zeal.registerTstateInterval(() => {
                /* Clear VBLANK bit in the PIO state */
                pio_set_pin(port_b, IO_VBLANK_PIN, 0);
            }, VBLANK_TSTATES_PERIOD);
            /* Register the same interval but for disabling the signal (after 63us) */
            vblank_interval_end = zeal.registerTstateInterval(() => {
                pio_set_pin(port_b, IO_VBLANK_PIN, 1);
            }, VBLANK_TSTATES_PERIOD_END);
        } else if (!enabled && vblank_interval != null) {
            /* Disable the intervals */
            zeal.removeTstateCallback(vblank_interval);
            zeal.removeTstateCallback(vblank_interval_end);
            vblank_interval = null;
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

    /* Public functions */
    function is_valid_address(read, address) {
        return false;
    }

    function is_valid_port(read, port) {
        port &= 0xff;
        return (port >= IO_PIO_DATA_A && port <= IO_PIO_CTRL_B);
    }

    function mem_read(address) {
        return false;
    }

    function mem_write(address, value) {
        return false;
    }

    function io_read(port) {
        port &= 0xff;
        
        /* Control or data port? (0 and 1 = data, 2 and 3 = ctrl) */
        const ctrl = (port & 2) != 0;
        const data = !ctrl;
        
        if (ctrl) {
            /* TODO: Check on real hardware */
            return 0x43;
        } else if (port == IO_PIO_DATA_B) {
            return port_b.state;
        } else {
            return port_a.state;
        }
    }

    function io_write(port, value) {
        port &= 0xff;
        /* Select the hardware port according to the address */
        console.assert(port >= IO_PIO_DATA_A && port <= IO_PIO_CTRL_B);
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
            /* ONLY FOR PORT B: TARGET RELATED */
            if (hw_port == port_b) {
                /* Enable or disable the V_BLANK interrupts */
                const enable_vblank = BIT(value, IO_VBLANK_PIN) == 0;
                set_vblank_enabled(enable_vblank);
            }
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
            if (hw_port.mode == MODE_BIDIR || hw_port.mode == MODE_OUTPUT) {
                hw_port.state = value & 0xff;
            } else {
                /* Only modify the state of output pins, input are not modified.
                * Input pins are set to 1, so invert the direction register. */
                const new_out_val = value & (~hw_port.dir & 0xff);
                /* Clear the output pins value from the state and OR it with the new value */
                hw_port.state = (hw_port.state & hw_port.dir) | new_out_val;
            }
            
            /* TARGET DEPENDENT */
            /* Send a write command to the UART and I2C in case the pins are configured as OUTPUT */
            if (hw_port == port_b) {
                /* The number of T-states will be useful to determine the elapsed time between two writes */
                const t_states = zeal.getTstates();
                if (hw_port.mode != MODE_BITCTRL || BIT(hw_port.dir, IO_UART_TX_PIN) == DIR_OUTPUT) {
                    uart.write(BIT(hw_port.state, IO_UART_TX_PIN), t_states);
                }
                /* TODO: Any module should be able to register itself on a pin, making the PIO implementation independent from
                 * the modules outside */
                if (hw_port.mode != MODE_BITCTRL ||
                    BIT(hw_port.dir, IO_I2C_SCL_OUT_PIN) == DIR_OUTPUT ||
                    BIT(hw_port.dir, IO_I2C_SDA_OUT_PIN) == DIR_OUTPUT)
                {
                    i2c.write(BIT(hw_port.state, IO_I2C_SCL_OUT_PIN), BIT(hw_port.state, IO_I2C_SDA_OUT_PIN), t_states);
                }
            }
        }
    }

    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
    this.pio_set_b_pin = (pin, value) => {
        return pio_set_pin(port_b, pin, value);
    }
}


function I2C(Zeal, PIO) {
    const zeal = Zeal;
    const pio = PIO;

    function write() {
        
    }

    this.write = write;
}