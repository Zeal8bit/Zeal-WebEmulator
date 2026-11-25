/**
 * SPDX-FileCopyrightText: 2022-2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const userBreakpoints = new Map();
const unavailableBreakpoints = new Set();
let breakpointEdits = Promise.resolve();

try {
    for (const point of JSON.parse(localStorage.getItem('breakpoints') ?? '[]')) {
        if (!point?.autodelete && Number.isInteger(point?.address) &&
            point.address >= 0 && point.address <= 0xffff) {
            userBreakpoints.set(point.address, point.enabled !== false && point.enabled !== 0);
        }
    }
} catch (error) {
    console.warn('Could not restore saved breakpoints', error);
}

function renderBreakpoints() {
    const list = document.getElementById('bps');
    list.replaceChildren();
    for (const [address, enabled] of userBreakpoints) {
        const row = document.createElement('li');
        row.dataset.addr = address;
        const unavailable = unavailableBreakpoints.has(address);
        row.classList.toggle('disabled', !enabled || unavailable);
        if (unavailable) row.title = 'This breakpoint could not be restored in the current session';
        row.append(hex(address));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove breakpoint at ${hex(address)}`);
        row.append(remove);
        list.append(row);
    }
    $('#memdump .dumpline').each((_, row) => {
        const address = Number(row.dataset.addr);
        row.classList.toggle('brk', isBreakpointEnabled(address));
    });
}

function isBreakpointEnabled(address) {
    return userBreakpoints.get(address) === true && !unavailableBreakpoints.has(address);
}

function editBreakpoint(edit) {
    const session = emulator?.debugger;
    if (!session?.state || sessionChanging) return;
    breakpointEdits = breakpointEdits.then(async () => {
        if (session !== emulator?.debugger || sessionChanging) return;
        await edit(session);
        renderBreakpoints();
        localStorage.setItem('breakpoints', JSON.stringify(Array.from(userBreakpoints,
            ([address, enabled]) => ({address, enabled}))));
    }).catch(error => {
        console.error(error);
        popout.error('Could not change the breakpoint.');
    });
}

async function restoreBreakpoints(session) {
    unavailableBreakpoints.clear();
    for (const [address, enabled] of userBreakpoints) {
        try {
            await session.setBreakpoint(address, enabled);
        } catch (error) {
            if (session !== emulator?.debugger || !emulator.runtimeReady) throw error;
            unavailableBreakpoints.add(address);
            console.warn('Could not restore breakpoint', address, error);
        }
    }
    renderBreakpoints();
    if (unavailableBreakpoints.size) popout.warn('Some saved breakpoints could not be restored.');
}

function addBreakpointFromInput() {
    const input = document.getElementById('bpaddr');
    const text = input.value.trim();
    if (!text) return;
    editBreakpoint(async session => {
        const isHex = /^(?:0x)?[a-f0-9]+$/i.test(text);
        const address = isHex ? Number.parseInt(text, 16) : await session.findSymbol(text);
        if (address === null || address > 0xffff) {
            popout.warn('Enter a 16-bit address or a loaded symbol.');
            return;
        }
        await session.setBreakpoint(address);
        unavailableBreakpoints.delete(address);
        userBreakpoints.set(address, true);
        input.value = '';
    });
}

$('#bpaddr').on('keydown', event => {
    if (event.key === 'Enter') addBreakpointFromInput();
});
$('#addbp').on('click', addBreakpointFromInput);

$('#bps').on('click', 'li', function(event) {
    const address = Number(this.dataset.addr);
    const remove = Boolean(event.target.closest('button'));
    editBreakpoint(async session => {
        if (remove) {
            await session.removeBreakpoint(address);
            userBreakpoints.delete(address);
            unavailableBreakpoints.delete(address);
        } else if (userBreakpoints.has(address)) {
            const enabled = !isBreakpointEnabled(address);
            await session.setBreakpoint(address, enabled);
            unavailableBreakpoints.delete(address);
            userBreakpoints.set(address, enabled);
        }
    });
});

$('#memdump').on('click', '.dumpline', function() {
    const address = Number(this.dataset.addr);
    editBreakpoint(async session => {
        if (userBreakpoints.has(address)) {
            await session.removeBreakpoint(address);
            userBreakpoints.delete(address);
            unavailableBreakpoints.delete(address);
        } else {
            await session.setBreakpoint(address);
            userBreakpoints.set(address, true);
        }
    });
});

renderBreakpoints();
