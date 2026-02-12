// Strategy RPG — Entry Point
// Keybindings, click handling, event wiring, game loop, ForkArcade integration
(function() {
  'use strict';
  var FA = window.FA;
  var cfg = FA.lookup('config', 'game');
  var colors = FA.lookup('config', 'colors');

  FA.initCanvas('game', cfg.canvasWidth, cfg.canvasHeight);

  // Keybindings
  FA.bindKey('endTurn', ['e', 'Enter']);
  FA.bindKey('restart', ['r']);
  FA.bindKey('cancel',  ['Escape']);

  // Input handling
  FA.on('input:action', function(data) {
    var state = FA.getState();
    if (data.action === 'restart' && state.gameOver) { Battle.init(); return; }
    if (state.gameOver) return;
    if (data.action === 'endTurn') Battle.endPlayerPhase();
    if (data.action === 'cancel') {
      state.selectedUnit = null;
      state.phase = 'select';
      state.reachable = [];
    }
  });

  // Click on hex
  FA.on('input:click', function(data) {
    var state = FA.getState();
    if (state.gameOver) return;
    // TODO: convert click to hex coords, select/move/attack
  });

  // Score submission
  FA.on('game:over', function(data) {
    if (typeof ForkArcade !== 'undefined') {
      ForkArcade.submitScore(data.score);
    }
  });

  // Game loop
  FA.setUpdate(function(dt) {
    FA.updateEffects(dt);
    FA.updateFloats(dt);
  });

  FA.setRender(function() {
    FA.draw.clear(colors.bg);
    FA.renderLayers();
  });

  // Start
  Render.setup();
  Battle.init();

  if (typeof ForkArcade !== 'undefined') {
    ForkArcade.onReady(function() {});
  }

  FA.start();

})();
