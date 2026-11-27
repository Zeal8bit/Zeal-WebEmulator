# Native WASM runtime

These browser assets were built with Emscripten 7.0.0 from Zeal-NativeEmulator
revision `c48202fcbd1b259dc9697c44e7e106c6e9533f0d` on `feature/web-emulator`.
[Zeal-NativeEmulator source](https://github.com/Zeal8bit/Zeal-NativeEmulator/tree/c48202fcbd1b259dc9697c44e7e106c6e9533f0d)

Build from the matching Native source with:

```sh
meson setup build-wasm --cross-file frontend/wasm/wasm-cross.build -Dwasm_template=minimal -Denable_debugger=true
meson compile -C build-wasm
```

Copy `zeal.elf.js`, `zeal.elf.wasm`, and the JavaScript files under `libnative/` from the same build. The Web Emulator supplies its own HTML and ROM images.

SDL 3.4.2 is linked into the WASM binary. Its license is included alongside the runtime.
