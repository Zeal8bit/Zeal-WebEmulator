<h1 align="center">Zeal 8-bit Computer emulator</h1>
<p align=center>
    <img src="imgs/screenshot.png" alt="screenshot" />
    <a href="https://opensource.org/licenses/Apache-2.0">
        <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="Licence" />
    </a>
</p>

This project is a software emulator for Zeal 8-bit Computer: a homebrew 8-bit computer based on a Z80 CPU.

[Click here for a live demo](https://zeal8bit.github.io/Zeal-WebEmulator/)

## Why this project?

The goal of this project is to reproduce the same behavior as the real machine, to be able to execute and **debug** the programs written for it directly from a host computer. As such, there is no need to flash any EEPROM or NOR Flash to test programs. This makes development and test cycles much faster and more convenient.

## Why a web-based emulator? (HTML/CSS/JavaScript)

The main goal is to integrate this emulator as part of [zeal8bit.com](https://zeal8bit.com) website. Thus, choosing HTML/CSS and Javascript was a bit obvious on this side.

On the other side, another goal of this project is also to let anybody test or write programs for Zeal 8-bit Computer on any platform (Linux/Windows/Mac OS X) without the need of a toolchain installed.

The emulator has been tested on Opera and Google Chrome.

## What about performance then?

The emulator is slower than the real hardware, even though the real hardware is using a Z80 running at 10MHz. This is due to the overhead of Javascript itself and the web browser itself. But as I said above, the main feature this was made for is **debugging** programs and for this, there is no doubt it is efficient.


Writing a native emulator in **C** (w/ SDL) would cover the requirement of a full-speed emulator. However, this needs some time investment. Feel free to contact me or contribute if such a project interest you.

## How to start using the emulator?

Several choices are offered to you:

* Use the live version of the emulator: [live version of the emulator](https://zeal8bit.github.io/Zeal-WebEmulator/). This will let you use the emulator without the need to install anything
* Clone this repository and open the `index.html` page with a web browser: Chrome or Opera preferred.
* Create an application out of this repo by using electron. More details below.

### Get started with electron?

#### Importing

First of all, you will need to clone this current repository, after that use a package manager to install electron forge. If you are using `yarn`, use the following commands:
```bash
$ cd /path/to/Zeal-WebEmulator
$ yarn add --dev @electron-forge/cli
$ yarn electron-forge import
```

If you are using `npm`, the commands are as follows:
```bash
$ cd /path/to/Zeal-WebEmulator
$ npm install --save-dev @electron-forge/cli
$ npm exec --package=@electron-forge/cli -c "electron-forge import"
```

If you encounter any issues, you can find more information on [the official electron forge website.](https://www.electronforge.io/import-existing-project)

#### Running

Once the project has been imported, it can be executed thanks to
```
$ yarn start
```
or
```
$ npm start
```
commands.

## Supported Features

Currently, the following features from Zeal 8-bit Computer are emulated:

* Z80 CPU ([thanks to *Molly Howell*](https://github.com/DrGoldfire/Z80.js))
* Z80 PIO: all modes supported, both port A and B. Implementation is independent of connected devices.
* 22-bit MMU
* 256KB ROM
* 512KB RAM
* Video chip: 640x480 text mode w/ colors, 640x480 graphic mode w/ colors
* PS/2 Keyboard, with interrupts
* UART: it is possible to send and receive bytes. It is also possible to send files. The baudrate can be changed from the GUI
* I2C: bus emulated, supporting write/read/write-read operations
* I2C RTC: always returns the current date
* I2C EEPROM: 24C512 is emulated, so hardcoded to be a 64KB EEPROM. Content can be loaded through the GUI.

Features of the emulator itself implemented:

* Debugger: breakpoints, step, step over instruction, continue until next breakpoint
* Assembler: when the emulator reaches a breakpoint, the code at *Program Counter* is disassembled. Clicking on one of the instructions will toggle a breakpoint. A map file can be provided to specify symbols.
* Load a binary file, loaded into ROM directly
* Load a dump file generated from `z88dk-dis` to view assembly code while doing step-by-step debugging
* Set breakpoints with either a **hexadecimal** PC address or a symbol (from the dump file)
* View memory content when doing step-by-step debugging
* Dedicated tab for the UART view

## TODO

On the emulation side, the remaining tasks to do are:

* I2C RTC set date. Currently, it always returns the current browser date, so writing to it will have no effect.
* Sound support¹
* SD Card emulation¹
* Video chip: 320x240 text mode, 320x240 graphic mode¹, sprites¹, 4-bit palettes¹, etc...

¹: features **not** in high priority as they have not been implemented on real hardware yet.

On the project/debugger side itself:

* A better way to **parse breakpoint input**. A known bug is that providing a label starting with a hexadecimal letter would be interpreted as a PC value instead of a label. For example, inputting *date_routine* as a label to break in would result in the addition of a breakpoint at address 0xda instead of the address of label *date_routine* (because *date* starts with hex letters *da*)
* **Refactoring**. Some parts of the code, mainly in `zeal.js` are a bit dirty in the sense that several different things are managed by this file: breakpoints, disassembly view, memory viewer, Zeal emulation, etc... It should be cleaned and split up between multiple files.
* An **integrated code editor** with an assembler! In the (far?) future, integrating a code editor, ideally, *CodeMirror*, would be a very nice addition. It would let anyone write code, assemble it, inject it in the emulator and test it directly. No need to have a toolchain or an assembler installed. Everything would be available directly from the browser. It would also be possible to connect the debugger to the code editor to be able to debug the code written more easily.

# Contributing

Anyone can contribute to this project, contributions are welcome!

Feel free to fix any bug that you may see or encounter, implement any feature that is present in the TODO list or a new one that you find useful or important.

To contribute:

* Fork the Project
* Create your feature Branch (*optional*)
* Commit your changes. Please make a clear and concise commit message (*)
* Push to the branch
* Open a Pull Request

(*) A good commit message is as follows:

```
Module: add/fix/remove a from b

Explanation on what/how/why
```

For example:

```
Video chip: implement 320x240 text-mode

It is now possible to switch to 320x240 text-mode and display text.
```

# License

`Z80.js` file is distributed under the MIT license (originated from Molly Howell repository: https://github.com/DrGoldfire/Z80.js)

All the other files are distributed under the Apache 2.0 License. See `LICENSE` file for more information.

You are free to use it for personal and commercial use, the boilerplate present in each file must not be removed.

# Contact

For any suggestion or request, you can contact me at contact [at] zeal8bit [dot] com

For feature requests, you can also open an issue or a pull request.
