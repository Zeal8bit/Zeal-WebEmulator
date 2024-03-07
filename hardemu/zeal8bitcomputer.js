/**
 * SPDX-FileCopyrightText: 2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

class Zeal8bitComputer extends Z80Machine {

    constructor() {
        super();

        /* Check which scale to use for the video */
        var scale = 1;

        const mmu = new MMU();
        const rom = new ROM(this);
        const ram = new RAM(512*KB);
        const pio = new PIO(this);
        const vchip = new VideoChip(this, pio, scale);
        const uart = new UART(this, pio);
        const i2c = new I2C(this, pio);
        const keyboard = new Keyboard(this, pio);
        const ds1307 = new I2C_DS1307(this, i2c);
        /* We could pass an initial content to the EEPROM, but set it to null for the moment */
        const eeprom = new I2C_EEPROM(this, i2c, null);

        /* Create the memory space for Zeal 8-bit Computer */
        const options = {
            physical_size: 4*KB*KB, // 22-bit addresses <=> 4MB address space
            alignment: 128*KB, // Devices are at least aligned on 128KB
            translator: mmu.get_ext_addr
        };
        this.machine_initialize_memory(options);

        /* On Zeal 8-bit Computer, the ROM is mirrored on 0x04_0000 when its size is 256KB */
        this.machine_add_mem_device(0x00_0000, rom.mem_region);
        if (rom.mem_region.size < 512*KB) {
            this.machine_add_mem_device(0x04_0000, rom.mem_region);
        }
        this.machine_add_mem_device(0x08_0000, ram.mem_region);
        this.machine_add_mem_device(0x10_0000, vchip.mem_region);

        /* Similarly for the I/O bus */
        this.machine_add_io_device(0x80, vchip.io_region);
        this.machine_add_io_device(0xd0, pio.io_region);
        this.machine_add_io_device(0xe0, keyboard.io_region);
        this.machine_add_io_device(0xf0, mmu.io_region);

        /* Make the devices public */
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
    }

    /**
     * @brief Graphics update function, called 60 tines a second
     */
    gfx_update() {
        this.vchip.renderScreen();
    }


    reset() {
        this.vchip.clear();
        super.reset();
    }


    KeyboardKeyPressed(keycode) {
        return this.keyboard.key_pressed(keycode);
    }

    KeyboardKeyReleased(keycode) {
        return this.keyboard.key_released(keycode);
    }
}
