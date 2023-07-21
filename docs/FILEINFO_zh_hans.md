<!--
    /**
    * SPDX-FileCopyrightText: 2023 JasonMo <jasonmo2009@hotmail.com>
    *
    * SPDX-License-Identifier: Apache-2.0
    */
    Version: 0.0.1,
    Author: JasonMo
    Last modified: 2023/07/21 9:16,
    Last commit: "Project: Reconstitution, delete useless files",
-->
# 文件信息

<p align="center">
    <a href="FILEINFO.md">English</a> | 简体中文
</p>

本文档用于解释Zeal-WebEmulator中各种目录和文件的含义

目录树：

```tree
Zeal-WebEmulator:.
│  .gitignore
│  forge.config.js
│  index.html
│  index.js
│  LICENSE
│  package.json
│  preload.js
│  README.md
│  yarn-error.log
│  yarn.lock
│
├─component
│  │  jquery-3.6.0.min.js
│  │
│  ├─crypto
│  │      sha256.js
│  │
│  ├─disassembler
│  │      disassembler.js
│  │
│  └─xterm
│          xterm.css
│          xterm.js
│          xterm.js.map
│
├─docs
│      FILEINFO.md
│      README.md
│      README_zh_hans.md
│
├─frontend
│  │  breakpoint.js
│  │  init.js
│  │  menus.js
│  │  misc.js
│  │  panel.js
│  │  readrom.js
│  │  utils.js
│  │
│  ├─css
│  │      emulator.css
│  │
│  └─fonts
│          CascadiaCode.ttf
│
├─hardemu
│      characters.js
│      i2c.js
│      keyboard.js
│      mmu.js
│      pio.js
│      ram.js
│      rom.js
│      screen.js
│      uart.js
│      Z80.js
│
├─imgs
│  │  continue.png
│  │  down-arrow.png
│  │  restart.png
│  │  right-arrow.png
│  │  screenshot.png
│  │  screenshotold.png
│  │  step.png
│  │  stepout.png
│  │  stepover.png
│  │  stop.png
│  │  zeal.ico
│  │
│  └─installer
│          header.bmp
│          license.txt
│          zeal.ico
│          zeal.png
│          zealhighdpi.ico
│          zealhighdpi.png
│
└─manifests
    └─z
        └─Zeal8bit
            └─Zeal-WebEmulator
                └─0.1.0
                        Zeal8bit.Zeal-WebEmulator.installer.yaml
                        Zeal8bit.Zeal-WebEmulator.locale.en-US.yaml
                        Zeal8bit.Zeal-WebEmulator.yaml
```

## 根目录

* .gitignore
选择将被git忽略的文件
* forge.config.js
Electron的配置文件
* index.html
模拟器的主 GUI
* index.js
初始化electron窗口
* LICENSE
Apache v2.0
* package.json
配置文件用于描述脚本、依赖项和发布配置
* preload.js
index.js的一部分
* README.md
自述文件（English）

### component

此目录是存储模拟器所需组件的位置

* jquery-3.6.0.min.js
这是一个著名的JavaScript库，它可以节省很多开发时间

#### crypto

此组件来自存储库 [crypto.js](https://github.com/brix/crypto-js)

* SHA256.js
它用于验证文件的哈希值

#### disassembler

此组件来自feature/add_disassembler分支。现在还不完善，如果你有什么想法，请自行改善或为我们贡献您的代码。

* disassembler.js
它用于反汇编Z80 CPU的操作码

#### xterm

此组件来自存储库 [xterm.js](https://github.com/xtermjs/xterm.js)

* xterm.css
* xterm.js
* xterm.js.map
这些文件用于实现Web终端

### docs

此文件夹包含项目的文档

* README_zh_hans.md
自述文件（简体中文）

* FILEINFO.md
文件信息（English）

* FILEINFO_zh_hans.md
文件信息（简体中文）

### frontend

此目录包含用于实现图形交互的程序

* breakpoint.js
用于实现程序调试器
* init.js
初始化硬件仿真和 zos index
* menus.js
实现菜单栏的交互逻辑
* misc.js
包括一些未知功能的前端代码
* panel.js
实现左/右面板的交互逻辑
* readrom.js
读取用户输入的 ROM 和 EEPROM
* utils.js
提取出的常用函数

#### css

用于实现 GUI 界面的 Css 文件

* emulator.css
用于实现模拟器的GUI界面

#### fonts

包含模拟器中使用的字体

* CascadiaCode.ttf
Truetype 字体 `Cascadia Code`

### hardemu

模拟 Zeal 8 位计算机的硬件

* characters.js
英语字形的实现
* i2c.js
在 Zeal 8 位计算机中模拟 I2C
* keyboard.js
在 Zeal 8 位计算机中将你的键盘模拟为ps2键盘
* mmu.js
在 Zeal 8 位计算机中模拟 MMU
* pio.js
在 Zeal 8 位计算机中模拟 PIO
* ram.js
在 Zeal 8 位计算机中模拟 RAM
* rom.js
在 Zeal 8 位计算机中模拟 ROM
* screen.js
在 Zeal 8 位计算机中模拟屏幕
* uart.js
在 Zeal 8 位计算机中模拟 uart
* Z80.js
在 Zeal 8 位计算机中模拟 Z80 CPU

### imgs

用于安装包、文档等的图片

### manifests

用于上传 winget-pkgs 的winget配置文件
