# Native WASM runtime

These browser assets were built with Emscripten 7.0.0 from Zeal-NativeEmulator
revision `5cb68a7a80a955a99cba62411a8097b84c046477` on `feature/web-emulator`.
[Zeal-NativeEmulator source](https://github.com/Zeal8bit/Zeal-NativeEmulator)

Build from that revision with:

```sh
meson setup build-wasm --cross-file frontend/wasm/wasm-cross.build -Dwasm_template=minimal -Denable_debugger=true
meson compile -C build-wasm
```

Copy `zeal.elf.js`, `zeal.elf.wasm`, and the JavaScript files under `libnative/` from the same build. The Web Emulator supplies its own HTML and ROM images.

SDL 3.4.2 is linked into the WASM binary. Its license is included alongside the runtime.
