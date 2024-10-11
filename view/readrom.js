/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>; Jason Mo <jasonmo2009@hotmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function loadToDevice(dev, loadfile_external_params=[], callback){
    let reader = new FileReader();
    $(reader).on('load', function(e) {
        const binary = e.target.result;
        const data = new Uint8Array(binary);
        const load_returns = dev.loadFile(data, ...loadfile_external_params);
        callback(load_returns);
    });
    return reader;
}

function loadRom(file_rom) {
    /* Read the rom file */
    if (!file_rom) return;
    loadToDevice(zealcom.rom, [], () => {
        $("#romready").addClass("ready");
    }).readAsArrayBuffer(file_rom);
}

function loadMap(file_map) {
    /* If a dump/map file was provided, try to load it */
    if (!file_map) return;
    loadToDevice(disassembler, [], (success) => {
        if (success) {
            /* symbols are ready! */
            $("#symready").addClass("ready");
        }
        else {
            popup.error("Error while loading map file");
        }
    }).readAsArrayBuffer(file_map);
}

function loadEEPROM(file_eeprom) {
    /* Read the EEPROM image */
    if (!file_eeprom) return;
    loadToDevice(zealcom.eeprom, [], () => {
        $("#eepromready").addClass("ready");
    }).readAsArrayBuffer(file_eeprom);
}

function loadCf(file_cf) {
    /** Read the Compact Flash image */
    if (!file_cf) return;
    loadToDevice(zealcom.compactflash, [], () => {
        $("#cfready").addClass("ready");
    }).readAsArrayBuffer(file_cf);
}

function loadRam(file_ram, offset) {
    /* Read the rom file */
    if (file_ram) {
        loadToDevice(zealcom.ram, [offset], () => {}).readAsArrayBuffer(file_ram);
    }
}

$("#read-button").on('click', function() {
    loadRom($("#file-rom")[0].files[0]);
    loadMap($("#file-map")[0].files[0]);
    loadEEPROM($("#file-eeprom")[0].files[0]);
    loadCf($("#file-cf")[0].files[0]);
    $("#continue").click();
});

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
    const to_option = (entry,selected=false) => {
        const attrs = {
            value: entry.urls,
            hash: entry.hash,
        };

        if(selected) {
            attrs.selected = true;
        }
        const attributes = Object.keys(attrs).reduce((acc,key) => {
            acc += ` ${key}`;
            if(!['selected', 'disabled'].includes(key) && attrs[key]) {
                acc += `="${attrs[key]}" `;
            }
            return acc;
        }, '');

        return `<option ${attributes}>${entry.name}</option>`;
    };

    /* Generate an HTML option out of each entry */
    let all_options = [
        `<option value="">Choose an image...</option>`,
    ];
    if(index.latest) {
        const latest  = to_option(index.latest, index.latest.urls == params.r || params.r == 'latest');
        all_options.push(`<optgroup label="--- Latest ---" data-type="latest">` + latest + `</optgroup>`);
    }
    if(index.nightly) {
        const nightly = index.nightly.reverse().map((entry, index) => {
            if((params.r == entry.urls) || (params.r == 'nightly' && index == 0)) {
                return to_option(entry, true);
            }
            return to_option(entry, false);
        });
        all_options.push(`<optgroup label="--- Nightly ---"  data-type="nightly">` + nightly.join("") + `</optgroup>`);
    }
    if(index.stable) {
        const stable  = index.stable.map((entry) => {
            return to_option(entry, (params.r == entry.urls));
        });
        all_options.push(`<optgroup label="--- Stable ---"  data-type="stable">` + stable.join("") + `</optgroup>`);
    }

    $("#romchoice").html(all_options.join("\n"));
    $("#romchoice").on("change", switchRom);
    if(params.r && $("#romchoice").find(":selected").length ) {
        $('#romchoice').trigger('change');
    }
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

var rom_chosen = false;
/**
 * Add a listener to the romchoice list, load the ROM when selected
 */
async function switchRom() {
    const reload = rom_chosen !== false;
    if(reload) {
        let cover = window.confirm("This will cover the current image, Confirm?");
        if(!cover) {
            $('#romchoice').val(rom_chosen);
            return;
        }
    }
    /* Get the URL of the current choice */
    rom_chosen = $(this).val();
    let compare = false;
    if(params.r == 'latest') {
        compare = $('#romchoice optgroup[data-type=latest] option:first-child').val();
    }
    if(params.r == 'nightly') {
        compare = $('#romchoice optgroup[data-type=nightly] option:first-child').val();
    }

    if (!rom_chosen) {
        return;
    }
    if(rom_chosen !== compare) {
        params.r = rom_chosen;
        window.history.pushState({}, undefined, `?${Object.keys(params).reduce((a,k) => {
            return a += `${k}=${params[k]}&`;
        }, '').slice(0,-1)}`);
        if(reload) {
            window.location.reload();
            return;
        }
    }

    try {
        $("#loading_img").visible();
        /* Get the hash for the current binary */
        let hash = $(`#romchoice option[value="${rom_chosen}"]`).attr("hash");
        let data = await readBlobFromUrl(rom_chosen);
        let hashcomp = params.local ? true : await filehash(data, hash);
        if (hashcomp == true) {
            loadRom(data);
        }
        $("#continue").click();
        $("#loading_img").invisible();
    }
    catch (error) {
        $("#loading_img").invisible();
        rom_loaded = false;
        popout.error("Error while fetching the image");
        $("#romchoice").html("<option value=''>Choose an image...</option>");
    }
};

jQuery(() => {
    if (params.advanced) {
        /**
         * Manage the "advanced" link that shows all the files uploader
         * If the URL has "advanced" parameters, show these uploaders directly
         */
        $("#romload").hide();
        $("#romfile").show();
        return;
    }

    /**
     * Manage the pre-built ROMs list. Available ROMs will be fetched from a remote JSON file that contains
     * names and links to all of the available ROMs, the first one will always be the default.
     */
    const prebuilt_json_url_host = params.local ? '' : "https://zeal8bit.com";
    const prebuilt_json_url_path = "/roms/index.json";
    /* Fetch the remote JSON file, and pass the content to the previous function */
    fetch(prebuilt_json_url_host + prebuilt_json_url_path)
        .then(response => response.json())
        .then(response => processIndex(response))
        .catch(() => {
            fetch(prebuilt_json_url_path)
            .then(response => response.json())
            .then(response => processIndex(response))
            .catch(switchToAdvancedMode);
        })
        .then(() => {
            const promises = [];
            if(params.cf) {
                promises.push(
                    fetch(params.cf)
                    .then((response) => response.blob())
                    .then((blob) => {
                        loadCf(blob);
                    })
                );
            }
            if(params.m) {
                promises.push(
                    fetch(params.m)
                        .then((response) => response.blob())
                        .then((blob) => {
                            loadMap(blob);
                        })
                );
            }
            if(params.e) {
                promises.push(
                    fetch(params.e)
                        .then((response) => response.blob())
                        .then((blob) => {
                            loadEEPROM(blob);
                        })
                );
            }
            return Promise.all(promises);
        });
});

// electron
if (typeof electronAPI != 'undefined') {
    electronAPI.on('load-advanced', (data) => {
        if(!data.hideAdvanced) {
            $('#romfile').show();
        }
        $('#read-button').trigger('click');
    });
}