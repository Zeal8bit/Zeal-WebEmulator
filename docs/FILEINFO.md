# Fileinfo

This document is used to explain the meaning of various directories and files in Zeal-WebEmulator

directory tree:

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

## ./

* .gitignore
Choose which files will been ignore by git
* forge.config.js
Config file of electron
* index.html
Main GUI of the emulator
* index.js
Init eletron window
* LICENSE
Apache v2.0
* package.json
Config file use to describe scripts, dependencies and publish configs
* preload.js
A part of index.js
* README.md
Readme(English)

### component

This directory is where the components required by the emulator are stored

* jquery-3.6.0.min.js
This is a famous JavaScript libuary, it can save development time a lot

#### crypto

This component comes from repository [crypto.js](https://github.com/brix/crypto-js)

* sha256.js
It is used to verify the hash value of the file

#### disassembler

This component comes from feature/add_disassembler branch. It is not refine now, if you have any idea about it, please contribute

* disassembler.js
It is used to disassemble opcodes from Z80 cpu

#### xterm

This component comes from repository [xterm.js](https://github.com/xtermjs/xterm.js)

* xterm.css
* xterm.js
* xterm.js.map
These are used to implement a web terminal

### docs

This folder contains the project documents

* README_zh_hans.md
Readme(简体中文)

* FILEINFO.md
Fileinfo(English)

<!-- * FILEINFO_zh_hans.md
Fileinfo(简体中文) -->

### frontend

This directory contains the programs used to implement the interaction

* breakpoint.js
Used to implement the program debugger
* init.js
Init hardware emulation and zos index
* menus.js
Implement the interaction logic for the menu bar
* misc.js
Include some unknown frontend codes
* panel.js
Implement the interaction logic for the left/right panel
* readrom.js
Read romdisk and eeprom inputed from users
* utils.js
Extracted common functions

#### css

Css(s) used to implement GUI interface

* emulator.css
Used to implement GUI interface of emulator

#### fonts

Contains fonts used in the emulator

* CascadiaCode.ttf
Truetype Font `Cascadia Code`

### hardemu

Emulate Zeal 8-bit Computer's hardware

* characters.js
Implement of English glyphs
* i2c.js
Emulate I2C in Zeal 8-bit Computer
* keyboard.js
Emulate your keaboard as ps2 keyboard
* mmu.js
Emulate MMU in Zeal 8-bit Computer
* pio.js
Emulate PIO in Zeal 8-bit Computer
* ram.js
Emulate RAM in Zeal 8-bit Computer
* rom.js
Emulate ROM in Zeal 8-bit Computer
* screen.js
Emulate screen in Zeal 8-bit Computer
* uart.js
Emulate uart in Zeal 8-bit Computer
* Z80.js
Emulate Z80 cpu in Zeal 8-bit Computer

### imgs

Images are used in installation packages, documentation, etc

### manifests

Used to upload package related files for winget-pkgs
