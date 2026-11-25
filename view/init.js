/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const params = Object.fromEntries(new URLSearchParams(location.search));
const popout = new Popup();
const screenCanvas = document.getElementById('zeal-screen');

let emulator = null;

async function bootEmulator(romdisk, eeprom) {
    const next = new ZealNative({
        canvas: screenCanvas,
        romdisk,
        eeprom,
        imageStorage: 'memory',
    });

    if (emulator) await emulator.exit();
    emulator = next;
    try {
        await next.start();
    } catch (error) {
        await next.exit().catch(console.error);
        emulator = null;
        throw error;
    }
}

screenCanvas.addEventListener('pointerdown', () => {
    emulator?.resumeAudio().catch(console.error);
});

document.addEventListener('keydown', event => {
    const binding = { F4: '#theater-mode', F5: '#fullscreen-mode' }[event.key];
    if (binding) {
        event.preventDefault();
        $(binding).click();
    }
});
