// Strategy RPG — Battle Logic
// System tur, combat, AI, warunki wygranej/przegranej
(function() {
  'use strict';
  var FA = window.FA;

  // === INIT ===

  function initBattle() {
    var cfg = FA.lookup('config', 'game');
    var grid = GameMap.generate(cfg.gridCols, cfg.gridRows);

    FA.resetState({
      grid: grid,
      units: [],      // { id, team, type, col, row, hp, maxHp, atk, def, move, acted }
      turn: 1,
      phase: 'select', // select | move | attack | enemy
      selectedUnit: null,
      reachable: [],
      gameOver: false,
      victory: false
    });

    // TODO: rozmieść jednostki na mapie

    var narCfg = FA.lookup('config', 'narrative');
    if (narCfg) FA.narrative.init(narCfg);
  }

  // === TURN SYSTEM ===

  function endPlayerPhase() {
    var state = FA.getState();
    state.phase = 'enemy';
    // TODO: AI wroga
    nextTurn();
  }

  function nextTurn() {
    var state = FA.getState();
    state.turn++;
    state.phase = 'select';
    state.selectedUnit = null;
    state.reachable = [];
    // reset acted flags
    for (var i = 0; i < state.units.length; i++) {
      state.units[i].acted = false;
    }
  }

  // === COMBAT ===

  function attack(attacker, defender) {
    var dmg = Math.max(1, attacker.atk - defender.def + FA.rand(-1, 2));
    defender.hp -= dmg;
    FA.emit('entity:damaged', { entity: defender, damage: dmg, attacker: attacker });

    var cfg = FA.lookup('config', 'game');
    var pos = GameMap.hexToPixel(defender.col, defender.row, cfg.hexSize);
    FA.addFloat(pos.x, pos.y - 10, '-' + dmg, '#f44', 800);

    if (defender.hp <= 0) {
      FA.emit('entity:killed', { entity: defender, killer: attacker });
    }
  }

  // === SELECT / MOVE ===

  function selectUnit(unitId) {
    var state = FA.getState();
    var unit = null;
    for (var i = 0; i < state.units.length; i++) {
      if (state.units[i].id === unitId) { unit = state.units[i]; break; }
    }
    if (!unit || unit.acted || unit.team !== 'player') return;

    state.selectedUnit = unitId;
    state.phase = 'move';
    state.reachable = GameMap.findReachable(state.grid, unit.col, unit.row, unit.move);
  }

  function moveUnit(unitId, col, row) {
    var state = FA.getState();
    for (var i = 0; i < state.units.length; i++) {
      if (state.units[i].id === unitId) {
        state.units[i].col = col;
        state.units[i].row = row;
        state.units[i].acted = true;
        break;
      }
    }
    state.phase = 'select';
    state.selectedUnit = null;
    state.reachable = [];
  }

  // === END GAME ===

  function endGame(victory) {
    var state = FA.getState();
    state.gameOver = true;
    state.victory = victory;
    var scoring = FA.lookup('config', 'scoring');
    var score = victory ? scoring.victoryBonus - (state.turn * scoring.turnPenalty) : 0;
    state.score = Math.max(0, score);
    FA.emit('game:over', { victory: victory, score: state.score });
  }

  // === EXPORTS ===

  window.Battle = {
    init: initBattle,
    selectUnit: selectUnit,
    moveUnit: moveUnit,
    attack: attack,
    endPlayerPhase: endPlayerPhase,
    endGame: endGame
  };

})();
