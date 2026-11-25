/**
 * SPDX-FileCopyrightText: 2022-2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

async function disassembleAndShow() {
    const session = emulator?.debugger;
    const state = session?.state;
    const panel = document.getElementById('memdump');
    if (!state?.paused || !emulator.runtimeReady) {
        panel.replaceChildren();
        return;
    }

    const { pc } = state.registers;
    try {
        const rows = await session.disassemble(pc);
        if (session !== emulator?.debugger || state !== session.state) return;
        const content = document.createDocumentFragment();
        for (const row of rows) {
            if (row.label) {
                const label = document.createElement('div');
                label.className = 'labelline';
                label.textContent = row.label;
                content.append(label);
            }
            const line = document.createElement('div');
            line.dataset.addr = row.address;
            line.className = 'dumpline';
            line.classList.toggle('activeline', row.address === pc);
            line.classList.toggle('brk', userBreakpoints.get(row.address) === true);
            const bytes = Array.from(row.bytes, byte => hex8(byte, true)).join(' ');
            line.textContent = `${hex(row.address)}  ${bytes.padEnd(11)}  ${row.instruction || 'DB ' + bytes}`;
            content.append(line);
        }
        panel.replaceChildren(content);
    } catch (error) {
        if (session === emulator?.debugger && state === session.state) console.error(error);
    }
}
