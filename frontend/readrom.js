/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function read_owr(file) {
    let reader = new FileReader();
    const isos = $("#os").prop("checked");
    reader.addEventListener('load', function(e) {
        let binary = e.target.result;
        if (isos) {
            rom.loadFile(binary);
            $("#binready").addClass("ready");
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
    /* If a dump/map file was provided, try to load it */
    let fdump = $("#file-dump")[0].files[0];
    if (typeof fdump !== "undefined") {
        let rdump = new FileReader();
        rdump.addEventListener('load', (e) => {
            const success = disassembler.loadSymbols(e.target.result);
            if (success) {
                /* symbols are ready! */
                $("#symready").addClass("ready");
            }
        });
        rdump.readAsText(fdump);
    }

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
        $("#eepromready").addClass("ready");
    });
    if (typeof file !== "undefined") {
        eepromr.readAsBinaryString(file);
    }

});