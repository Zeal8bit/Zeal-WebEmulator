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

The goal of this project is to reproduce the exact same behavior of the real machine, in order to be able to execute and mainly **debug** the programs written for it directly from a host computer, without the need to flash any EEPROM or NOR Flash in order to test it. This makes development and test cycles much faster and more convenient.

## How to start it with electron?

##### Import

Use electron import script:

Yarn:

```
yarn add --dev @electron-forge/cli
yarn electron-forge import
```

Npm:

```
cd my-app
npm install --save-dev @electron-forge/cli
npm exec --package=@electron-forge/cli -c "electron-forge import"
```

If it doesn't work, you can find some information at [here.](https://www.electronforge.io/import-existing-project)

##### Run

```
yarn start
```

or

```
npm start
```

For more informations, check for [Get Started - Electron forge](https://www.electronforge.io/).

##### Publish

There are 4 scripts to publish zos.

###### Basic:

```
yarn run publish
```

###### Electron-builder:

Add dependencies:

```
yarn add electron-builder
```

Win32:

```
yarn dist-win
```

Win64:

```
yarn dist-win64
```

Linux:

```
yarn dist-linux
```

It's too complex for me to pass Macos config, so you can't build it for Macos now. If you can do it, plese make contribution.

## Why a web-based emulator ? (HTML/CSS/JavaScript)

The main goal is to integrate this emulator as part of [zeal8bit.com](https://zeal8bit.com) website. Thus, choosing HTML/CSS and Javascript was a bit obvious on this side.

On the other side, another goal of this project is also to let anybody test or write programs for Zeal 8-bit Computer on any platform (Linux/Windows/Mac OS X) without the need of a toolchain installed.

The emulator has been tested on Opera and Google Chrome.

## What about performance then?

The emulator is slower than the real hardware, even though the real hardware is using a Z80 running at 10MHz. This is due to the overhead of Javascript itself and the web browser itself. But as I said above, the main feature this was made for is **debugging** programs and for this, there is no doubt it is efficient.

Moreover, the emulator is not really accurate it terms of timings, more details below, in the *features* section.

Writing a native emulator in **C** (w/ SDL) would cover the requirement of a full-speed emulator, which would be more accurate in terms of timings. However, this needs some time investment. Feel free to contact me or contribute if such project interest you.

## Features

Currently, the following features from Zeal 8-bit Computer are emulated:

* Z80 CPU ([thanks to *Molly Howell*](https://github.com/DrGoldfire/Z80.js))
* Z80 PIO: all modes supported, both port A and B. Implementation is independent from connected devices.
* 22-bit MMU
* 256KB ROM
* 512KB RAM
* Video chip: 640x480 text mode w/ colors, 640x480 graphic mode w/ colors
* PS/2 Keyboard, with interrupts
* UART: it is possible to send and receive bytes. It is also possible to send files. The baudrate can be changed from the GUI
* I2C: bus emulated, supporting write/read/write-read operations
* I2C RTC: always returns the current date

Features of the emulator itself implemented:

* Debugger: breakpoints, step, step over instruction, continue until next breakpoint
* Load a binary file, loaded into ROM directly
* Load a dump file generated from `z88dk-dis` to view assembly code while doing step by step debugging
* Set breakpoints with either a **hexadecimal** PC address or a symbol (from the dump file)
* View memory content when doing step by step debugging
* Dedicated tab for the UART view

## TODO

Of course a lot of things are still remaining to do. On the emulation side:

* `<s>`PIO: complete the implementation for the user port (A) to act as a regular GPIO, and system port (port B) to activate/deactivate the interrupts, the H-blank, V-blank, I2C, UART, etc...`</s>` (Done, PIO is now a regular GPIO component, separated from connected components)
* `<s>`UART emulation (needs PIO port B)`</s>` (`<s>`Done, it is possible to read and write characters, baudrates are hardcoded at the moment. Would be interesting to be able to send a file through UART `</s>` Done)
* `<s>`I2C RTC (needs PIO port B)`</s>` (Partially implemented: it always returns the current browser date, so writing to it will have no effect)
* I2C 32KB EEPROM emulation `<s>`(needs PIO port B)`</s>`
* Sound support¹
* SD Card emulation²
* Video chip: 320x240 text mode, 320x240 graphic mode², sprites², 4-bit palettes², etc...

¹: feature that may be modified on the real hardware.

²: features **not** in high priority as they have not been implemented on real hardware yet.

On the project/debugger side itself:

* A better **interface** for the debugger's buttons, with some shortcuts
* A better way to **parse breakpoint input**. A know bug is providing a label starting hex letters would be interpreted as a PC value instead of a label. For example, inputting *date_routine* as a label to break in would result in the addition of a breakpoint at address 0xda instead of the address of label *date_routine* (because *date* starts with hex letters *da*)
* **Refactoring**. Some part of the code, mainly in `zeal.js` are a bit dirty in the sense that several different things are managed by this file: breakpoints, disassembly view, memory viewer, Zeal emulation, etc... It should be cleaned and split up between multiple files.
* A **disassembler**! Today, the disassembler view only takes the disassembly from a file generated by `z88dk-dis` toolchain. A much better (or complementary) way is to disassemble the instructions on the fly and show them in the *disassembly* view at the bottom of the screen.
* An **integrated code editor** with an assembler! In the (far?) future, integrating a code editor, ideally *CodeMirror*, would be a very nice addition. It would let anyone write code, assemble it, inject it in the emulator and test it directly. No need to have a toolchain, or an assembler installed. Everything would be available directly from the browser. It would also be possible to connect the debugger to the code editor in order to be able to debug the code written more easily.

# Contributing

Anyone can contribute to this project, contributions are welcome!

Feel free to fix any bug that you may see or encounter, implement any feature that is present in the TODO list or a new one that you find useful or important.

To contribute:

* Fork the Project
* Create your feature Branch (*optional*)
* Commit your changes. Please make a clear and concise commit message (*)
* Push to the branch
* Open a Pull Request

(*) A good commit message is as follow:

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

`Z80.js` file is distributed under the MIT licence (originated from Molly Howell repository: https://github.com/DrGoldfire/Z80.js)

All the other files are distributed under the Apache 2.0 License. See `LICENSE` file for more information.

You are free to use it for personal and commercial use, the boilerplate present in each file must not be removed.

# Contact

For any suggestion or request, you can contact me at contact [at] zeal8bit [dot] com

For features requests, you can also open an issue or a pull request.
