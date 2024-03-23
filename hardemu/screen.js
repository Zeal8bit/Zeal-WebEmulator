/**
 * SPDX-FileCopyrightText: 2022-2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function ColorPalette() {
    /* Default color palette: VGA 256-color */
    const palette565 = [0x0000, 0x0015, 0x1540, 0x0555, 0xA800, 0xA815, 0xAAA0, 0xAD55, 0x52AA, 0x52BF, 0x57EA, 0x57FF, 0xFAAA, 0xFABF, 0xFFEA, 0xFFFF,
                        0x0000, 0x1082, 0x2104, 0x31A6, 0x4228, 0x52AA, 0x632C, 0x73AE, 0x8C51, 0x9CD3, 0xAD55, 0xBDD7, 0xCE59, 0xDEFB, 0xEF7D, 0xFFFF,
                        0x003F, 0x403F, 0x801F, 0xB81F, 0xF81F, 0xF817, 0xF810, 0xF808, 0xF801, 0xFA00, 0xFC00, 0xFDE0, 0xFFE0, 0xBFE0, 0x87E0, 0x47E0,
                        0x27E0, 0x27E8, 0x1FF0, 0x17F7, 0x07FF, 0x05FF, 0x041F, 0x021F, 0x841F, 0x9C1F, 0xBC1F, 0xDC1F, 0xFC1F, 0xFC1B, 0xFC17, 0xFC13,
                        0xFC10, 0xFCF0, 0xFDF0, 0xFEF0, 0xFFF0, 0xDFF0, 0xBFF0, 0x9FF0, 0x87F0, 0x87F3, 0x87F7, 0x87FB, 0x87FF, 0x86FF, 0x85FF, 0x84FF,
                        0xBDDF, 0xCDDF, 0xDDDF, 0xEDDF, 0xFDDF, 0xFDDD, 0xFDDB, 0xFDD9, 0xFDD7, 0xFE57, 0xFEF7, 0xFF77, 0xFFF7, 0xEFF7, 0xDFF7, 0xCFF7,
                        0xBFF7, 0xBFF9, 0xBFFB, 0xBFFD, 0xBFFF, 0xBF7F, 0xBEFF, 0xBE5F, 0x000E, 0x180E, 0x380E, 0x500E, 0x700E, 0x700A, 0x7007, 0x7003,
                        0x7000, 0x70E0, 0x71C0, 0x72A0, 0x7380, 0x5380, 0x3B80, 0x1B80, 0x0B80, 0x0B83, 0x0387, 0x038A, 0x038E, 0x02AE, 0x01CE, 0x00EE,
                        0x39CE, 0x41CE, 0x51CE, 0x61CE, 0x71CE, 0x71CC, 0x71CA, 0x71C8, 0x71C7, 0x7227, 0x72A7, 0x7307, 0x7387, 0x6387, 0x5387, 0x4387,
                        0x3B87, 0x3B88, 0x3B8A, 0x3B8C, 0x3B8E, 0x3B0E, 0x3AAE, 0x3A2E, 0x528E, 0x5A8E, 0x628E, 0x6A8E, 0x728E, 0x728D, 0x728C, 0x728B,
                        0x728A, 0x72CA, 0x730A, 0x734A, 0x738A, 0x6B8A, 0x638A, 0x5B8A, 0x538A, 0x538B, 0x538C, 0x538D, 0x538E, 0x534E, 0x530E, 0x52CE,
                        0x0008, 0x1008, 0x2008, 0x3008, 0x4008, 0x4006, 0x4004, 0x4002, 0x4000, 0x4080, 0x4100, 0x4180, 0x4200, 0x3200, 0x2200, 0x1200,
                        0x0200, 0x0202, 0x0204, 0x0206, 0x0208, 0x0188, 0x0108, 0x0088, 0x2108, 0x2908, 0x3108, 0x3908, 0x4108, 0x4107, 0x4106, 0x4105,
                        0x4104, 0x4144, 0x4184, 0x41C4, 0x4204, 0x3A04, 0x3204, 0x2A04, 0x2204, 0x2205, 0x2206, 0x2207, 0x2208, 0x21C8, 0x2188, 0x2148,
                        0x2968, 0x3168, 0x3168, 0x3968, 0x4168, 0x4167, 0x4166, 0x4166, 0x4165, 0x4185, 0x41A5, 0x41E5, 0x4205, 0x3A05, 0x3205, 0x3205,
                        0x2A05, 0x2A06, 0x2A06, 0x2A07, 0x2A08, 0x29E8, 0x29A8, 0x2988, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0xEB9E];

    /* Same palette as before but the colors are already converted to RGB888 for speed reasons */
    const palette888 = [0x000000, 0x0000a8, 0x10a800, 0x00a8a8, 0xa80000, 0xa800a8, 0xa85400, 0xa8a8a8, 0x505450, 0x5054f8, 0x50fc50, 0x50fcf8, 0xf85450, 0xf854f8, 0xf8fc50, 0xf8fcf8,
                        0x000000, 0x101010, 0x202020, 0x303430, 0x404440, 0x505450, 0x606460, 0x707470, 0x888888, 0x989898, 0xa8a8a8, 0xb8b8b8, 0xc8c8c8, 0xd8dcd8, 0xe8ece8, 0xf8fcf8,
                        0x0004f8, 0x4004f8, 0x8000f8, 0xb800f8, 0xf800f8, 0xf800b8, 0xf80080, 0xf80040, 0xf80008, 0xf84000, 0xf88000, 0xf8bc00, 0xf8fc00, 0xb8fc00, 0x80fc00, 0x40fc00,
                        0x20fc00, 0x20fc40, 0x18fc80, 0x10fcb8, 0x00fcf8, 0x00bcf8, 0x0080f8, 0x0040f8, 0x8080f8, 0x9880f8, 0xb880f8, 0xd880f8, 0xf880f8, 0xf880d8, 0xf880b8, 0xf88098,
                        0xf88080, 0xf89c80, 0xf8bc80, 0xf8dc80, 0xf8fc80, 0xd8fc80, 0xb8fc80, 0x98fc80, 0x80fc80, 0x80fc98, 0x80fcb8, 0x80fcd8, 0x80fcf8, 0x80dcf8, 0x80bcf8, 0x809cf8,
                        0xb8b8f8, 0xc8b8f8, 0xd8b8f8, 0xe8b8f8, 0xf8b8f8, 0xf8b8e8, 0xf8b8d8, 0xf8b8c8, 0xf8b8b8, 0xf8c8b8, 0xf8dcb8, 0xf8ecb8, 0xf8fcb8, 0xe8fcb8, 0xd8fcb8, 0xc8fcb8,
                        0xb8fcb8, 0xb8fcc8, 0xb8fcd8, 0xb8fce8, 0xb8fcf8, 0xb8ecf8, 0xb8dcf8, 0xb8c8f8, 0x000070, 0x180070, 0x380070, 0x500070, 0x700070, 0x700050, 0x700038, 0x700018,
                        0x700000, 0x701c00, 0x703800, 0x705400, 0x707000, 0x507000, 0x387000, 0x187000, 0x087000, 0x087018, 0x007038, 0x007050, 0x007070, 0x005470, 0x003870, 0x001c70,
                        0x383870, 0x403870, 0x503870, 0x603870, 0x703870, 0x703860, 0x703850, 0x703840, 0x703838, 0x704438, 0x705438, 0x706038, 0x707038, 0x607038, 0x507038, 0x407038,
                        0x387038, 0x387040, 0x387050, 0x387060, 0x387070, 0x386070, 0x385470, 0x384470, 0x505070, 0x585070, 0x605070, 0x685070, 0x705070, 0x705068, 0x705060, 0x705058,
                        0x705050, 0x705850, 0x706050, 0x706850, 0x707050, 0x687050, 0x607050, 0x587050, 0x507050, 0x507058, 0x507060, 0x507068, 0x507070, 0x506870, 0x506070, 0x505870,
                        0x000040, 0x100040, 0x200040, 0x300040, 0x400040, 0x400030, 0x400020, 0x400010, 0x400000, 0x401000, 0x402000, 0x403000, 0x404000, 0x304000, 0x204000, 0x104000,
                        0x004000, 0x004010, 0x004020, 0x004030, 0x004040, 0x003040, 0x002040, 0x001040, 0x202040, 0x282040, 0x302040, 0x382040, 0x402040, 0x402038, 0x402030, 0x402028,
                        0x402020, 0x402820, 0x403020, 0x403820, 0x404020, 0x384020, 0x304020, 0x284020, 0x204020, 0x204028, 0x204030, 0x204038, 0x204040, 0x203840, 0x203040, 0x202840,
                        0x282c40, 0x302c40, 0x302c40, 0x382c40, 0x402c40, 0x402c38, 0x402c30, 0x402c30, 0x402c28, 0x403028, 0x403428, 0x403c28, 0x404028, 0x384028, 0x304028, 0x304028,
                        0x284028, 0x284030, 0x284030, 0x284038, 0x284040, 0x283c40, 0x283440, 0x283040, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0xe870f0];

    var color_changed = {};

    function toRGB888(color565) {
        const red = ((color565 >> 11) & 0x1F) * 8;
        const green = ((color565 >> 5) & 0x3F) * 4;
        const blue = (color565 & 0x1F) * 8;
        return (red << 16) | (green << 8) | blue;
    }

    /* Get color at index, 16-bit value */
    this.getColorRGB565 = function (color_index) {
        return palette565[color_index];
    }

    /**
     * @brief Return the RGB888 color from the given index.
     *
     * @return Array of 3 values: r, g, b
     */
    this.getColorRGB888 = function (color_index) {
        const color = palette888[color_index];
        return [(color >> 16) & 0xff, (color >> 8) & 0xff, (color >> 0) & 0xff];
    }


    /**
     * @brief Function called when a write (byte) occurs on the memory address where the palette
     *        is mapped.
     *
     * @param address Address relative to this component.
     * @param data    Byte to write at the given offset.
     */
    this.mem_write = function(address, data) {
        /* It looks weird to keep data stored in hex string, but since this module is used a lot by the canvas renderer,
         * it makes more sense to keep them in this form */
        console.assert(address < palette565.length * 2);
        const index = Math.floor(address / 2);
        var color = palette565[index];

        if ((address & 1) == 1) {
            /* Writing to the MSB, save the LSB */
            color = ((data & 0xff) << 8) | (color & 0xff);
        } else {
            color = ((color & 0xff) << 8) | (data & 0xff);
        }
        palette565[index] = color;
        palette888[index] = toRGB888(color);
        color_changed[index] = true;
    };

    this.hasUpdates = function () {
        return Object.keys(color_changed).length > 0;
    }

    this.colorUpdated = function (color) {
        return color_changed[color];
    }

    this.flushUpdates = function () {
        color_changed = {};
    }
}


