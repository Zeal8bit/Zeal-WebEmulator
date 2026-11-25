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

async function bootEmulator(romdisk, eeprom, symbols) {
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
        if (symbols) await next.debugger.loadSymbols(symbols);
        await restoreBreakpoints(next.debugger);
        if (vblankControl.checked) await next.debugger.setBreakOnVBlank(true);
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

const shortcuts = {
    F4: '#theater-mode',
    F5: '#fullscreen-mode',
    F9: '.cpuexec:visible',
    F10: '#step',
    F11: '#stepover',
};

function handleShortcut(event) {
    const binding = shortcuts[event.key];
    if (!binding) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'keydown' && !event.repeat) {
        $(binding).not('[aria-disabled=true]').click();
    }
}

document.addEventListener('keydown', handleShortcut, true);
document.addEventListener('keyup', handleShortcut, true);
