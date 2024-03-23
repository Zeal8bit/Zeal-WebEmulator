<h1 align="center">Zeal 8-bit Computer emulator</h1>
<p align=center>
    <img src="imgs/screenshot.png" alt="screenshot" />
    <a href="https://opensource.org/licenses/Apache-2.0">
        <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="Licence" />
    </a>
    <a href="https://space.bilibili.com/1042658991?spm_id_from=333.337.0.0">
        <img alt="bilibili" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.swo.moe%2Fstats%2Fbilibili%2F1042658991&query=count&color=282c34&label=bilibili&labelColor=FE7398&logo=bilibili&logoColor=white&logoSvg=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB2aWV3Qm94PSIwIDAgNTIgNTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPHBhdGggZD0iTTEuMzczNTIgMTcuMzUzMjJIOC4xMzUzMjNMMTcuMzUzMjIgMTYuNzUzMjF6IE0yLjEzNTMyIDMuMDAwMDJMMi4xMzUzMjIgMy4wMDAwMnoiLz48L3N2Zz4%3D)"/>
    </a>
</p>

<p align="center">
English | <a href="docs/README_zh_hans.md">简体中文</a>
</p>

This project is a software emulator for Zeal 8-bit Computer: a homebrew 8-bit computer based on a Z80 CPU.

[Click here for a live demo](https://zeal8bit.github.io/Zeal-WebEmulator/)

## Why this project?

The goal of this project is to reproduce the same behavior as the real machine, to be able to execute and **debug** the programs written for it directly from a host computer. As such, there is no need to flash any EEPROM or NOR Flash to test programs. This makes development and test cycles much faster and more convenient.

## Why a web-based emulator? (HTML/CSS/JavaScript)

The main goal is to integrate this emulator as part of [zeal8bit.com](https://zeal8bit.com) website. Thus, choosing HTML/CSS and Javascript was a bit obvious on this side.

On the other side, another goal of this project is also to let anybody test or write programs for Zeal 8-bit Computer on any platform (Linux/Windows/Mac OS X) without the need of a toolchain installed.

The emulator has been tested on Opera, Google Chrome and Microsoft Edge.

## What about performance then?

The emulator implementation should now reach the native Zeal 8-bit Computer speed: 10MHz CPU and 60FPS. However, performance also depend on your computer and browser performances, as well as the emulated program. For example, a program that makes extensive use of the all the available sprites at each frame may result in slower execution. This is due to the overhead of Javascript itself and the way HTML canvas are implemented. Keep in mind the main purpose of this emulator is **debugging** programs and for this, there is no doubt it is efficient.

Writing a native emulator in **C** (w/ SDL) would cover the requirement of a full-speed emulator even on lower-spec computers. However, this needs some time investment. Feel free to contact me (or contribute directly) if such a project interest you.

## How to start using the emulator?

Several choices are offered to you:

* Use the live version of the emulator: [live version of the emulator](https://zeal8bit.github.io/Zeal-WebEmulator/). This will let you use the emulator without the need to install anything
* Clone this repository and open the `index.html` page with a web browser: Chrome or Opera preferred.
* Create an application out of this repo by using electron. More details below.

### Get started with electron?

#### Install dependencies

First of all, you will need to clone this current repository, after that use a package manager to install dependencies. If you are using `yarn`, use the following commands:

```bash
cd /path/to/Zeal-WebEmulator
yarn install
```

If you are using `npm`, the commands are as follows:

```bash
cd /path/to/Zeal-WebEmulator
npm install
```

If you encounter any issues, you can find more information on [the official electron forge website](https://www.electronforge.io/import-existing-project).

#### Running

Once the dependencies are ready, it can be executed thanks to `yarn start` or `npm start` commands.

#### Compiling

Supported architectures are the following: `win`, `win64`, and `linux`.

Choose your architecture and replace it in either `npm run dist-<arch>` or `yarn dist-<arch>` commands to compile the project.


For example, if you want to build for Windows x64, run the following command:

```bash
npm run dist-win64
```

or:

```bash
yarn dist-win64
```

## Supported Features

Currently, the following features from Zeal 8-bit Computer are emulated:

* Z80 CPU ([thanks to *Molly Howell*](https://github.com/DrGoldfire/Z80.js))
* Z80 PIO: all modes supported, both port A and B. Implementation is independent of connected devices.
* 22-bit MMU
* 256KB ROM
* 512KB RAM
* Zeal 8-bit **Video Card**: 640x480 and 320x240px modes, text mode, including cursor and scrolling, graphic modes, including sprites, X/Y flipping, palettes, 4-bit and 8-bit color modes
* PS/2 Keyboard, with interrupts
* UART: it is possible to send and receive bytes. It is also possible to send files. The baudrate can be changed from the GUI
* I2C: bus emulated, supporting write/read/write-read operations
* I2C RTC: always returns the current date
* I2C EEPROM: 24C512 is emulated, so hardcoded to be a 64KB EEPROM. Content can be loaded through the GUI.

Features of the emulator itself implemented:

* Debugger: breakpoints, step, step over instruction, continue until next breakpoint
* Disassembler: when the emulator reaches a breakpoint, the code at *Program Counter* is disassembled. Clicking on one of the instructions will toggle a breakpoint.
* Load a binary file, loaded into ROM directly
* Load a map file generated from `z88dk-z88dk` to view symbols in the assembly view when doing step-by-step debugging
* Set breakpoints with either a **hexadecimal** PC address or a symbol (from the map file)
* View memory content when doing step-by-step debugging
* Dedicated tab for the UART view: can send files to the emulated target

## TODO

On the emulation side, the remaining tasks to do are:

* I2C RTC set date. Currently, it always returns the current browser date, so writing to it will have no effect.
* Sound support (part of Zeal 8-bit Video Card)
* SD Card emulation (part of Zeal 8-bit Video Card)
* <s>Video chip: 320x240 text mode, 320x240 graphic mode¹, sprites¹, 4-bit palettes¹, etc...</s> **IMPLEMENTED!**


On the project/debugger side itself:

* A better way to **parse breakpoint input**. A known bug is that providing a label starting with a hexadecimal letter would be interpreted as a PC value instead of a label. For example, inputting *date_routine* as a label to break in would result in the addition of a breakpoint at address 0xda instead of the address of label *date_routine* (because *date* starts with hex letters *da*)

## Contributing

Anyone can contribute to this project, contributions are welcome!

Feel free to fix any bug that you may see or encounter, implement any feature that is present in the TODO list or a new one that you find useful or important.

To contribute:

* Fork the Project
* Create your feature Branch (*optional*)
* Commit your changes. Please make a clear and concise commit message (*)
* Push to the branch
* Open a Pull Request

(*) A good commit message is as follows:

```plain
Module: add/fix/remove a from b

Explanation on what/how/why
```

For example:

```plain
Video chip: implement 320x240 text-mode

It is now possible to switch to 320x240 text-mode and display text.
```

## License

`Z80.js` file is distributed under the MIT licence (originated from Molly Howell repository: [Z80.js](https://github.com/DrGoldfire/Z80.js))

All the other files are distributed under the Apache 2.0 License. See `LICENSE` file for more information.

You are free to use it for personal and commercial use, the boilerplate present in each file must not be removed.

## Contact

For any suggestion or request, you can contact me at `contact [at] zeal8bit [dot] com`

For feature requests, you can also open an issue or a pull request.
