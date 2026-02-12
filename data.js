// Strategy RPG — Data
// Rejestracja danych: config, unit types, abilities, terrain, scoring, narracja
(function() {
  'use strict';
  var FA = window.FA;

  // === CONFIG ===
  FA.register('config', 'game', {
    gridCols: 10, gridRows: 8,
    hexSize: 36,
    canvasWidth: 800,
    canvasHeight: 600
  });

  FA.register('config', 'colors', {
    bg: '#1a1a2e', grass: '#4a4', water: '#48a', mountain: '#888',
    blueTeam: '#44c', redTeam: '#c44',
    highlight: '#fff', select: '#fd4', text: '#ddd', dim: '#777'
  });

  FA.register('config', 'scoring', {
    killMultiplier: 50,
    turnPenalty: 5,
    victoryBonus: 500
  });

  // === UNIT TYPES ===
  // FA.register('unitTypes', id, { name, char, color, hp, atk, def, move, abilities })

  // === ABILITIES ===
  // FA.register('abilities', id, { name, range, damage, effect, cost })

  // === TERRAIN ===
  // FA.register('terrain', id, { name, color, moveCost, defBonus })

  // === NARRATIVE ===
  FA.register('config', 'narrative', {
    startNode: 'start',
    variables: {},
    graph: {
      nodes: [
        { id: 'start', label: 'Poczatek bitwy', type: 'scene' }
      ],
      edges: []
    }
  });

})();