function Tileset(Palette, Tilemap) {

    /* The tilemap is necessary to get the palette used by a tile */
    const tilemap = Tilemap;
    const palette = Palette;
    var   mode8bit = true;
    /* List the tile that got updated, either because of a pixel change or because a color changed */
    var tiles_updates = {};

    /* Optimize the tileset by representing it as an array of 256 images */
    const TILE_HEIGHT = 16;
    const TILE_WIDTH  = 16;
    const TILE_SIZE   = TILE_HEIGHT * TILE_WIDTH;

    /* Raw content of the tileset */
    const tiles_raw = new Array(256 * TILE_SIZE);

    /* ImageData table for each tile */
    const tiles = new Array(512);
    for (var i = 0; i < tiles.length; i++) {
        tiles[i] = new ImageData(TILE_WIDTH, TILE_HEIGHT);
    }

    /**
     * @brief Function called when a write (byte) occurs on the memory address where the tileset is mapped.
     *
     * @param address Address relative to this component.
     * @param data    Byte to write at the given offset.
     */
    function tileWritten(address, data) {
        tiles_raw[address] = data;
        const tileidx = Math.floor(address / TILE_SIZE);
        if (mode8bit) {
            const img = tiles[tileidx];
            /* Each pixel takes 4 bytes in RGB888 */
            const pixel = (address % TILE_SIZE) * 4;
            const rgb = palette.getColorRGB888(data);
            img.data[pixel + 0] = rgb[0];
            img.data[pixel + 1] = rgb[1];
            img.data[pixel + 2] = rgb[2];
            img.data[pixel + 3] = 255;
            /* Mark the tile as updated */
            tiles_updates[tileidx] = true;
        } else {
            /* In 4-bit mode, modifying one byte will modify two pixels  */
            /* Tiles are twice smaller in 4-bit mode */
            const img = tiles[2 * tileidx];
            const pixel = (address % Math.floor(TILE_SIZE / 2)) * 8;
            /* Hight nibble is the first pixel */
            const palidx = (tilemap.getPaletteNumber(tileidx) << 4);
            var rgb = palette.getColorRGB888(palidx | (data >> 4));
            img.data[pixel + 0] = rgb[0];
            img.data[pixel + 1] = rgb[1];
            img.data[pixel + 2] = rgb[2];
            img.data[pixel + 3] = 255;
            /* Low nibble is the second pixel */
            rgb = palette.getColorRGB888(palidx | (data & 0xf));
            img.data[pixel + 4] = rgb[0];
            img.data[pixel + 5] = rgb[1];
            img.data[pixel + 6] = rgb[2];
            img.data[pixel + 7] = 255;
            /* Mark the tile as updated */
            tiles_updates[2 * tileidx] = true;
        }
    }
    this.mem_write = tileWritten;

    /**
     * @brief Set the color mode, can be 8-bit or 4-bit.
     */
    this.setColorMode8Bit = function(mode8) {
        if (mode8bit != mode8) {
            /* TODO: Mark all the imaged as updated? */
        }
        mode8bit = mode8;
    }


    /**
     * @brief Get a given tile as an array of pixels
     *
     * @param index Index of the tile to retrieve, 0-255 in 8-bit mode, 0-511 in 4-bit mode
     * @param transparency Boolean set to true if transparency is needed
     */
    this.getTileRGB888 = function(index, transparency, palette_4bit) {
        tiles_updates[index] = false;
        var img = tiles[index];

        const data = img.data;
        const opacity = transparency ? 0 : 255;

        if (mode8bit) {
            for (var i = 0; i < TILE_SIZE; i++) {
                if (tiles_raw[index * TILE_SIZE + i] == 0) {
                    /* If opacity is already correct, no need to redo it again */
                    if (data[i * 4 + 3] == opacity) break;
                    data[i * 4 + 3] = opacity;
                }
            }
        } else {
            const tile_bytes = TILE_SIZE / 2;
            const from = index * tile_bytes;
            const new_palette = palette_4bit << 4;

            /* In 4-bit mode, we have to modify the colors too */
            for (var i = 0; i < tile_bytes; i++) {
                const pixels = tiles_raw[from + i];
                const left = pixels >> 4;
                const right = pixels & 0xf;

                /* Left pixel */
                let rgb = palette.getColorRGB888(new_palette | left);
                data[i * 8 + 0] = rgb[0];
                data[i * 8 + 1] = rgb[1];
                data[i * 8 + 2] = rgb[2];
                data[i * 8 + 3] = (left == 0 && transparency) ? opacity: 255;
                /* Right pixel */
                rgb = palette.getColorRGB888(new_palette | right);
                data[i * 8 + 4] = rgb[0];
                data[i * 8 + 5] = rgb[1];
                data[i * 8 + 6] = rgb[2];
                data[i * 8 + 7] = (right == 0 && transparency) ? opacity: 255;
            }
        }

        return img;
    }


    this.getTileCanvas = function (index, destination, transparency, palette) {

        const img = tiles[index];

        this.getTileRGB888(index, transparency, palette);

        for (var i = 0; i < img.data.length; i++)
            destination.data[i] = img.data[i];
    }


    /**
     * @brief Check the color palette changes and update the tile consequently
     */
    function checkColorsUpdate () {
        if (!palette.hasUpdates()) {
            return;
        }

        /* Number of pixels/colors in total, in all the tiles */
        const length = tiles_raw.length;
        const hasChanged = palette.colorUpdated;
        for (var i = 0; i < length; i++) {
            const color = tiles_raw[i];
            if (hasChanged(color)) {
                /* Simulate a write from the Z80 */
                tileWritten(i, color);
            }
        }

        /* Flush all the color changes */
        palette.flushUpdates();
    }


    /**
     * @brief Function to call to check if any tile changed (or saw a color change) since the last update flush
     */
    this.hasUpdates = function () {
        checkColorsUpdate();
        return Object.keys(tiles_updates).length > 0;
    }

    this.tileUpdated = function (tile) {
        return tiles_updates[tile];
    }

    this.flushUpdates = function () {
        tiles_updates = {};
    }
}



