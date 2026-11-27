/**
 * SPDX-FileCopyrightText: 2022-2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const registerCells = document.querySelectorAll('[data-register]');
const flagChips = document.querySelectorAll('#flags li');
let previousRegisters = null;

function cpuRegisters(regs) {
    return {
        ...regs,
        af: regs.a << 8 | regs.f,
        bc: regs.b << 8 | regs.c,
        de: regs.d << 8 | regs.e,
        hl: regs.h << 8 | regs.l,
    };
}

function renderCPU(state, sampled = false) {
    const regs = state && (state.paused || sampled) ? cpuRegisters(state.registers) : null;
    if (!state || state.reason === 'startup' || state.reason === 'reset') previousRegisters = null;
    const status = document.getElementById('cpu-state');
    status.textContent = state ? (state.paused ? 'Paused' : sampled ? 'Sampled' : 'Running') : '';
    status.title = regs ? `${state.tstates} T-states` : '';

    for (const cell of registerCells) {
        const name = cell.dataset.register;
        const address = cell instanceof HTMLButtonElement;
        const digits = address ? 4 : 2;
        const value = regs?.[name];
        const available = Number.isInteger(value);
        cell.textContent = available ? hex(value, true, digits) : '-'.repeat(digits);
        cell.classList.toggle('register-changed', !sampled && available && previousRegisters &&
            previousRegisters[name] !== value);
        if (address) {
            cell.disabled = !available;
            const label = cell.closest('div').querySelector('dt').textContent;
            cell.setAttribute('aria-label', `${label} ${cell.textContent}, show in Memory`);
        }
    }

    flagChips.forEach((chip, index) => {
        const set = Boolean(regs?.f & (0x80 >> index));
        chip.classList.toggle('flag-set', set);
        chip.setAttribute('aria-label', `${chip.title} ${regs ? (set ? 'set' : 'clear') : 'unavailable'}`);
    });
    if (state?.paused) previousRegisters = regs;
}

$('.registers button').on('click', function() {
    openMemoryAt(Number.parseInt(this.textContent, 16));
});
