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

    let sample_table = {
        divider: 0,
        config: 0,
        ready: 1,
        fifo: [],
        baudrate: 0,
        is_u8: 0,
        is_signed: 0,
    };

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

    function sample_table_enabled() {
        return (enabled_voices & 0x80) != 0;
    }

    function sample_table_fifo_write(value) {
        sample_table.fifo.push(value);
    }

    function sample_table_set_divider(value) {
        sample_table.divider = value;
        sample_table.baudrate = Math.floor(44091 / (value + 1));
    }

    function sample_table_set_conf(value) {
        sample_table.config = value & 0x7;
        sample_table.is_u8 = (value & 1) ? 1 : 0;
        sample_table.is_signed = (value & 4) ? 1 : 0;
    }

    function sample_table_start() {
        /* Convert all the samples to [-1.0;1.0] */
        var samples = [];

        if (sample_table.fifo.length == 0) {
            return;
        }

        while (sample_table.fifo.length != 0)
        {
            const lsb = sample_table.fifo.shift();
            let value = 0;
            if (sample_table.is_u8) {
                value = (lsb - 128) / 128;
            } else {
                /* If the amount of bytes is not even, stop now */
                if (sample_table.fifo.length == 0) {
                    break;
                }
                const msb = sample_table.fifo.shift();
                value = (msb << 8) | lsb;

                if (sample_table.is_signed) {
                    if (value & 0x8000) value -= 0x10000;
                    value = value / 32768;
                } else {
                    value = (value - 32768) / 32768;
                }
            }
            samples.push(value);
        }

        const audio_buffer = audio_ctx.createBuffer(1, samples.length, sample_table.baudrate);
        const channel_samples = audio_buffer.getChannelData(0);

        /* Fill the buffer with the generates samples */
        for (let i = 0; i < samples.length; i++) {
            channel_samples[i] = samples[i];
        }

        const buffer_source = audio_ctx.createBufferSource();
        buffer_source.connect(audio_ctx.destination);
        buffer_source.onended = () => {
            sample_table.ready = 1;
        };

        sample_table.ready = 0;
        buffer_source.buffer = audio_buffer;
        buffer_source.start();
    }


    this.io_read = function (port) {
        switch (port) {
            case 1:
                if (sample_table_enabled()) {
                    return sample_table.divider;
                }
            break;
            case 2:
                if (sample_table_enabled()) {
                    return (sample_table.ready << 7)
                          | 1 << 6                      // Only present in the emulator, telling the program it is emulated
                          | sample_table.config;
                }
            break;
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
                /* Special case for the sample table voice */
                if (sample_table_enabled()) {
                    /* Register 0 corresponds to the FIFO */
                    sample_table_fifo_write(value);
                }
                break;
            case REG_FREQ_HIGH:
                exec_active_voices(function(entry) {
                    entry.freq_high = value;
                    const divider = (value << 8) | entry.freq_low;
                    /* Convert the divider back to a frequency */
                    const freq = (divider * 65536) / 44100;
                    entry.oscillator.frequency.value = freq;
                });
                /* Special case for the sample table voice,
                 * Register 1 corresponds to the sample divider */
                if (sample_table_enabled()) {
                    sample_table_set_divider(value);
                }
                break;
            case REG_WAVEFORM:
                exec_active_voices(function(entry) {
                    entry.wave = value & 3;
                    entry.oscillator.type = WAVE_STR[entry.wave];
                });
                /* Special case for the sample table voice,
                 * Register 2 corresponds to the configuration */
                if (sample_table_enabled()) {
                    sample_table_set_conf(value);
                }
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
                /* Check if we have to start the smaple table voice */
                if ((value & 0x80) == 0) {
                    sample_table_start();
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
