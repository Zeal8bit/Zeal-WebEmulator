(() => {
    // OPFS files are opened by WasmFS, never copied out of the running module.
    class DiskImageStore {
        constructor({storage = 'opfs', storageNamespace, images = [], onWarning = console.warn,
            onUpdateAvailable = null} = {}) {
            if (!['opfs', 'memory'].includes(storage)) {
                throw new RangeError(`Unknown image storage: ${storage}`);
            }
            if (storageNamespace !== undefined &&
                (typeof storageNamespace !== 'string' || !storageNamespace.trim())) {
                throw new TypeError('storageNamespace must be a non-empty string when provided');
            }
            this.storage = storage;
            this.storageNamespace = storageNamespace;
            this.images = images.filter(image => image.source != null);
            for (const image of this.images) {
                if (typeof image.source !== 'string' && !(image.source instanceof URL) &&
                    !(image.source instanceof Uint8Array) && !(image.source instanceof ArrayBuffer)) {
                    throw new TypeError('Image source must be a URL, Uint8Array, or ArrayBuffer');
                }
            }
            this.onWarning = onWarning;
            this.onUpdateAvailable = onUpdateAvailable;
            this.manifest = {version: 1, images: {}};
            this.memory = new Map();
            this.directory = null;
            this.releaseLock = null;
        }

        async hash(value) {
            const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
            return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
        }

        async open() {
            if (this.releaseLock) return;
            if (!window.isSecureContext) {
                throw new Error('Open the emulator using HTTPS, or use http://localhost or http://127.0.0.1 on the machine running the server.');
            }
            if (!navigator.locks) throw new Error('The Web Locks API is unavailable in this browser context.');
            // Keep the legacy input byte-for-byte when no workspace is selected.
            // Explicit identifiers have a separate domain and are never URL-resolved.
            const namespace = await this.hash(this.storageNamespace === undefined
                ? new URL('.', document.baseURI).href
                : `storageNamespace:${JSON.stringify(this.storageNamespace)}`);
            this.namespace = namespace;
            for (const image of this.images) image.id = await this.hash(String(image.key ?? image.source));
            if (new Set(this.images.map(image => image.id)).size !== this.images.length) {
                throw new Error('Configured images must have distinct storage keys');
            }
            let lockAcquisition;
            const lockReady = new Promise((resolve, reject) => { lockAcquisition = {resolve, reject}; });
            this.lockTask = navigator.locks.request(`zeal-images:${this.storage}:${namespace}`,
                {mode: 'exclusive', ifAvailable: true}, async lock => {
                    if (!lock) throw new Error('Disk images are already in use by another tab');
                    await new Promise(resolve => {
                        this.releaseLock = resolve;
                        lockAcquisition.resolve();
                    });
                });
            this.lockTask.catch(lockAcquisition.reject);
            await lockReady;
            try {
                if (this.storage === 'opfs') {
                    if (!navigator.storage?.getDirectory) {
                        throw new Error('The origin private file system (OPFS) is unavailable in this browser context.');
                    }
                    const rootDirectory = await navigator.storage.getDirectory();
                    const applicationDirectory = await rootDirectory.getDirectoryHandle('zeal-native', {create: true});
                    this.directory = await applicationDirectory.getDirectoryHandle(namespace, {create: true});
                    let manifestFile;
                    try { manifestFile = await this.directory.getFileHandle('manifest.json'); }
                    catch (error) { if (error.name !== 'NotFoundError') throw error; }
                    this.manifest = manifestFile ? JSON.parse(await (await manifestFile.getFile()).text())
                        : {version: 1, images: {}};
                }
                if (this.manifest.version !== 1 || !this.manifest.images ||
                    typeof this.manifest.images !== 'object' || Array.isArray(this.manifest.images)) {
                    throw new Error('Invalid disk image manifest; existing data was left intact');
                }
                for (const record of Object.values(this.manifest.images)) {
                    if (!record || !/^[a-f0-9-]+\.img$/.test(record.file)) {
                        throw new Error('Invalid disk image record; existing data was left intact');
                    }
                }
            } catch (error) {
                await this.close();
                throw error;
            }
        }

        async close() {
            this.releaseLock?.();
            this.releaseLock = null;
            await this.lockTask;
            this.lockTask = null;
            this.directory = null;
        }

        descriptor(name) {
            const image = this.images.find(candidate => candidate.name === name);
            if (!image) throw new RangeError(`Unknown or unconfigured disk image: ${name}`);
            return image;
        }

        metadata(response) {
            return {etag: response.headers.get('ETag'), lastModified: response.headers.get('Last-Modified')};
        }

        async fetchRemote(image) {
            const source = image.source;
            if (source instanceof Uint8Array || source instanceof ArrayBuffer) {
                return {data: new Uint8Array(source), etag: null, lastModified: null};
            }
            const response = await fetch(source, {cache: 'no-cache'});
            if (!response.ok) throw new Error(`Failed to fetch ${source}: HTTP ${response.status}`);
            return {data: new Uint8Array(await response.arrayBuffer()), ...this.metadata(response)};
        }

        async writeFile(name, data) {
            const file = await this.directory.getFileHandle(name, {create: true});
            const writable = await file.createWritable();
            try {
                await writable.write(data);
                await writable.close();
            } catch (error) {
                await writable.abort().catch(() => {});
                throw error;
            }
        }

        async stageUpdates(imageNames) {
            const selected = [...new Set(imageNames)].map(name => this.descriptor(name));
            const nextManifest = structuredClone(this.manifest);
            const files = [];
            try {
                for (const image of selected) {
                    const remote = await this.fetchRemote(image);
                    const filename = `${crypto.randomUUID()}.img`;
                    files.push(filename);
                    if (this.storage === 'opfs') await this.writeFile(filename, remote.data);
                    else this.memory.set(filename, remote.data);
                    nextManifest.images[image.id] = {file: filename, etag: remote.etag, lastModified: remote.lastModified};
                }
                return {manifest: nextManifest, files};
            } catch (error) {
                await this.removeFiles(files);
                throw error;
            }
        }

        async removeFiles(files) {
            for (const filename of files) {
                try {
                    if (this.storage === 'opfs') await this.directory.removeEntry(filename);
                    else this.memory.delete(filename);
                } catch (error) {
                    if (error.name !== 'NotFoundError') {
                        // Cleanup happens after commit. An observer must not turn a
                        // successful commit into a rollback that deletes active files.
                        try { this.onWarning('Image cleanup failed', error); }
                        catch (warningError) { console.error(warningError); }
                    }
                }
            }
        }

        async commit(staged) {
            try {
                if (this.storage === 'opfs') await this.writeFile('manifest.json', JSON.stringify(staged.manifest));
            } catch (error) {
                await this.removeFiles(staged.files);
                throw error;
            }
            const previousManifest = this.manifest;
            this.manifest = staged.manifest;
            const retainedFiles = new Set(Object.values(this.manifest.images).map(record => record.file));
            await this.removeFiles(Object.values(previousManifest.images)
                .map(record => record.file).filter(filename => !retainedFiles.has(filename)));
        }

        async loadAll() {
            await this.open();
            const missing = this.images.filter(image => !this.manifest.images[image.id]);
            if (missing.length) await this.commit(await this.stageUpdates(missing.map(image => image.name)));
            const loaded = {};
            for (const image of this.images) {
                const record = this.manifest.images[image.id];
                if (this.storage === 'opfs') {
                    await this.directory.getFileHandle(record.file);
                    image.path = `/opfs/zeal-native/${this.namespace}/${record.file}`;
                } else {
                    loaded[image.name] = this.memory.get(record.file);
                    if (!(loaded[image.name] instanceof Uint8Array)) {
                        throw new Error(`Stored image is missing: ${image.name}`);
                    }
                }
            }
            return loaded;
        }

        async checkUpdates() {
            const updates = [];
            for (const image of this.images) {
                if (typeof image.source !== 'string' && !(image.source instanceof URL)) continue;
                try {
                    const response = await fetch(image.source, {method: 'HEAD', cache: 'no-cache',
                        signal: AbortSignal.timeout(10000)});
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const remote = this.metadata(response);
                    const local = this.manifest.images[image.id];
                    if (!remote.etag && !remote.lastModified) {
                        this.onWarning(`Update detection unavailable for ${image.name}: no remote validators`);
                        continue;
                    }
                    const changed = remote.etag ? remote.etag !== local.etag
                        : remote.lastModified !== local.lastModified;
                    if (changed) {
                        const update = {name: image.name, source: String(image.source),
                            local: {etag: local.etag, lastModified: local.lastModified}, remote};
                        updates.push(update);
                        this.onUpdateAvailable?.(update);
                    }
                } catch (error) {
                    this.onWarning(`Image update check failed for ${image.name}`, error);
                }
            }
            return updates;
        }

        async persist(filesystem) {
            if (this.storage !== 'opfs') {
                for (const image of this.images) {
                    const filename = this.manifest.images[image.id].file;
                    const data = filesystem.readFile(image.path);
                    this.memory.set(filename, data);
                }
            }
            return this.images.map(image => image.name);
        }

        async clear() {
            const nextManifest = structuredClone(this.manifest);
            for (const image of this.images) delete nextManifest.images[image.id];
            await this.commit({manifest: nextManifest, files: []});
        }

        async usage() {
            let total = 0;
            for (const image of this.images) {
                const record = this.manifest.images[image.id];
                if (!record) continue;
                if (this.storage === 'opfs') {
                    total += (await (await this.directory.getFileHandle(record.file)).getFile()).size;
                } else {
                    const data = this.memory.get(record.file);
                    total += data?.byteLength || 0;
                }
            }
            return total;
        }
    }
    window.DiskImageStore = DiskImageStore;
})();
