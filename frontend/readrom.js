/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function binaryReady() {
    $("#binready").addClass("ready");
}

function symbolsReady() {
    $("#symready").addClass("ready");
}

function parseDumpLine(i, line) {
    var idx = line.indexOf(";");
    if (idx != -1) {
        /* Extract number from the [ ] */
        const addr = parseInt(line.substr(idx+2, 4), 16);
        dump.table[addr] = i;
        return addr;
    }
    return -1;
}

function read_owr(file) {
    let reader = new FileReader();
    const isos = $("#os").prop("checked");
    reader.addEventListener('load', function(e) {
        let binary = e.target.result;
        if (isos) {
            rom.loadFile(binary);
            binaryReady();
        } else {
            const addr = $("#address").val();
            const result = parseInt(addr, 16);
            ram.loadFile(result, binary);
        }
    });
    if (typeof file !== "undefined") {
        reader.readAsBinaryString(file);
    }
}

$("#read-button").on('click', function() {
    /* Read the binary dump */
    let fdump = $("#file-dump")[0].files[0];
    let rdump = new FileReader();
    rdump.addEventListener('load', function(e) {
        const lines = e.target.result.split("\n");
        dump.lines = lines;
        for (var i = 0; i < lines.length; i++) {
            const line = lines[i];
            const addr = parseDumpLine(i, line);
            /* If error in parsing, it may be a label */
            if (addr == -1 && line.indexOf(":") != -1) {
                /* Check if the next line can be parsed */
                const naddr = parseDumpLine(i + 1, lines[i + 1]);
                if (naddr != -1) {
                    /* Extract the label, without the : */
                    const label = line.substr(0, line.length - 1);
                    dump.labels[label] = naddr;
                    /* Skip the next line as we just treated it */
                    i++;
                }
            }
        }
        symbolsReady();
    });

    if (typeof fdump !== "undefined") {
        rdump.readAsText(fdump);
    }

    /* Read the binary executable */
    const fileread = $("#file-input")[0].files[0];
    const pboptions = $("#romchoice option:selected");
    const pbuildurl = pboptions.val();
    const pbuildhas = pboptions.attr('hash');

    if (typeof fileread !== "undefined") {
        read_owr(fileread);
    } else if (pbuildurl !== "None") {
        readblobfromurl(pbuildurl).then(file => {
        if (typeof file !== "undefined") {
            filehash(file, pbuildhas);
        } else {
            window.alert("No os_with_romdisk chosen");
        }
        });
    } else {
        window.alert("No os_with_romdisk chosen");
    }

    /* Read the EEPROM image */
    file = $("#eeprom-bin")[0].files[0];
    let eepromr = new FileReader();
    eepromr.addEventListener('load', function(e) {
        let binary = e.target.result;
        eeprom.loadFile(binary);
    });
    if (typeof file !== "undefined") {
        eepromr.readAsBinaryString(file);
    }

});