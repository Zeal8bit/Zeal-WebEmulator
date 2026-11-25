/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const params = Object.fromEntries(new URLSearchParams(location.search));
const popout = new Popup();
const screenCanvas = document.getElementById('zeal-screen');

let emulator = null;

async function unloadEmulator() {
    const current = emulator;
    if (!current) return;
    debugControls.inert = true;
    try {
        await current.exit();
        emulator = null;
        renderDebugState(null);
    } catch (error) {
        renderDebugState(current.debugger.state);
        throw error;
    }
}

async function bootEmulator(romdisk, eeprom) {
    const next = new ZealNative({
        canvas: screenCanvas,
        romdisk,
        eeprom,
        imageStorage: 'memory',
        debugger: true,
    });

    next.debugger.addEventListener('statechange', ({detail}) => {
        if (emulator === next) renderDebugState(detail);
    });

    await unloadEmulator();
    emulator = next;
    try {
        await next.start();
        await next.debugger.continue();
    } catch (error) {
        await next.exit().catch(console.error);
        emulator = null;
        renderDebugState(null);
        throw error;
    }
}

screenCanvas.addEventListener('pointerdown', () => {
    emulator?.resumeAudio().catch(console.error);
});

document.addEventListener('keydown', event => {
    const binding = {
        F4: '#theater-mode',
        F5: '#fullscreen-mode',
        F9: '.cpuexec:visible',
        F10: '#step',
    }[event.key];
    if (binding) {
        event.preventDefault();
        $(binding).not('[aria-disabled=true]').click();
    }
});
