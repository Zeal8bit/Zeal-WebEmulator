let TEXT_MODE = 0;
let SMALL_TEXT_MODE = 1;
let SMALL_SPRITE_MODE = 2;
let BIG_SPRITE_MODE = 3;
let DEFAULT_MODE = SMALL_TEXT_MODE;
let MAX_TILES = 5000; /* TEXT_MODE, in 800x600 */
let SPRITE_RAM_SIZE = 32 * 1024; /* Sprite RAM is 32KB wide */

/* In big sprite mode, the max number of sprite in 40 * 30*/
let MAX_BIG_SPRITE_COUNT = 1200;

function resolutionOfMode(mode) {
    if (mode == TEXT_MODE)
        return {width: 800, height: 600};
    return {width: 640, height: 480};
}

function VideoChip() {
    var video_mode = DEFAULT_MODE;
    var text_color_index = 0xf;
    var background_color_index = 0x0;
    /* 0 - Black, 1 - dark blue, 2 - dark green, 3 - dark cyan,
     * 4 - dark red, 5 - dark purple, 6 - brown, 7 - light grey,
     * 8 - dark grey, 9 - blue, 10 - green, 11 - cyan,
     * 12 - red, 13 - purple, 14 - yellow, 15 - white */
    const palette16 = [ "#000000", "#0000aa", "#00aa00", "#00aaaa",
                        "#aa0000", "#aa00aa", "#aa5500", "#aaaaaa",
                        "#555555", "#5555ff", "#55ff55", "#55ffff",
                        "#ff5555", "#ff55ff", "#ffff55", "#ffffff" ];
    const palette256 = ["#000000", "#0000a8", "#10a800", "#00a8a8", "#a80000", "#a800a8", "#a85400", "#a8a8a8", "#505450", "#5054f8", "#50fc50", "#50fcf8", "#f85450", "#f854f8", "#f8fc50", "#f8fcf8", 
                        "#000000", "#101010", "#202020", "#303430", "#404440", "#505450", "#606460", "#707470", "#888888", "#989898", "#a8a8a8", "#b8b8b8", "#c8c8c8", "#d8dcd8", "#e8ece8", "#f8fcf8", 
                        "#0004f8", "#4004f8", "#8000f8", "#b800f8", "#f800f8", "#f800b8", "#f80080", "#f80040", "#f80008", "#f84000", "#f88000", "#f8bc00", "#f8fc00", "#b8fc00", "#80fc00", "#40fc00", 
                        "#20fc00", "#20fc40", "#18fc80", "#10fcb8", "#00fcf8", "#00bcf8", "#0080f8", "#0040f8", "#8080f8", "#9880f8", "#b880f8", "#d880f8", "#f880f8", "#f880d8", "#f880b8", "#f88098", 
                        "#f88080", "#f89c80", "#f8bc80", "#f8dc80", "#f8fc80", "#d8fc80", "#b8fc80", "#98fc80", "#80fc80", "#80fc98", "#80fcb8", "#80fcd8", "#80fcf8", "#80dcf8", "#80bcf8", "#809cf8", 
                        "#b8b8f8", "#c8b8f8", "#d8b8f8", "#e8b8f8", "#f8b8f8", "#f8b8e8", "#f8b8d8", "#f8b8c8", "#f8b8b8", "#f8c8b8", "#f8dcb8", "#f8ecb8", "#f8fcb8", "#e8fcb8", "#d8fcb8", "#c8fcb8", 
                        "#b8fcb8", "#b8fcc8", "#b8fcd8", "#b8fce8", "#b8fcf8", "#b8ecf8", "#b8dcf8", "#b8c8f8", "#000070", "#180070", "#380070", "#500070", "#700070", "#700050", "#700038", "#700018", 
                        "#700000", "#701c00", "#703800", "#705400", "#707000", "#507000", "#387000", "#187000", "#087000", "#087018", "#007038", "#007050", "#007070", "#005470", "#003870", "#001c70", 
                        "#383870", "#403870", "#503870", "#603870", "#703870", "#703860", "#703850", "#703840", "#703838", "#704438", "#705438", "#706038", "#707038", "#607038", "#507038", "#407038", 
                        "#387038", "#387040", "#387050", "#387060", "#387070", "#386070", "#385470", "#384470", "#505070", "#585070", "#605070", "#685070", "#705070", "#705068", "#705060", "#705058", 
                        "#705050", "#705850", "#706050", "#706850", "#707050", "#687050", "#607050", "#587050", "#507050", "#507058", "#507060", "#507068", "#507070", "#506870", "#506070", "#505870", 
                        "#000040", "#100040", "#200040", "#300040", "#400040", "#400030", "#400020", "#400010", "#400000", "#401000", "#402000", "#403000", "#404000", "#304000", "#204000", "#104000", 
                        "#004000", "#004010", "#004020", "#004030", "#004040", "#003040", "#002040", "#001040", "#202040", "#282040", "#302040", "#382040", "#402040", "#402038", "#402030", "#402028", 
                        "#402020", "#402820", "#403020", "#403820", "#404020", "#384020", "#304020", "#284020", "#204020", "#204028", "#204030", "#204038", "#204040", "#203840", "#203040", "#202840", 
                        "#282c40", "#302c40", "#302c40", "#382c40", "#402c40", "#402c38", "#402c30", "#402c30", "#402c28", "#403028", "#403428", "#403c28", "#404028", "#384028", "#304028", "#304028", 
                        "#284028", "#284030", "#284030", "#284038", "#284040", "#283c40", "#283440", "#283040", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#e870f0"];

    var x_cursor = 0;
    var y_cursor = 0;
    var ratio = 1;
    /* In case the ratio is a float value, we have to draw a bit more
     * pixel that whatt is required to avoid artifacts. */
    var errorrate = Number.isInteger(ratio) ? 0 : 2 * (ratio - Math.floor(ratio));
    var charheight = 12;
    var resolution_width = 0;
    var resolution_height = 0;
    var final_height = 0;
    var final_width = 0;
    var char_per_line = 0;
    var char_per_col  = 0;
    var char_total = 0;
    var scroll = 0;

    var mapped_vram = false;
    var mapped_sprite = false;
    
    var framebuffer = new Array(16*1024);
    var spriteram = new Array(SPRITE_RAM_SIZE);
    const { canvas, ctx } = initialize();

    function initialize() {
        var canvas = document.querySelector("#screen");
        updateModeData(canvas);

        var ctx = canvas.getContext("2d");
        ctx.fillStyle = palette16[background_color_index];
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < framebuffer.length; i++)
            framebuffer[i] = 0;
        for (var i = 0; i < spriteram.length; i++)
            spriteram[i] = "#000000";

        return { canvas, ctx };
    }

    function updateModeData(canvas) {
        const {width, height } = resolutionOfMode(video_mode);
        resolution_width = width;
        resolution_height = height;
        final_width = resolution_width * ratio;
        final_height = resolution_height * ratio;
        canvas.width = final_width;
        canvas.height = final_height;
        /* Update other fields */
        char_per_line = resolution_width / 8;
        char_per_col  = resolution_height / charheight;
        char_total = char_per_line * char_per_col;
    }

    function drawCharacter(ctx, ascii, x, y) {
        const orx = x;
        const bitmaps = characters[ascii];
        for (var i = 0; i < bitmaps.length; i++) {
            const line = bitmaps[i];
            if (line == 0) {
                ctx.fillStyle = palette16[background_color_index];
                ctx.fillRect(x, y, charwidth * ratio + errorrate, ratio + errorrate);
            } else {
                for (var bits = 0; bits < charwidth; bits++) {
                    const bit = (line >> (7 - bits)) & 1;
                    ctx.fillStyle = (bit == 1) ? palette16[text_color_index] :
                                                 palette16[background_color_index];
                    ctx.fillRect(x, y, ratio + errorrate, ratio + errorrate);
                    x += ratio;
                }
                x = orx;
            }

            y += ratio;
        }
    }

    function scroll_screen () {
        var firstline = ctx.getImageData(0, 0, final_width, charheight * ratio);
        var restlines = ctx.getImageData(0, charheight * ratio, final_width, final_height - charheight * ratio);
        ctx.putImageData(restlines, 0, 0);
        ctx.putImageData(firstline, 0, final_height - charheight * ratio);
    }
    
    function putChar(code) {
        //drawCharacter(ctx, text.charCodeAt(i), i * charwidth * ratio, 0);
        drawCharacter(ctx, code,
                      x_cursor * charwidth * ratio,
                      y_cursor * charheight * ratio);
        x_cursor++;
        if (x_cursor == 100) {
            x_cursor = 0;
            y_cursor++;
        }
        
        if (y_cursor == 50) {
            y_cursor = 0;
            x_cursor = 0;
        }
    }

    function putCharNoInc(code) {
        //drawCharacter(ctx, text.charCodeAt(i), i * charwidth * ratio, 0);
        drawCharacter(ctx, code,
                      x_cursor * charwidth * ratio,
                      y_cursor * charheight * ratio);
    }

    function drawChar(code, cursor) {
        cursor = ((cursor - scroll * char_per_line) + char_total) % char_total;
        const y = Math.floor(cursor / char_per_line);
        const x = cursor % char_per_line;
        drawCharacter(ctx, code,
                      x * charwidth * ratio,
                      y * charheight * ratio);
    }

    function writeChar(code, cursor) {
        framebuffer[cursor] = code;
        drawChar(code, cursor);
    }

    function reWriteChar(address) {
        drawChar(framebuffer[address], address);
    }

    const mem_wo_from = 0x00_0000;
    const mem_wo_to   = 0x00_8000;
    /* VRAM size: 128KB */
    const mem_size    = 0x02_0000;
    const mem_rw_from = 0x10_0000;
    const mem_rw_to   = mem_rw_from + mem_size;

    function is_address_rw(address) {
        return address >= mem_rw_from && address < mem_rw_to;
    }

    function is_address_w(address) {
        return is_address_rw(address)
            || (address >= mem_wo_from && address < mem_wo_to);
    }

    function is_valid_address(read, address) {
        return is_address_rw(address);
        /* Remove the support for writing to ROM address
         *|| (!read && is_address_w(address)) ;
         */
    }

    function is_valid_port(read, port) {
        return !read && port >= 0x80;
    }

    function mem_read(address) {
        /* Only support the first 16KB at the moment */
        if (address >= mem_rw_from + 16*1024) {
            return;
        }

        const physaddress = address & (mem_size - 1);
        return framebuffer[physaddress];
    }

    function mem_write(address, value) {
        /* Only support the first 16KB at the moment */
        if (address >= mem_rw_from + 16*1024) {
            return;
        }

        /* Get an address between 0 and 128KB. Masking with size works because mem_rw_from is aligned on 128KB. */
        const physaddress = address & (mem_size - 1);

        if (video_mode == TEXT_MODE || video_mode == SMALL_TEXT_MODE)
            mem_write_text_mode(physaddress, value);
        else if (video_mode == BIG_SPRITE_MODE)
            mem_write_big_sprite_mode(physaddress, value);
        else
            console.log("Small sprite mode video mode currently not supported");
    }

    function mem_write_text_mode(address, value) {
        /* Text characters are mapped between 0 and 3200 */
        if (address < 3200) {
            writeChar(value, address);
        } else if (address >= 0x2000 && address < 0x2000 + 3200) {
            /* Color attributes for the characters */
            const bak_foreground = text_color_index;
            const bak_background = background_color_index;
            background_color_index = (value >> 4) & 0xf;
            text_color_index = value & 0xf;
            framebuffer[address] = value;
            reWriteChar(address - 0x2000);
            text_color_index = bak_foreground;
            background_color_index = bak_background;
        } else {
            /* Not a char, not a color either, nothing at the moment.
             * Maybe palette in the future? Char table? */
        }
    }

    const big_sprite_bytes = 256;
    const big_sprite_per_line = 40;
    const big_sprite_size = 16;

    function updateSpriteOnScreen(address, newspritenum, layer1) {
        if (layer1) {
            console.log("Layer1 not supported yet");
            return;
        }

        const spriteline = Math.floor(address / big_sprite_per_line);
        const spritecol = address % big_sprite_per_line;
        const originalx = spritecol * big_sprite_size * ratio
        var spritey = spriteline * big_sprite_size * ratio;
        var spritex = originalx;
        
        for (var i = 0; i < big_sprite_size; i++) {
            for (var j = 0; j < big_sprite_size; j++) {
                const color = spriteram[newspritenum * big_sprite_bytes + i * big_sprite_size + j];
                //const color = palette256[coloridx];
                ctx.fillStyle = color;
                ctx.fillRect(spritex, spritey, ratio + errorrate, ratio + errorrate);
                spritex += ratio;
            }
            spritex = originalx;
            spritey += ratio;
        }
    }

    function mem_write_big_sprite_mode(address, value) {
        if (mapped_vram) {
            /* Check that the address passed is valid */
            if ((address >= 0x8000) ||
                (address >= MAX_BIG_SPRITE_COUNT && address < 0x2000) ||
                (address >= 0x2000 + MAX_BIG_SPRITE_COUNT && address < 0x8000))
                    return;
            
            framebuffer[address] = (value & 0xff);
            updateSpriteOnScreen(address, (value & 0xff), address >= 0x2000);
        } else if (mapped_sprite) {
            /* One big sprites takes 16*16 bytes */
            const color = palette256[value & 0xff];
            spriteram[address] = color;
            // const sprite_idx = Math.floor(address / big_sprite_bytes);
            // TODO: updatePixelOnScreen(sprite_idx, address, color);
        }
    }

    function io_read(port) {
    }

    var start = 0;

    function io_write(port, value) {
        port &= 0xff;
        console.assert (port >= 0x80, "Wrong port for VideoChip");
        if (port == 0x80) {
            putChar(value);
        } else if (port == 0x87) {
            putCharNoInc(value);
        }  else if (port == 0x81) {
            y_cursor = value;
        } else if (port == 0x82) {
            x_cursor = value;
        } else if (port == 0x83) {
            video_mode = value & 0x3;
            updateModeData(canvas);
        } else if (port == 0x84) {
            mapped_vram = (value == 0);
            mapped_sprite = (value == 1);
        } else if (port == 0x85) {
            scroll = value;
            scroll_screen();
        } else if (port == 0x86) {
            text_color_index = value & 0xf;
            background_color_index = (value >> 4) & 0xf;
        }
    }


    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
}
