// Strategy RPG — Data
(function() {
  'use strict';
  var FA = window.FA;

  FA.register('config', 'game', {
    gridCols: 10, gridRows: 8,
    hexSize: 36,
    canvasWidth: 800,
    canvasHeight: 600,
    offsetX: 54,
    offsetY: 50
  });

  FA.register('config', 'colors', {
    bg: '#1a1a2e', grass: '#3a6b3a', forest: '#2a5a2a', mountain: '#7a7a7a', water: '#2a5a8a',
    blueTeam: '#4466cc', redTeam: '#cc4444',
    blueLight: '#6688ee', redLight: '#ee6666',
    highlight: '#ffffff', select: '#ffdd44', move: '#44ff44', attack: '#ff4444',
    text: '#ddd', dim: '#777', narrative: '#c8b4ff'
  });

  FA.register('config', 'scoring', {
    killMultiplier: 50,
    turnPenalty: 5,
    victoryBonus: 500
  });

  // === TERRAIN ===
  FA.register('terrain', 'grass',    { name: 'Trawa',  color: '#3a6b3a', moveCost: 1, defBonus: 0 });
  FA.register('terrain', 'forest',   { name: 'Las',    color: '#2a5a2a', moveCost: 2, defBonus: 2 });
  FA.register('terrain', 'mountain', { name: 'Gora',   color: '#7a7a7a', moveCost: 99, defBonus: 0 });
  FA.register('terrain', 'water',    { name: 'Woda',   color: '#2a5a8a', moveCost: 99, defBonus: 0 });

  // === UNIT TYPES ===
  FA.register('unitTypes', 'warrior', {
    name: 'Wojownik', char: 'W',
    hp: 30, atk: 8, def: 5, move: 2, range: 1
  });

  FA.register('unitTypes', 'archer', {
    name: 'Lucznik', char: 'A',
    hp: 18, atk: 7, def: 2, move: 3, range: 3
  });

  FA.register('unitTypes', 'mage', {
    name: 'Mag', char: 'M',
    hp: 15, atk: 10, def: 1, move: 2, range: 2
  });

  // === NARRATIVE ===
  FA.register('config', 'narrative', {
    startNode: 'prepare',
    variables: { kills: 0, losses: 0 },
    graph: {
      nodes: [
        { id: 'prepare', label: 'Przygotowanie', type: 'scene' },
        { id: 'battle', label: 'Bitwa', type: 'scene' },
        { id: 'first_blood', label: 'Pierwsza krew', type: 'scene' },
        { id: 'turning_point', label: 'Punkt zwrotny', type: 'scene' },
        { id: 'victory', label: 'Zwyciestwo', type: 'scene' },
        { id: 'defeat', label: 'Porazka', type: 'scene' }
      ],
      edges: [
        { from: 'prepare', to: 'battle' },
        { from: 'battle', to: 'first_blood' },
        { from: 'first_blood', to: 'turning_point' },
        { from: 'turning_point', to: 'victory' },
        { from: 'turning_point', to: 'defeat' },
        { from: 'battle', to: 'defeat' }
      ]
    }
  });

  FA.register('narrativeText', 'prepare', {
    text: 'Armie stoja naprzeciw siebie. Napieice wisi w powietrzu.',
    color: '#c8b4ff'
  });
  FA.register('narrativeText', 'battle', {
    text: 'Bitwa sie rozpoczela! Wydawaj rozkazy swym wojownikom.',
    color: '#c8b4ff'
  });
  FA.register('narrativeText', 'first_blood', {
    text: 'Pierwszy wrog pada! Twoi wojownicy nabieraja pewnosci siebie.',
    color: '#ffa'
  });
  FA.register('narrativeText', 'turning_point', {
    text: 'Szala zwyciestwa przechyla sie na twoja strone!',
    color: '#ffa'
  });
  FA.register('narrativeText', 'victory', {
    text: 'Zwyciestwo! Wrogie sily zostaly rozbite. Chwala zwyciezcom!',
    color: '#4f4'
  });
  FA.register('narrativeText', 'defeat', {
    text: 'Porazka... Twoja armia legla na polu bitwy.',
    color: '#f44'
  });

})();
