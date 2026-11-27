/**
 * SPDX-FileCopyrightText: 2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const hostFSButton = document.getElementById('hostfs-mount');
const hostFSStatus = document.getElementById('hostfs-status');
let hostFSDirectory = null;

const hostFSOptions = {
    onError(operation, error) {
        console.error('[HostFS]', operation, error);
        popout.error('HostFS could not access the mounted folder.');
    },
};

function createHostFS(directory = hostFSDirectory) {
    return directory ? new HostFS(directory, hostFSOptions) : null;
}

function updateHostFSButton() {
    hostFSButton.disabled = sessionChanging || !HostFS.supported;
    hostFSButton.textContent = hostFSDirectory ? 'Unmount HostFS' : 'Mount HostFS';
    hostFSStatus.dataset.mounted = String(Boolean(hostFSDirectory));
    const status = HostFS.unavailableReason ?? (hostFSDirectory
        ? `Mounted: ${hostFSDirectory.name} → H:/`
        : 'Share a local folder with the guest as H:/.');
    if (hostFSStatus.textContent !== status) hostFSStatus.textContent = status;
}

async function reloadHostFS(current, hostfs) {
    const previousModule = current.module;
    const previousBackend = current.hostfs;
    const resume = !current.debugger.state?.paused;

    current.setHostFS(hostfs);
    try {
        await current.reload();
    } catch (error) {
        // A backend owns the guest's open descriptors for a single runtime.
        current.setHostFS(current.module === previousModule ? previousBackend : createHostFS());
        if (!current.module) {
            try {
                await current.start();
                await prepareDebugger(current, resume);
            } catch (recoveryError) {
                console.error('Could not restore the emulator after a HostFS change', recoveryError);
                $('#romready, #eepromready, #symready').removeClass('ready');
            }
        }
        throw error;
    }

    hostFSDirectory = hostfs?.directory ?? null;
    await prepareDebugger(current, resume);
}

hostFSButton.addEventListener('click', async () => {
    if (sessionChanging || !HostFS.supported) return;
    setSessionChanging(true);
    try {
        const hostfs = hostFSDirectory ? null : await HostFS.mount(hostFSOptions);
        if (emulator?.runtimeReady) {
            const action = hostfs ? 'Mounting' : 'Unmounting';
            const prompt = `${action} HostFS will restart the emulator and discard guest RAM. ` +
                'Finish any guest file operations before continuing. Continue?';
            if (!confirm(prompt)) return;
            await reloadHostFS(emulator, hostfs);
        } else {
            hostFSDirectory = hostfs?.directory ?? null;
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error(error);
            popout.error('Could not change the HostFS mount.');
        }
    } finally {
        setSessionChanging(false);
    }
});

updateHostFSButton();
