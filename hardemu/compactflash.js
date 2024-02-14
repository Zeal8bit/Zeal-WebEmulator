/**
 * SPDX-FileCopyrightText: 2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function CompactFlash(Zeal) {
    const size = 128*KB; // Not realistic but enough for testing
    const io_addr_from = 0x70;
    const io_addr_to   = 0x77;

    /* Internal registers */
    var cf_data = new Array(size);
    let data_ptr = 0;
    let data_sec_cnt = 0;
    let sector_buffer_idx = 0;
    let sector_write = false;
    /**
     * STATUS_BUSY_BIT = Bit 7
     * STATUS_RDY_BIT  = Bit 6
     * STATUS_DWF_BIT  = Bit 5
     * STATUS_DSC_BIT  = Bit 4
     * STATUS_DRQ_BIT  = Bit 3
     * STATUS_CORR_BIT = Bit 2
     * STATUS_ERR_BIT  = Bit 0
     */
    let status = 0;
    let lba_0  = 0;
    let lba_8  = 0;
    let lba_16 = 0;
    let lba_24 = 0;
    let sec_cnt = 0;
    let sec_it = 0;
    let error = 0;
    let feature = 0;
    /* The sector buffer has a size of 512 bytes */
    let sector_buffer = new Array(512);
    /* Registers addresses */
    let reg_data    = io_addr_from + 0;
    let reg_feature = io_addr_from + 1;
    let reg_error   = io_addr_from + 1; // Same as feature
    let reg_sec_cnt = io_addr_from + 2;
    let reg_lba_0   = io_addr_from + 3;
    let reg_lba_8   = io_addr_from + 4;
    let reg_lba_16  = io_addr_from + 5;
    let reg_lba_24  = io_addr_from + 6;
    let reg_command = io_addr_from + 7;
    let reg_status  = io_addr_from + 7; // Same as command

    for (var i = 0; i < cf_data.length; i++) {
        cf_data[i] = i;
    }

    function is_valid_address(read, address) {
        return false;
    }

    function is_valid_port(read, port) {
        return (port & 0xff) >= io_addr_from && (port & 0xff) <= io_addr_to;
    }

    function mem_read(address) {
        console.assert("CompactFlash cannot be read from the memory bus");
        return 0;
    }

    function mem_write(address, value) {
    }

    function io_read(port) {
        port  &= 0xff;
        switch (port) {
            case reg_status:    return status;
            case reg_error:     return error;
            case reg_sec_cnt:   return sec_cnt;
            case reg_lba_0:     return lba_0;
            case reg_lba_8:     return lba_8;
            case reg_lba_16:    return lba_16;
            case reg_lba_24:    return lba_24;
            case reg_data:      return process_data();
            default:            return 0;
        }
    }

    function io_write(port, value) {
        port  &= 0xff;
        value &= 0xff;
        switch (port) {
            case reg_data:
                process_data(value);
                break;
            case reg_command:
                process_command(value);
                break;
            case reg_feature:
                feature = value;
                break;
            case reg_sec_cnt:
                sec_cnt = value;
                break;
            case reg_lba_0:
                lba_0 = value;
                break;
            case reg_lba_8:
                lba_8 = value;
                break;
            case reg_lba_16:
                lba_16 = value;
                break;
            case reg_lba_24:
                /* Only the lowest 4 bits are part of the address */
                lba_24 = value & 0xf;
                break;
            default:
                console.log("Unsupported CompactFlash write register " + port.toString());
                break;
        }
    }

    function process_data(value) {
        if (sector_write) {
            /* If the sector count is 0, do nothing... */
            if (sec_cnt == 0) {
                return;
            }

            /* Write the byte to the buffer */
            sector_buffer[sector_buffer_idx++] = value;
            if (sector_buffer_idx == 512) {
                /* Flush to the Compact Flash */
                for (var i = 0; i < 512; i++)
                cf_data[data_ptr * 512 + i] = sector_buffer[i];
                sec_cnt--;
            }
        } else {
            /* Read the next byte from the sector buffer */
            const data = sector_buffer[sector_buffer_idx];
            console.log("CF: reading " + sector_buffer_idx + " = 0x" + data.toString(16));
            sector_buffer_idx = (sector_buffer_idx + 1) % 512;
            console.assert(sec_cnt != 0);
            if (sector_buffer_idx == 0) {
                sec_cnt--;
                sec_it++;
                for (var i = 0; i < 512; i++) {
                    sector_buffer[i] = cf_data[(data_ptr + sec_it) * 512 + i];
                }
            }
            return data;
        }
    }

    const CMD_NOP           = 0x00;

    const CMD_READ_SECTOR1  = 0x20;
    const CMD_READ_SECTOR2  = 0x21;

    const CMD_WRITE_SECTOR1 = 0x30;
    const CMD_WRITE_SECTOR2 = 0x31;

    const CMD_READ_BUFFER   = 0xE4;
    const CMD_WRITE_BUFFER  = 0xE8;
    const CMD_SET_FEATURE   = 0xEF;


    function process_command(cmd) {
        switch (cmd) {
            case CMD_NOP:
                break;
            case CMD_SET_FEATURE:
                break;

            case CMD_READ_SECTOR1:
            case CMD_READ_SECTOR2:
                data_ptr = (lba_24 << 24) | (lba_16 << 16) |
                           (lba_8 << 8)   | (lba_0  << 0);
                data_sec_cnt = sec_cnt;
                sec_it = 0;
                // Fall-through
            case CMD_READ_BUFFER:
                if ((data_ptr + 1) * 512 >= size) {
                    console.error("CompactFlash: invalid read address");
                    return;
                }
                /* Read the data into the sector buffer */
                for (var i = 0; i < 512; i++)
                    sector_buffer[i] = cf_data[data_ptr * 512 + i];
                sector_write = false;
                /* Sector index becomes 0 */
                sector_buffer_idx = 0;
                break;


            case CMD_WRITE_SECTOR1:
            case CMD_WRITE_SECTOR2:
                data_ptr = (lba_24 << 24) | (lba_16 << 16) |
                           (lba_8 << 8)   | (lba_0  << 0);
                data_sec_cnt = sec_cnt;
                sec_it = 0;
                // Fall-through
            case CMD_WRITE_BUFFER:
                sector_write = true;
                /* Sector index becomes 0 */
                sector_buffer_idx = 0;
                break;
        }
    }


    function loadFile(binary) {
        if (typeof binary === "string") {
            for (var i = 0; i < binary.length; i++)
                cf_data[i] = binary.charCodeAt(i);
        } else {
            for (var i = 0; i < binary.length; i++)
                cf_data[i] = binary[i];
        }
        /* Set the CompactFlash to ready */
        status = 1 << 6;
    }


    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
    this.loadFile = loadFile;
}
