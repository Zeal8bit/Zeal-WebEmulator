/**
 * SPDX-FileCopyrightText: 2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @brief HostFS lets the virtual machine access (a part of) the host filesystem
 *
 * The read and wrtie functions, provided as parameters will let this module read the
 * Z80 machine memory directly.
 */
function HostFS(dma_read, dma_write) {
    const ZOS_MAX_NAME_LENGTH = 16;

    const OPERATION_REG = 0xF;

    /* List of possible operations requested by the VM */
    const OP_WHOAMI  = 0;
    const OP_OPEN    = 1;
    const OP_STAT    = 2;
    const OP_READ    = 3;
    const OP_WRITE   = 4;
    const OP_CLOSE   = 5;
    const OP_OPENDIR = 6;
    const OP_READDIR = 7;
    const OP_MKDIR   = 8;
    const OP_RM      = 9;
    const OP_LAST    = OP_RM;

    let operations = [];
    operations[OP_OPEN]    = fs_open;
    operations[OP_STAT]    = fs_stat;
    operations[OP_READ]    = fs_read;
    operations[OP_WRITE]   = fs_write;
    operations[OP_CLOSE]   = fs_close;
    operations[OP_OPENDIR] = fs_opendir;
    operations[OP_READDIR] = fs_readdir;
    operations[OP_MKDIR]   = fs_mkdir;
    operations[OP_RM]      = fs_rm;
    operations[OP_WHOAMI]  = fs_whoami;


    /**
     * @brief Function used by the VM to detect if this emulation layer
     *        is available.
     */
    function fs_whoami() {
        /* Check if the web browser is compatible */
        if (window.showDirectoryPicker) {
            /* Compatible! */
            registers[OPERATION_REG] = 0xd3;
        } else {
            /* Not compatible */
            registers[OPERATION_REG] = 0;
        }
    }

    /**
     * When 0xFF, operation in progress
     * When 0x00, operation success (idle state)
     * Else, error code
     */
    const ZOS_SUCCESS         = 0;
    const ZOS_FAILURE         = 1;
    const ZOS_NO_SUCH_ENTRY   = 4;
    const ZOS_CANNOT_REGISTER_MORE = 20;
    const ZOS_NO_MORE_ENTRIES = 21;
    const ZOS_PENDING         = 0xFF;

    function set_status(val) {
        registers[OPERATION_REG] = val;
    }

    /**
     * @brief Registers used in various way depending on the request
     */
    var registers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    function io_read(port, upper) {
        return registers[port];
    }

    function io_write(port, value) {
        /**
         * I/O mapping for write is as follows:
         *  0x00 - Start operation
         *      1 - Open directory
         *      2 - Read directory
         *      3 - Open file
         *      4 - Read file
         *      5 - Close
         *  0x01 - Path address, LSB
         *  0x02 - Path address, MSB
         */
        if (port == OPERATION_REG) {
            if (value >= 0 && value <= OP_LAST) {
                set_status(ZOS_PENDING);
                operations[value]();
            } else {
                console.log("[HostFS] Invalid operation\n");
                set_status(ZOS_FAILURE);
            }
        } else if (port >= 0 && port <= 7) {
            registers[port] = value;
        } else {
            console.log("[HostFS] Unknown register write\n");
        }
    }

    this.io_region = {
        write: io_write,
        read: io_read,
        size: 0x10
    };


    /* Private functions */
    let descriptors = new Array(256).fill(null);
    let root_handle = null;

    function find_descriptor() {
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i] == null)
                return i;
        }

        throw ZOS_CANNOT_REGISTER_MORE;
    }


    /**
     * @brief Check if the emualtor has access to a directory on the host filsystem
     */
    async function check_root() {
        if (root_handle) return ZOS_SUCCESS;
        return mount();
    }

    async function mount() {
        const opts = { id: 7777, mode: "readwrite"};
        const duration = 3000;
        const speed = 100;
        popout.info("Specify the directory to use as a virtual disk", duration, speed);
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
            root_handle = await window.showDirectoryPicker(opts);
            window.dispatchEvent(new CustomEvent("hostfs", {
                detail: {
                    mounted: true
                }
            }));
            return ZOS_SUCCESS;
        } catch (error) {
            window.dispatchEvent(new CustomEvent("hostfs", {
                detail: {
                    mounted: false
                }
            }));
            return ZOS_FAILURE;
        }
    }

    async function unmount() {
        root_handle = null;
        window.dispatchEvent(new CustomEvent("hostfs", {
            detail: {
                mounted: false
            }
        }));
    }

    function mounted() {
        return !!root_handle;
    }

    this.mount = mount;
    this.unmount = unmount;
    this.mounted = mounted;


    /**
     * @brief Get the path the system is trying to access
     */
    function get_path() {
        let virt_addr = (registers[2] << 8) | registers[1];
        let bytes = [];
        while (1) {
            const byte = dma_read(virt_addr++);
            if (byte == 0) {
                break;
            }
            bytes.push(byte);
        }
        return String.fromCharCode(...bytes);
    }


    async function get_last_dir_handle(path) {
        if (path == "/") {
            return { handle: root_handle, name: null };
        }
        if (path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        const directories = path.slice(1).split('/');
        /* Only keep the directories, without the last file/dir */
        const pure_path = directories.slice(0, -1);
        const last_name = directories[directories.length - 1];

        /* Iterate through all the directories until we reach the end */
        let current = root_handle;
        for (const dir of pure_path) {
          try {
            current = await current.getDirectoryHandle(dir, { create: false });
          } catch (error) {
            console.error(`Error navigating to directory '${part}':`, error);
            throw error;
          }
        }

        return { handle: current, name: last_name };
    }

    async function get_dir_handle(path) {
        const { handle, name } = await get_last_dir_handle(path);
        if (name == null) {
            return handle;
        }
        return await handle.getDirectoryHandle(name);
    }

    function get_dma_32bit_value(addr) {
        const b0 = dma_read(addr++) << 0;
        const b1 = dma_read(addr++) << 8;
        const b2 = dma_read(addr++) << 16;
        const b3 = dma_read(addr++) << 24;
        return b3 | b2 | b1 | b0;
    }


    const ZOS_FD_OFFSET_T = 8;
    const ZOS_FD_USER_T   = 12;
    const ZOS_FL_RDONLY = 0
    const ZOS_FL_WRONLY = 1
    const ZOS_FL_RDWR   = 2
    const ZOS_FL_TRUNC  = 1 << 2
    const ZOS_FL_APPEND = 2 << 2
    const ZOS_FL_CREAT  = 4 << 2


    /**
     * @brief Open a file (not directory!) from the file system
     * @params
     *  REG0 - Flags
     *  REG1 - Address of path (LSB)
     *  REG2 - Address of path (MSB)
     * @returns
     *  REG0..3 - 32-bit size of the file (little endian)
     *  REG4 - Abstract index representing the opened file
     */
    async function fs_open() {
        const ready = await check_root();
        if (ready != ZOS_SUCCESS) {
            set_status(ready);
            return;
        }
        const path = get_path();
        const flags = registers[0];
        const o_write = (flags & (ZOS_FL_WRONLY | ZOS_FL_RDWR)) != 0;
        const o_trunc = (flags & ZOS_FL_TRUNC) != 0;
        const o_creat = (flags & ZOS_FL_CREAT) != 0;
        try {
            let write_handle = null;
            let index = find_descriptor();

            let { handle, name } = await get_last_dir_handle(path);
            let file = handle;
            let file_size = 0;
            let is_dir = handle.kind === "directory";

            let fhandle = null;
            try {
                fhandle = await handle.getFileHandle(name, { create: o_creat });
                is_dir = false;
            } catch (error) {
                /* Check if the directory exists, if not, an exception will be raised */
                await handle.getDirectoryHandle(name);
            }

            if (is_dir) {
                file_size = 4096; // Arbitrary
            } else {
                file = await fhandle.getFile();
                file_size = file.size;

                if (o_write) {
                    write_handle = await fhandle.createWritable({ keepExistingData: !o_trunc });
                    if (o_trunc) {
                        write_handle.truncate(0);
                        file_size = 0;
                    }
                }
            }

            /* Get all the entries of the directory */
            descriptors[index] = { is_dir, handle: file, write_handle };
            /* Write the 32-bit file size */
            if (file_size > 0xFFFFFFFF) {
                file_size = 0xFFFFFFFF;
            }
            registers[0] = (file_size >> 0)  & 0xff;
            registers[1] = (file_size >> 8)  & 0xff;
            registers[2] = (file_size >> 16) & 0xff;
            registers[3] = (file_size >> 24) & 0xff;
            registers[4] = index & 0xff;
            set_status(ZOS_SUCCESS);
        } catch (error) {
            set_status(ZOS_NO_SUCH_ENTRY);
        }
    }


    /**
     * @brief Stat the given opened file (or directory)
     * @params
     *  REG0..1 - Address of the structure to fill with the data
     *  REG2 - Context of the opened entry
     * @returns
     *  None
     */
    async function fs_stat() {
        const ready = await check_root();
        if (ready != ZOS_SUCCESS) {
            set_status(ready);
            return;
        }
        /* Get the opened file structure and the buffer */
        let struct_addr = (registers[1] << 8) | registers[0];
        const fd = registers[2];
        const { is_dir, handle } = descriptors[fd];
        /* Need to get the size, the name and the last modification date */
        // const size = is_dir ? 4096 : handle.size;
        const name = zos_format_name(handle.name);
        /* Directories opened with `open` won't have the modified date, FIXME! */
        const d = handle.lastModifiedDate;
        let regs = [0, 0, 0, 0, 0, 0, 0, 0];

        if (d) {
            /* Generate the 8 BCD registers */
            const high = Math.floor(d.getFullYear() / 100);
            const year = d.getFullYear() % 100;
            const month = d.getMonth() + 1;
            const date = d.getDate();
            const day = d.getDay();
            const seconds = d.getSeconds();
            const minutes = d.getMinutes();
            const hours = d.getHours();
            regs = [high, year, month, date, day, hours, minutes, seconds];
            regs = regs.map(value => parseInt(value.toString(10), 16));
        }

        /* Write to the structure, size is not required (handled by the OS) */
        /* BCD date */
        for (var i = 0; i < regs.length; i++) {
            dma_write(struct_addr++, regs[i] & 0xff);
        }
        /* 16-char file name */
        for (var i = 0; i < ZOS_MAX_NAME_LENGTH; i++) {
            dma_write(struct_addr++, name.charCodeAt(i) & 0xff);
        }
        set_status(ZOS_SUCCESS);
    }


    /**
     * @brief Read the given opened file
     * @params
     *  REG0..1 - Address of the opened file
     *  REG2..3 - Buffer to fill with data read from file
     *  REG4..5 - Number of bytes to read
     * @returns
     *  REG4..5 - Number of bytes read from the file
     */
    async function fs_read() {
        const ready = await check_root();
        if (ready != ZOS_SUCCESS) {
            set_status(ready);
            return;
        }
        /* Get the opened file structure and the buffer */
        const struct_addr = (registers[1] << 8) | registers[0];
        const buffer_addr = (registers[3] << 8) | registers[2];
        const buffer_len  = (registers[5] << 8) | registers[4];
        /* Get the abstract context from that structure */
        const fd = dma_read(struct_addr + ZOS_FD_USER_T);
        /* Get the 32-bit offset to start reading from */
        const offset = get_dma_32bit_value(struct_addr + ZOS_FD_OFFSET_T);
        const { is_dir, handle, content } = descriptors[fd];
        if (is_dir) {
            set_status(ZOS_FAILURE);
            return;
        }
        const result = handle.slice(offset, offset + buffer_len);
        const abuffer = await result.arrayBuffer();
        const array = new Uint8Array(abuffer);
        for (var i = 0; i < buffer_len; i++) {
            dma_write(buffer_addr +  i, array[i]);
        }
        /* Bytes read in registers 4 and 5 */
        registers[4] = buffer_len & 0xff;
        registers[5] = (buffer_len >> 8) & 0xff;
        set_status(ZOS_SUCCESS);
    }


    /**
     * @brief Write to the given opened file
     * @params
     *  REG0..1 - Address of the opened file
     *  REG2..3 - Buffer containing the bytes to write to the file
     *  REG4..5 - Number of bytes to write
     * @returns
     *  REG4..5 - Number of bytes written to the file
     */
    async function fs_write() {
        const ready = await check_root();
        if (ready != ZOS_SUCCESS) {
            set_status(ready);
            return;
        }
        /* Get the opened file structure and the buffer */
        const struct_addr = (registers[1] << 8) | registers[0];
        const buffer_addr = (registers[3] << 8) | registers[2];
        const buffer_len  = (registers[5] << 8) | registers[4];
        /* Get the abstract context from that structure */
        const fd = dma_read(struct_addr + ZOS_FD_USER_T);
        /* Get the 32-bit offset to start reading from */
        const offset = get_dma_32bit_value(struct_addr + ZOS_FD_OFFSET_T);
        const { is_dir, handle, write_handle } = descriptors[fd];
        if (is_dir) {
            set_status(ZOS_FAILURE);
            return;
        }
        /* Get the bytes from the RAM */
        var content = [];
        for (var i = 0; i < buffer_len; i++) {
            content.push(dma_read(buffer_addr + i));
        }
        await write_handle.seek(offset);
        await write_handle.write(new Uint8Array(content));

        /* Bytes written in registers 4 and 5 */
        registers[4] = buffer_len & 0xff;
        registers[5] = (buffer_len >> 8) & 0xff;
        set_status(ZOS_SUCCESS);
    }


    /**
     * @brief Close an opened entry (file or directory)
     * @params
     *  REG0 - Abstract index (opened entry)
     * @returns
     *
     */
    async function fs_close() {
        const ready = await check_root();
        if (ready != ZOS_SUCCESS) {
            set_status(ready);
            return;
        }
        let index = registers[0];
        if (!descriptors[index].is_dir) {
            const write_handle = descriptors[index].write_handle;
            if (write_handle) {
               await write_handle.close();
            }
        }
        descriptors[index] = null;
        set_status(ZOS_SUCCESS);
    }


    /**
     * @brief Open a directory from the file system
     * @params
     *  REG0 - Empty
     *  REG1 - Address of path (LSB)
     *  REG2 - Address of path (MSB)
     * @returns
     *  REG0..3 - 32-bit size of the file (little endian)
     *  REG4 - Abstract index representing the opened file
     */
    async function fs_opendir() {
        const ready = await check_root();
        if (ready != ZOS_SUCCESS) {
            set_status(ready);
            return;
        }
        const path = get_path();
        try {
            let handle = await get_dir_handle(path);
            let index = find_descriptor();
            /* Get all the entries of the directory */
            var content = [];
            descriptors[index] = { is_dir: true, handle, content };
            for await (const entry of handle.values()) {
                content.push(entry);
            }
            registers[4] = index & 0xff;
            set_status(ZOS_SUCCESS);
        } catch (error) {
            set_status(ZOS_NO_SUCH_ENTRY);
        }
    }


    /**
     * @brief Read the next entry in the opened directory
     * @params
     *  REG0..1 - Address of the structure to fill with the next entry
     *  REG2 - Context of the opened directory
     * @returns
     *  None
     */
    async function fs_readdir() {
        const ready = await check_root();
        if (ready != ZOS_SUCCESS) {
            set_status(ready);
            return;
        }
        let index = registers[2];
        let content = descriptors[index].content;
        if (content.length > 0) {
            let next_entry = content.shift();
            const is_file = (next_entry.kind == "file") ? 1 : 0;
            /* TODO: Check empty names (non-ASCII) */
            const name = zos_format_name(next_entry.name);
            /* Fill the structure with "DMA" */
            var virt_addr = (registers[1] << 8) | registers[0];
            dma_write(virt_addr++, is_file);
            for (var i = 0; i < ZOS_MAX_NAME_LENGTH; i++) {
                dma_write(virt_addr++, name.charCodeAt(i) & 0xff);
            }
            set_status(ZOS_SUCCESS);
        } else {
            set_status(ZOS_NO_MORE_ENTRIES);
        }
    }


    /**
     * @brief Make a new directory in the file system
     * @params
     *  REG0 - Empty
     *  REG1 - Address of path (LSB)
     *  REG2 - Address of path (MSB)
     * @returns
     *  REG0..3 - 32-bit size of the file (little endian)
     *  REG4 - Abstract index representing the opened file
     */
    async function fs_mkdir() {
        const ready = await check_root();
        if (ready != ZOS_SUCCESS) {
            set_status(ready);
            return;
        }
        try {
            const path = get_path();
            let { handle, name } = await get_last_dir_handle(path);
            await handle.getDirectoryHandle(name, { create: true });
            set_status(ZOS_SUCCESS);
        } catch (error) {
            set_status(ZOS_FAILURE);
        }
    }

    /**
     * @brief Remove a file on the file system
     * @params
     *  REG0 - Empty
     *  REG1 - Address of path (LSB)
     *  REG2 - Address of path (MSB)
     * @returns
     *  None
    */
    async function fs_rm() {
        const ready = await check_root();
        if (ready != ZOS_SUCCESS) {
            set_status(ready);
            return;
        }
        let err = ZOS_SUCCESS;
        const path = get_path();
        try {
            let { handle, name } = await get_last_dir_handle(path);
            const fhandler = await handle.getFileHandle(name);
            await fhandler.remove();
        } catch (error) {
            err = ZOS_FAILURE;
        }

        /* Check if it's a directory */
        if (err != ZOS_SUCCESS) {
            try {
                const path = get_path();
                let { handle, name } = await get_last_dir_handle(path);
                const dhandler = await handle.getDirectoryHandle(name);
                await dhandler.remove();
                err = ZOS_SUCCESS;
            } catch (error) {
                err = ZOS_FAILURE;
            }
        }

        set_status(err);
    }


    /**
     * @brief Helper to always make a file name 16 bytes big
     */
    function zos_format_name(name) {
        if (name.length < ZOS_MAX_NAME_LENGTH) {
          return name.padEnd(ZOS_MAX_NAME_LENGTH, '\0');
        } else if (name.length > ZOS_MAX_NAME_LENGTH) {
          return name.slice(0, ZOS_MAX_NAME_LENGTH - 1) + '~';
        } else {
          return name;
        }
    }
}
