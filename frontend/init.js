/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Init window
const left_panel_height = $("#debug").height();
$("#rightpanel").css('min-height', left_panel_height);

const KB = 1024;
/* 10MHz frequency */
const CPUFREQ = 10000000;
const TSTATES_US = 1/CPUFREQ * 1000000;

function us_to_tstates(us) {
    return Math.floor(us / TSTATES_US);
}

var terminal = new Terminal();
terminal.open(document.getElementById('terminal'));

// Init shortcut key
document.addEventListener('keydown', function(event) {
    const binding = {'F9': zealcom.cont, 'F10': zealcom.step, 'F11': zealcom.step_over};
    if (binding[event.key]) {
        binding[event.key]();
    }
});

// Init Emulated hardware
// const mmu = new MMU();
// const rom = new ROM(this);
// const ram = new RAM();
// const pio = new PIO(this);
// /* Peripherals */
// const vchip = new VideoChip(this, pio, scale);
// const uart = new UART(this, pio);
// const i2c = new I2C(this, pio);
// const keyboard = new Keyboard(this, pio);
// const ds1307 = new I2C_DS1307(this, i2c);
// /* We could pass an initial content to the EEPROM, but set it to null for the moment */
// const eeprom = new I2C_EEPROM(this, i2c, null);
var zealcom = new Zeal8bitComputer();
const disassembler = new Disassembler();
const assembler = new Assembler();
const popout = new PopOut();

/* Memdump related */
const byte_per_line = 0x20;

// const devices = [ rom, ram, vchip, pio, keyboard, mmu ];

// const zpu = new Z80({ mem_read, mem_write, io_read, io_write });