(() => {
  $('#video-dump').on('click', () => {
    const { tileset, palette, layer0, layer1, sprites } = zealcom.vchip.dump();

    const $palette = $('#video .palette').empty();
    const palette888 = palette.getPalette();
    const background = palette888[0].toString(16).padStart(6, '0');
    palette888.forEach((c, i) => {
      const hex = c.toString(16).padStart(6, '0');
      $palette.append(`
        <div class="color" style="background-color: #${hex}" title="Index ${i}"></div>
      `);
    });

    const $tileset = $('#video .tileset').empty();
    const mode8bit = tileset.getColorMode8Bit();
    const tile_count = mode8bit ? 256 : 512;
    const tiles = tileset.getTiles();
    for(let i = 0; i < tile_count; i++) {
      const tile = tiles[i];
      const canvas = document.createElement('canvas');
      $(canvas).attr('title', `Tile ${i}`).css('background-color', `#${background}`);
      canvas.width = 16;
      canvas.height = 16;
      var ctx = canvas.getContext('2d');
      ctx.putImageData(tile, 0, 0);
      $tileset.append(canvas);
    };

    const $layers = $('#video .layers').empty();
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 640;
    ctx = canvas.getContext('2d');
    // ctx.putImageData(layer0.getImageData(0, 0, 1280, 640), 0, 0);
    // ctx.putImageData(layer1.getImageData(0, 0, 1280, 640), 0, 0);
    ctx.drawImage(layer0.offscreenCanvas, 0, 0, 1280, 640, 0, 0, 1280, 640);
    ctx.drawImage(layer1, 0, 0, 1280, 640, 0, 0, 1280, 640);
    sprites.drawSprites(canvas);
    $layers.append(canvas);
  });

  $("#gamepad").on("active", () => {
    $('#video-dump').trigger('click');
  });
})();