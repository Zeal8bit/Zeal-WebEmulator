/**
 * SPDX-FileCopyrightText: 2022-2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const userBreakpoints = new Map();
const unavailableBreakpoints = new Set();
const userWatchpoints = new Map();
const unavailableWatchpoints = new Set();
const watchpointLabels = {read: 'Read', write: 'Write', access: 'R/W'};
let breakpointEdits = Promise.resolve();

try {
    for (const point of JSON.parse(localStorage.getItem('breakpoints') ?? '[]')) {
        if (!point?.autodelete && Number.isInteger(point?.address) &&
            point.address >= 0 && point.address <= 0xffff) {
            const enabled = point.enabled !== false && point.enabled !== 0;
            if (Object.hasOwn(watchpointLabels, point.type)) {
                userWatchpoints.set(point.address, {type: point.type, enabled});
            } else if (!point.type || point.type === 'exec') {
                userBreakpoints.set(point.address, enabled);
            }
        }
    }
} catch (error) {
    console.warn('Could not restore saved breakpoints', error);
}

function* debuggerStops() {
    for (const [address, enabled] of userBreakpoints) yield {address, type: 'exec', enabled};
    for (const [address, point] of userWatchpoints) yield {address, ...point};
}

function renderBreakpoints() {
    const list = document.getElementById('bps');
    document.getElementById('breakpoint-count').textContent = userBreakpoints.size + userWatchpoints.size;
    list.replaceChildren();
    for (const {address, type, enabled} of debuggerStops()) {
        const row = document.createElement('li');
        row.dataset.addr = address;
        row.dataset.type = type;
        const unavailable = (type === 'exec' ? unavailableBreakpoints : unavailableWatchpoints).has(address);
        row.classList.toggle('disabled', !enabled || unavailable);
        if (unavailable) row.title = 'This breakpoint could not be restored in the current session';
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'breakpoint-toggle inspect-address';
        const label = watchpointLabels[type];
        toggle.textContent = label ? `${label} ${hex(address)}` : hex(address);
        toggle.setAttribute('aria-label', `${label ?? 'Execution'} breakpoint at ${hex(address)}`);
        toggle.setAttribute('aria-pressed', String(enabled && !unavailable));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'dock-remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove ${label ?? 'execution'} breakpoint at ${hex(address)}`);
        row.append(toggle, remove);
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

function breakpointSession() {
    return emulator?.runtimeReady && emulator.debugger.state ? emulator.debugger : null;
}

function syncBreakpointControls() {
    document.getElementById('breakpoint-hint').hidden = Boolean(breakpointSession());
    document.getElementById('addbp').disabled = sessionChanging;
    document.getElementById('bps').inert = sessionChanging;
}

function editBreakpoint(edit) {
    if (sessionChanging) return;
    const session = breakpointSession();
    breakpointEdits = breakpointEdits.then(async () => {
        if (sessionChanging || session !== breakpointSession()) return;
        await edit(session);
        renderBreakpoints();
        localStorage.setItem('breakpoints', JSON.stringify([...debuggerStops()]));
    }).catch(error => {
        console.error(error);
        popout.error('Could not change the breakpoint.');
    });
}

async function restoreBreakpoints(session) {
    unavailableBreakpoints.clear();
    unavailableWatchpoints.clear();
    for (const {address, enabled, type} of debuggerStops()) {
        try {
            if (type === 'exec') await session.setBreakpoint(address, enabled);
            else await session.setWatchpoint(address, type, enabled);
        } catch (error) {
            if (session !== emulator?.debugger || !emulator.runtimeReady) throw error;
            (type === 'exec' ? unavailableBreakpoints : unavailableWatchpoints).add(address);
            console.warn('Could not restore breakpoint', address, error);
        }
    }
    renderBreakpoints();
    if (unavailableBreakpoints.size || unavailableWatchpoints.size) {
        popout.warn('Some saved breakpoints could not be restored.');
    }
}

function addBreakpointFromInput() {
    const input = document.getElementById('bpaddr');
    const text = input.value.trim();
    const type = document.getElementById('bp-type').value;
    if (!text) return;
    editBreakpoint(async session => {
        const address = await resolveDebugAddress(session, text);
        if (address === null) {
            popout.warn(session ? 'Enter a 16-bit address or a loaded symbol.' :
                'Enter a 16-bit hex address. Symbols require a loaded ROM and map.');
            return;
        }
        if (type === 'exec') {
            await session?.setBreakpoint(address);
            unavailableBreakpoints.delete(address);
            userBreakpoints.set(address, true);
        } else {
            await session?.setWatchpoint(address, type);
            unavailableWatchpoints.delete(address);
            userWatchpoints.set(address, {type, enabled: true});
        }
        input.value = '';
    });
}

$('#bpaddr').on('keydown', event => {
    if (event.key === 'Enter') addBreakpointFromInput();
});
$('#addbp').on('click', addBreakpointFromInput);

$('#bps').on('click', 'li', function(event) {
    const address = Number(this.dataset.addr);
    const {type} = this.dataset;
    const remove = Boolean(event.target.closest('.dock-remove'));
    editBreakpoint(async session => {
        if (type !== 'exec') {
            const point = userWatchpoints.get(address);
            if (!point) return;
            if (remove) {
                await session?.removeWatchpoint(address);
                userWatchpoints.delete(address);
            } else {
                const enabled = !point.enabled || unavailableWatchpoints.has(address);
                await session?.setWatchpoint(address, point.type, enabled);
                point.enabled = enabled;
            }
            unavailableWatchpoints.delete(address);
        } else if (remove) {
            await session?.removeBreakpoint(address);
            userBreakpoints.delete(address);
            unavailableBreakpoints.delete(address);
        } else if (userBreakpoints.has(address)) {
            const enabled = !isBreakpointEnabled(address);
            await session?.setBreakpoint(address, enabled);
            unavailableBreakpoints.delete(address);
            userBreakpoints.set(address, enabled);
        }
    });
});

$('#memdump').on('click', '.dumpline', function() {
    const address = Number(this.dataset.addr);
    editBreakpoint(async session => {
        if (!session) return;
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
syncBreakpointControls();
