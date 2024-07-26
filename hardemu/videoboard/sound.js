/**
 * SPDX-FileCopyrightText: 2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function Sound() {
    /* We have 4 oscilaltors on the  real hardware */
    let audio_ctx  = null;
    let audio_gain = null;
    let voices = [];
    const VOICES_COUNT = 4;

    function initialize() {
        audio_ctx = new AudioContext();

        audio_gain = audio_ctx.createGain();
        audio_gain.gain.value = 0;
        audio_gain.connect(audio_ctx.destination);
        audio_gain.gain.minValue = 0;
        audio_gain.gain.maxValue = 1;

        for (var i = 0; i < VOICES_COUNT; i++) {
            const osci = audio_ctx.createOscillator()
            const locgain = audio_ctx.createGain();
            locgain.connect(audio_gain);
            voices[i] = {
                oscillator: osci,
                freq_low: 0,
                freq_high: 0,
                wave: 0,
                locgain: locgain,
            };
            locgain.gain.value = 1;
            osci.connect(locgain);
            osci.start();
        }
    }

    const WAVE_SQUARE   = 0;
    const WAVE_TRIANGLE = 1;
    const WAVE_SAWTOOTH = 2;
    const WAVE_NOISE    = 3;
    const WAVE_STR      = ["square", "triangle", "sawtooth", "custom"];

    const REG_FREQ_LOW  = 0x0;
    const REG_FREQ_HIGH = 0x1;
    const REG_WAVEFORM  = 0x2;
    const REG_HOLD      = 0xD;
    const REG_MST_VOL   = 0xE;
    const REG_VOICE_SEL = 0xF;

    let hold_voices    = 0xff;
    let enabled_voices = 0;
    let master_volume  = 0x80;

    function exec_active_voices(callback) {
        for (var i = 0; i < VOICES_COUNT; i++) {
            if (enabled_voices & (1 << i)) {
                callback(voices[i]);
            }
        }
    }


    this.io_read = function (port) {
        switch (port) {
            case REG_HOLD:      return hold_voices;
            case REG_MST_VOL:   return master_volume;
            case REG_VOICE_SEL: return enabled_voices;
        }
        return 0;
    }

    this.io_write = function (port, value) {
        if (audio_ctx == null) {
            initialize();
        }

        switch (port) {
            case REG_FREQ_LOW:
                exec_active_voices(function(entry) {
                    entry.freq_low = value;
                });
                break;
            case REG_FREQ_HIGH:
                exec_active_voices(function(entry) {
                    entry.freq_high = value;
                    const divider = (value << 8) | entry.freq_low;
                    /* Convert the divider back to a frequency */
                    const freq = (divider * 65536) / 44100;
                    entry.oscillator.frequency.value = freq;
                });
                break;
            case REG_WAVEFORM:
                exec_active_voices(function(entry) {
                    entry.wave = value & 3;
                    entry.oscillator.type = WAVE_STR[entry.wave];
                });
                break;
            case REG_HOLD:
                hold_voices = value;
                for (var i = 0; i < VOICES_COUNT; i++) {
                    if (value & (1 << i)) {
                        voices[i].locgain.gain.value = 0;
                    }  else {
                        voices[i].locgain.gain.value = 1;
                    }
                }
                break;
            case REG_MST_VOL:
                master_volume = value;
                if (value & 0x80) {
                    audio_gain.gain.value = 0;
                } else {
                    /* 15 is an arbitrary value, to make sure the soudn doesn't saturate */
                    audio_gain.gain.value = ((value & 0x3) + 1) / 15;
                }
                break;
            case REG_VOICE_SEL:
                enabled_voices = value;
                break;

            default:
                break;
        }
    }
}
