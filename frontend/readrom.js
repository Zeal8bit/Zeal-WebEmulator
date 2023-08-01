/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

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
    /* Read the binary executable */
    let file = $("#file-input")[0].files[0];
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

/**
 * Manage the "advanced" link that shows all the files uploader
 * If the URL has "advanced" parameters, show these uploaders directly
 */

const urlGetParam = new URLSearchParams(window.location.search);
var advancedMode = urlGetParam.get("advanced") === "true";

if (advancedMode) {
    $("#romload").hide();
    $("#romfile").show();
}

$("#romadvanced a").click(() => {
    $("#romfile").toggle(500);
});

/**
 * Manage the popup message
 */

/* Add a listener on the popup that will close it on click */
$("#popup-message").on("click", function() {
    $(this).fadeOut(500);
});

function switchToAdvancedMode(error) {
    showErrorPopup("Could not fetch remote data, switched to advanced mode");

    /* Hide advanced link option and ROMs list */
    $("#romload").hide(250, function() {
        /* Show file uploaders */
        $("#romfile").show(250);
    });
}

/**
 * Manage the pre-built ROMs list. Available ROMs will be fetched from a remote JSON file that contains
 * names and links to all of the available ROMs, the first one will always be the default.
 */
const prebuilt_json_url = "https://zeal8bit.com/roms/index.json";

/* Process the index JSON object that contains all the ROMs available */
function processIndex(index) {
    /* Generate an HTML option out of each entry */
    const options = index.index.map(entry =>
        `<option value="${entry.urls}" data-version="${entry.version}" data-hash="${entry.hash}">${entry.name}</option>`
    );

    const all_options =
        `<option value="">Choose an image...</option>` +
        options.join("");

    $("#romchoice").html(all_options);
}

/* Fetch the remote JSON file, and pass the content to the previous function */
if (!advancedMode) {
    fetch(prebuilt_json_url)
        .then(response => response.json())
        .then(response => processIndex(response))
        .catch(switchToAdvancedMode);
}


function readBinaryFromURL(pburl) {
    return fetch(pburl)
        .then(response => response.blob())
        .then(res => new Response(res).arrayBuffer())
        .then(res => new Uint8Array(res));
}

/**
 * Add a listener to the romchoice list, load the ROM when selected
 */
$("#romchoice").on("change", function() {
    /* Get the URL of the current choice */
    const url = $(this).val();
    /* Get the hash for the current binary */
    const hash = $('#romchoice option:selected').data("hash");

    if (!url) {
        return;
    }

    $("#loading_img").visible();

    readBinaryFromURL(url)
    .then(data => {
        rom.loadFile(data);
        $("#loading_img").invisible();
        cont();
    })
    .catch(switchToAdvancedMode);

});