/**
 * SPDX-FileCopyrightText: 2023 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const params = Object.fromEntries(new URLSearchParams(location.search));
const popout = new Popup();
const screenCanvas = document.getElementById('zeal-screen');

let emulator = null;
let sessionChanging = false;
let activeSymbols = null;

function setSessionChanging(changing) {
    sessionChanging = changing;
    $('#romchoice, #read-button').prop('disabled', changing);
    updateHostFSButton();
}

async function prepareDebugger(current, resume) {
    if (activeSymbols) await current.debugger.loadSymbols(activeSymbols);
    await restoreBreakpoints(current.debugger);
    if (vblankControl.checked) await current.debugger.setBreakOnVBlank(true);
    if (resume) await current.debugger.continue();
    else renderDebugState(current.debugger.state);
}

async function unloadEmulator() {
    const current = emulator;
    if (!current) return;
    debugControls.inert = true;
    try {
        await current.exit();
        emulator = null;
        activeSymbols = null;
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
        hostfs: createHostFS(),
    });

    next.debugger.addEventListener('statechange', ({detail}) => {
        if (emulator === next) renderDebugState(detail);
    });

    await unloadEmulator();
    emulator = next;
    activeSymbols = symbols;
    try {
        await next.start();
        await prepareDebugger(next, true);
    } catch (error) {
        await next.exit().catch(console.error);
        emulator = null;
        activeSymbols = null;
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
