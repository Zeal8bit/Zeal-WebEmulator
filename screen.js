//canvas.addEventListener('keydown', check, false);

function VideoChip() {
    const backgroundColor = "#0000ac";
    const textColor = "#0088ff";
    var x_cursor = 0;
    var y_cursor = 0;
    var ratio = 1.5;
    var charheight = 12;
    var resolution_width = 800;
    var resolution_height = 600;
    const final_height = resolution_height * ratio;
    const final_width = resolution_width * ratio;
    const char_per_line = 100;
    const char_per_col  = 50;
    const char_total = char_per_line * char_per_col;
    var scroll = 0;

    var mapped_vram = false;
    var mapped_sprite = false;
    
    var framebuffer = new Array(resolution_width/8 * resolution_height/12);
    const { canvas, ctx } = initialize();

    function initialize() {
        var canvas = document.querySelector("#screen");
        canvas.width = resolution_width * ratio;
        canvas.height = resolution_height * ratio;
        
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < framebuffer.length; i++)
            framebuffer[i] = 0;

        return { canvas, ctx };
    }

    function drawCharacter(ctx, ascii, x, y) {
        const orx = x;
        const bitmaps = characters[ascii];
        for (var i = 0; i < bitmaps.length; i++) {
            const line = bitmaps[i];
            if (line == 0) {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(x, y, charwidth * ratio, ratio);
            } else {
                for (var bits = 0; bits < charwidth; bits++) {
                    const bit = (line >> (7 - bits)) & 1;
                    ctx.fillStyle = (bit == 1) ? textColor : backgroundColor;
                    ctx.fillRect(x, y, ratio, ratio);
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


    function is_valid_address(read, address) {
        return !read && address >= 0 && address < 0x8000;
    }

    function is_valid_port(read, port) {
        return !read && port >= 0x80;
    }

    function mem_read(address) {
        assert(false, "Cannot read mem from VideoChip !");
    }

    function mem_write(address, value) {
        writeChar(value, address);
    }

    function io_read(port) {
    }

    function io_write(port, value) {
        console.assert (port >= 0x80, "Wrong port for VideoChip");
        
        if (port == 0x80) {
            putChar(value);
        } else if (port == 0x81) {
            y_cursor = value;
        } else if (port == 0x82) {
            x_cursor = value;
        } else if (port == 0x83) {
            mapped_vram = (value == 0);
            mapped_sprite = (value == 1);
        } else if (port == 0x85) {
            scroll = value;
            scroll_screen();
        }
    }


    this.is_valid_address = is_valid_address;
    this.is_valid_port = is_valid_port;
    this.mem_read = mem_read;
    this.mem_write = mem_write;
    this.io_read = io_read;
    this.io_write = io_write;
}