function Sprites(Tileset)
{
    const tileset = Tileset;
    var   mode8bit = true;

    const TILE_HEIGHT = 16;
    const TILE_WIDTH  = 16;
    const TILE_SIZE   = TILE_HEIGHT * TILE_WIDTH;

    const ATTR_SIZE = 8;
    const ATTR_COUNT = 128;

    const ATTR_Y_REG = 0;
    const ATTR_X_REG = 1;
    const ATTR_FLAG_REG = 2;
    const attributes = new Array(ATTR_COUNT);
    const attributes_raw = new Array(ATTR_COUNT * ATTR_SIZE);
    for (var i = 0; i < attributes.length; i++) {
        attributes[i] = {
            x: 0,
            y: 0,
            tile: 0,
            flip_x: 0,
            flip_y: 0,
            palette: 0,
            updates: {
                flip_x: false,
                flip_y: false,
                tile: true,
            },
            img: new ImageData(TILE_WIDTH, TILE_HEIGHT),
            canvas: document.createElement('canvas'),
            ctx: null
        };

        attributes[i].canvas.width  = TILE_WIDTH;
        attributes[i].canvas.height = TILE_HEIGHT;
        attributes[i].ctx = attributes[i].canvas.getContext('2d');
    }

    /**
     * @brief Function called when a write (byte) occurs on the memory address where the sprites are mapped.
     *
     * @param address Address relative to this component.
     * @param data Byte to write at the given offset.
     */
    this.mem_write = function (address, data) {
        attributes_raw[address] = data;
        const attr_index = Math.floor(address / ATTR_SIZE);
        const attribute = attributes[attr_index];
        const register = Math.floor((address % ATTR_SIZE) / 2);
        const msb = (address & 1);
        if (register == ATTR_Y_REG) {
            if (msb) attribute.y = (data << 8) | (attribute.y & 0xff);
            else attribute.y = (attribute.y & 0xff00) | (data & 0xff);
        } else if (register == ATTR_X_REG) {
            if (msb) attribute.x = (data << 8) | (attribute.x & 0xff);
            else attribute.x = (attribute.x & 0xff00) | (data & 0xff);
        } else if (register == ATTR_FLAG_REG) {
            if (msb) {
                const new_tile_msb = (data >> 0) & 1; // 4-bit mode;
                attribute.updates.tile = attribute.updates.tile || (attribute.tile_msb != new_tile_msb);
                attribute.tile_msb = new_tile_msb;

                const new_flip_y = (data >> 2) & 1;
                attribute.updates.flip_y = (attribute.flip_y != new_flip_y);
                attribute.flip_y         = new_flip_y;

                const new_flip_x = (data >> 3) & 1;
                attribute.updates.flip_x = (attribute.flip_x != new_flip_x);
                attribute.flip_x         = new_flip_x;

                const new_palette = (data >> 4) & 0xf;
                attribute.updates.tile = attribute.updates.tile || (attribute.palette != new_palette);
                attribute.palette       = new_palette;
            } else {
                attribute.updates.tile = attribute.updates.tile || (attribute.tile != data);
                attribute.tile = data;
            }
        }
    }

    /**
     * @brief Set the color mode, can be 8-bit or 4-bit.
     */
    this.setColorMode8Bit = function(mode8) {
        mode8bit = mode8;
    }


    /**
     * @brief Check if any update occurred on the sprite
     */
    function hasUpdates(sprite) {
        const updates = sprite.updates;
        return updates.flip_x || updates.flip_y || updates.tile;
    }


    function swapPixel (img, x, y, x2, y2) {
        for (var p = 0; p < 4; p++) {
            const idx0 = (y  * TILE_WIDTH + x)  * 4;
            const idx1 = (y2 * TILE_WIDTH + x2) * 4;
            const tmp = img[idx0 + p];
            img[idx0 + p] = img[idx1 + p];
            img[idx1 + p] = tmp;
        }
    }

    function flipX (img) {
        /* For each pixel line, flip all the pixels */
        for (var i = 0; i < TILE_HEIGHT; i++) {
            for (var j = 0; j < TILE_WIDTH / 2; j++) {
                swapPixel(img.data, j, i, TILE_WIDTH - 1 - j, i);
            }
        }
    }

    function flipY (img) {
        /* Flip all the pixels for each column */
        for (var j = 0; j < TILE_WIDTH; j++) {
            for (var i = 0; i < TILE_HEIGHT / 2; i++) {
                swapPixel(img.data, j, i, j, TILE_HEIGHT - 1 - i);
            }
        }

    }


    /**
     * @brief Get a given sprite as an array of pixels
     *
     * @param index Index of the tile to retrieve, 0-255 in 8-bit mode, 0-511 in 4-bit mode
     */
    this.drawSprites = function(canvas) {
        const ctx = canvas.getContext("2d");

        for (var i = 0; i < attributes.length; i++) {
            const sprite = attributes[i];
            /* If the sprite is not shown, go to the next one */
            if (sprite.x == 0 || sprite.y == 0 || sprite.x >= canvas.width + 16 || sprite.y >= canvas.height + 16)
                continue;

            const width = 16;
            const height = 16;
            const x = sprite.x - width;
            const y = sprite.y - height;

            /* Check if we can re-use the cache */
            if (!hasUpdates(sprite)) {
                ctx.drawImage(sprite.canvas, x, y);
                continue;
            }

            /* Some updates ocurred, check which ones and update the tile */
            if (sprite.updates.tile) {
                tileset.getTileCanvas(sprite.tile, sprite.img, true, sprite.palette);

                if (sprite.flip_x)
                    flipX(sprite.img);

                if (sprite.flip_y)
                    flipY(sprite.img);


                sprite.ctx.putImageData(sprite.img, 0, 0);

            } else {
                if (sprite.updates.flip_x) {
                    flipX(sprite.img);
                }

                if (sprite.updates.flip_y) {
                    flipY(sprite.img);
                }

                sprite.ctx.putImageData(sprite.img, 0, 0);
            }

            sprite.updates = {
                flip_x: false,
                flip_y: false,
                tile: false,
            };

            ctx.drawImage(sprite.canvas, x, y);
        }
    }
}

