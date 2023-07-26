<!--
    /**
    * SPDX-FileCopyrightText: 2022 Zeal 8-bit Computer <contact@zeal8bit.com>
    *
    * SPDX-License-Identifier: Apache-2.0
    */
    Version: 0.0.1,
    Author: Zeal 8-bit Computer
    Translator: JasonMo
    Last modified: 2023/07/21 8:16,
    Last commit: "Project: Reconstitution, delete useless files",
-->

<h1 align="center">Zeal 8-bit Computer emulator</h1>
<p align=center>
    <img src="../imgs/screenshot.png" alt="screenshot" />
    <a href="https://opensource.org/licenses/Apache-2.0">
        <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="Licence" />
    </a>
</p>

<p align="center">
    <a href="../README.md">English</a> | 简体中文
</p>

该项目是Zeal 8位计算机的软件模拟器（Zeal 8位计算机是基于Z80 CPU的自制8位计算机）。

[点击这里访问在线版模拟器](https://zeal8bit.github.io/Zeal-WebEmulator/)

## 这个项目的用意在何处？

该项目的目标是实现与真实机器完全相同的模拟器，以便能够直接从主机执行并**调试**为Zeal 8位计算机编写的程序，而无需手动写入任何EEPROM或NOR闪存。这使得开发和测试周期更加便捷。

## 为什么将它做成一个网页模拟器？（HTML/CSS/JavaScript）

主要目标是将此模拟器集成为 [zeal8bit.com](https://zeal8bit.com)的一部分。因此，选择HTML/CSS和Javascript在这方面优势明显。

另一方面，该项目的另一个目标是让任何人在任何平台（Linux / Windows / Mac OS X）上为Zeal 8位计算机测试或编写程序，而无需安装工具链。

该模拟器已在Opera，Google Chrome和Microsoft Edge上进行了测试。

## 性能如何？

模拟器比实际硬件慢，即使实际硬件使用的是运行频率为 10MHz 的 Z80。这是由于Javascript本身和Web浏览器本身的开销。但正如我上面所说，它的主要功能是**调试**程序，为此，毫无疑问它是合格的。

此外，模拟器在时间方面并不准确，更多详细信息如下，在*功能*部分中。

用 **C语言** （w/ SDL） 编写原生仿真器将会更快，这在计时方面会更准确。但是，这需要一些时间投入。如果您对此类项目感兴趣，请随时与我联系或做出贡献。

## 如何使用模拟器？

为您提供了几种选择：

* 使用模拟器的实时版本：[模拟器的实时版本](https://zeal8bit.github.io/Zeal-WebEmulator/)。您将使用模拟器而无需安装任何其他东西。
* 克隆此存储库并使用网络浏览器打开 `index.html`（首选 Google Chrome 或 Opera）。
* 使用 electron 从此存储库创建一个应用程序。更多详情如下。

### 如何使用electron？

#### 安装依赖项

首先，您需要克隆此当前存储库，然后使用包管理器安装程序依赖项。如果您使用的是 `yarn`，请使用以下命令：

```bash
cd /path/to/Zeal-WebEmulator
yarn install
```

如果您使用的是 `npm`，则命令如下：

```bash
cd /path/to/Zeal-WebEmulator
npm install
```

如果您遇到了任何问题，您可以在[electron forge官方网站](https://www.electronforge.io/import-existing-project)上找到更多信息。

#### 运行

在依赖项安装完成之后，你可以使用

```bash
yarn start
```

或

```bash
npm start
```

命令来启动你的模拟器。

#### 发布

目前支持的架构：

`win` `win64` `linux`

npm：

```bash
npm run dist-<arch>
```

yarn：

```bash
yarn dist-<arch>
```

例如，如果要为 Windows-x64 生成完整程序及安装包，请运行以下命令：

```bash
npm run dist-win64
```

或：

```bash
yarn dist-win64
```

## 目前支持的功能

目前，模拟了Zeal 8位计算机的以下功能：

* Z80 CPU（[感谢*Molly Howell*](https://github.com/DrGoldfire/Z80.js)）
* Z80 PIO：支持所有模式，包括端口 A 和 B。实现了独立于连接的设备。
* 22 位 MMU
* 256KB 只读存储器
* 512KB 内存视频芯片：拥有640x480带颜色文本模式及640x480带颜色图形模式
* 带中断的PS/2 键盘
* UART：可以发送和接收字节。也可以发送文件。波特率可以从 GUI 更改
* I2C：总线仿真，支持读/写/读写操作
* I2C RTC：始终返回当前日期
* I2C EEPROM：仿真24C512，因此硬编码为64KB EEPROM。内容可以通过 GUI 加载。

模拟器本身实现的功能：

* 调试器：断点、单步执行、单步执行指令、继续直到下一个断点
* 加载二进制文件，直接加载到ROM
* 加载从“z88dk-dis”生成的转储文件，在进行分步调试的同时查看汇编代码
* 使用**十六进制**PC地址或符号（来自转储文件）设置断点
* 在进行分步调试时查看内存内容
* UART 视图的专用选项卡

## 待办

在模拟器端，要执行的其余任务是：

* I2C RTC 设置日期。目前，它始终返回当前浏览器日期，因此写入它不会产生任何改变。
* 声音支持¹
* SD 卡仿真¹
* 视频芯片：320x240文本模式，320x240图形模式¹，精灵图¹，4位调色板¹等...

¹：优先级**较低**的功能，因为它们尚未在实际硬件上实现。

* 调试器按钮的更好界面，带有一些快捷方式
* 解析断点输入的更好方法。一个已知的错误是，提供以十六进制字母开头的标签将被解释为 PC 值而不是标签。例如，输入 *date_routine* 作为要中断的标签将导致在地址 0xda 处添加断点，而不是标签 *date_routine* 的地址（因为 *date* 以十六进制字母 *da* 开头）

## 为项目做出贡献

任何人都可以为这个项目做出贡献，欢迎贡献者们！

按您的意愿修复您遇到的任何错误，实现待办列表中存在的任何功能或您认为有用或重要的新功能。

贡献流程：

* 分叉项目
* 创建您的功能分支（*可选*）
* 提交您的更改。请制作清晰简洁的提交消息 （*）
* 推送到分支
* 打开拉取请求

(*) 下面是一个正确的提交示例：
(*) 译者注：提交，议题及拉取请求消息请用英文

```example
Module: add/fix/remove a from b

Explanation on what/how/why
```

例如：

```example
Video chip: implement 320x240 text-mode

It is now possible to switch to 320x240 text-mode and display text.
```

## 许可证

`Z80.js` 在MIT licence下取得许可 (源自Molly Howell的存储库：[Z80.js](https://github.com/DrGoldfire/Z80.js))

所有其他文件都在 Apache 2.0 许可证下分发。有关详细信息，请参阅“许可证”文件。

您可以自由地将其用于个人和商业用途，但不得删除每个文件中存在的样板。

# 联系方式

如有任何建议或要求，您可以通过 `contact@zeal8bit.com`与我联系

对于功能请求，还可以打开议题或拉取请求。
