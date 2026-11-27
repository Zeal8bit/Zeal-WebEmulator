/**
 * SPDX-FileCopyrightText: 2022-2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const disassemblyPanel = document.getElementById('memdump');
const disassemblyInput = document.getElementById('disassembly-address');
const followPC = document.getElementById('disassembly-follow');
const pcButton = document.getElementById('disassembly-pc');
const moreInstructions = document.getElementById('disassembly-more');
const instructionBatch = 48;
const instructionLimit = 192;
let disassemblyStart;
let disassemblyNext;
let instructionCount = 0;
let disassemblyRequest = 0;

async function disassembleAndShow({more = false, pc = false} = {}) {
    const session = emulator?.debugger;
    const state = session?.state;
    const sequence = ++disassemblyRequest;
    const paused = state?.paused && emulator.runtimeReady;
    moreInstructions.disabled = true;
    disassemblyInput.disabled = !paused;
    pcButton.disabled = !paused;
    if (!paused) {
        disassemblyPanel.replaceChildren();
        moreInstructions.textContent = 'Load more';
        if (!state) {
            disassemblyStart = undefined;
            disassemblyInput.value = '';
        }
        return;
    }

    const {pc: currentPC} = state.registers;
    if (!more) {
        if (pc || followPC.checked || disassemblyStart === undefined) disassemblyStart = currentPC;
        instructionCount = 0;
        disassemblyNext = disassemblyStart;
        disassemblyInput.value = hex(disassemblyStart, true);
        moreInstructions.textContent = 'Load more';
    }
    const start = disassemblyNext;
    try {
        const rows = await session.disassemble(start, instructionBatch);
        if (sequence !== disassemblyRequest || session !== emulator?.debugger || state !== session.state) return;
        const content = document.createDocumentFragment();
        for (const row of rows) {
            if (row.label) {
                const label = document.createElement('div');
                label.className = 'labelline';
                label.textContent = row.label + ':';
                content.append(label);
            }
            const line = document.createElement('div');
            line.dataset.addr = row.address;
            line.className = 'dumpline';
            line.classList.toggle('activeline', row.address === currentPC);
            line.classList.toggle('brk', isBreakpointEnabled(row.address));
            const bytes = Array.from(row.bytes, byte => hex8(byte, true)).join(' ');
            const address = document.createElement('span');
            address.className = 'instruction-address';
            address.textContent = hex(row.address, true);
            const encoding = document.createElement('span');
            encoding.className = 'instruction-bytes';
            encoding.textContent = bytes;
            const instruction = document.createElement('span');
            instruction.textContent = row.instruction?.trim().replace(/\s+/, ' ') || 'db ' + bytes;
            line.append(address, encoding, instruction);
            content.append(line);
        }
        if (more) disassemblyPanel.append(content);
        else {
            disassemblyPanel.replaceChildren(content);
            disassemblyPanel.scrollTop = 0;
        }
        const last = rows.at(-1);
        instructionCount += rows.length;
        if (last) disassemblyNext = (last.address + Math.max(1, last.bytes.length)) & 0xffff;
        moreInstructions.disabled = !last || instructionCount >= instructionLimit;
        moreInstructions.textContent = instructionCount >= instructionLimit ? `${instructionLimit} instructions shown` : 'Load more';
    } catch (error) {
        if (sequence === disassemblyRequest && session === emulator?.debugger && state === session.state) {
            console.error(error);
            moreInstructions.disabled = instructionCount === 0 || instructionCount >= instructionLimit;
        }
    }
}

$('#disassembly-form').on('submit', async event => {
    event.preventDefault();
    const session = emulator?.debugger;
    const state = session?.state;
    if (!state?.paused) return;
    const query = disassemblyInput.value.trim();
    try {
        const address = await resolveDebugAddress(session, query);
        if (session !== emulator?.debugger || state !== session.state) return;
        if (address === null) {
            popout.warn('Enter a 16-bit address or a loaded symbol.');
            return;
        }
        followPC.checked = false;
        disassemblyStart = address;
        disassembleAndShow();
    } catch (error) {
        if (session === emulator?.debugger && state === session.state) console.error(error);
    }
});

pcButton.addEventListener('click', () => disassembleAndShow({pc: true}));
followPC.addEventListener('change', () => {
    if (followPC.checked) disassembleAndShow();
});
moreInstructions.addEventListener('click', () => disassembleAndShow({more: true}));
disassembleAndShow();
