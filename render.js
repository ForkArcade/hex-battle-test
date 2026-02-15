// Strategy RPG — Rendering
// Warstwy: startScreen, grid, highlights, units, floats, narrative, ui, gameOver
(function() {
  'use strict';
  var FA = window.FA;

  function setupLayers() {
    var cfg = FA.lookup('config', 'game');
    var colors = FA.lookup('config', 'colors');
    var size = cfg.hexSize;
    var ox = cfg.offsetX;
    var oy = cfg.offsetY;

    // Layer 0: Start screen
    FA.addLayer('startScreen', function() {
      var state = FA.getState();
      if (state.screen !== 'start') return;

      FA.draw.text('HEX BATTLE', cfg.canvasWidth / 2, 100, {
        color: '#fff', size: 36, bold: true, align: 'center', baseline: 'middle'
      });
      FA.draw.text('Turowa strategia na siatce hex', cfg.canvasWidth / 2, 145, {
        color: colors.dim, size: 14, align: 'center', baseline: 'middle'
      });

      // Team display
      var teamY = 220;
      FA.draw.text('Twoja druzyna', cfg.canvasWidth / 2 - 150, teamY, {
        color: colors.blueLight, size: 16, bold: true, align: 'center', baseline: 'middle'
      });
      FA.draw.text('Wrogowie', cfg.canvasWidth / 2 + 150, teamY, {
        color: colors.redLight, size: 16, bold: true, align: 'center', baseline: 'middle'
      });

      var unitNames = ['W - Wojownik', 'A - Lucznik', 'M - Mag'];
      for (var i = 0; i < unitNames.length; i++) {
        FA.draw.text(unitNames[i], cfg.canvasWidth / 2 - 150, teamY + 30 + i * 22, {
          color: colors.blueTeam, size: 13, align: 'center', baseline: 'middle'
        });
        FA.draw.text(unitNames[i], cfg.canvasWidth / 2 + 150, teamY + 30 + i * 22, {
          color: colors.redTeam, size: 13, align: 'center', baseline: 'middle'
        });
      }

      // Controls
      var ctrlY = 370;
      FA.draw.text('Sterowanie:', cfg.canvasWidth / 2, ctrlY, {
        color: '#fff', size: 15, bold: true, align: 'center', baseline: 'middle'
      });
      var controls = [
        'Kliknij jednostke aby ja wybrac',
        'Kliknij zielony hex aby sie ruszyc',
        'Kliknij wroga w zasiegu aby atakowac',
        '[E] Zakoncz ture  [ESC] Anuluj'
      ];
      for (var c = 0; c < controls.length; c++) {
        FA.draw.text(controls[c], cfg.canvasWidth / 2, ctrlY + 25 + c * 20, {
          color: colors.dim, size: 12, align: 'center', baseline: 'middle'
        });
      }

      // Start prompt
      FA.draw.text('[SPACJA] Rozpocznij bitwe', cfg.canvasWidth / 2, 500, {
        color: colors.select, size: 18, bold: true, align: 'center', baseline: 'middle'
      });
    }, 0);

    // Layer 1: Hex grid
    FA.addLayer('grid', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;
      if (!state.grid) return;
      for (var r = 0; r < cfg.gridRows; r++) {
        for (var c = 0; c < cfg.gridCols; c++) {
          var pos = GameMap.hexToPixel(c, r, size);
          var terrain = state.grid[r][c].terrain;
          var terrainDef = FA.lookup('terrain', terrain);
          var col = terrainDef ? terrainDef.color : colors.grass;
          FA.draw.hex(pos.x + ox, pos.y + oy, size - 1, col, '#333', 1);
        }
      }
    }, 1);

    // Layer 5: Highlights (reachable + attackable + selected)
    FA.addLayer('highlights', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;

      // Selected unit highlight
      if (state.selectedUnit) {
        var sel = null;
        for (var s = 0; s < state.units.length; s++) {
          if (state.units[s].id === state.selectedUnit) { sel = state.units[s]; break; }
        }
        if (sel) {
          var sp = GameMap.hexToPixel(sel.col, sel.row, size);
          FA.draw.hex(sp.x + ox, sp.y + oy, size - 1, colors.select, colors.select, 2);
        }
      }

      // Reachable tiles (green)
      for (var i = 0; i < state.reachable.length; i++) {
        var t = state.reachable[i];
        var pos = GameMap.hexToPixel(t.col, t.row, size);
        FA.draw.withAlpha(0.3, function() {
          FA.draw.hex(pos.x + ox, pos.y + oy, size - 2, colors.move);
        });
      }

      // Attackable targets (red)
      for (var a = 0; a < state.attackable.length; a++) {
        var at = state.attackable[a];
        var ap = GameMap.hexToPixel(at.col, at.row, size);
        FA.draw.hex(ap.x + ox, ap.y + oy, size - 1, null, colors.attack, 2);
      }
    }, 5);

    // Layer 10: Units
    FA.addLayer('units', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;

      for (var i = 0; i < state.units.length; i++) {
        var u = state.units[i];
        if (u.hp <= 0) continue;
        var pos = GameMap.hexToPixel(u.col, u.row, size);
        var px = pos.x + ox;
        var py = pos.y + oy;
        var typeDef = FA.lookup('unitTypes', u.type);
        var ch = typeDef ? typeDef.char : '?';
        var teamColor = u.team === 'player' ? colors.blueTeam : colors.redTeam;
        var lightColor = u.team === 'player' ? colors.blueLight : colors.redLight;
        var spriteSize = size * 1.1;

        // Dim acted units
        if (u.acted) {
          FA.draw.withAlpha(0.4, function() {
            FA.draw.circle(px, py, size * 0.55, teamColor);
            FA.draw.sprite('units', u.type, px - spriteSize / 2, py - spriteSize / 2, spriteSize, ch, '#fff', 0);
          });
        } else {
          FA.draw.circle(px, py, size * 0.55, teamColor);
          FA.draw.circle(px, py, size * 0.55, null, lightColor, 2);
          FA.draw.sprite('units', u.type, px - spriteSize / 2, py - spriteSize / 2, spriteSize, ch, '#fff', 0);
        }

        // HP bar
        var hpRatio = u.hp / u.maxHp;
        if (hpRatio < 1) {
          var barW = size * 0.8;
          FA.draw.bar(px - barW / 2, py + size * 0.6, barW, 3, hpRatio, '#4f4', '#400');
        }
      }
    }, 10);

    // Layer 20: Floating text
    FA.addLayer('floats', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;
      FA.drawFloats();
    }, 20);

    // Layer 25: Narrative bar
    FA.addLayer('narrative', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;
      if (!state.narrativeMessage || state.narrativeMessage.life <= 0) return;

      var msg = state.narrativeMessage;
      var alpha = Math.min(1, msg.life / 1000);
      FA.draw.withAlpha(alpha, function() {
        FA.draw.rect(0, 0, cfg.canvasWidth, 30, 'rgba(0,0,0,0.7)');
        FA.draw.text(msg.text, cfg.canvasWidth / 2, 15, {
          color: msg.color || colors.narrative, size: 13, align: 'center', baseline: 'middle'
        });
      });
    }, 25);

    // Layer 30: UI (turn, phase, selected unit info)
    FA.addLayer('ui', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;

      var uiY = cfg.canvasHeight - 50;

      // Bottom bar background
      FA.draw.rect(0, uiY - 5, cfg.canvasWidth, 55, 'rgba(0,0,0,0.6)');

      FA.draw.text('Tura: ' + state.turn, 10, uiY + 8, {
        color: colors.text, size: 14
      });
      FA.draw.text('Faza: ' + (state.phase === 'enemy' ? 'wrog' : state.phase), 10, uiY + 26, {
        color: colors.dim, size: 12
      });

      // Selected unit info
      if (state.selectedUnit) {
        var sel = null;
        for (var s = 0; s < state.units.length; s++) {
          if (state.units[s].id === state.selectedUnit) { sel = state.units[s]; break; }
        }
        if (sel) {
          var typeDef = FA.lookup('unitTypes', sel.type);
          var name = typeDef ? typeDef.name : sel.type;
          FA.draw.text(name + '  HP:' + sel.hp + '/' + sel.maxHp +
            '  ATK:' + sel.atk + '  DEF:' + sel.def +
            '  MOV:' + sel.move + '  RNG:' + sel.range,
            200, uiY + 8, { color: '#fff', size: 13 }
          );
          if (state.phase === 'move') {
            FA.draw.text('Kliknij zielony hex lub wroga w zasiegu', 200, uiY + 26, {
              color: colors.dim, size: 11
            });
          } else if (state.phase === 'attack') {
            FA.draw.text('Kliknij wroga aby atakowac lub kliknij gdzie indziej', 200, uiY + 26, {
              color: colors.attack, size: 11
            });
          }
        }
      } else {
        FA.draw.text('Wybierz jednostke | [E] Zakoncz ture', 200, uiY + 8, {
          color: colors.dim, size: 13
        });
      }

      // Kill/loss counter
      FA.draw.text('Zabici: ' + state.kills + '  Straty: ' + state.losses,
        cfg.canvasWidth - 10, uiY + 8, {
          color: colors.dim, size: 12, align: 'right'
        }
      );
    }, 30);

    // Layer 40: Game over overlay
    FA.addLayer('gameOver', function() {
      var state = FA.getState();
      if (state.screen !== 'victory' && state.screen !== 'defeat') return;

      FA.draw.withAlpha(0.75, function() {
        FA.draw.rect(0, 0, cfg.canvasWidth, cfg.canvasHeight, '#000');
      });

      var isVictory = state.screen === 'victory';
      var narText = FA.lookup('narrativeText', isVictory ? 'victory' : 'defeat');

      // Title
      var title = isVictory ? 'ZWYCIESTWO!' : 'PORAZKA!';
      var titleColor = isVictory ? '#4f4' : '#f44';
      FA.draw.text(title, cfg.canvasWidth / 2, 150, {
        color: titleColor, size: 32, bold: true, align: 'center', baseline: 'middle'
      });

      // Narrative text
      if (narText) {
        FA.draw.text(narText.text, cfg.canvasWidth / 2, 200, {
          color: narText.color, size: 15, align: 'center', baseline: 'middle'
        });
      }

      // Stats
      var statsY = 270;
      FA.draw.text('Statystyki:', cfg.canvasWidth / 2, statsY, {
        color: '#fff', size: 16, bold: true, align: 'center', baseline: 'middle'
      });
      FA.draw.text('Tury: ' + state.turn, cfg.canvasWidth / 2, statsY + 30, {
        color: colors.text, size: 14, align: 'center', baseline: 'middle'
      });
      FA.draw.text('Zabici wrogowie: ' + state.kills, cfg.canvasWidth / 2, statsY + 55, {
        color: colors.text, size: 14, align: 'center', baseline: 'middle'
      });
      FA.draw.text('Stracone jednostki: ' + state.losses, cfg.canvasWidth / 2, statsY + 80, {
        color: colors.text, size: 14, align: 'center', baseline: 'middle'
      });

      // Score
      FA.draw.text('Wynik: ' + (state.score || 0), cfg.canvasWidth / 2, statsY + 120, {
        color: colors.select, size: 22, bold: true, align: 'center', baseline: 'middle'
      });

      // Restart prompt
      FA.draw.text('[R] Nowa gra', cfg.canvasWidth / 2, 490, {
        color: colors.dim, size: 15, align: 'center', baseline: 'middle'
      });
    }, 40);
  }

  window.Render = {
    setup: setupLayers
  };

})();
