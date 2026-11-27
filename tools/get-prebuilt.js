/**
 * SPDX-FileCopyrightText: 2026 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const { createHash } = require('node:crypto');
const { mkdir, rename, writeFile } = require('node:fs/promises');
const { unzipSync } = require('fflate');

const repository = 'Zeal8bit/Zeal-8-bit-OS';
const releaseAPI = `https://api.github.com/repos/${repository}/releases`;
const archiveName = 'zos_target_zeal8bit_emulator.zip';
const imageName = 'os_with_romdisk.img';
const maxArchiveBytes = 4 * 1024 * 1024;
const maxROMBytes = 512 * 1024;

const sha256 = data => createHash('sha256').update(data).digest('hex');

async function fetchChecked(url, headers = {}) {
    const response = await fetch(url, {
        headers: { 'User-Agent': 'Zeal-WebEmulator', ...headers },
        signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
    return response;
}

async function fetchReleaseMetadata(suffix) {
    const headers = { Accept: 'application/vnd.github+json' };
    return (await fetchChecked(releaseAPI + suffix, headers)).json();
}

async function writeAtomically(path, data) {
    const temporary = `${path}.${process.pid}.tmp`;
    await writeFile(temporary, data);
    await rename(temporary, path);
}

async function downloadROM(release, asset) {
    if (!Number.isSafeInteger(asset.id) || !Number.isInteger(asset.size) ||
        asset.size < 1 || asset.size > maxArchiveBytes) {
        throw new Error(`${release.tag_name} has invalid emulator archive metadata`);
    }
    const tag = encodeURIComponent(release.tag_name);
    const archiveURL = `https://github.com/${repository}/releases/download/${tag}/${archiveName}`;
    const archive = new Uint8Array(await (await fetchChecked(archiveURL)).arrayBuffer());
    if (archive.length !== asset.size || (asset.digest && asset.digest !== `sha256:${sha256(archive)}`)) {
        throw new Error(`${release.tag_name} emulator archive failed verification`);
    }

    const images = Object.values(unzipSync(archive, {
        filter: ({ name, originalSize }) =>
            name.split('/').at(-1) === imageName && originalSize > 0 && originalSize <= maxROMBytes,
    }));
    if (images.length !== 1 || images[0].length === 0 || images[0].length > maxROMBytes) {
        throw new Error(`${release.tag_name} must contain one valid ${imageName}`);
    }

    const [image] = images;
    const hash = sha256(image);
    const urls = `roms/zos-${asset.id}.img`;
    await writeAtomically(urls, image);
    console.log(`${release.tag_name}: ${image.length} bytes → ${urls}`);
    return { name: release.tag_name, urls, hash };
}

async function main() {
    const [releases, latestRelease] = await Promise.all([
        fetchReleaseMetadata('?per_page=30'),
        fetchReleaseMetadata('/latest'),
    ]);
    const compatible = [latestRelease, ...releases.filter(release => release.id !== latestRelease.id)]
        .filter(release => !release.draft)
        .map(release => ({
            release,
            asset: release.assets.find(asset => asset.name === archiveName && asset.state === 'uploaded'),
        }))
        .filter(entry => entry.asset);

    const isNightly = ({release}) => release.prerelease || release.tag_name === 'latest';
    const stable = compatible.filter(entry => !isNightly(entry));
    const nightly = compatible.filter(isNightly);
    if (!stable.length) throw new Error('No published Zeal OS release contains an emulator ROM');

    await mkdir('roms', { recursive: true });
    const catalog = { latest: null, stable: [], nightly: [] };
    for (const { release, asset } of stable) {
        const image = await downloadROM(release, asset);
        if (!catalog.latest) catalog.latest = image;
        else catalog.stable.push(image);
    }
    for (const { release, asset } of nightly) {
        catalog.nightly.push(await downloadROM(release, asset));
    }

    await writeAtomically('roms/index.json', JSON.stringify(catalog, null, 2) + '\n');
    console.log(`Latest emulator ROM: ${catalog.latest.name}`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
