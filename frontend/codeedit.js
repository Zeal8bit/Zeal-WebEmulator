var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: "text/x-z80",
    mode: "text/x-csrc",
    matchBrackets: true,	//括号匹配
    lineNumbers: true,	//显示行号
    theme: "darcula",	//设置主题
    lineWrapping: true,	//代码折叠
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    styleActiveLine: true,
    autoRefresh:true,
    extraKeys:{"Ctrl-Space":"autocomplete"}//ctrl-space唤起智能提示
});

editor.refresh();

// 定义一个保存文件的函数
function saveTextAsFile(progname) {
    // 获取CodeMirror中的文本内容
    var textToWrite = editor.getValue();
    // 把文本内容转换成一个Blob对象
    var textFileAsBlob = new Blob([textToWrite], {
        type: "text/plain;charset=utf-8"
    });
    // 创建一个<a>元素作为下载链接
    var downloadLink = $("<a></a>");
    // 设置下载链接的属性
    downloadLink.attr("download", progname);
    downloadLink.text("Download File");
    // 根据浏览器类型，设置下载链接的href属性
    if (window.webkitURL != null) {
        // Chrome允许直接点击链接，不需要添加到DOM中
        downloadLink.attr("href", window.webkitURL.createObjectURL(textFileAsBlob));
    } else {
        // Firefox需要把链接添加到DOM中才能点击
        downloadLink.attr("href", window.URL.createObjectURL(textFileAsBlob));
        downloadLink.on("click", function(event) {
            $(this).remove();
        });
        downloadLink.css("display", "none");
        $("body").append(downloadLink);
    }
    // 触发下载链接的点击事件
    downloadLink[0].click();
}

function getprogname() {
    let progname = "myprogram.asm";
    // 获取文本框中的值
    let input = $("#progname").val();
    // 判断文本框中的值是否为空或未定义
    if ((input != "") && (input != undefined)) {
        // 如果有值，就把它赋给progname变量
        progname = input;
    }
    return progname;
}

function save() {
    // 获取编辑器中的文本内容
    var text = editor.getValue();
    // 把文本内容保存到本地存储中，使用"code"作为键名
    localStorage.setItem("code", text);
}

function clear() {
    // 把编辑器中的文本内容设置为空字符串
    editor.setValue("");
    // 把本地存储中的文本内容也清空，使用"code"作为键名
    localStorage.removeItem("code");
}

function asmcode() {
    let value = localStorage.getItem("code");
    if ((value != null) && (value != undefined)) {
        compile(3);
    }
    else {
        window.alert("Please save your program before assemble");
    }
}

// 使用jQuery选择器获取id为downasm的按钮，并绑定点击事件处理函数
$("#downasm").on("click", function() {
    saveTextAsFile(getprogname());
});

// 使用jQuery选择器获取id为save和clear的按钮，并绑定点击事件处理函数
$("#savecode").on("click", save);
$("#clearcode").on("click", clear);
$("#asmcode").on("click", asmcode);

$(document).ready(function() {
    // var workspace = localStorage.getItem("zeal-workspace");

    // if (value == null) {
    //     workspace = new Array();
    //     workspace.push("")
    //     localStorage.setItem("zeal-workspace", text);
    // }
    // else if (value == undefined) {

    // }
    // 获取本地存储中的文本内容，使用"code"作为键名
    var text = localStorage.getItem("code");
    // 如果有值，就把文本内容设置到编辑器中
    if (text) {
        editor.setValue(text);
    }
});