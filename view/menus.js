/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const webSettings = document.getElementById('web-settings');
const webSettingsOpener = document.getElementById('open-web-settings');
const settingsNotification = document.getElementById('popup-message');

webSettingsOpener.addEventListener('click', () => {
    webSettings.append(settingsNotification);
    webSettings.showModal();
});

webSettings.addEventListener('close', () => {
    if (!webSettings.open) document.body.prepend(settingsNotification);
});

$("#theme").on("change", function() {
    document.documentElement.dataset.theme = this.value;
});

$('#canvas-smooth-val').on('change', (e) => {
    const smooth = e.currentTarget.checked;
    localStorage.setItem('canvas-smooth', JSON.stringify(smooth));
    $('#zeal-screen').toggleClass('no-pixels', smooth);
})

$('#screen-capture').on('click', async () => {
    const session = emulator?.debugger;
    if (!session?.state) return;
    try {
        const { pixels, width, height, stride } = await session.captureScreen();
        if (session !== emulator?.debugger) return;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const image = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixel = pixels[y * stride + x];
                const offset = (y * width + x) * 4;
                image.data[offset] = (pixel >>> 11) * 255 / 31;
                image.data[offset + 1] = ((pixel >>> 5) & 63) * 255 / 63;
                image.data[offset + 2] = (pixel & 31) * 255 / 31;
                image.data[offset + 3] = 255;
            }
        }
        ctx.putImageData(image, 0, 0);

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'zeal-screenshot.png';
        link.click();
    } catch (error) {
        console.error(error);
        popout.error('Could not capture the emulator screen.');
    }
});

$('#theater-mode, #container .close').on('click', () => {
    if (webSettings.open) webSettings.close();
    $('#toppanel').toggleClass('theater-mode').trigger('layoutchange');
    if (debuggerLayout.classList.contains('theater-mode')) {
        document.querySelector('#container .close').focus();
    } else {
        webSettingsOpener.focus();
    }
});

$('#fullscreen-mode').on('click', () => {
    webSettings.close();
    const canvas = document.querySelector('#container canvas');

    if(document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
    } else {
        if(canvas && canvas.requestFullscreen) {
            canvas.requestFullscreen({
                navigationUI: "hide",
            });
        }
    }
});

jQuery(() => {
    const smooth = localStorage.getItem('canvas-smooth') === 'true';
    $('#canvas-smooth-val').prop('checked', smooth).trigger('change');

    if (screenCanvas.requestFullscreen) $('#fullscreen-mode').show();
});
