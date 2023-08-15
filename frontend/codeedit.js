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
    var downloadLink = $("<a></a>");
    downloadLink.attr("download", progname);
    downloadLink.attr("href", "data:text/plain;charset=utf-8," + encodeURIComponent(textToWrite));
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

function _loadcode() {
    // Get binary Array
    let bin = assembler.compile(3);
    let binsize = bin.length;
    if (binsize > 16384) {
        showErrorPopup("Your binary is too big to load");
    }
    else {
        // Simulate input load command into terminal
        keyboard.key_pressed(76);     // l
        keyboard.key_pressed(79);     // o
        keyboard.key_pressed(65);     // a
        keyboard.key_pressed(68);     // d
        keyboard.key_pressed(32);       // (space)
        for (var i = 0; i < binsize.toString().length; i++) {
            keyboard.key_pressed(binsize.toString().charCodeAt(i));     // The length of the program
        }
        keyboard.key_pressed(13);       // (enter)

        setTimeout(function() {
            uart.send_binary_array(bin);
        }, 10);
    }
}

function loadcode() {
    let bin = assembler.compile(3);
    let binsize = bin.length;
    if (binsize > 16384) {
        showErrorPopup("Your binary is too big to load");
    }
    else {
        // Use \r (ascii 13) instead of \n (ascii 10)
        keyboard.key_pressstr("LOAD " + binsize + "\r");
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
    assembler.compile(0);
});

$("#loadcode").on("click", loadcode);

$(document).ready(function() {
    var text = localStorage.getItem("code");
    if (text) {
        editor.setValue(text);
    }
});