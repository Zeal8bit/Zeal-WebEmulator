/**
 * SPDX-FileCopyrightText: 2022-2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const bytesPerRow = 16;
const memoryPanel = document.getElementById('memview');
const dumpContent = document.getElementById('dumpcontent');
const dumpAddress = document.getElementById('dumpaddr');
const dumpSize = document.getElementById('dumpsize');
let memoryRequest = 0;

function displayAddress(address) {
    return hex(address, true, 4);
}

function displayByte(byte) {
    return hex8(byte, true).toLowerCase();
}

function displayCharacter(byte) {
    return byte === 32 ? '\u00a0' : isPrintable(byte) ? String.fromCharCode(byte) : '.';
}

function memoryElement(tag, className, text = '') {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

function renderMemory(address, bytes, mmu, editable) {
    const content = document.createDocumentFragment();
    const heading = memoryElement('section', 'memline heading');
    const offsets = memoryElement('div', 'membytes');
    for (let index = 0; index < bytesPerRow; index++) {
        offsets.append(memoryElement('div', '', displayByte(index)));
    }
    heading.append(memoryElement('div', 'memaddr', 'Physical Virt'), offsets, document.createElement('div'));
    content.append(heading);

    for (let offset = 0; offset < bytes.length; offset += bytesPerRow) {
        const logical = (address + offset) & 0xffff;
        const page = mmu[logical >>> 14];
        const physical = page.physical + logical - page.logical;
        const row = memoryElement('section', 'memline');
        const label = memoryElement('section', 'memaddr', `(${hex(physical, true, 6)}) ${displayAddress(logical)}`);
        label.title = page.device ?? 'Unmapped';
        const values = memoryElement('section', 'membytes');
        const chars = memoryElement('section', 'asciichars');

        for (let index = offset; index < Math.min(offset + bytesPerRow, bytes.length); index++) {
            const byteAddress = (address + index) & 0xffff;
            const value = memoryElement('div', '', displayByte(bytes[index]));
            const char = memoryElement('div', 'asciichar', displayCharacter(bytes[index]));
            value.dataset.addr = char.dataset.addr = byteAddress;
            value.dataset.byte = bytes[index];
            value.contentEditable = editable ? 'plaintext-only' : 'false';
            value.setAttribute('aria-label', `Memory at ${hex(byteAddress)}`);
            values.append(value);
            chars.append(char);
        }
        row.append(label, values, chars);
        content.append(row);
    }

    document.getElementById('current_memaddr').textContent = displayAddress(address);
    dumpContent.replaceChildren(content);
}

async function setRAMView(address, size, save = false) {
    const session = emulator?.debugger;
    if (!session?.state || !emulator.runtimeReady) return;
    const sequence = ++memoryRequest;
    try {
        const {bytes, mmu} = await session.inspectMemory(address, size);
        if (session !== emulator?.debugger || sequence !== memoryRequest) return;
        renderMemory(address, bytes, mmu, session.state.paused);
        if (save) localStorage.setItem('dump', JSON.stringify({address: displayAddress(address), size}));
    } catch (error) {
        if (session === emulator?.debugger && sequence === memoryRequest) {
            console.error(error);
            popout.error('Could not read emulator memory.');
        }
    }
}

function dumpSelectedMemory(save = false) {
    const rawAddress = dumpAddress.value.trim();
    const rawSize = dumpSize.value.trim();
    const address = /^(?:0x)?[a-f0-9]{1,4}$/i.test(rawAddress) ? Number.parseInt(rawAddress, 16) : NaN;
    const size = /^\d+$/.test(rawSize) ? Number(rawSize) : NaN;
    if (!Number.isInteger(address) || !Number.isInteger(size) || size < 1 || size > 0x10000) {
        if (save) popout.warn('Enter a 16-bit hex address and a size from 1 to 65536 bytes.');
        return;
    }
    setRAMView(address, size, save);
}

function syncMemoryState(state) {
    memoryPanel.inert = !state || !emulator?.runtimeReady;
    if (memoryPanel.inert) {
        memoryRequest++;
        dumpContent.replaceChildren();
    } else if (!state.paused) {
        dumpContent.querySelectorAll('[contenteditable]').forEach(cell => { cell.contentEditable = 'false'; });
    } else if (memoryPanel.classList.contains('active')) {
        dumpSelectedMemory();
    }
}

$('#dumpnow').on('click', () => dumpSelectedMemory(true));
$('#dumpaddr, #dumpsize').on('keydown', event => {
    if (event.key === 'Enter') dumpSelectedMemory(true);
});
$('#memview').on('active', () => dumpSelectedMemory());

$('.regaddr').on('click', function() {
    if (!this.textContent) return;
    dumpAddress.value = displayAddress(Number.parseInt(this.textContent, 16));
    dumpSize.value = '256';
    setActiveTab('memory-tab');
    localStorage.setItem('dump', JSON.stringify({address: dumpAddress.value, size: 256}));
});

$('#dumpcontent').on('mouseenter focusin', '[data-addr]', function() {
    const elements = this.closest('.memline').querySelectorAll(`[data-addr="${this.dataset.addr}"]`);
    elements.forEach(cell => cell.classList.add('activefield'));
    document.getElementById('current_memaddr').textContent = displayAddress(Number(this.dataset.addr));
});

$('#dumpcontent').on('mouseleave focusout', '[data-addr]', function() {
    this.closest('.memline').querySelectorAll('.activefield').forEach(cell => cell.classList.remove('activefield'));
});

$('#dumpcontent').on('keydown', '[contenteditable]', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        this.blur();
    }
});

$('#dumpcontent').on('focusout', '[contenteditable]', async function() {
    const session = emulator?.debugger;
    const previous = Number(this.dataset.byte);
    const text = this.textContent.trim();
    if (text.toLowerCase() === displayByte(previous)) return;
    if (!session?.state?.paused || !/^[0-9a-f]{1,2}$/i.test(text)) {
        this.textContent = displayByte(previous);
        if (session?.state?.paused) popout.warn('Enter a hex byte from 00 to FF.');
        return;
    }

    const address = Number(this.dataset.addr);
    const value = Number.parseInt(text, 16);
    try {
        const [actual] = await session.writeMemory(address, Uint8Array.of(value));
        if (!this.isConnected || session !== emulator?.debugger) return;
        disassembleAndShow();
        this.dataset.byte = actual;
        this.textContent = displayByte(actual);
        this.closest('.memline').querySelector(`.asciichar[data-addr="${address}"]`).textContent = displayCharacter(actual);
        if (actual !== value) popout.warn('The mapped device did not accept the write.');
    } catch (error) {
        if (!this.isConnected || session !== emulator?.debugger) return;
        this.textContent = displayByte(previous);
        console.error(error);
        popout.error('Could not write emulator memory.');
    }
});

try {
    const saved = JSON.parse(localStorage.getItem('dump') ?? 'null');
    dumpAddress.value = saved?.address ?? '0000';
    dumpSize.value = saved?.size ?? 256;
} catch {
    dumpAddress.value = '0000';
    dumpSize.value = '256';
}
