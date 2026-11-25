/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function saveMenuState() {
    const menus = {};
    $('.menu').each(function() {
        const id = $(this).attr('id');
        menus[id] = $(this).hasClass('visible');
    });
    localStorage.setItem('menus', JSON.stringify(menus));
}

$(".menutitle").on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    $(this).parent().toggleClass('visible');
    saveMenuState();
});

$("#theme").on("change", function() {
    $(":root").removeClass();
    $(":root").addClass($(this).val());
})

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

$('#theater-mode').on('click', () => {
    $('#toppanel').toggleClass('theater-mode');
});

$('#fullscreen-mode').on('click', () => {
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

$('#container .close').on('click', () => {
    $('#toppanel').toggleClass('theater-mode');
})

jQuery(() => {
    try {
        const menus = JSON.parse(localStorage.getItem('menus') ?? '{}') ?? {};
        for (const [id, visible] of Object.entries(menus)) {
            const menu = document.getElementById(id);
            if (visible && menu?.classList.contains('menu')) menu.classList.add('visible');
        }
    } catch (error) {
        console.warn('Could not restore menu preferences', error);
    }

    const smooth = localStorage.getItem('canvas-smooth') === 'true';
    $('#canvas-smooth-val').prop('checked', smooth).trigger('change');

    if (screenCanvas.requestFullscreen) $('#fullscreen-mode').show();
});
