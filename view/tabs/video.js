/**
 * SPDX-FileCopyrightText: 2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const videoPanel = document.getElementById('video');
const vblankControl = document.getElementById('breakpoint-vblank');
const videoSections = Array.from(videoPanel.querySelectorAll('details[name]'));
const videoPreferences = {
    palette: { open: true, visible: true },
    fonts: { open: true, visible: false },
    tileset: { open: true, visible: true },
    sprites: { open: false, visible: false, data: {
        'sprites-empty': true,
        'sprites-empty-index': 0,
        'sprites-details': false,
    }},
    tilemap: { open: false, visible: false, data: {
        'tilemap-layer0': true,
        'tilemap-layer1': true,
    }},
};
let videoRequest = 0;

try {
    const saved = JSON.parse(localStorage.getItem('video-panels') ?? '{}');
    for (const [name, current] of Object.entries(videoPreferences)) {
        if (typeof saved?.[name]?.open === 'boolean') current.open = saved[name].open;
        if (typeof saved?.[name]?.visible === 'boolean') current.visible = saved[name].visible;
        if (current.data) Object.assign(current.data, saved?.[name]?.data);
    }
} catch (error) {
    console.warn('Could not restore video panel preferences', error);
}

function saveVideoPreferences() {
    localStorage.setItem('video-panels', JSON.stringify(videoPreferences));
}

function previewCanvas({width, height, pixels, mask}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const image = context.createImageData(width, height);
    for (let index = 0; index < width * height; index++) {
        image.data[index * 4] = pixels[index * 3];
        image.data[index * 4 + 1] = pixels[index * 3 + 1];
        image.data[index * 4 + 2] = pixels[index * 3 + 2];
        image.data[index * 4 + 3] = !mask || mask[index] ? 255 : 0;
    }
    context.putImageData(image, 0, 0);
    return canvas;
}

function renderPalette(preview) {
    const colors = document.createDocumentFragment();
    for (let index = 0; index < 256; index++) {
        const x = index % preview.columns * (preview.cellWidth + 1) + 1;
        const y = Math.floor(index / preview.columns) * (preview.cellHeight + 1) + 1;
        const offset = (y * preview.width + x) * 3;
        const [r, g, b] = preview.pixels.subarray(offset, offset + 3);
        const swatch = document.createElement('div');
        swatch.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        swatch.title = `Index ${index}`;
        colors.append(swatch);
    }
    videoPanel.querySelector('.palette').replaceChildren(colors);
}

function renderCells(preview, selector, label, count) {
    const source = previewCanvas(preview);
    const {columns, cellWidth, cellHeight} = preview;
    const cells = document.createDocumentFragment();
    for (let index = 0; index < count; index++) {
        const canvas = document.createElement('canvas');
        canvas.width = cellWidth;
        canvas.height = cellHeight;
        canvas.title = `${label} ${index}`;
        const x = index % columns * (cellWidth + 1) + 1;
        const y = Math.floor(index / columns) * (cellHeight + 1) + 1;
        canvas.getContext('2d').drawImage(source, x, y, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);
        cells.append(canvas);
    }
    videoPanel.querySelector(selector).replaceChildren(cells);
}

function renderSprites(sprites) {
    const data = videoPreferences.sprites.data;
    const container = videoPanel.querySelector('.sprites');
    const content = document.createDocumentFragment();
    container.classList.toggle('detailed', data['sprites-details']);
    for (const sprite of sprites) {
        if (data['sprites-empty'] && sprite.tile === Number(data['sprites-empty-index'])) continue;
        const canvas = previewCanvas(sprite);
        canvas.title = `Sprite ${sprite.index}`;
        if (!data['sprites-details']) {
            content.append(canvas);
        } else {
            const details = document.createElement('div');
            details.className = 'details';
            const attributes = document.createElement('pre');
            attributes.textContent = `Index: ${sprite.index}  Tile: ${sprite.tile}
X: ${sprite.x}  Y: ${sprite.y}
Flip X: ${sprite.flipX}  Flip Y: ${sprite.flipY}
Palette: ${sprite.palette}  Behind FG: ${sprite.behindForeground}`;
            details.append(canvas, attributes);
            content.append(details);
        }
    }
    container.replaceChildren(content);
}

function renderLayers(layers) {
    const content = document.createDocumentFragment();
    for (const [index, preview] of layers) {
        const figure = document.createElement('figure');
        const caption = document.createElement('figcaption');
        caption.textContent = `Layer ${index}`;
        figure.append(caption, previewCanvas(preview));
        content.append(figure);
    }
    videoPanel.querySelector('.tilemap').replaceChildren(content);
}

async function refreshVideo() {
    const session = emulator?.debugger;
    if (!session?.state || videoPanel.inert || !videoPanel.classList.contains('active')) return;
    const sequence = ++videoRequest;
    const valid = () => session === emulator?.debugger && sequence === videoRequest;
    const showing = name => videoPreferences[name].open && videoPreferences[name].visible;

    try {
        if (showing('palette')) {
            const palette = await session.inspectVideo('palette');
            if (!valid()) return;
            renderPalette(palette);
        }
        if (showing('fonts')) {
            const font = await session.inspectVideo('font');
            if (!valid()) return;
            renderCells(font, '.fonts', 'Character', 256);
        }
        if (showing('tileset')) {
            const tiles = await session.inspectVideo('tileset');
            if (!valid()) return;
            renderCells(tiles, '.tileset', 'Tile', tiles.itemCount);
        }
        if (showing('sprites')) {
            const sprites = await session.inspectVideo('sprites');
            if (!valid()) return;
            renderSprites(sprites);
        }
        if (showing('tilemap')) {
            const layers = [];
            for (const index of [0, 1]) {
                if (!videoPreferences.tilemap.data[`tilemap-layer${index}`]) continue;
                const layer = await session.inspectVideo(`layer${index}`);
                if (!valid()) return;
                layers.push([index, layer]);
            }
            renderLayers(layers);
        }
    } catch (error) {
        if (valid()) {
            console.error(error);
            popout.error('Could not read video memory.');
        }
    }
}

function syncVideoState(state) {
    videoPanel.inert = !state || !emulator?.runtimeReady;
    vblankControl.disabled = videoPanel.inert;
    if (videoPanel.inert) {
        videoRequest++;
        videoPanel.querySelectorAll('.palette, .fonts, .tileset, .sprites, .tilemap')
            .forEach(section => section.replaceChildren());
    } else if (state.paused) {
        refreshVideo();
    }
}

vblankControl.addEventListener('change', async () => {
    const session = emulator?.debugger;
    if (!session?.state) return;
    const enabled = vblankControl.checked;
    try {
        await session.setBreakOnVBlank(enabled);
    } catch (error) {
        if (session === emulator?.debugger && vblankControl.checked === enabled) vblankControl.checked = !enabled;
        console.error(error);
        popout.error('Could not change the VBlank breakpoint.');
    }
});

for (const section of videoSections) {
    const name = section.getAttribute('name');
    const preferences = videoPreferences[name];
    const toggle = videoPanel.querySelector(`.toggle[name="${name}"]`);
    toggle.checked = preferences.visible;
    section.hidden = !preferences.visible;
    section.open = preferences.open;
    toggle.addEventListener('change', () => {
        preferences.visible = toggle.checked;
        section.hidden = !preferences.visible;
        saveVideoPreferences();
        refreshVideo();
    });
    section.addEventListener('toggle', () => {
        if (preferences.open === section.open) return;
        preferences.open = section.open;
        saveVideoPreferences();
        refreshVideo();
    });
    for (const input of section.querySelectorAll('input.data')) {
        if (input.type === 'checkbox') input.checked = Boolean(preferences.data[input.name]);
        else input.value = preferences.data[input.name];
        input.addEventListener('change', () => {
            preferences.data[input.name] = input.type === 'checkbox' ? input.checked : input.value;
            saveVideoPreferences();
            refreshVideo();
        });
    }
}

$('#video').on('active', refreshVideo);
$('#video-dump').on('click', refreshVideo);
