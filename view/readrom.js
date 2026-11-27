/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>; Jason Mo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const romChoice = document.getElementById('romchoice');
const loadImagesButton = document.getElementById('read-button');
let loadedChoice = '';

function resetImageSelection() {
    loadedChoice = '';
    romChoice.value = '';
    document.querySelectorAll('#romfile input[type=file]').forEach(input => { input.value = ''; });
    $('#romready, #eepromready, #symready').removeClass('ready');
}

function showImageError(message, error) {
    console.error(error);
    popout.error(message);
}

async function fetchImage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Image request failed (${response.status})`);
    return response.arrayBuffer();
}

async function loadImages(prepare, choice = '') {
    if (sessionChanging) return;
    setSessionChanging(true);
    $('#loading_img').visible();
    try {
        const images = await prepare();
        if (!images) return;
        await bootEmulator(images.rom, images.eeprom, images.symbols);
        loadedChoice = choice;
        $('#romready').addClass('ready');
        $('#eepromready').toggleClass('ready', Boolean(images.eeprom));
        $('#symready').toggleClass('ready', Boolean(images.symbols));
    } catch (error) {
        if (!emulator?.module) {
            loadedChoice = '';
            $('#romready, #eepromready').removeClass('ready');
        }
        showImageError('Could not start the emulator. Check the images and try again.', error);
    } finally {
        romChoice.value = loadedChoice;
        $('#loading_img').invisible();
        setSessionChanging(false);
    }
}

loadImagesButton.addEventListener('click', () => {
    const rom = document.getElementById('file-rom').files[0];
    const eeprom = document.getElementById('file-eeprom').files[0];
    const map = document.getElementById('file-map').files[0];
    if (rom) {
        loadImages(async () => ({
            rom: await rom.arrayBuffer(),
            eeprom: await eeprom?.arrayBuffer(),
            symbols: await map?.arrayBuffer(),
        }));
    } else if (map && emulator?.runtimeReady) {
        loadMap(map);
    } else {
        popout.warn('Choose a system image first.');
    }
});

async function loadMap(file) {
    if (sessionChanging) return;
    setSessionChanging(true);
    const session = emulator.debugger;
    try {
        const symbols = await file.arrayBuffer();
        await session.loadSymbols(symbols);
        if (session === emulator?.debugger) {
            activeSymbols = symbols;
            $('#symready').addClass('ready');
            disassembleAndShow();
            renderWatches();
        }
    } catch (error) {
        showImageError('Could not load the map file.', error);
    } finally {
        setSessionChanging(false);
    }
}

romChoice.addEventListener('change', () => {
    const { value, selectedOptions } = romChoice;
    if (!value) return;
    if (emulator && !confirm('Replace the current emulator session?')) {
        romChoice.value = loadedChoice;
        return;
    }
    const expectedHash = selectedOptions[0].dataset.hash;
    loadImages(async () => {
        const rom = await fetchImage(value);
        if (expectedHash && !await filehash(rom, expectedHash)) return;
        const eeprom = params.e ? await fetchImage(params.e) : undefined;
        const symbols = params.m ? await fetchImage(params.m) : undefined;
        return { rom, eeprom, symbols };
    }, value);
});

document.getElementById('romload-advanced').addEventListener('click', function() {
    const expanded = this.getAttribute('aria-expanded') !== 'true';
    this.setAttribute('aria-expanded', String(expanded));
    $('#romfile').toggle(expanded);
});

async function fetchRomIndex() {
    const response = await fetch(new URL('roms/index.json', document.baseURI));
    if (!response.ok) throw new Error(`ROM catalog request failed (${response.status})`);
    return { index: await response.json(), base: response.url };
}

async function populateRomPicker() {
    const requestedROM = params.r ?? 'latest';
    romChoice.replaceChildren(new Option('Choose an image...', ''));
    try {
        const { index, base } = await fetchRomIndex();
        const groups = [
            ['Latest', index.latest ? [index.latest] : []],
            ['Nightly', index.nightly ?? []],
            ['Stable', index.stable ?? []],
        ];
        const groupRequested = groups.some(([label]) => requestedROM === label.toLowerCase());
        for (const [label, entries] of groups) {
            if (!entries.length) continue;
            const group = document.createElement('optgroup');
            group.label = label;
            entries.forEach((entry, position) => {
                // The release sync writes paths relative to the application root.
                const url = new URL(entry.urls, new URL('../', base));
                const option = new Option(entry.name, url.href);
                option.dataset.hash = entry.hash ?? '';
                group.append(option);
                const selected = groupRequested
                    ? requestedROM === label.toLowerCase() && position === 0
                    : requestedROM === entry.name || requestedROM === entry.urls || requestedROM === url.href;
                if (selected) {
                    option.selected = true;
                }
            });
            romChoice.append(group);
        }
        if (romChoice.value) romChoice.dispatchEvent(new Event('change'));
    } catch (error) {
        showImageError('Could not load the prebuilt ROM list. You can open a local image.', error);
        $('#romfile').show();
        $('#romload-advanced').attr('aria-expanded', 'true');
    }
}

if ('advanced' in params) {
    $('#romload').hide();
    $('#romfile').show();
} else {
    populateRomPicker();
}
