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
  FA.bindKey('start',   [' ']);

  // Input handling
  FA.on('input:action', function(data) {
    var state = FA.getState();

    // Start screen
    if (state.screen === 'start' && data.action === 'start') {
      Battle.begin();
      return;
    }

    // Game over screens
    if ((state.screen === 'victory' || state.screen === 'defeat') && data.action === 'restart') {
      Battle.startScreen();
      return;
    }

    // Playing
    if (state.screen !== 'playing') return;
    if (state.phase === 'enemy') return;

    if (data.action === 'endTurn') {
      Battle.endPlayerPhase();
    }
    if (data.action === 'cancel') {
      Battle.deselect();
    }
  });

  // Click on hex
  FA.on('input:click', function(data) {
    var state = FA.getState();
    if (state.screen !== 'playing') return;

    var hex = GameMap.pixelToHex(data.x, data.y, cfg.hexSize, cfg.offsetX, cfg.offsetY);
    Battle.handleClick(hex.col, hex.row);
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
    // Narrative message timer
    var state = FA.getState();
    if (state.narrativeMessage && state.narrativeMessage.life > 0) {
      state.narrativeMessage.life -= dt;
    }
  });

  FA.setRender(function() {
    FA.draw.clear(colors.bg);
    FA.renderLayers();
  });

  // Start
  Render.setup();
  Battle.startScreen();

  if (typeof ForkArcade !== 'undefined') {
    ForkArcade.onReady(function() {});
  }

  FA.start();
})();
