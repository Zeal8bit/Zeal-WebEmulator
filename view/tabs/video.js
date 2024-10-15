(() => {
  $('#video-dump').on('click', () => {
    const { tileset, palette } = zealcom.vchip.dump();

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
      canvas = document.createElement('canvas');
      $(canvas).attr('title', `Tile ${i}`).css('background-color', `#${background}`);
      canvas.width = 16;
      canvas.height = 16;
      var ctx = canvas.getContext('2d');
      ctx.putImageData(tile, 0, 0);
      $tileset.append(canvas);
    };
  });

  $("#gamepad").on("active", () => {
    $('#video-dump').trigger('click');
  });
})();