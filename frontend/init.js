/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Unknown init value
var elapsed = 0;

// Init window
/* Check which scale to use for the video */
var scale = 1;
if ($(window).height() > 920 && $(window).width() > 1280) {
    // scale = 2;
}

// Init shortcut key
document.addEventListener('keydown', function(event) {
    const binding = {'F9': cont, 'F10': step, 'F11': step_over};
    if (binding[event.key]) {
        binding[event.key]();
    }
});

// Init Emulated hardware
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
const eeprom = new I2C_EEPROM(this, i2c, null)

/* Memdump related */
const byte_per_line = 0x20;

const devices = [ rom, ram, vchip, pio, keyboard, mmu ];

const zpu = new Z80({ mem_read, mem_write, io_read, io_write });

// Init zos index
async function readindex() {
    // Zos-Index-Mirror
    try {
        let response = await fetch('https://jasonmo1.github.io/ZOS-Index-demo/index.json');
        var indexsrc = await response.json();
        initindex(indexsrc);
    } catch (error) {
        console.error(error.message);
    }
}

async function initindex(indexjson) {
    // load index in index.json into romchoise
    let index = indexjson;
    
    for (let jsonindex = 0; jsonindex < index.index.length; jsonindex++){
        let urls = index.index[jsonindex].urls;

        if (urls.length == 1) {
            fastestUrl = urls[0];
        }
        else if (urls.length > 1) {
            let promises = [];
            for (let i = 0; i < urls.length; i++) {
                let promise = testSpeed(urls[i]);
                promises.push(promise);
            }
    
            try {
                let fastest = await compareSpeeds(promises);
                var fastestUrl = fastest.url;
            } catch (error) {
                console.error(error.message);
            }
        }
        else {
            window.alert("The image doesn't have a corresponding link")
        }


        var option = "<option value=" + fastestUrl + " version=" + index.index[jsonindex].version + " upload=" + index.index[jsonindex].upload + " hash=" + index.index[jsonindex].hash + ">" + index.index[jsonindex].name + "</option>";
        $("#romchoice").append(option);
    }
}

readindex();