# Native WASM runtime

These browser assets were built from [Zeal-NativeEmulator 5bd04f4](https://github.com/Zeal8bit/Zeal-NativeEmulator/tree/5bd04f447ab2d4fa9d5ddebd1dbda3c4adf899ac) using Emscripten 7.0.0.

Build from that revision with:

```sh
meson setup build-wasm --cross-file frontend/wasm/wasm-cross.build -Dwasm_template=minimal
meson compile -C build-wasm
```

Copy `zeal.elf.js`, `zeal.elf.wasm`, and the JavaScript files under `libnative/` from the same build. The Web Emulator supplies its own HTML and ROM images.

SDL 3.4.2 is linked into the WASM binary. Its license is included alongside the runtime.
