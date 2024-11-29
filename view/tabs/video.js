(() => {
  var $tab = $('#video');
  const _panels = localStorage.getItem('video-panels');
  let panels;
  const savePanels = () => {
    localStorage.setItem('video-panels', JSON.stringify(panels));
  }

  if(!_panels) {
    panels = {
      "palette": { "open": true, "visible": true },
      "fonts": { "open": true, "visible": false },
      "tileset": { "open": true, "visible": true },
      "tilemap": { "open": false, "visible": false }
    }
    savePanels();
  } else {
    panels = JSON.parse(_panels);
  }

  $("#video").on("active", () => {
    $('#video-dump').trigger('click');
  });

  $('#video-dump').on('click', () => {
    const { tileset, palette, layer0, layer1, sprites, font } = zealcom.vchip.dump();

    const $palette = $('#video .palette').empty();
    const palette888 = palette.getPalette();
    const background = palette888[0].toString(16).padStart(6, '0');
    palette888.forEach((c, i) => {
      const hex = c.toString(16).padStart(6, '0');
      $palette.append(`
        <div class="color" style="background-color: #${hex}" title="Index ${i}"></div>
      `);
    });

    const $font = $('#video .fonts').empty();
    for(let i = 0; i < 256; i++) {
      const img = font.getCharacterImg(i, [0,0,0], [255,255,255]);
      const canvas = document.createElement('canvas');
      $(canvas).attr('title', `Char ${i}`).css('background-color', `#${background}`);
      canvas.width = 8;
      canvas.height = 12;
      var ctx = canvas.getContext('2d');
      ctx.putImageData(img, 0, 0);
      $font.append(canvas);
    }

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

    const $tilemap = $('#video .tilemap').empty();
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 640;
    ctx = canvas.getContext('2d');
    // ctx.putImageData(layer0.getImageData(0, 0, 1280, 640), 0, 0);
    // ctx.putImageData(layer1.getImageData(0, 0, 1280, 640), 0, 0);
    ctx.drawImage(layer0.offscreenCanvas, 0, 0, 1280, 640, 0, 0, 1280, 640);
    ctx.drawImage(layer1, 0, 0, 1280, 640, 0, 0, 1280, 640);
    sprites.drawSprites(canvas);
    $tilemap.append(canvas);
  });

  $('details', $tab).on('toggle', function() {
    console.log('toggle', this);
    const panel = $(this).attr('name');
    panels[panel].open = this.open;
    savePanels();
  });

  const togglePanel = (panel, toggle) => {
    const $panel = $(`.sub-panel[name=${panel}]`, $tab);
    if(toggle) $panel.show();
    else $panel.hide();

    panels[panel] = {
      visible: toggle,
    };
    savePanels();
  }

  $('input.toggle', $tab).on('change', function() {
    var panel = $(this).attr('name');
    var checked = $(this).is(':checked');
    togglePanel(panel, checked);
  });

  for(k in panels) {
    const {visible, open} = panels[k];
    const $panel = $(`.sub-panel[name=${k}]`);
    console.log('panel', { visible, open});
    $(`input[name=${k}]`).prop('checked', visible);
    if(visible) {
      $panel.show();
    } else {
      $panel.hide();
    }

    if(open) {
      $panel.attr('open', true);
    } else {
      $panel.attr('open', false);
    }
  }
})();