function VideoChip(Zeal, PIO, scale) {
    const zeal = Zeal;
    const pio = PIO;

    /* Constants for all the modes */
    const MODE_TEXT_640     = 0;
    const MODE_TEXT_320     = 1;
    const MODE_GFX_640_8BIT = 4;
    const MODE_GFX_320_8BIT = 5;
    const MODE_GFX_640_4BIT = 6;
    const MODE_GFX_320_4BIT = 7;

    const TEXT_CHAR_HEIGHT = 12;
    const TEXT_CHAR_WIDTH  = 8;
    /* In graphics mode, all the tiles are squared */
    const TILE_HEIGHT      = 16;
    const TILE_WIDTH       = 16;

    /* Maximum amount of tiles on screen */
    const TILE_MAX_COUNT   = 3200;    // 640x480 text mode

    const MAX_ITEMS_PER_LINE = 80;
    const MAX_ITEMS_PER_COL = 40;

    /* Default mode used on reset and initialization */
    const DEFAULT_MODE  = MODE_TEXT_640;
    const DEFAULT_BG_COLOR = 0x0;
    const DEFAULT_FG_COLOR = 0xf;

    /* 256-color palette, it can be modified at runtime */
    const palette = new ColorPalette();

    /* Font table, it can also be modified at runtime */
    const font = new FontTable();

    /* We have two layers of data for the tilemap */
    const tilemap = {
        layer0 : {
            mem_write : (addr, data) => layerWritten(0, addr, data),
            data: new Array(TILE_MAX_COUNT)
        },
        layer1 : {
            mem_write : (addr, data) => layerWritten(1, addr, data),
            data : new Array(TILE_MAX_COUNT),
        }
    };


    this.getPaletteNumber = function (tileidx) {
        /* High nibble represents the palette index */
        return tilemap.layer0.data[tileidx] >> 4;
    }

    const tileset = new Tileset(palette, this);
    const sprites = new Sprites(tileset);

    /* Video mode configuration */
    const video_cfg = {
        mode: 0,
        is_text: false,
        is_8bit: true,
        /* Resolution, in pixels, associated to the current configuration */
        width: 0,
        height: 0,
        /* The maximum resolution supported in the following */
        max_width: 640,
        max_height: 480,
        base_scale: 1,
        /* The following scale should be configurable */
        view_scale: 1,
        /* Object can be a text character or a tile */
        obj_per_line: 0,
        obj_per_col: 0,
        obj_total: 0,
        obj_width: 0,
        obj_height: 0,
        vblank: 0,
        /* Enable after each emulated v-blank, marks whether we need to redraw the screen
         * the screen or not. This will prevent redraw if the emulation is paused/stopped */
        update_screen: false
    };

    /* Text mode configuration */
    const text_cfg = {
        /* Index for the current color, both foreground and background */
        fg_color: DEFAULT_FG_COLOR,
        bg_color: DEFAULT_BG_COLOR,
        scroll_x: 0,
        scroll_y: 0,
        cursor : {
            x: 0,
            y: 0,
            /* Number of frames the cursor is shown/hidden */
            blink: 255,
            blink_state: 0,
            blink_shown: false,
            char: 0,
            /* The cursor has inverted colors */
            fg_color: DEFAULT_BG_COLOR,
            bg_color: DEFAULT_FG_COLOR,
            /* Backup used when savign/restoring the cursor */
            dump_x: 0,
            dump_y: 0
        },
        flags: {
            auto_scroll_x: 0,
            auto_scroll_y: 0,
            eat_newline:   0,
            scroll_y_occurred : 0,
        }
    };

    /* Graphics mode configuration */
    const gfx_cfg = {
        scroll_x: 0,
        scroll_y: 0,
    };

    const { canvas, ctx, canvas_layer1, ctx_layer1 } = initialize();

    function initialize() {
        /* Create both the canvas and off-screen canvas */
        const canvas = document.querySelector("#screen");
        canvas.offscreenCanvas = document.createElement("canvas");

        const canvas_layer1 = document.createElement("canvas");

        updateModeData(canvas, canvas_layer1, DEFAULT_MODE);

        /* Off-screen canvas will always have the same size, it will ease scrolling
         * while rendering */
        canvas.offscreenCanvas.width  = 640;
        canvas.offscreenCanvas.height = 480;
        const ctx = canvas.offscreenCanvas.getContext("2d", {
            alpha: false,
            desynchronized: true,
            willReadFrequently: true,
        });
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const ctx_layer1 = canvas_layer1.getContext("2d", {
            alpha: true,
            desynchronized: true,
            willReadFrequently: true,
        });
        ctx_layer1.clearRect(0, 0, canvas_layer1.width, canvas_layer1.height);

        /* Reset the layers */
        const length = tilemap.layer0.length;

        for (var i = 0; i < length; i++) {
            tilemap.layer0.data[i] = 0;
            tilemap.layer1.data[i] = 0;
        }

        return { canvas, ctx, canvas_layer1, ctx_layer1 };
    }

    /**
     * @brief Change the current video mode
     */
    function updateModeData(canvas, canvas_layer1, new_mode) {
        /* Ignore the higher bits of the nmode */
        new_mode = new_mode & 7;
        video_cfg.mode    = new_mode;
        video_cfg.is_text = new_mode <= MODE_TEXT_320;
        video_cfg.is_8bit = new_mode <  MODE_GFX_640_4BIT;

        /* At the moment it is enough to check the lowest bit to determine the resolution */
        if ((new_mode & 1) == 1) {
            video_cfg.width  = 320;
            video_cfg.height = 240;
            video_cfg.base_scale = 2;
        } else {
            video_cfg.width  = 640;
            video_cfg.height = 480;
            video_cfg.base_scale = 1;
        }
        const scale = video_cfg.base_scale * video_cfg.view_scale;
        canvas.style.transform = `scale(${scale})`;
        canvas_layer1.style.transform = `scale(${scale})`;

        /* Check the width of the object */
        const obj_width  = video_cfg.is_text ? TEXT_CHAR_WIDTH  : TILE_WIDTH;
        const obj_height = video_cfg.is_text ? TEXT_CHAR_HEIGHT : TILE_HEIGHT;

        video_cfg.obj_per_line = video_cfg.width / obj_width;
        video_cfg.obj_per_col  = video_cfg.height / obj_height;
        video_cfg.obj_total    = video_cfg.obj_per_line * video_cfg.obj_per_col;
        video_cfg.obj_width    = obj_width;
        video_cfg.obj_height   = obj_height;

        /* Update the visible canvas */
        canvas.width = video_cfg.width;
        canvas.height = video_cfg.height;
        canvas_layer1.width = video_cfg.width;
        canvas_layer1.height = video_cfg.height;

        /* TODO: update the screen with the already existing tiles? */
        if (!video_cfg.is_text) {
            tileset.setColorMode8Bit(video_cfg.is_8bit);
            sprites.setColorMode8Bit(video_cfg.is_8bit);

            // FIXME: canvas is simply cleared to show that the mode changed
            const context = canvas.offscreenCanvas.getContext("2d");
            context.fillStyle = "black";
            context.fillRect(0, 0, canvas.offscreenCanvas.width, canvas.offscreenCanvas.height);
            canvas_layer1.style.opacity = 1.0;
        } else {
            /* No layer 1 in text mode */
            canvas_layer1.style.opacity = 0.0;
        }
    }

    /**
     * @brief Draw a character fron the font table, on screen. This function shall be called
     *        in text mode only.
     *
     * @param ctx 2D graphic context
     * @param ascii Index of the character, in the font table (0-255), to print
     * @param x Position X, in character count, to start printing the character from
     * @param y Position Y, in character count, to start printing the character from
     * @param bg_color Background color index, that will be retrive from the palette
     * @param fg_color Foreground color index, that will be retrive from the palette
     */
    function drawCharacter(ctx, ascii, x, y, bg_color, fg_color) {
        const bgstyle = palette.getColorRGB888(bg_color);
        const fgstyle = palette.getColorRGB888(fg_color);

        /* Create an image out of the bitmaps */
        const charimg = font.getCharacterImg(ascii, bgstyle, fgstyle);
        ctx.putImageData(charimg, x * TEXT_CHAR_WIDTH, y * TEXT_CHAR_HEIGHT);
    }


    /**
     * @brief Invoked when a character is written from the I/O space. This function prints a
     *        character at the cursor position and the increments the latter. If scrolling is
     *        enabled, the screen will scroll.
     */
    function printAndIncrement(value) {
        const fg_color = text_cfg.fg_color;
        const bg_color = text_cfg.bg_color;
        const color    = (bg_color << 4) | fg_color;

        /* Check if the cursor is pending (because of "eat-newline" feature) */
        if (text_cfg.flags.wait_for_next_char) {
            text_cfg.flags.wait_for_next_char = false;
            cursorNextLine();
        }

        /* Make sure the current cursor are not out of bounds */
        const cursor_x = (text_cfg.cursor.x + text_cfg.scroll_x) % video_cfg.obj_per_line;
        const cursor_y = (text_cfg.cursor.y + text_cfg.scroll_y) % video_cfg.obj_per_col;

        // No matter which resolution we are in, the maximum number of tiles is the same
        const index = cursor_y * MAX_ITEMS_PER_LINE + cursor_x;
        tilemap.layer0.data[index] = value;
        tilemap.layer1.data[index] = color;

        // Draw the new character on the canvas
        drawCharacter(ctx, value, cursor_x, cursor_y, bg_color, fg_color);

        // Increment the cursor position
        text_cfg.cursor.x++;
        if (text_cfg.cursor.x == video_cfg.obj_per_line) {
            /* Check if we have to scroll in X */
            if (text_cfg.flags.auto_scroll_x) {
                text_cfg.cursor.x--;
                text_cfg.scroll_x = (text_cfg.scroll_x + 1) % MAX_ITEMS_PER_LINE;
            } else if (text_cfg.flags.eat_newline) {
                /* Check if we have to "eat newline", in other word, do we need to wait for a new character
                 * before resetting X and updating Y. */
                text_cfg.flags.wait_for_next_char = true;
            } else {
                cursorNextLine();
            }
        }
    }

    /**
     * @brief Function to call at each frame rendering when in text mode. It will print the cursor.
     */
    function printCursor(ctx) {
        const cursor = text_cfg.cursor;

        if (!video_cfg.is_text || cursor.blink == 0) {
            return;
        }

        if (++cursor.blink_state >= cursor.blink) {
            cursor.blink_state = 0;
            cursor.blink_shown = !cursor.blink_shown;
        }

        if (cursor.blink == 255 || cursor.blink_shown) {
            drawCharacter(ctx, cursor.char, cursor.x, cursor.y, cursor.bg_color, cursor.fg_color);
        }
    }

    /**
     * @brief Function to call when the cursor X must be reset and cursor Y incremented
     */
    function cursorNextLine() {
        text_cfg.cursor.x = 0;
        text_cfg.cursor.y++;

        if (text_cfg.cursor.y == video_cfg.obj_per_col) {
            if (text_cfg.flags.auto_scroll_y) {
                text_cfg.scroll_y = (text_cfg.scroll_y + 1) % MAX_ITEMS_PER_COL;
                text_cfg.cursor.y--;
                text_cfg.flags.scroll_y_occurred = 1;
            } else {
                text_cfg.cursor.y = 0;
            }
        }
    }


    /**
     * @brief Invoked when a write occurs on the layer 0 or 1.
     *
     * @param address Address relative to the layer
     * @param value Value to put in the layer
     */
    function layerWritten(layer_num, address, value) {
        if (layer_num == 0)
            tilemap.layer0.data[address] = value;
        else
            tilemap.layer1.data[address] = value;

        const y = Math.floor(address / MAX_ITEMS_PER_LINE);
        const x = address % MAX_ITEMS_PER_LINE;

        if (video_cfg.is_text) {
            /* Text mode, update the character */
            const ascii = tilemap.layer0.data[address];
            const color = tilemap.layer1.data[address];
            const bg_color = color >> 4;
            const fg_color = color & 0xf;
            drawCharacter(ctx, ascii, x, y, bg_color, fg_color);
        } else {
            /* Graphics mode, a tile has just been choosen, retrieve it from the tileset and show it */
            /* TODO: what if the tilemap is set first and the tileset is updated later? The changes will
            /* not be visible until the tilemap is updated again... */
            var transparency = false;
            var context = ctx;
            if (video_cfg.is_8bit) {
                if (layer_num == 1) {
                    transparency = true;
                    context = ctx_layer1;
                    ctx_layer1.clearRect(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                }
                var tileidx = value;
            } else {
                /* 4-bit mode, update the tile */
                var tileidx = ((tilemap.layer1.data[address] & 1) << 8) | (tilemap.layer0.data[address]);
            }
            const img = tileset.getTileRGB888(tileidx, transparency);
            context.putImageData(img, x * TILE_WIDTH, y * TILE_HEIGHT);
        }
    }


    /**
     * @brief Check if any tile has been updated while the tilemap was already set and written.
     *        If that's the case, the offscree canvas shall be updated with the new tile.
     */
    function checkAndUpdateTiles() {
        if (!tileset.hasUpdates()) {
            return;
        }

        // FIXME: Implement layer1 too
        const layer0 = tilemap.layer0.data;
        const layer0_length = layer0.length;
        for (var i = 0; i < layer0_length; i++) {
            if (tileset.tileUpdated(layer0[i])) {
                /* Simulate a write to the layer to force the update */
                layerWritten(0, i, layer0[i]);
            }
        }

        tileset.flushUpdates();
    }

    /* -------------------------------------------------------------------------- */
    /*                              Text I/O Related                              */
    /* -------------------------------------------------------------------------- */

    const PRINT_CHAR    = 0;
    const CURSOR_Y      = 1;
    const CURSOR_X      = 2;
    const SCROLL_Y      = 3;
    const SCROLL_X      = 4;
    const CURRENT_COLOR = 5;
    const CURSOR_TIMER  = 6;
    const CURSOR_CHAR   = 7;
    const CURSOR_COLOR  = 8;
    const CTRL_REG      = 9;
        const CTRL_REG_SAVE_CURSOR    = 1 << 7;
        const CTRL_REG_RESTORE_CURSOR = 1 << 6;
        const CTRL_REG_NEWLINE        = 1 << 0;

    /**
     * @brief I/O text component sees a write, address is relative to this space
     */
    function textConfigWrite(address, value) {
        switch(address) {
            case PRINT_CHAR:
                if (video_cfg.is_text) {
                    text_cfg.flags.scroll_y_occurred = 0;
                    printAndIncrement(value);
                } else {
                    console.error("Use of PRINT_CHAR register is GFX mode is invalid!");
                }
                break;

            case CURSOR_Y:
                if (value < video_cfg.obj_per_col) {
                    text_cfg.cursor.y = value;
                }
                break;

            case CURSOR_X:
                if (value < video_cfg.obj_per_line) {
                    text_cfg.cursor.x = value;
                    text_cfg.flags.wait_for_next_char = false;
                }
                break;

            case SCROLL_Y:
                text_cfg.scroll_y = value;
                break;

            case SCROLL_X:
                text_cfg.scroll_x = value;
                break;

            case CURRENT_COLOR:
                text_cfg.bg_color = (value >> 4) & 0xf;
                text_cfg.fg_color = (value >> 0) & 0xf;
                break;

            case CURSOR_TIMER:
                text_cfg.cursor.blink = value;
                break;

            case CURSOR_CHAR:
                text_cfg.cursor.char = value;
                break;

            case CURSOR_COLOR:
                text_cfg.cursor.bg_color = (value >> 4) & 0xf;
                text_cfg.cursor.fg_color = (value >> 0) & 0xf;
                break;

            case CTRL_REG:
                text_cfg.flags.auto_scroll_x = (value >> 5) & 1;
                text_cfg.flags.auto_scroll_y = (value >> 4) & 1;
                text_cfg.flags.eat_newline   = (value >> 3) & 1;
                if ((value & CTRL_REG_SAVE_CURSOR) != 0 &&
                    (value & CTRL_REG_RESTORE_CURSOR) != 0) {
                    /* Exchange the cursor and the backup */
                    const tmp_x = text_cfg.cursor.dump_x;
                    const tmp_y = text_cfg.cursor.dump_y;
                    text_cfg.cursor.dump_x = text_cfg.cursor.x;
                    text_cfg.cursor.dump_y = text_cfg.cursor.y;
                    text_cfg.cursor.x = tmp_x;
                    text_cfg.cursor.y = tmp_y;
                } else if ((value & CTRL_REG_SAVE_CURSOR) != 0) {
                    text_cfg.cursor.dump_x = text_cfg.cursor.x;
                    text_cfg.cursor.dump_y = text_cfg.cursor.y;
                } else if ((value & CTRL_REG_RESTORE_CURSOR) != 0) {
                    text_cfg.cursor.x = text_cfg.cursor.dump_x;
                    text_cfg.cursor.y = text_cfg.cursor.dump_y;
                }

                if ((value & CTRL_REG_NEWLINE) != 0) {
                    text_cfg.flags.scroll_y_occurred = 0;
                    text_cfg.flags.wait_for_next_char = false;
                    cursorNextLine();
                }

                break;

            default:;
        }
    }


    function textConfigRead(address) {
        switch(address) {
            case CURSOR_Y:
                return text_cfg.cursor.y;
            case CURSOR_X:
                return text_cfg.cursor.x;
            case SCROLL_Y:
                return text_cfg.scroll_y;
            case SCROLL_X:
                return text_cfg.scroll_x;
            case CURRENT_COLOR:
                return (text_cfg.bg_color << 4) | (text_cfg.fg_color & 0xf);
            case CURSOR_TIMER:
                return text_cfg.cursor.blink;
            case CURSOR_CHAR:
                return text_cfg.cursor.char;
            case CURSOR_COLOR:
                return (text_cfg.cursor.bg_color << 4) |
                       (text_cfg.cursor.fg_color & 0xf);
            case CTRL_REG:
                return (text_cfg.flags.auto_scroll_x << 5) |
                       (text_cfg.flags.auto_scroll_y << 4) |
                       (text_cfg.flags.eat_newline   << 3) |
                       (text_cfg.flags.scroll_y_occurred << 0);
            default:
                return 0;
        }
    }


    /* -------------------------------------------------------------------------- */
    /*                        Mapping Configuration Related                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @brief Video configuration sees a write, address is relative to this space
     */
    function vConfigWrite(address, value) {
        switch (address) {
            case 0x0:
            case 0x2:
            case 0x3:
            case 0x4:
            case 0x5:
                /* Try to detect a former driver that needs to be updated */
                if (!vConfigWrite.alerted) {
                    alert("This ROM image seems to be using an old implementation of video card.\n"
                        + "Please update it to match the newest implementation");
                    vConfigWrite.alerted = true;
                }
            break;
            case 0xe: mapping.io_bank = value & 0x3f;
                break;
            case 0xf: mapping.mem_start = (value & 0x1f) >> (22 - 5);
                break;
            default:
                break;
        }
    }

    function vConfigRead(address) {
        const MAJ = 0;
        const MIN = 1;
        const REV = 0;

        switch (address) {
            case 0x0: return REV;
            case 0x1: return MIN;
            case 0x2: return MAJ;
            case 0xe: return mapping.io_bank;
            case 0xf: return mapping.mem_start >> (22 - 5);
        }
        return 0;
    }

    /* -------------------------------------------------------------------------- */
    /*                          Physical Mapping Related                          */
    /* -------------------------------------------------------------------------- */

    const IO_MAPPING_TEXT = 0;
    // const IO_MAPPING_RSVD = 1;
    // const IO_MAPPING_RSVD = 2;
    // const IO_MAPPING_RSVD = 3;

    /* Highest five bits of the FPGA 22-bit physical memory address */
    const mapping = {
        mem_start : 0x100000, // Mapped at 1MB by default
        mem_size  : 128*1024, // Even if some ranges are not mapped, let's
        io_start  : 0x80,
        io_size   : 0x30, // 3 banks of 16 bytes
        io_bank : 0,
    };

    function mem_write(address, value) {
        // TODO: Fix hardcoded values
        // TODO: Support memory write to I/O devices
        if (address < 0xc80)
            tilemap.layer0.mem_write(address, value);
        else if (address >= 0xe00 && address < 0x1000)
            // TODO: Update all the tiles since the color may have changed
            palette.mem_write(address - 0xe00, value);
        else if (address >= 0x1000 && address < 0x1c80)
            tilemap.layer1.mem_write(address - 0x1000, value);
        else if (address >= 0x2800 && address < 0x2c00)
            sprites.mem_write(address - 0x2800, value);
        else if (address >= 0x3000 && address < 0x3000 + 3072)
            // TODO: Update all the tiles since the pixels may have changed
            font.mem_write(address - 0x3000, value);
        else if (address >= 0x10000 && address < 0x20000)
            tileset.mem_write(address - 0x10000, value);
    }

    function io_write(port, value) {
        if (port >= 0x0 && port <= 0xf) {
            vConfigWrite(port, value);
        } else if (port >= 0x10 && port <= 0x1f) {
            // TODO: Scrolling values and enable screen
            if ((port - 0x10) == 0xc) updateModeData(canvas, canvas_layer1, value);
        } else if (port >= 0x20 && port <= 0x2f && mapping.io_bank == IO_MAPPING_TEXT) {
            textConfigWrite(port - 0x20, value);
        }
    }

    function io_read(port) {
        if (port >= 0x0 && port < 0x10) {
            return vConfigRead(port);
        } else if (port >= 0x10 && port < 0x20) {
            // TODO: Scrolling values and video mode
            if (port - 0x10 == 0xd) {
                return video_cfg.vblank << 1;
            }
        } else if (port >= 0x20 && port < 0x30 && mapping.io_bank == IO_MAPPING_TEXT) {
            return textConfigRead(port - 0x20);
        }
        return 0;
    }


    this.mem_region = {
        write: mem_write,
        read: null,
        size: mapping.mem_size
    };
    this.io_region = {
        write: io_write,
        read: io_read,
        size: mapping.io_size
    };


    function renderScreen() {
        if (!video_cfg.update_screen) {
            return;
        }

        video_cfg.update_screen = false;

        const visible_ctx = canvas.getContext("2d", {
            alpha: false,
            desynchronized: false,
            willReadFrequently: false,
        });
        /* Check if any tile has been updated while the tilemap was already written */
        checkAndUpdateTiles();
        /* Extract the visible part out of the offscreen canvas contex */
        const visible_x = (video_cfg.is_text ? text_cfg.scroll_x * video_cfg.obj_width : gfx_cfg.scroll_x);
        const visible_y = (video_cfg.is_text ? text_cfg.scroll_y * video_cfg.obj_height : gfx_cfg.scroll_y);
        const visible_width  = Math.min(video_cfg.width, video_cfg.max_width - visible_x);
        const visible_height = Math.min(video_cfg.height, video_cfg.max_height - visible_y);
        /* Parameters:
         *  - Source canvas
         *  - (x,y) source coordinates
         *  - Source size
         *  - (x,y) destination coordinates
         *  - Destination size
         */
        visible_ctx.drawImage(canvas.offscreenCanvas,
                              visible_x, visible_y,
                              visible_width, visible_height,
                              0, 0,
                              visible_width, visible_height);
        if (!video_cfg.is_text) {
            visible_ctx.drawImage(canvas_layer1,
                                  visible_x, visible_y,
                                  visible_width, visible_height,
                                  0, 0,
                                  visible_width, visible_height);
        }
        if (visible_width != video_cfg.width) {
            /* Part of the screen should wrap, we need to copy the "left" part of the canvas */
            const remaining = video_cfg.width - visible_width;
            visible_ctx.drawImage(canvas.offscreenCanvas,
                0, visible_y,
                remaining, visible_height,
                visible_width, 0,
                remaining, visible_height);
        }
        if (visible_height != video_cfg.height) {
            /* Similarly for Y */
            const remaining = video_cfg.height - visible_height;
            visible_ctx.drawImage(canvas.offscreenCanvas,
                visible_x, 0,
                visible_width, remaining,
                0, visible_height,
                visible_width, remaining);
        }

        /* Draw the sprites on screen */
        sprites.drawSprites(canvas);

        /* Add the cursor if it needs to be visible */
        printCursor(visible_ctx);
    }


    /* PIO and signal generation related */
    const IO_HBLANK_PIN      = 5;
    const IO_VBLANK_PIN      = 6;
    /* 16.66ms in T-states */
    const VBLANK_TSTATES_PERIOD = us_to_tstates(16666.666) - 1;
    const VBLANK_TSTATES_PERIOD_END = us_to_tstates(63.55) - 1;

    /* We don't need to add a listener on the PIO, as they are mainly for OUTPUT pins.
     * But let's keep in mind that this may change in the future */
    /* Start the V_Blank signal generation */
    const vblank_interval = zeal.registerTstateInterval(() => {
        /* Clear VBLANK bit in the PIO state */
        pio.pio_set_b_pin(IO_VBLANK_PIN, 0);
        video_cfg.vblank = 0;
    }, VBLANK_TSTATES_PERIOD);

    /* Register the same interval but for disabling the signal
     * So the period is the same as the one above, but we need to start it
     * a bit later (after 63us) */
    const vblank_interval_end = zeal.registerTstateInterval(() => {
        pio.pio_set_b_pin(IO_VBLANK_PIN, 1);
        video_cfg.vblank = 1;
        video_cfg.update_screen = true;
    }, VBLANK_TSTATES_PERIOD, VBLANK_TSTATES_PERIOD_END);


    this.clear = initialize;
    this.renderScreen = renderScreen;
}
