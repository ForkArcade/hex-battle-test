// Strategy RPG — Rendering
// Warstwy: grid, units, highlights, floats, UI, overlay
(function() {
  'use strict';
  var FA = window.FA;

  function setupLayers() {
    var cfg = FA.lookup('config', 'game');
    var colors = FA.lookup('config', 'colors');
    var size = cfg.hexSize;
    var offsetX = size * 1.5;
    var offsetY = size * 2;

    // Layer 0: Hex grid
    FA.addLayer('grid', function() {
      var state = FA.getState();
      if (!state.grid) return;
      for (var r = 0; r < cfg.gridRows; r++) {
        for (var c = 0; c < cfg.gridCols; c++) {
          var pos = GameMap.hexToPixel(c, r, size);
          var terrain = state.grid[r][c].terrain;
          var terrainDef = FA.lookup('terrain', terrain);
          var col = terrainDef ? terrainDef.color : colors.grass;
          FA.draw.hex(pos.x + offsetX, pos.y + offsetY, size - 1, col, '#333', 1);
        }
      }
    }, 0);

    // Layer 5: Highlights (reachable tiles)
    FA.addLayer('highlights', function() {
      var state = FA.getState();
      for (var i = 0; i < state.reachable.length; i++) {
        var t = state.reachable[i];
        var pos = GameMap.hexToPixel(t.col, t.row, size);
        FA.draw.withAlpha(0.3, function() {
          FA.draw.hex(pos.x + offsetX, pos.y + offsetY, size - 2, colors.highlight);
        });
      }
    }, 5);

    // Layer 10: Units
    FA.addLayer('units', function() {
      var state = FA.getState();
      for (var i = 0; i < state.units.length; i++) {
        var u = state.units[i];
        if (u.hp <= 0) continue;
        var pos = GameMap.hexToPixel(u.col, u.row, size);
        var typeDef = FA.lookup('unitTypes', u.type);
        var ch = typeDef ? typeDef.char : '?';
        var color = u.team === 'player' ? colors.blueTeam : colors.redTeam;
        FA.draw.sprite('units', u.type, pos.x + offsetX - size/2, pos.y + offsetY - size/2, size, ch, color);
        // HP bar
        var hpRatio = u.hp / u.maxHp;
        if (hpRatio < 1) {
          FA.draw.bar(pos.x + offsetX - size/2, pos.y + offsetY + size/2 + 2, size, 3, hpRatio, '#4f4', '#400');
        }
      }
    }, 10);

    // Layer 20: Floating messages
    FA.addLayer('floats', function() {
      FA.drawFloats();
    }, 20);

    // Layer 30: UI
    FA.addLayer('ui', function() {
      var state = FA.getState();
      FA.draw.text('Tura: ' + state.turn, 8, 8, { color: colors.text, size: 14 });
      FA.draw.text('Faza: ' + state.phase, 8, 26, { color: colors.dim, size: 12 });
      // TODO: selected unit info, action buttons
    }, 30);

    // Layer 40: Game over overlay
    FA.addLayer('overlay', function() {
      var state = FA.getState();
      if (!state.gameOver) return;
      FA.draw.withAlpha(0.7, function() {
        FA.draw.rect(0, 0, cfg.canvasWidth, cfg.canvasHeight, '#000');
      });
      var label = state.victory ? 'ZWYCIESTWO!' : 'PORAZKA!';
      var col = state.victory ? '#4f4' : '#f44';
      FA.draw.text(label, cfg.canvasWidth / 2, cfg.canvasHeight / 2 - 20, { color: col, size: 28, bold: true, align: 'center', baseline: 'middle' });
      FA.draw.text('Wynik: ' + (state.score || 0), cfg.canvasWidth / 2, cfg.canvasHeight / 2 + 20, { color: '#fff', size: 16, align: 'center', baseline: 'middle' });
      FA.draw.text('[R] Nowa gra', cfg.canvasWidth / 2, cfg.canvasHeight / 2 + 50, { color: colors.dim, size: 14, align: 'center', baseline: 'middle' });
    }, 40);
  }

  window.Render = {
    setup: setupLayers
  };

})();
