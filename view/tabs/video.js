(() => {
  // copied from screen.js, ... proper module exports would be better?
  const MODE_TEXT_640     = 0;
  const MODE_TEXT_320     = 1;
  const MODE_GFX_640_8BIT = 4;
  const MODE_GFX_320_8BIT = 5;
  const MODE_GFX_640_4BIT = 6;
  const MODE_GFX_320_4BIT = 7;

  const $tab = $('#video');
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
      "sprites": {
        "open": false,
        "visible": false,
        "data": {
          "sprites-empty": true,
          "sprites-empty-index": 0,
        }
      },
      "tilemap": {
        "open": false,
        "visible": false,
        "data": {
          "tilemap-layer0": true,
          "tilemap-layer1": true,
          "tilemap-sprites": true,
          "tilemap-grid": true,
          "tilemap-grid-color": "#ff0000",
        }
      }
    }
    savePanels();
  } else {
    panels = JSON.parse(_panels);
  }

  $("#video").on("active", () => {
    $('#video-dump').trigger('click');
  });

  $('#video-dump').on('click', () => {
    const { tileset, palette, layer0, layer1, sprites, font, gfx_cfg, text_cfg, video_cfg } = zealcom.vchip.dump();

    /** Palette **/
    const $palette = $('#video .palette').empty();
    const palette888 = palette.getPalette();
    const background = palette888[0].toString(16).padStart(6, '0');
    palette888.forEach((c, i) => {
      const hex = c.toString(16).padStart(6, '0');
      $palette.append(`
        <div class="color" style="background-color: #${hex}" title="Index ${i}"></div>
      `);
    });

    /** Font **/
    const $font = $('#video .fonts').empty();
    for(let i = 0; i < 256; i++) {
      const img = font.getCharacterImg(i, [0,0,0], [255,255,255]);
      const canvas = document.createElement('canvas');
      $(canvas).attr('title', `Char ${i}`).css('background-color', `#${background}`);
      canvas.width = 8;
      canvas.height = 12;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(img, 0, 0);
      $font.append(canvas);
    }

    /** Tiles **/
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
      const ctx = canvas.getContext('2d');
      ctx.putImageData(tile, 0, 0);
      $tileset.append(canvas);
    };

    /** Sprites **/
    const $sprites = $('#video .sprites').empty();
    const { attributes: sprite_attrs } = sprites.dump();
    const sprite_count = sprite_attrs.length
    const sprite_empty = panels['sprites']?.data?.['sprites-empty'] ?? true;
    const sprite_details = panels['sprites']?.data?.['sprites-details'] ?? false;
    const sprite_empty_index = panels['sprites']?.data?.['sprites-empty-index'] ?? 0;
    if(sprite_details) $sprites.addClass('detailed');
    else $sprites.removeClass('detailed');
    for(let i = 0; i < sprite_count; i++) {
      const sprite = sprite_attrs[i];
      if(sprite_empty && sprite.tile == sprite_empty_index) continue;
      const canvas = document.createElement('canvas');
      $(canvas).attr('title', `Sprite ${i}`).css('background-color', `#${background}`);
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(sprite.img, 0, 0);
      if(!sprite_details) {
        $sprites.append(canvas);
      } else {
        const $details = $('<div class="details"></div>');
        $details.append(canvas);
        $details.append(`<pre>Index: ${i} Tile: ${sprite.tile}
X: ${sprite.x}, Y: ${sprite.y}
Flip X: ${sprite.flip_x}, Flip Y: ${sprite.flip_y}
Palette: ${sprite.palette}</pre>`)
        $sprites.append($details);
      }
    }

    /** Tilemap **/
    const data = panels['tilemap'].data;
    const $tilemap = $('#video .tilemap').empty();
    const canvas = document.createElement('canvas');
    let width = 1280;
    let height = 640;
    let show_cells = panels['tilemap']?.data?.['tilemap-grid'] ?? true;
    switch(video_cfg.mode) {
      case MODE_TEXT_640: show_cells = false; width = 640; height = 480; break;
      case MODE_TEXT_320: show_cells = false; width = 320; height = 240; break;
      case MODE_GFX_640_8BIT: // fall thru
      case MODE_GFX_640_4BIT:
        $tilemap.css({
          '--grid-width': 640,
          '--columns': 2,
        });
        break;
      case MODE_GFX_320_8BIT: // fall thru
      case MODE_GFX_320_4BIT:
        $tilemap.css({
          '--grid-width': 320,
          '--columns': 4,
        });
        break;
    }

    $(canvas).attr({
      'width': width,
      'height': height,
    }).css({
      'background-color': `#${background}`,
      'aspect-ration': `${width} / ${height}`
    });
    ctx = canvas.getContext('2d');
    if(data['tilemap-layer0']) ctx.drawImage(layer0.offscreenCanvas, 0, 0, 1280, 640, 0, 0, 1280, 640);
    if(data['tilemap-layer1']) ctx.drawImage(layer1, 0, 0, 1280, 640, 0, 0, 1280, 640);
    if(data['tilemap-sprites']) sprites.drawSprites(canvas);

    const grid_color = panels['tilemap']?.data?.['tilemap-grid-color'] ?? '#ff0000';
    $tilemap.css({
      '--grid-color': `${grid_color}`
    });
    $tilemap.append(canvas);
    if(show_cells) {
      $tilemap.addClass('grid');
      const $overlay = $('<div class="tilemap-overlay"></div>');
      $overlay.css({
        'width': 1280,
        'aspect-ration': `${width} / ${height}`,
      });
      $tilemap.append($overlay);
      const cols = Math.ceil(1280 / video_cfg.width);
      const rows = Math.ceil(640 / video_cfg.height);
      const cells = cols * rows;
      for(let i = 0; i < cells; i++) {
        $overlay.append($('<div></div>'));
      }
    } else {
      $tilemap.removeClass('grid');
    }
  });

  $('details', $tab).on('toggle', function() {
    const panel = $(this).attr('name');
    panels[panel].open = this.open;
    savePanels();
  });

  const togglePanel = (panel, toggle) => {
    const $panel = $(`.sub-panel[name=${panel}]`, $tab);
    if(toggle) $panel.show();
    else $panel.hide();

    panels[panel] = {
      ...panels[panel],
      visible: toggle,
    };
    savePanels();
  }

  const setData = (panel, attr, value) => {
    if(!panels[panel].data) panels[panel].data = {};
    panels[panel].data[attr] = value;
    savePanels();
  }

  $('input.toggle', $tab).on('change', function() {
    const panel = $(this).attr('name');
    const checked = $(this).is(':checked');
    togglePanel(panel, checked);
  });

  $('input.data', $tab).on('change', function() {
    const $input = $(this);
    const $panel = $input.closest('.sub-panel');
    const panel = $panel.attr('name');
    const attr = $input.attr('name');
    let val = $input.val();
    const type = $input.attr('type');
    switch(type) {
      case 'checkbox':
        val = $input.is(':checked');
        break;
    }
    setData(panel, attr, val);
  });

  for(k in panels) {
    const {visible, open, data} = panels[k];
    const $panel = $(`.sub-panel[name=${k}]`);
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

    if(data) {
      for(j in data) {
        const val = data[j];
        if(typeof val == 'boolean') {
          $(`input[name=${j}`, $panel).prop('checked', data[j]);
        } else {
          $(`input[name=${j}`, $panel).val(val);
        }
      }
    }
  }
})();