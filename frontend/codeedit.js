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
function saveTextAsFile(progname="myprogram.asm") {
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

// 使用jQuery选择器获取id为downasm的按钮，并绑定点击事件处理函数
$("#downasm").on("click", function() {
    let progname = $("#progname").val();
    if ((progname != "") && (progname != undefined)) {
        saveTextAsFile(progname);
    } else {
        saveTextAsFile();
    }
});