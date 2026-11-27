/**
 * SPDX-FileCopyrightText: 2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const debugControls = document.getElementById('menu-controls');
const debuggerStatus = document.getElementById('debugger-status');
const samplingControl = document.getElementById('debugger-sampling');
let sampleTimer;
let samplePending = false;

samplingControl.checked = localStorage.getItem('debugger-sampling') !== 'false';

function canSampleDebugger() {
    return samplingControl.checked && !document.hidden && !sessionChanging &&
        !document.getElementById('toppanel').classList.contains('theater-mode') &&
        emulator?.runtimeReady && emulator.debugger.state?.reason === 'running';
}

function scheduleDebuggerSample() {
    clearTimeout(sampleTimer);
    if (!samplePending && canSampleDebugger()) sampleTimer = setTimeout(sampleDebugger, 1000);
}

async function sampleDebugger() {
    if (!canSampleDebugger()) return;
    const {debugger: session, module} = emulator;
    const {state} = session;
    const memory = memoryPanel.classList.contains('active') ? memorySelection() : null;
    const sampleWatches = wantsWatchSample();
    const memorySequence = memoryRequest;
    const isCurrent = () => canSampleDebugger() && session === emulator.debugger &&
        module === emulator.module && state === session.state;
    samplePending = true;
    try {
        const sample = await session.sample(sampleWatches ? 0 : memory?.address,
            sampleWatches ? 0x10000 : memory?.size);
        if (!isCurrent()) return;
        renderCPU(sample, true);
        displayStack(sample.registers.sp, sample.stack);
        const currentMemory = memoryPanel.classList.contains('active') ? memorySelection() : null;
        if (memory && currentMemory && sample.memory && memorySequence === memoryRequest &&
            memory.address === currentMemory.address && memory.size === currentMemory.size) {
            const {bytes, mmu} = sample.memory;
            const page = sampleWatches ? memoryPageFromSample(bytes, memory.address, memory.size) : bytes;
            renderMemory(memory.address, page, mmu, false);
        }
        if (sampleWatches && sample.memory && wantsWatchSample()) await renderWatches(session, sample, isCurrent);
    } catch (error) {
        if (isCurrent()) console.error('Could not sample the debugger', error);
    } finally {
        samplePending = false;
        scheduleDebuggerSample();
    }
}

samplingControl.addEventListener('change', () => {
    localStorage.setItem('debugger-sampling', String(samplingControl.checked));
    if (!samplingControl.checked && emulator?.debugger.state?.reason === 'running') {
        renderCPU(emulator.debugger.state);
        renderStack(emulator.debugger);
    }
    renderWatches();
    scheduleDebuggerSample();
});

document.addEventListener('visibilitychange', scheduleDebuggerSample);
$('#toppanel').on('layoutchange', scheduleDebuggerSample);

function renderDebuggerStatus(state) {
    debuggerStatus.dataset.state = state ? (state.paused ? 'stopped' : 'running') : 'idle';
    let text = state ? 'RUNNING' : 'NO ROM';
    let title = '';
    if (state?.paused) {
        const pc = `$${hex(state.registers.pc, true)}`;
        const hit = state.watchpoint;
        if (hit) {
            text = `${hit.type.toUpperCase()} $${hex(hit.address, true)} = $${hex8(hit.value, true)}`;
            title = `${text} at PC $${hex(hit.pc, true)}`;
        } else if (state.reason === 'breakpoint') {
            text = `BREAK $${hex(state.breakpointAddress ?? state.registers.pc, true)}`;
        } else {
            text = `PAUSED ${pc}`;
            if (state.reason === 'vblank') title = `Paused on VBlank at ${pc}`;
        }
    }
    if (debuggerStatus.textContent !== text) debuggerStatus.textContent = text;
    debuggerStatus.title = title || text;
}

function renderDebugState(state) {
    debugControls.inert = !emulator?.runtimeReady;
    $('#continue').prop('hidden', !state?.paused);
    $('#pause').prop('hidden', !state || state.paused);
    $('#step, #stepover').attr('aria-disabled', String(!state?.paused));
    syncBreakpointControls();
    $('#screen-capture, #clean').prop('disabled', debugControls.inert);
    renderDebuggerStatus(state);
    renderCPU(state);
    refreshMemoryInspectors();
    disassembleAndShow();
    syncMemoryState(state);
    syncVideoState(state);
    scheduleDebuggerSample();
}

function runDebugCommand(command) {
    const session = emulator?.debugger;
    if (!session?.state || debugControls.inert) return;
    if ((command === 'step' || command === 'stepOver') && !session.state.paused) return;
    session[command]().catch(error => {
        console.error(error);
        popout.error('The debugger command failed.');
    });
}

for (const command of ['continue', 'pause', 'step', 'reset']) {
    $(`#${command}`).on('click', () => runDebugCommand(command));
}

$('#stepover').on('click', () => runDebugCommand('stepOver'));

$('#clean').on('click', async () => {
    if (!emulator || sessionChanging) return;
    setSessionChanging(true);
    try {
        await unloadEmulator();
        resetImageSelection();
    } catch (error) {
        console.error(error);
        popout.error('Could not close the emulator session.');
    } finally {
        setSessionChanging(false);
    }
});
