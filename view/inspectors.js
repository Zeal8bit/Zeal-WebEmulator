/**
 * SPDX-FileCopyrightText: 2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const stackWords = document.getElementById('stack-words');
const stackMessage = document.getElementById('stack-message');
const stackPointer = document.getElementById('stack-pointer');
const watchPanel = document.getElementById('watch-panel');
const watchForm = document.getElementById('watch-form');
const watchInput = document.getElementById('watch-expr');
const watchType = document.getElementById('watch-type');
const watchRows = document.getElementById('watch-rows');
const watchMessage = document.getElementById('watch-message');
const watchLimit = 32;
let watches = [];
let watchRender = 0;
let watchMemory;
let watchSymbols;
let stackAddress;
let stackBytes;

try {
    const saved = JSON.parse(localStorage.getItem('watches') ?? '[]');
    watches = saved.filter(watch => typeof watch?.expr === 'string' && watch.expr.trim() &&
        watch.expr.length <= watchInput.maxLength &&
        Array.from(watchType.options).some(option => option.value === watch.type)).slice(0, watchLimit);
} catch (error) {
    console.warn('Could not restore saved watches', error);
}

function littleWord(bytes, address) {
    return bytes[address] | bytes[(address + 1) & 0xffff] << 8;
}

function memoryAddressButton(address, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'inspect-address';
    button.textContent = hex(address, true);
    button.setAttribute('aria-label', `${label} ${hex(address)}, show in Memory`);
    button.addEventListener('click', () => openMemoryAt(address));
    return button;
}

function displayStack(sp, bytes) {
    stackPointer.textContent = sp === undefined ? '' : `SP $${hex(sp, true)}`;
    stackMessage.textContent = bytes?.length ? '' :
        sp === undefined ? 'Pause to inspect the stack.' : 'No complete word at SP.';
    if (sp === stackAddress && bytes && stackBytes?.length === bytes.length &&
        bytes.every((byte, index) => byte === stackBytes[index])) return;
    const content = document.createDocumentFragment();
    for (let offset = 0; bytes && offset < bytes.length; offset += 2) {
        const row = document.createElement('li');
        row.className = 'stack-row';
        const marker = document.createElement('span');
        marker.textContent = offset === 0 ? '›' : '';
        marker.setAttribute('aria-hidden', 'true');
        const distance = document.createElement('span');
        distance.textContent = '+' + hex8(offset, true);
        const value = document.createElement('span');
        value.textContent = hex(littleWord(bytes, offset), true);
        row.append(marker, distance, memoryAddressButton(sp + offset, 'Stack slot'), value);
        content.append(row);
    }
    stackWords.replaceChildren(content);
    if (sp !== stackAddress) stackWords.parentElement.scrollTop = 0;
    stackAddress = sp;
    stackBytes = bytes;
}

async function renderStack(session) {
    const state = session?.state;
    if (!state?.paused || !emulator.runtimeReady) {
        displayStack();
        return;
    }

    const {sp} = state.registers;
    const count = Math.min(64, (0x10000 - sp) & ~1);
    try {
        const bytes = count ? await session.readMemory(sp, count) : undefined;
        if (session === emulator?.debugger && state === session.state) displayStack(sp, bytes);
    } catch (error) {
        if (session !== emulator?.debugger || state !== session.state) return;
        displayStack(sp);
        stackMessage.textContent = 'Could not read stack memory.';
        console.error(error);
    }
}

function watchOffset(text) {
    if (/^#[0-9]+$/.test(text)) return Number(text.slice(1));
    if (/^(?:0x|\$)?[a-f0-9]+$/i.test(text)) return Number.parseInt(text.replace(/^\$/, ''), 16);
    return NaN;
}

function watchAddressLookup(session) {
    if (watchSymbols?.session !== session || watchSymbols.map !== activeSymbols) {
        watchSymbols = {session, map: activeSymbols, addresses: new Map()};
    }
    const {addresses} = watchSymbols;
    return expression => {
        if (!addresses.has(expression)) {
            const address = Promise.resolve(resolveDebugAddress(session, expression)).catch(error => {
                addresses.delete(expression);
                throw error;
            });
            addresses.set(expression, address);
        }
        return addresses.get(expression);
    };
}

async function watchAddress(lookup, expression, regs, bytes, depth = 0) {
    if (!expression || depth > 3) return null;
    if (expression.startsWith('(') && expression.endsWith(')')) {
        const inner = expression.slice(1, -1).trim();
        const register = /^(hl|de|bc|sp|ix|iy)\s*(?:([+-])\s*(.+))?$/i.exec(inner);
        if (register) {
            const [, name, sign, offset] = register;
            const delta = offset ? watchOffset(offset.trim()) : 0;
            return Number.isSafeInteger(delta) ? (regs[name.toLowerCase()] + (sign === '-' ? -delta : delta)) & 0xffff : null;
        }
        const pointer = await watchAddress(lookup, inner, regs, bytes, depth + 1);
        return pointer === null ? null : littleWord(bytes, pointer);
    }

    const address = await lookup(expression);
    if (address !== null) return address;
    const offset = /^(.+)\s*([+-])\s*([^+-]+)$/.exec(expression);
    if (!offset) return null;
    const delta = watchOffset(offset[3].trim());
    if (!Number.isSafeInteger(delta)) return null;
    const base = await watchAddress(lookup, offset[1].trim(), regs, bytes, depth + 1);
    return base === null ? null : (base + (offset[2] === '-' ? -delta : delta)) & 0xffff;
}

async function readWatch(watch, lookup, regs, bytes) {
    let address = await watchAddress(lookup, watch.expr, regs, bytes);
    if (address === null) return {text: '?'};
    const {type} = watch;
    if (type === 'ptr8' || type === 'ptr16') address = littleWord(bytes, address);
    if (type === 'string') {
        let text = '';
        for (let index = 0; index < 32; index++) {
            const byte = bytes[(address + index) & 0xffff];
            if (!byte) break;
            text += isPrintable(byte) ? String.fromCharCode(byte) : '.';
        }
        return {address, text: `"${text}"`};
    }

    const word = type.endsWith('16');
    const value = word ? littleWord(bytes, address) : bytes[address];
    const signed = type.startsWith('s') ? word ? (value << 16) >> 16 : (value << 24) >> 24 : value;
    const text = type === 'bits' ? value.toString(2).padStart(8, '0') : hex(value, true, word ? 4 : 2);
    return {address, text, title: String(signed)};
}

function drawWatches() {
    const content = document.createDocumentFragment();
    for (const [index, watch] of watches.entries()) {
        const row = document.createElement('li');
        row.className = 'watch-row';
        const expression = document.createElement('span');
        expression.textContent = watch.expr;
        expression.title = `${watch.expr} (${watch.type})`;
        const address = document.createElement('button');
        address.type = 'button';
        address.className = 'inspect-address';
        address.style.visibility = 'hidden';
        address.addEventListener('click', () => openMemoryAt(Number(address.dataset.address)));
        const output = document.createElement('span');
        output.textContent = '—';
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'dock-remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove watch ${watch.expr}`);
        remove.addEventListener('click', () => {
            watches.splice(index, 1);
            saveWatches();
            watchInput.focus();
        });
        row.append(expression, address, output, remove);
        content.append(row);
    }
    watchRows.replaceChildren(content);
    document.getElementById('watch-count').textContent = watches.length;
}

function updateWatchValues(values) {
    for (const [index, value] of values.entries()) {
        const [, address, output] = watchRows.children[index].children;
        address.style.visibility = value.address === undefined ? 'hidden' : '';
        if (value.address !== undefined) {
            address.dataset.address = value.address;
            address.textContent = hex(value.address, true);
            address.setAttribute('aria-label', `Watch address ${hex(value.address)}, show in Memory`);
        }
        output.textContent = value.text;
        output.title = value.title ?? value.text;
    }
}

function wantsWatchSample() {
    return watches.length > 0 && !watchPanel.hidden;
}

async function renderWatches(session = emulator?.debugger, sample = null, isCurrent = () => true) {
    const sequence = ++watchRender;
    const state = session?.state;
    const paused = state?.paused && emulator.runtimeReady;
    if (!sample) {
        watchMessage.textContent = !watches.length ? 'Add a watch using an address, symbol, or (HL).' :
            paused ? '' : state?.reason !== 'running' ? 'Load a ROM to read watch values.' :
                samplingControl.checked ? 'Waiting for the next sample…' : 'Sampling is off. Pause to read watch values.';
        drawWatches();
        if (!paused || !wantsWatchSample()) return;
    }
    const current = () => sequence === watchRender && isCurrent() && !watchPanel.hidden &&
        session === emulator?.debugger && state === session.state;

    try {
        if (!sample && (watchMemory?.state !== state || watchMemory.session !== session)) {
            watchMemory = {session, state, bytes: session.readMemory(0, 0x10000)};
        }
        const bytes = sample?.memory.bytes ?? await watchMemory.bytes;
        if (!current()) return;
        const regs = cpuRegisters((sample ?? state).registers);
        const lookup = watchAddressLookup(session);
        const values = await Promise.all(watches.map(watch => readWatch(watch, lookup, regs, bytes)));
        if (current()) {
            watchMessage.textContent = '';
            updateWatchValues(values);
        }
    } catch (error) {
        if (!current()) return;
        watchMemory = null;
        watchMessage.textContent = 'Could not read watch values.';
        console.error(error);
    }
}

function refreshMemoryInspectors() {
    watchMemory = null;
    renderStack(emulator?.debugger);
    renderWatches();
}

function saveWatches() {
    localStorage.setItem('watches', JSON.stringify(watches));
    watchSymbols = null;
    renderWatches();
}

watchForm.addEventListener('submit', event => {
    event.preventDefault();
    const expr = watchInput.value.trim();
    if (!expr) return;
    if (watches.length >= watchLimit) {
        popout.warn(`The watch list is limited to ${watchLimit} entries.`);
        return;
    }
    watches.push({expr, type: watchType.value});
    watchInput.value = '';
    saveWatches();
});

$('.watch-break-dock .dock-switch > button').on('click', function() {
    for (const tab of this.parentElement.querySelectorAll('button')) {
        const selected = tab === this;
        tab.setAttribute('aria-pressed', String(selected));
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    }
    renderWatches();
});

renderWatches();

displayStack();
