/**
 * SPDX-FileCopyrightText: 2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function TraceVCD() {
    let is_enabled = false;
    let init_phase = true;
    const comment = "Zeal 8-bit computer emulator VCD trace dump";

    /* Dictionary for the wires of the form:
     * { name, width, symbol }
     */
    let wires = [];
    let changes = [];

    let current_symbol = 0x3a;
    let current_timescale = 0;

    function addWire(name, width = 1) {
        if (init_phase) {
            let symbol = String.fromCharCode(current_symbol++);
            wires[name] = { name, width, symbol };
            return name;
        }

        return null;
    }


    function logChange(timescale, name, value) {
        if (!is_enabled) {
            return;
        }

        init_phase = false;

        if (current_timescale == 0) {
            current_timescale = timescale;
        }

        const timedif = timescale - current_timescale;
        const symbol = wires[name].symbol;
        if (!changes[timedif]) {
            changes[timedif] = [];
        }
        changes[timedif].push({ symbol, value });
    }


    function dumpChanges() {
        /* Generate header */
        let content = `$date
$end
$version
    Zeal-WebEmulator trace VCD
$end
$comment
    ${comment}
$end
$timescale 100ns $end
$scope module Zeal_IO $end\n`;

        for (let name in wires) {
            let entry = wires[name];
            content += `$var wire ${entry.width} ${entry.symbol} ${entry.name} $end\n`;
        }
        content += `$upscope $end\n`;
        content += `$enddefinitions $end\n`;
        content += `$dumpvars\n`;
        content += `$end\n`;

        /* Generate changes from variables */
        for (let timescale in changes) {
            content += `#${timescale}\n`;

            changes[timescale].forEach(change => {
                content += `${change.value}${change.symbol}\n`;
            });
        }

        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([content], {type: 'text/csv'}));
        a.download = 'dump.vcd';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function enable() {
        is_enabled = true;
    }

    this.addWire = addWire;
    this.change = logChange;
    this.download = dumpChanges;
    this.enable = enable;
}


/* Global debug peripheral */
const g_tracevcd = new TraceVCD();
