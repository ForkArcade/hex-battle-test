// Strategy RPG — Map & Hex Math
// Siatka hex, teren, pathfinding, zaznaczanie
(function() {
  'use strict';
  var FA = window.FA;

  // === HEX MATH ===

  function hexToPixel(col, row, size) {
    var x = size * Math.sqrt(3) * (col + 0.5 * (row & 1));
    var y = size * 1.5 * row;
    return { x: x, y: y };
  }

  function pixelToHex(px, py, size) {
    var row = Math.round(py / (size * 1.5));
    var col = Math.round((px / (size * Math.sqrt(3))) - 0.5 * (row & 1));
    return { col: col, row: row };
  }

  function hexDistance(a, b) {
    var ac = axialToCube(a.col, a.row);
    var bc = axialToCube(b.col, b.row);
    return Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z));
  }

  function axialToCube(col, row) {
    var x = col - (row - (row & 1)) / 2;
    var z = row;
    var y = -x - z;
    return { x: x, y: y, z: z };
  }

  function hexNeighbors(col, row) {
    var parity = row & 1;
    var dirs = parity
      ? [[1,0],[ 0,-1],[1,-1],[1,1],[ 0,1],[-1,0]]
      : [[1,0],[-1,-1],[0,-1],[0,1],[-1,1],[-1,0]];
    var result = [];
    for (var i = 0; i < dirs.length; i++) {
      result.push({ col: col + dirs[i][0], row: row + dirs[i][1] });
    }
    return result;
  }

  // === MAP GENERATION ===

  function generateMap(cols, rows) {
    var grid = [];
    for (var r = 0; r < rows; r++) {
      grid[r] = [];
      for (var c = 0; c < cols; c++) {
        grid[r][c] = { terrain: 'grass' }; // TODO: proceduralna generacja
      }
    }
    return grid;
  }

  // === PATHFINDING ===

  function findReachable(grid, startCol, startRow, moveRange) {
    // TODO: BFS po hexach z uwzględnieniem moveCost terenu
    var reachable = [];
    var neighbors = hexNeighbors(startCol, startRow);
    for (var i = 0; i < neighbors.length; i++) {
      var n = neighbors[i];
      if (n.row >= 0 && n.row < grid.length && n.col >= 0 && n.col < grid[0].length) {
        reachable.push(n);
      }
    }
    return reachable;
  }

  // === EXPORTS ===

  window.GameMap = {
    generate: generateMap,
    hexToPixel: hexToPixel,
    pixelToHex: pixelToHex,
    hexDistance: hexDistance,
    hexNeighbors: hexNeighbors,
    findReachable: findReachable
  };

})();
