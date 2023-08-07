var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: "text/x-z80",
    mode: "text/x-csrc",
    matchBrackets: true,
    lineNumbers: true,
    theme: "darcula",
    lineWrapping: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    styleActiveLine: true,
    autoRefresh:true,
    extraKeys:{"Ctrl-Space":"autocomplete"}
});

editor.refresh();

function saveCodeAsFile(progname) {
    var textToWrite = editor.getValue();
    var textFileAsBlob = new Blob([textToWrite], {
        type: "text/plain;charset=utf-8"
    });
    var downloadLink = $("<a></a>");
    downloadLink.attr("download", progname);
    downloadLink.text("Download File");
    if (window.webkitURL != null) {
        downloadLink.attr("href", window.webkitURL.createObjectURL(textFileAsBlob));
    } else {
        downloadLink.attr("href", window.URL.createObjectURL(textFileAsBlob));
        downloadLink.on("click", function(event) {
            $(this).remove();
        });
        downloadLink.css("display", "none");
        $("body").append(downloadLink);
    }
    downloadLink[0].click();
}

function getprogname() {
    let progname = "myprogram.asm";
    let input = $("#progname").val();
    if ((input != "") && (input != undefined)) {
        progname = input;
    }
    return progname;
}

function save() {
    var text = editor.getValue();
    localStorage.setItem("code", text);
}

function clear() {
    editor.setValue("");
    localStorage.removeItem("code");
}

function asmcode(mode) {
    /*
        Compile modes:
        - 1         Make SNA binary
        - 2         Make TAP binary
        - 3         Make BIN binary(ZOS use this type of binaries)
        - 4         Return Array of BIN binary
        - "debug"   Log compile result on the console
    */
    let value = localStorage.getItem("code");
    let namesplit = getprogname().split(".");
    let filename = namesplit[0];
    if ((value != null) && (value != undefined)) {
        let binary;
        switch(mode) {
            case 1:
                binary = assembler.compile(mode);
                mkdown(binary, filename+".sna");
                break;
            case 2:
                binary = assembler.compile(mode);
                mkdown(binary, filename+".tap");
                break;
            case 3:
                binary = assembler.compile(mode);
                mkdown(binary, filename+".bin");
                break;
            case 4:
                binary = assembler.compile(3);
                return binary;
            case "debug":
                binary = assembler.compile(mode);
                break;
            default:
                binary = assembler.compile(mode);
                return binary;
        }
    }
    else {
        showErrorPopup("Please save your program before assemble");
    }
}

function loadcode() {
    // Get binary Array
    let bin = asmcode(4);
    let binsize = bin.length;
    if (binsize > 16384) {
        showErrorPopup("Your binary is too big to load");
    }
    else {
        // Simulate input load command into terminal
        keyboard.key_pressed(0x4c);     // l
        keyboard.key_pressed(0x4f);     // o
        keyboard.key_pressed(0x41);     // a
        keyboard.key_pressed(0x44);     // d
        keyboard.key_pressed(32);       // (space)
        for (var i = 0; i < binsize.toString().length; i++) {
            keyboard.key_pressed(binsize.toString().charCodeAt(i));
        }
        keyboard.key_pressed(13);       // (enter)

        setTimeout(function() {
            uart.send_binary_array(bin);
        }, 10);
    }
}


$("#downasm").on("click", function() {
    saveCodeAsFile(getprogname());
});

$("#saveCodeAsFile").on("click", save);
$("#clearcode").on("click", clear);
$("#asmcode").on("click", function() {
    asmcode(3);
});

$("#loadcode").on("click", loadcode);

$(document).ready(function() {
    var text = localStorage.getItem("code");
    if (text) {
        editor.setValue(text);
    }
});