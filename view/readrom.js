/**
 * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 
 * @param {*} dev 
 * @param {*} file 
 * @param {*} reader_method 
 * @param {*} callback 
 * @param {*} external_params 
 * You can use variable `load_returns` to get the return value of `dev.loadFile`.
 */
function loadToDevice(dev, file, reader_method, loadfile_external_params=[], callback){
    let reader = new FileReader();
    $(reader).on('load', function(e) {
        let binary = e.target.result;
        console.log(dev?.isNew);
        let load_returns = dev.loadFile(binary, ...loadfile_external_params);
        callback(load_returns);
    });
    if (file) {
        reader[reader_method](file);
    }
}

function loadRom(file_rom) {
    /* Read the rom file */
    if (file_rom) {
        loadToDevice(zealcom.rom, file_rom, "readAsBinaryString", [], () => {
            $("#romready").addClass("ready");
        });    
    }
}

function loadMap(file_map) {
    /* If a dump/map file was provided, try to load it */
    if (file_map) {
        loadToDevice(disassembler, file_map, "readAsText", [], (success) => {
            if (success) {
                /* symbols are ready! */
                $("#symready").addClass("ready");
            }
            else {
                popup.error("Error while loading map file");
            }
        });
    }    
}

function loadEEPROM(file_eeprom) {
    /* Read the EEPROM image */
    if (file_eeprom) {
        loadToDevice(zealcom.eeprom, file_eeprom, "readAsBinaryString", [], () => {
            $("#eepromready").addClass("ready");
        });
    }
}

function loadCf(file_cf) {
    /** Read the Compact Flash image */
    if (file_cf) {
        loadToDevice(zealcom.compactflash, file_cf, "readAsBinaryString", [], () => {
            $("#cfready").addClass("ready");
        });
    }
}

$("#read-button").on('click', function() {
    loadRom($("#file-rom")[0].files[0]);
    loadMap($("#file-map")[0].files[0]);
    loadEEPROM($("#file-eeprom")[0].files[0]);
    loadCf($("#file-cf")[0].files[0]);
});

/**
 * Manage the "advanced" link that shows all the files uploader
 * If the URL has "advanced" parameters, show these uploaders directly
 */

const urlGetParam = new URLSearchParams(window.location.search);
var advancedMode = urlGetParam.get("advanced") === "true";

if (advancedMode) {
    // $("#romload").hide();
    $("#romfile").show();
}

$("#romadvanced a").click(() => {
    $("#romfile").toggle(500);
});

var fetch_counter = 0;
function switchToAdvancedMode(error) {
    popout.error("Could not fetch remote data, trying again");
    console.error(error);
    if (fetch_counter >= 3) {
        popout.error("Could not fetch remote data, swich to advanced mode");
        /* Show file uploaders */
        $("#romfile").show(250);
        $("#romchoice").html("<option value=''>Click to try again</option>");
        $("#romchoice").on("focus", fetchIndex);
        fetch_counter = 0;
    }
    else {
        setTimeout(() => {
            fetchIndex();
        }, 4000);
        fetch_counter += 1;
    }
}

/**
 * Manage the pre-built ROMs list. Available ROMs will be fetched from a remote JSON file that contains
 * names and links to all of the available ROMs, the first one will always be the default.
 */

var prebuilt_json_url = "https://zeal8bit.com/roms/index.json";

/*
    Only for debug    --Jason
*/
// prebuilt_json_url = "https://jasonmo1.github.io/ZOS-Index-demo/index.json"

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
    fetchIndex();
}

function fetchIndex() {
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
        let cover = window.confirm("This will restart the machine emulation, continue?");
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
            loadRom(data);
        }
        $("#loading_img").invisible();
        zealcom.cont();
    }
    catch (error) {
        switchToAdvancedMode(error);
    }
});