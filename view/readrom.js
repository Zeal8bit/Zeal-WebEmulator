/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function load_bin(file){
    let reader = new FileReader();
    const isos = $("#os").prop("checked");
    reader.addEventListener('load', function(e) {
        let binary = e.target.result;
        if (isos) {
            zealcom.rom.loadFile(binary);
            $("#binready").addClass("ready");
        } else {
            const addr = $("#address").val();
            const result = parseInt(addr, 16);
            zealcom.ram.loadFile(result, binary);
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

    /* Read the binary executable */
    let file = $("#file-input")[0].files[0];
    load_bin(file);

    /* Read the EEPROM image */
    file = $("#eeprom-bin")[0].files[0];
    let eepromr = new FileReader();
    eepromr.addEventListener('load', function(e) {
        let binary = e.target.result;
        zealcom.eeprom.loadFile(binary);
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

function switchToAdvancedMode(error) {
    popout.error("Could not fetch remote data, switched to advanced mode");
    console.error(error);
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

/*
    Only for debug, I don't hold all of the copyright of the
    prebuild images in this index and I'm not sure they are safe     --Jason
*/
// const prebuilt_json_url = "https://jasonmo1.github.io/ZOS-Index-demo/index.json"

/* Process the index JSON object that contains all the ROMs available */
function processIndex(index) {
    const to_option = entry => `<option value="${entry.urls}" data-version="${entry.version}" data-hash="${entry.hash}">${entry.name}</option>`;

    /* Generate an HTML option out of each entry */
    const latest  = to_option(index.latest);
    const nightly = index.nightly.map(to_option);
    const stable  = index.stable.map(to_option);

    const all_options =
    `<option value="">Choose an image...</option>` +
    `<option value="" disabled>--- Latest ---</option>` +
    latest +
    `<option value="" disabled>--- Nightly ---</option>` +
    nightly.join("") +
    `<option value="" disabled>--- Stable ---</option>` +
    stable.join("");


    $("#romchoice").html(all_options);
}

/* Fetch the remote JSON file, and pass the content to the previous function */
if (!advancedMode) {
    fetch(prebuilt_json_url)
        .then(response => response.json())
        .then(response => processIndex(response))
        .catch(switchToAdvancedMode);
}

function resetRom() {
    rom_chosen = false;
    /* Reset all the file inputs */
    $("#romfile [type=file]").val("");
    /* Remove the ticks from the ready list */
    $(".status").removeClass("ready");
    $("#romchoice").each(function(){
        $(this).find("option").eq(0).prop("selected",true)
    });
}

var rom_chosen = false;
var index_src;
/**
 * Add a listener to the romchoice list, load the ROM when selected
 */
$("#romchoice").on("change", async function() {
    if (rom_chosen === true) {
        let cover = window.confirm("This will cover the current image, Confirm?");
        if (cover == false) {
            $("#romchoice").find("option").eq(index_src).prop("selected",true);
            return;
        }
        else {
            zealcom.restart(reset_rom_selected=false);
        }
    }
    rom_chosen = true;
    index_src = $("#romchoice").get(0).selectedIndex;
    /* Get the URL of the current choice */
    let url = $(this).val();
    /* Get the hash for the current binary */
    let hash = $('#romchoice option:selected').data("hash");

    if (!url) {
        return;
    }

    $("#loading_img").visible();

    try {
        let data = await readBlobFromUrl(url);
        let hashcomp = await filehash(data, hash);
        if (hashcomp == true) {
            load_bin(data);
        }
        $("#loading_img").invisible();
        zealcom.cont();
    }
    catch (error) {
        switchToAdvancedMode(error);
    }
});