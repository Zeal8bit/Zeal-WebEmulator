/**
 * SPDX-FileCopyrightText: 2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const debugControls = document.getElementById('menu-controls');

function renderDebugState(state) {
    debugControls.inert = !emulator?.runtimeReady;
    $('#continue').toggle(Boolean(state?.paused));
    $('#pause').toggle(Boolean(state && !state.paused));
    $('#step').attr('aria-disabled', String(!state?.paused));
    if (state?.paused) setRegView(state);
    else clearRegView();
}

function runDebugCommand(command) {
    const session = emulator?.debugger;
    if (!session?.state || debugControls.inert) return;
    if (command === 'step' && !session.state.paused) return;
    session[command]().catch(error => {
        console.error(error);
        popout.error('The debugger command failed.');
    });
}

for (const command of ['continue', 'pause', 'step', 'reset']) {
    $(`#${command}`).on('click', () => runDebugCommand(command));
}

$('#clean').on('click', async () => {
    if (!emulator || loadingImages) return;
    try {
        await unloadEmulator();
        resetImageSelection();
    } catch (error) {
        console.error(error);
        popout.error('Could not close the emulator session.');
    }
});
