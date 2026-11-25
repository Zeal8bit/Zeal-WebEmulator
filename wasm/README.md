# Native WASM runtime

These browser assets were built from [Zeal-NativeEmulator 99ba26b](https://github.com/Zeal8bit/Zeal-NativeEmulator/tree/99ba26ba6af7e23b377d1542a4f3b41492b85010) using Emscripten 7.0.0.

Build from that revision with:

```sh
meson setup build-wasm --cross-file frontend/wasm/wasm-cross.build -Dwasm_template=minimal -Denable_debugger=true
meson compile -C build-wasm
```

Copy `zeal.elf.js`, `zeal.elf.wasm`, and the JavaScript files under `libnative/` from the same build. The Web Emulator supplies its own HTML and ROM images.

SDL 3.4.2 is linked into the WASM binary. Its license is included alongside the runtime.
