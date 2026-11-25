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
npm install
npm run dev
```

Select a prebuilt Zeal 8-bit OS image or use **Advanced** to upload a ROM and optional EEPROM and map files. Use `npm run get-prebuilt` to cache the prebuilt ROMs locally, then open `?local=1&r=latest`. Image changes last for the current session.

## Debugger features

- Pause, continue, reset, single-step, and step over calls. Breakpoints accept hexadecimal addresses and map-file symbols.
- Inspect registers, flags, T-states, and disassembly when the CPU stops.
- Read and edit logical memory with physical addresses resolved through the MMU.
- Inspect video palettes, fonts, tilesets, sprites, and tilemap layers. Break on emulated VBlank.
- Use the canvas for keyboard input, audio, and SDL gamepad support.

For desktop debugging, use Zeal-NativeEmulator. For the browser runtime's source revision and build commands, see [the WASM runtime notes](wasm/README.md).

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
