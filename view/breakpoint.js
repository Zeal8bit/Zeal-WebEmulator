/**
 * SPDX-FileCopyrightText: 2022-2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const userBreakpoints = new Map();
let breakpointEdits = Promise.resolve();

try {
    for (const point of JSON.parse(localStorage.getItem('breakpoints') ?? '[]')) {
        if (!point?.autodelete && Number.isInteger(point?.address) &&
            point.address >= 0 && point.address <= 0xffff) {
            userBreakpoints.set(point.address, Boolean(point.enabled));
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
        row.classList.toggle('disabled', !enabled);
        row.append(hex(address));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove breakpoint at ${hex(address)}`);
        row.append(remove);
        list.append(row);
    }
    $('#memdump .dumpline').each((_, row) => {
        row.classList.toggle('brk', userBreakpoints.get(Number(row.dataset.addr)) === true);
    });
}

function editBreakpoint(edit) {
    const session = emulator?.debugger;
    if (!session?.state || loadingImages) return;
    breakpointEdits = breakpointEdits.then(async () => {
        if (session !== emulator?.debugger || loadingImages) return;
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
    for (const [address, enabled] of userBreakpoints) {
        await session.setBreakpoint(address, enabled);
    }
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
        } else if (userBreakpoints.has(address)) {
            const enabled = !userBreakpoints.get(address);
            await session.setBreakpoint(address, enabled);
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
        } else {
            await session.setBreakpoint(address);
            userBreakpoints.set(address, true);
        }
    });
});

renderBreakpoints();
