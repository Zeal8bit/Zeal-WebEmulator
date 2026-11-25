(() => {
    const SNES_BUTTONS = Object.freeze({
        b: 0,
        y: 1,
        select: 2,
        start: 3,
        up: 4,
        down: 5,
        left: 6,
        right: 7,
        a: 8,
        x: 9,
        l: 10,
        r: 11,
    });

    class DebuggerSession extends EventTarget {
        constructor(emulator) {
            super();
            this.emulator = emulator;
            this.state = null;
            this.queue = Promise.resolve();
            this.pending = null;
        }

        update(state) {
            this.state = state;
            this.dispatchEvent(new CustomEvent('statechange', {detail: state}));
        }

        complete(error, result) {
            const pending = this.pending;
            this.pending = null;
            if (error) pending?.reject(new Error(`Debugger command failed (errno ${error})`));
            else pending?.resolve(result);
        }

        disconnect(error) {
            this.pending?.reject(error);
            this.pending = null;
            this.update(null);
        }

        request(command, address = 0, count = 0, data = null) {
            const { module } = this.emulator;
            const operation = this.queue.then(async () => {
                if (!module || module !== this.emulator.module || !this.emulator.runtimeReady ||
                    this.emulator.runtimeError) {
                    throw new Error('The debugger session is unavailable');
                }
                let buffer = 0;
                try {
                    if (data?.length) {
                        buffer = module._malloc(data.length);
                        if (!buffer) throw new Error('Could not allocate debugger data');
                        module.HEAPU8.set(data, buffer);
                    }
                    return await new Promise((resolve, reject) => {
                        this.pending = {resolve, reject};
                        try {
                            if (module._zeal_debug_request_web(command, address, count, buffer, data?.length ?? 0)) return;
                            throw new Error('The emulator could not accept the debugger command');
                        } catch (error) {
                            this.pending = null;
                            reject(error);
                        }
                    });
                } finally {
                    if (buffer && module === this.emulator.module && !this.emulator.runtimeError) {
                        module._free(buffer);
                    }
                }
            });
            this.queue = operation.catch(() => {});
            return operation;
        }

        pause() { return this.request(1); }
        continue() { return this.request(2); }
        step() { return this.request(3); }
        reset() { return this.request(4); }
        stepOver() { return this.request(5); }

        setBreakpoint(address, enabled = true) {
            this.validateAddress(address);
            return this.request(6, address, enabled ? 1 : 0);
        }

        removeBreakpoint(address) {
            this.validateAddress(address);
            return this.request(7, address);
        }

        disassemble(address, count = 20) {
            this.validateAddress(address);
            if (!Number.isInteger(count) || count < 1 || count > 256) {
                throw new RangeError('Expected 1 to 256 instructions');
            }
            return this.request(8, address, count);
        }

        loadSymbols(data) {
            if (!(data instanceof Uint8Array) && !(data instanceof ArrayBuffer)) {
                throw new TypeError('Expected a map file as bytes');
            }
            if (data.byteLength > 4 * 1024 * 1024) throw new RangeError('Map file exceeds 4 MiB');
            return this.request(9, 0, 0, new Uint8Array(data).slice());
        }

        findSymbol(name) {
            if (typeof name !== 'string' || !name.length || name.includes('\0')) {
                throw new TypeError('Expected a symbol name');
            }
            const data = new TextEncoder().encode(name + '\0');
            if (data.length > 256) throw new RangeError('Symbol name exceeds 255 bytes');
            return this.request(10, 0, 0, data);
        }

        inspectMemory(address, count) {
            this.validateAddress(address);
            if (!Number.isInteger(count) || count < 0 || count > 0x10000) {
                throw new RangeError('Expected a memory length between 0 and 65536');
            }
            return this.request(11, address, count);
        }

        async readMemory(address, count) {
            return (await this.inspectMemory(address, count)).bytes;
        }

        writeMemory(address, data) {
            this.validateAddress(address);
            if (!(data instanceof Uint8Array) || !data.length || data.length > 0x10000) {
                throw new RangeError('Expected 1 to 65536 bytes as a Uint8Array');
            }
            return this.request(12, address, 0, data.slice());
        }

        setBreakOnVBlank(enabled) {
            return this.request(13, 0, enabled ? 1 : 0);
        }

        inspectVideo(view) {
            const index = ['layer0', 'layer1', 'tileset', 'palette', 'font', 'sprites'].indexOf(view);
            if (index < 0) throw new RangeError('Unknown video inspection view');
            return this.request(14, index);
        }

        captureScreen() {
            return this.request(15);
        }

        validateAddress(address) {
            if (!Number.isInteger(address) || address < 0 || address > 0xffff) {
                throw new RangeError('Expected a 16-bit logical address');
            }
        }
    }

    class ZealNative {
        constructor({
            canvas,
            moduleFactory = window.NativeModule,
            romdisk = null,
            userProgram = null,
            eeprom = null,
            tf = null,
            romdiskPath = '/roms/default.img',
            userProgramPath = '/roms/user.bin',
            eepromPath = '/roms/eeprom.img',
            tfPath = '/roms/tf.img',
            debugger: enableDebugger = false,
            imageStorage = 'opfs',
            storageNamespace,
            diskImages = {},
            onImageUpdateAvailable = null,
            onStorageError = null,
            hostfs = null,
            print = text => console.log(`Log: ${text}`),
            printErr = text => console.error(`Error: ${text}`),
            onLoadingChange = null,
            onRuntimeInitialized = null,
            onExit = null,
        } = {}) {
            if (!canvas) throw new TypeError('ZealNative requires a canvas');
            if (typeof moduleFactory !== 'function') {
                throw new TypeError('ZealNative requires a module factory');
            }

            this.canvas = canvas;
            this.debugger = enableDebugger ? new DebuggerSession(this) : null;
            this.moduleFactory = moduleFactory;
            this.romdisk = romdisk;
            this.userProgram = userProgram;
            this.eeprom = eeprom;
            this.tf = tf;
            this.romdiskPath = romdiskPath;
            this.userProgramPath = userProgramPath;
            this.eepromPath = eepromPath;
            this.tfPath = tfPath;
            this.imageStorage = imageStorage;
            this.onStorageError = onStorageError;

            this.hostfs = hostfs;
            this.print = print;
            this.printErr = printErr;
            this.onLoadingChange = onLoadingChange;
            this.onRuntimeInitialized = onRuntimeInitialized;
            this.onExit = onExit;
            this.module = null;
            this.exitPromise = null;
            this.loading = false;
            this.operationPromise = null;
            this.binaryPromises = new Map();
            const imageDefaults = {
                romdisk: {
                    source: romdisk, path: romdiskPath,
                },
                eeprom: {
                    source: eeprom, path: eepromPath,
                },
                tf: {
                    source: tf, path: tfPath,
                },
            };
            this.diskImages = new DiskImageStore({
                storage: imageStorage,
                storageNamespace,
                images: Object.entries(imageDefaults).map(([name, defaults]) => {
                    const image = {...defaults, ...(diskImages[name] || {}), name};
                    image.key ??= this.cacheKey(image.source, image.path);
                    return image;
                }),
                onWarning: (message, error) => this.printErr(
                    error ? `${message}: ${error.message || error}` : message
                ),
                onUpdateAvailable: onImageUpdateAvailable,
            });
        }

        cacheKey(source, path) {
            if (typeof source === 'string') return source;
            if (source instanceof URL) return source.toString();
            return path.split('/').filter(Boolean).at(-1);
        }

        async resolveBinary(source) {
            if (source == null) return null;
            if (source instanceof Uint8Array) return source;
            if (source instanceof ArrayBuffer) return new Uint8Array(source);
            if (typeof source !== 'string' && !(source instanceof URL)) {
                throw new TypeError('Binary source must be a URL, Uint8Array, or ArrayBuffer');
            }

            const key = source.toString();
            if (!this.binaryPromises.has(key)) {
                this.binaryPromises.set(key, fetch(source).then(async response => {
                    if (!response.ok) throw new Error(`Failed to fetch ${key}`);
                    return new Uint8Array(await response.arrayBuffer());
                }));
            }
            return this.binaryPromises.get(key);
        }

        ensureDirectory(filesystem, path) {
            filesystem.mkdirTree(path);
        }

        writeBinary(filesystem, path, data) {
            const separator = path.lastIndexOf('/');
            const parent = separator > 0 ? path.slice(0, separator) : '';
            if (parent) this.ensureDirectory(filesystem, parent);
            filesystem.writeFile(path, data);
        }

        async loadModule() {
            if (this.module) throw this.startupError || new Error('A runtime already owns the disk images');
            this.runtimeError = null;
            this.runtimeReady = false;
            let resolveReady;
            let rejectReady;
            const ready = new Promise((resolve, reject) => {
                resolveReady = resolve;
                rejectReady = reject;
            });
            // Attach immediately: an early abort can occur before factory completion.
            ready.catch(() => {});
            let resolveExit;
            const exitPromise = new Promise(resolve => { resolveExit = resolve; });
            const owner = this;
            let instance;
            let stopped = false;
            const trackRuntime = module => {
                instance = module;
                if (!stopped) {
                    owner.module = module;
                    owner.exitPromise = exitPromise;
                }
            };
            try {
                const images = await this.diskImages.loadAll();
                const userProgram = await this.resolveBinary(this.userProgram);
                const imagePaths = Object.fromEntries(
                    this.diskImages.images.map(image => [image.name, image.path])
                );
                if (userProgram) imagePaths.userProgram = this.userProgramPath;
                const moduleOptions = {
                    imagePaths,
                    imageStorage: this.imageStorage,
                    debuggerEnabled: Boolean(this.debugger),
                    onDebugState(state) {
                        owner.debugger?.update(state);
                    },
                    onDebugComplete(error, result) {
                        owner.debugger?.complete(error, result);
                    },
                    hostfsBackend: this.hostfs,
                    print: this.print,
                    printErr: this.printErr,
                    canvas: this.canvas,
                    onRuntimeInitialized() {
                        trackRuntime(this);
                        for (const image of owner.diskImages.images) {
                            if (images[image.name]) owner.writeBinary(this.FS, image.path, images[image.name]);
                        }
                        if (userProgram) owner.writeBinary(this.FS, owner.userProgramPath, userProgram);
                    },
                    onEmulatorReady() {
                        owner.runtimeReady = true;
                        resolveReady();
                    },
                    onStorageComplete(error) {
                        const request = owner.storageRequest;
                        owner.storageRequest = null;
                        if (error) request?.reject(new Error(`Storage flush failed (errno ${error})`));
                        else request?.resolve();
                    },
                    onAbort(reason) {
                        const error = new Error(`Emulator aborted: ${reason}`);
                        owner.runtimeError = error;
                        owner.debugger?.disconnect(error);
                        rejectReady(error);
                        owner.storageRequest?.reject(error);
                        owner.storageRequest = null;
                        owner.reportStorageError(error);
                    },
                    onExit(exitCode) {
                        stopped = true;
                        rejectReady(new Error(`Emulator exited before startup completed (${exitCode})`));
                        owner.storageRequest?.reject(new Error('Emulator exited during storage operation'));
                        owner.storageRequest = null;
                        resolveExit(exitCode);
                        if (owner.module === instance || owner.module === this) {
                            owner.module = null;
                            owner.exitPromise = null;
                            owner.runtimeReady = false;
                            owner.debugger?.disconnect(new Error('The emulator exited'));
                            owner.startupError = null;
                        }
                        owner.onExit?.(exitCode);
                    },
                };
                this.hostfs?.bindModule(moduleOptions);
                trackRuntime(await this.moduleFactory(moduleOptions));
                await ready;
                if (stopped) throw new Error('Emulator exited during startup');
                if (this.debugger && typeof instance._zeal_debug_request_web !== 'function') {
                    throw new Error('This Native WASM build does not support debugging');
                }
                this.hostfs?.bindModule(instance);
                this.canvas.setAttribute('tabindex', '0');
                this.canvas.focus();
                this.onRuntimeInitialized?.(instance);
                // Network checks do not hold up local boot or ask for a decision.
                this.updateCheck = this.diskImages.checkUpdates();
                return instance;
            } catch (error) {
                try {
                    // Runtime creation can precede factory completion or readiness.
                    // Only an observed exit proves that its image handles are closed.
                    if (instance && !stopped) await this.exitModule();
                    await this.diskImages.close();
                } catch (cleanupError) {
                    const failure = new AggregateError([error, cleanupError],
                        `Startup failed: ${error?.message || error}; cleanup failed: ${cleanupError?.message || cleanupError}`,
                        {cause: error});
                    if (this.module) this.startupError = failure;
                    throw failure;
                }
                throw error;
            }
        }

        reportStorageError(error) {
            this.printErr(error.message || String(error));
            this.onStorageError?.(error);
        }

        runExclusive(operation) {
            const previousOperation = this.operationPromise || Promise.resolve();
            const currentOperation = previousOperation.catch(() => {}).then(async () => {
                this.loading = true;
                this.onLoadingChange?.(true);
                try { return await operation(); }
                catch (error) { this.reportStorageError(error); throw error; }
            }).finally(() => {
                if (this.operationPromise === currentOperation) {
                    this.operationPromise = null;
                    this.loading = false;
                    this.onLoadingChange?.(false);
                }
            });
            this.operationPromise = currentOperation;
            return currentOperation;
        }

        start() {
            return this.runExclusive(() => {
                if (this.startupError) throw this.startupError;
                return this.module || this.loadModule();
            });
        }

        requestStorage(exit = false) {
            if (this.runtimeError) throw this.runtimeError;
            if (!this.module) throw new Error('Emulator is not running');
            if (!this.runtimeReady) throw new Error('Runtime failed before it could accept orderly teardown');
            return new Promise((resolve, reject) => {
                this.storageRequest = {resolve, reject};
                try {
                    if (exit) this.module._zeal_exit_web();
                    else this.module._zeal_flush_storage_web();
                } catch (error) {
                    this.storageRequest = null;
                    reject(error);
                }
            });
        }

        async flushImages() {
            if (!this.module) return [];
            await this.requestStorage();
            return this.diskImages.persist(this.module.FS);
        }

        async exitModule() {
            if (!this.module) return;
            await this.flushImages();
            const exitPromise = this.exitPromise;
            await this.requestStorage(true);
            await exitPromise;
        }

        exit() {
            return this.runExclusive(async () => {
                await this.exitModule();
                await this.updateCheck;
                await this.diskImages.close();
            });
        }

        reload() {
            return this.runExclusive(async () => {
                await this.exitModule();
                return this.loadModule();
            });
        }

        setHostFS(hostfs) {
            this.hostfs = hostfs;
            return this;
        }

        saveDiskImages() {
            return this.runExclusive(() => {
                if (!this.module) throw new Error('Emulator is not running');
                return this.flushImages();
            });
        }

        checkImageUpdates() {
            return this.runExclusive(async () => {
                await this.diskImages.open();
                await this.diskImages.loadAll();
                return this.diskImages.checkUpdates();
            });
        }

        applyImageUpdates(imageNames) {
            return this.runExclusive(async () => {
                if (!Array.isArray(imageNames)) throw new TypeError('Image names must be an array');
                if (!imageNames.length) {
                    if (this.startupError) throw this.startupError;
                    return this.module;
                }
                await this.diskImages.open();
                const staged = await this.diskImages.stageUpdates(imageNames);
                const running = !!this.module;
                try {
                    await this.exitModule();
                    await this.updateCheck;
                    await this.diskImages.commit(staged);
                } catch (error) {
                    await this.diskImages.removeFiles(staged.files);
                    if (running && !this.module) await this.loadModule();
                    throw error;
                }
                return running ? this.loadModule() : undefined;
            });
        }

        clearDiskImages() {
            return this.runExclusive(async () => {
                const running = !!this.module;
                await this.diskImages.open();
                await this.exitModule();
                await this.updateCheck;
                await this.diskImages.clear();
                if (running) return this.loadModule();
            });
        }

        diskImageUsage() {
            return this.runExclusive(async () => {
                await this.diskImages.open();
                return this.diskImages.usage();
            });
        }

        resumeAudio() {
            const context = this.module?.SDL3?.audioContext;
            return context?.state === 'suspended' ? context.resume() : Promise.resolve();
        }

        setSnesButton(button, pressed) {
            if (!Object.prototype.hasOwnProperty.call(SNES_BUTTONS, button)) {
                throw new RangeError(`Unknown SNES button: ${button}`);
            }
            if (!this.module?._zeal_snes_button_web) return false;
            this.module._zeal_snes_button_web(SNES_BUTTONS[button], pressed ? 1 : 0);
            return true;
        }

        clearSnesButtons() {
            if (!this.module?._zeal_snes_clear_web) return false;
            this.module._zeal_snes_clear_web();
            return true;
        }

        // Retained for existing embedders; the WASM frontend has no debugger UI.
        toggleDebugger() {
            return false;
        }

        toggleFps() {
            if (!this.module || !this.module._show_fps) return false;
            const showFps = !!this.module.getValue(this.module._show_fps, 'i8');
            this.module.setValue(this.module._show_fps, showFps ? 0 : 1, 'i8');
            return true;
        }
    }

    window.ZealNative = ZealNative;
})();
