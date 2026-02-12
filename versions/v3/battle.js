// Strategy RPG — Battle Logic
// System tur, combat, AI, warunki wygranej/przegranej
(function() {
  'use strict';
  var FA = window.FA;

  function showNarrative(nodeId) {
    var textDef = FA.lookup('narrativeText', nodeId);
    if (textDef) {
      FA.setState('narrativeMessage', { text: textDef.text, color: textDef.color, life: 3 });
    }
    FA.narrative.transition(nodeId);
  }

  // === SCREENS ===

  function startScreen() {
    var cfg = FA.lookup('config', 'game');
    FA.resetState({
      screen: 'start',
      grid: null,
      units: [],
      turn: 0,
      phase: 'select',
      selectedUnit: null,
      reachable: [],
      attackable: [],
      narrativeMessage: null,
      kills: 0,
      losses: 0,
      score: 0
    });
    var narCfg = FA.lookup('config', 'narrative');
    if (narCfg) FA.narrative.init(narCfg);
  }

  function beginBattle() {
    var cfg = FA.lookup('config', 'game');
    var grid = GameMap.generate(cfg.gridCols, cfg.gridRows);
    var units = [];
    var id = 0;

    // Player units (blue, left side)
    var playerTypes = ['warrior', 'archer', 'mage'];
    var playerPositions = [
      { col: 1, row: 1 },
      { col: 0, row: 3 },
      { col: 1, row: 5 }
    ];
    for (var i = 0; i < playerTypes.length; i++) {
      var def = FA.lookup('unitTypes', playerTypes[i]);
      units.push({
        id: 'p' + (id++),
        team: 'player',
        type: playerTypes[i],
        col: playerPositions[i].col,
        row: playerPositions[i].row,
        hp: def.hp, maxHp: def.hp,
        atk: def.atk, def: def.def,
        move: def.move, range: def.range,
        acted: false
      });
    }

    // Enemy units (red, right side)
    var enemyTypes = ['warrior', 'archer', 'mage'];
    var enemyPositions = [
      { col: 8, row: 2 },
      { col: 9, row: 4 },
      { col: 8, row: 6 }
    ];
    for (var j = 0; j < enemyTypes.length; j++) {
      var edef = FA.lookup('unitTypes', enemyTypes[j]);
      units.push({
        id: 'e' + (id++),
        team: 'enemy',
        type: enemyTypes[j],
        col: enemyPositions[j].col,
        row: enemyPositions[j].row,
        hp: edef.hp, maxHp: edef.hp,
        atk: edef.atk, def: edef.def,
        move: edef.move, range: edef.range,
        acted: false
      });
    }

    FA.setState('screen', 'playing');
    FA.setState('grid', grid);
    FA.setState('units', units);
    FA.setState('turn', 1);
    FA.setState('phase', 'select');
    FA.setState('selectedUnit', null);
    FA.setState('reachable', []);
    FA.setState('attackable', []);
    FA.setState('kills', 0);
    FA.setState('losses', 0);

    showNarrative('battle');
  }

  // === CLICK HANDLING ===

  function handleClick(col, row) {
    var state = FA.getState();
    if (state.screen !== 'playing' || state.phase === 'enemy') return;

    var cfg = FA.lookup('config', 'game');
    if (!GameMap.inBounds(col, row, cfg.gridCols, cfg.gridRows)) return;

    if (state.phase === 'select') {
      // Try to select a player unit at this hex
      var unit = findUnitAt(col, row, 'player');
      if (unit && !unit.acted) {
        selectUnit(unit);
      }
    } else if (state.phase === 'move') {
      // Check if clicking on an attackable enemy
      var enemy = findUnitAt(col, row, 'enemy');
      if (enemy) {
        var sel = getSelectedUnit();
        if (sel) {
          var dist = GameMap.hexDistance(
            { col: sel.col, row: sel.row },
            { col: enemy.col, row: enemy.row }
          );
          if (dist <= sel.range) {
            doAttack(sel, enemy);
            return;
          }
        }
      }

      // Check if clicking on a reachable tile
      var reachable = state.reachable;
      var isReachable = false;
      for (var i = 0; i < reachable.length; i++) {
        if (reachable[i].col === col && reachable[i].row === row) {
          isReachable = true;
          break;
        }
      }

      if (isReachable) {
        moveUnit(col, row);
      } else {
        // Click on another player unit to switch selection
        var other = findUnitAt(col, row, 'player');
        if (other && !other.acted) {
          selectUnit(other);
        } else {
          deselect();
        }
      }
    } else if (state.phase === 'attack') {
      // Attack phase — click on attackable enemy
      var target = findUnitAt(col, row, 'enemy');
      if (target) {
        var attacker = getSelectedUnit();
        var attackable = state.attackable;
        var canAttack = false;
        for (var a = 0; a < attackable.length; a++) {
          if (attackable[a].id === target.id) { canAttack = true; break; }
        }
        if (canAttack) {
          doAttack(attacker, target);
          return;
        }
      }
      // Click elsewhere — skip attack
      deselect();
    }
  }

  function findUnitAt(col, row, team) {
    var units = FA.getState().units;
    for (var i = 0; i < units.length; i++) {
      var u = units[i];
      if (u.hp > 0 && u.col === col && u.row === row) {
        if (!team || u.team === team) return u;
      }
    }
    return null;
  }

  function getSelectedUnit() {
    var state = FA.getState();
    if (!state.selectedUnit) return null;
    var units = state.units;
    for (var i = 0; i < units.length; i++) {
      if (units[i].id === state.selectedUnit) return units[i];
    }
    return null;
  }

  // === SELECT / MOVE / ATTACK ===

  function selectUnit(unit) {
    var state = FA.getState();
    state.selectedUnit = unit.id;
    state.phase = 'move';
    state.reachable = GameMap.findReachable(state.grid, unit.col, unit.row, unit.move, state.units);
    state.attackable = GameMap.findAttackable(unit.col, unit.row, unit.range, state.units, unit.team);
  }

  function moveUnit(col, row) {
    var state = FA.getState();
    var unit = getSelectedUnit();
    if (!unit) return;

    unit.col = col;
    unit.row = row;

    FA.playSound('step');

    // After move, check for attackable targets
    var targets = GameMap.findAttackable(unit.col, unit.row, unit.range, state.units, unit.team);
    if (targets.length > 0) {
      state.phase = 'attack';
      state.reachable = [];
      state.attackable = targets;
    } else {
      unit.acted = true;
      deselect();
      checkAutoEndTurn();
    }
  }

  function doAttack(attacker, defender) {
    var cfg = FA.lookup('config', 'game');
    var terrain = FA.lookup('terrain', FA.getState().grid[defender.row][defender.col].terrain);
    var defBonus = terrain ? terrain.defBonus : 0;

    var dmg = Math.max(1, attacker.atk - (defender.def + defBonus) + FA.rand(-1, 2));
    defender.hp -= dmg;

    var pos = GameMap.hexToPixel(defender.col, defender.row, cfg.hexSize);
    FA.addFloat(pos.x + cfg.offsetX, pos.y + cfg.offsetY - 10, '-' + dmg, '#f44', 800);
    FA.playSound('hit');

    FA.emit('entity:damaged', { entity: defender, damage: dmg, attacker: attacker });

    if (defender.hp <= 0) {
      defender.hp = 0;
      FA.emit('entity:killed', { entity: defender, killer: attacker });
      FA.playSound('death');

      var state = FA.getState();
      if (defender.team === 'enemy') {
        state.kills++;
        FA.narrative.setVar('kills', state.kills);
        if (state.kills === 1) showNarrative('first_blood');
        if (state.kills === 2) showNarrative('turning_point');
      } else {
        state.losses++;
        FA.narrative.setVar('losses', state.losses);
      }
    }

    attacker.acted = true;
    deselect();
    checkEndConditions();
    checkAutoEndTurn();
  }

  function deselect() {
    var state = FA.getState();
    state.selectedUnit = null;
    state.phase = 'select';
    state.reachable = [];
    state.attackable = [];
  }

  function checkAutoEndTurn() {
    var state = FA.getState();
    var allActed = true;
    var units = state.units;
    for (var i = 0; i < units.length; i++) {
      if (units[i].team === 'player' && units[i].hp > 0 && !units[i].acted) {
        allActed = false;
        break;
      }
    }
    if (allActed && state.screen === 'playing') {
      endPlayerPhase();
    }
  }

  // === END TURN / ENEMY PHASE ===

  function endPlayerPhase() {
    var state = FA.getState();
    if (state.screen !== 'playing') return;
    deselect();
    state.phase = 'enemy';

    // Simple AI for each enemy unit
    var units = state.units;
    for (var i = 0; i < units.length; i++) {
      var enemy = units[i];
      if (enemy.team !== 'enemy' || enemy.hp <= 0 || enemy.acted) continue;
      enemyAction(enemy);
    }

    // Check end conditions after enemy phase
    if (!checkEndConditions()) {
      nextTurn();
    }
  }

  function enemyAction(enemy) {
    var state = FA.getState();
    var cfg = FA.lookup('config', 'game');

    // Find nearest player unit
    var nearest = null;
    var nearestDist = 999;
    var units = state.units;
    for (var i = 0; i < units.length; i++) {
      var u = units[i];
      if (u.team !== 'player' || u.hp <= 0) continue;
      var dist = GameMap.hexDistance(
        { col: enemy.col, row: enemy.row },
        { col: u.col, row: u.row }
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = u;
      }
    }

    if (!nearest) return;

    // Try to attack first if in range
    if (nearestDist <= enemy.range) {
      doEnemyAttack(enemy, nearest);
      enemy.acted = true;
      return;
    }

    // Move toward nearest player unit
    var reachable = GameMap.findReachable(state.grid, enemy.col, enemy.row, enemy.move, units);
    var bestTile = null;
    var bestDist = nearestDist;
    for (var j = 0; j < reachable.length; j++) {
      var tile = reachable[j];
      var d = GameMap.hexDistance(
        { col: tile.col, row: tile.row },
        { col: nearest.col, row: nearest.row }
      );
      if (d < bestDist) {
        bestDist = d;
        bestTile = tile;
      }
    }

    if (bestTile) {
      enemy.col = bestTile.col;
      enemy.row = bestTile.row;
    }

    // Try to attack after moving
    var newDist = GameMap.hexDistance(
      { col: enemy.col, row: enemy.row },
      { col: nearest.col, row: nearest.row }
    );
    if (newDist <= enemy.range) {
      doEnemyAttack(enemy, nearest);
    }

    enemy.acted = true;
  }

  function doEnemyAttack(attacker, defender) {
    var cfg = FA.lookup('config', 'game');
    var state = FA.getState();
    var terrain = FA.lookup('terrain', state.grid[defender.row][defender.col].terrain);
    var defBonus = terrain ? terrain.defBonus : 0;

    var dmg = Math.max(1, attacker.atk - (defender.def + defBonus) + FA.rand(-1, 2));
    defender.hp -= dmg;

    var pos = GameMap.hexToPixel(defender.col, defender.row, cfg.hexSize);
    FA.addFloat(pos.x + cfg.offsetX, pos.y + cfg.offsetY - 10, '-' + dmg, '#f44', 800);
    FA.playSound('hit');

    if (defender.hp <= 0) {
      defender.hp = 0;
      FA.playSound('death');
      state.losses++;
      FA.narrative.setVar('losses', state.losses);
    }
  }

  function nextTurn() {
    var state = FA.getState();
    state.turn++;
    state.phase = 'select';
    state.selectedUnit = null;
    state.reachable = [];
    state.attackable = [];
    // Reset acted flags for all living units
    var units = state.units;
    for (var i = 0; i < units.length; i++) {
      if (units[i].hp > 0) units[i].acted = false;
    }
  }

  // === END CONDITIONS ===

  function checkEndConditions() {
    var state = FA.getState();
    var units = state.units;
    var playerAlive = 0;
    var enemyAlive = 0;
    for (var i = 0; i < units.length; i++) {
      if (units[i].hp > 0) {
        if (units[i].team === 'player') playerAlive++;
        else enemyAlive++;
      }
    }

    if (enemyAlive === 0) {
      endGame(true);
      return true;
    }
    if (playerAlive === 0) {
      endGame(false);
      return true;
    }
    return false;
  }

  function endGame(victory) {
    var state = FA.getState();
    var scoring = FA.lookup('config', 'scoring');
    var score = 0;
    if (victory) {
      score = scoring.victoryBonus + (state.kills * scoring.killMultiplier) - (state.turn * scoring.turnPenalty);
    }
    score = Math.max(0, score);
    FA.setState('score', score);
    FA.setState('screen', victory ? 'victory' : 'defeat');

    showNarrative(victory ? 'victory' : 'defeat');
    FA.emit('game:over', { victory: victory, score: score });
  }

  // === EXPORTS ===

  window.Battle = {
    startScreen: startScreen,
    begin: beginBattle,
    handleClick: handleClick,
    endPlayerPhase: endPlayerPhase,
    deselect: deselect
  };

})();
