/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>; Jason Mo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function loadToDevice(dev, loadfile_external_params=[], callback){
    let reader = new FileReader();
    $(reader).on('load', function(e) {
        let binary = e.target.result;
        let load_returns = dev.loadFile(binary, ...loadfile_external_params);
        callback(load_returns);
    });
    return reader;
}

function loadRom(file_rom) {
    /* Read the rom file */
    if (file_rom) {
        loadToDevice(zealcom.rom, [], () => {
            $("#romready").addClass("ready");
        }).readAsBinaryString(file_rom);
    }
}

function loadMap(file_map) {
    /* If a dump/map file was provided, try to load it */
    if (file_map) {
        loadToDevice(disassembler, [], (success) => {
            if (success) {
                /* symbols are ready! */
                $("#symready").addClass("ready");
            }
            else {
                popup.error("Error while loading map file");
            }
        }).readAsText(file_map);
    }    
}

function loadEEPROM(file_eeprom) {
    /* Read the EEPROM image */
    if (file_eeprom) {
        loadToDevice(zealcom.eeprom, [], () => {
            $("#eepromready").addClass("ready");
        }).readAsBinaryString(file_eeprom);
    }
}

function loadCf(file_cf) {
    /** Read the Compact Flash image */
    if (file_cf) {
        loadToDevice(zealcom.compactflash, [], () => {
            $("#cfready").addClass("ready");
        }).readAsBinaryString(file_cf);
    }
}

function loadRam(file_ram, offset) {
    /* Read the rom file */
    if (file_ram) {
        loadToDevice(zealcom.ram, [offset], () => {}).readAsBinaryString(file_ram);
    }
}

$("#read-button").on('click', function() {
    loadRom($("#file-rom")[0].files[0]);
    loadMap($("#file-map")[0].files[0]);
    loadEEPROM($("#file-eeprom")[0].files[0]);
    loadCf($("#file-cf")[0].files[0]);
    zealcom.cont();
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

var fetch_counter = 0;
function switchToAdvancedMode(error) {
    popout.error("Could not fetch remote data, trying again");
    console.error(error);
    if (fetch_counter >= 3) {
        popout.error("Could not fetch remote data, swich to advanced mode");
        /* Show file uploaders */
        $("#romfile").show(250);
        $("#romchoice").html("<option value=''>Click here to try again</option>");
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
    // TODO: use roms/index.json
const prebuilt_json_url_host = "https://zeal8bit.com";
const prebuilt_json_url_path = "/roms/index.json";

function fetchIndex() {
    fetch(prebuilt_json_url_host + prebuilt_json_url_path)
        .then(response => response.json())
        .then(response => processIndex(response))
        .catch(() => {
            fetch(prebuilt_json_url_path)
            .then(response => response.json())
            .then(response => processIndex(response))
            .catch(switchToAdvancedMode);
        });
}

/* Process the index JSON object that contains all the ROMs available */
function processIndex(index) {
    const to_option = (entry) => `<option value="${entry.urls}" data-version="${entry.version}" data-hash="${entry.hash}">${entry.name}</option>`;

    /* Generate an HTML option out of each entry */
    const latest  = to_option(index.latest);
    const nightly = index.nightly.map(to_option);
    const stable  = index.stable.map(to_option);

    const all_options =
    `<option value="">Choose an image...</option>` +
    `<optgroup label="--- Latest ---" data-type="latest">` + latest + `</optgroup>` +
    `<optgroup label="--- Nightly ---"  data-type="nightly">` + nightly.join("") + `</optgroup>` +
    `<optgroup label="--- Stable ---"  data-type="stable">` + stable.join("") + `</optgroup>`;


    $("#romchoice").html(all_options);
}

/* Fetch the remote JSON file, and pass the content to the previous function */
if (!advancedMode) {
    fetchIndex();
}

function resetRom() {
    rom_loaded = false;
    /* Reset all the file inputs */
    $("#romfile [type=file]").val("");
    /* Remove the ticks from the ready list */
    $(".status").removeClass("ready");
    $("#romchoice").each(function(){
        $(this).find("option").eq(0).prop("selected",true)
    });
}

// TODO: add a `loaded` attribute for every devices
var rom_loaded = false;
var index_src;
/**
 * Add a listener to the romchoice list, load the ROM when selected
 */
$("#romchoice").on("change", async function() {
    if (rom_loaded === true) {
        let cover = window.confirm("This will restart the machine emulation, continue?");
        if (cover == false) {
            $("#romchoice").find("option").eq(index_src).prop("selected",true);
            return;
        }
        else {
            zealcom.restart(reset_rom_selected=false);
        }
    }
    rom_loaded = true;
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
        $("#loading_img").invisible();
        rom_loaded = false;
        popout.error("Error while fetching the image");
        $("#romchoice").html("<option value=''>Choose an image...</option>");
    }
});

const params = parseQueryParams(window.location.search);
setTimeout(() => {
    console.log('params', params);
    if(params.r) {
        if(params.r == 'latest') {
            params.r = $('#romchoice optgroup[data-type=latest] option:first-child').val();
        }
        if(params.r == 'nightly') {
            params.r = $('#romchoice optgroup[data-type=nightly] option:last-child').val();
        }
        console.log('pre-built rom', params.r);
        $('#romchoice').val(params.r).trigger('change');
    }
}, 250);

// electron
if (typeof electronAPI != 'undefined') {
    electronAPI.on("rom", (data) => {
        loadRom(array_to_blob(data));
        rom_loaded = true;
        zealcom.cont();
    });
    electronAPI.on("map", (data) => {
        loadMap(array_to_blob(data));
    });
    electronAPI.on("eeprom", (data) => {
        loadEEPROM(array_to_blob(data));
    });
    electronAPI.on("cf", (data) => {
        loadCf(array_to_blob(data));
    });
}

