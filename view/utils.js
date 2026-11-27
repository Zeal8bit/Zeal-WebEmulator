/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function isPrintable(byteCode) {
    return byteCode >= 32 && byteCode <= 126;
}

async function filehash(bytes, expected) {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    return actual === String(expected).toLowerCase() ||
        confirm('The downloaded image has a different checksum. Continue?');
}

function hex(value, noPrefix = false, digits = 4) {
    const number = value.toString(16).toUpperCase().padStart(digits, '0').slice(-digits);
    return noPrefix ? number : `0x${number}`;
}

function hex8(value, noPrefix = false) {
    return hex(value, noPrefix, 2);
}

function hex16(high, low, noPrefix = false) {
    return hex(high << 8 | low, noPrefix);
}

function resolveDebugAddress(session, text) {
    if (/^(?:0x|\$)?[a-f0-9]{1,4}$/i.test(text)) return Number.parseInt(text.replace(/^\$/, ''), 16);
    if (!text || /^(?:\$|0x)?[0-9a-f]{5,}$/i.test(text)) return null;
    return session?.findSymbol(text) ?? null;
}
