<h1 align="center">Zeal 8-bit Computer Web Emulator</h1>

<p align=center>
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

Run and debug Z80 software for the Zeal 8-bit Computer in Chrome. Zeal-NativeEmulator runs the hardware and renders the guest screen through SDL and WebAssembly. This project provides the HTML debugger. [Zeal-NativeEmulator](https://github.com/Zeal8bit/Zeal-NativeEmulator)

## Run the browser debugger

Serve the repository over localhost or HTTPS. For local development, run:

```sh
npm ci
npm run get-prebuilt
npm run dev
```

The emulator boots the latest published Zeal 8-bit OS release with an emulator ROM by default. Use a URL such as `?r=v0.8.0` for a specific release or `?r=` to start without a ROM. In **Web Settings**, you can select another release or use **Load local files** for a ROM and optional EEPROM and map files. Image changes last for the current session.

The ROM picker uses a catalog generated from Zeal 8-bit OS GitHub releases. Run `npm run get-prebuilt` again to refresh a local copy. [Zeal 8-bit OS releases](https://github.com/Zeal8bit/Zeal-8-bit-OS/releases)

In Settings, select **Mount HostFS** to share a folder with a HostFS-enabled ROM over localhost or HTTPS in desktop Chrome. The guest can read and write the selected folder. Mounting or unmounting during a session requires a restart.

## Debugger features

- Pause, continue, reset, single-step, and step over calls. Breakpoints accept hexadecimal addresses and map-file symbols.
- Inspect registers, flags, T-states, and disassembly when the CPU stops.
- Read and edit logical memory with physical addresses resolved through the MMU.
- Inspect video palettes, fonts, tilesets, sprites, and tilemap layers. Break on emulated VBlank.
- Use the canvas for keyboard input, audio, and SDL gamepad support.

For desktop debugging, use Zeal-NativeEmulator. For the browser runtime's source revision and build commands, see [the WASM runtime notes](wasm/README.md).

## Theme

The browser theme tokens are in [theme.css](view/css/theme.css). Dark and light
use the Native SDL/FLTK palette, and BigBlue Terminal 437TT is the default font
throughout the web interface. To add a theme, define a `[data-theme]` variant in
`theme.css` and add its value to the Settings theme selector. [Font attribution and license](view/fonts/README.md)

## Publish the web emulator

Set the repository's Pages build source to **GitHub Actions**. The **Publish Web Emulator** workflow refreshes the release catalog and deploys the static site on pushes to `main`, nightly, and on manual dispatch. Only published releases that provide an emulator ZIP are available in the picker.

## Contributing

Anyone can contribute to this project, contributions are welcome!

Feel free to fix any bug that you may see or encounter, or propose a debugger improvement.

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

The project uses the [Apache 2.0 License](LICENSE). The bundled Native WASM runtime includes SDL under the [SDL license](wasm/SDL3-LICENSE.txt).

## Contact

For any suggestion or request, you can contact me at `contact [at] zeal8bit [dot] com`

For feature requests, you can also open an issue or a pull request.
