// Strategy RPG — Map & Hex Math
(function() {
  'use strict';
  var FA = window.FA;

  function hexToPixel(col, row, size) {
    var x = size * Math.sqrt(3) * (col + 0.5 * (row & 1));
    var y = size * 1.5 * row;
    return { x: x, y: y };
  }

  function pixelToHex(px, py, size, offsetX, offsetY) {
    var adjX = px - offsetX;
    var adjY = py - offsetY;
    var row = Math.round(adjY / (size * 1.5));
    var col = Math.round((adjX / (size * Math.sqrt(3))) - 0.5 * (row & 1));
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
      ? [[1,0],[0,-1],[1,-1],[1,1],[0,1],[-1,0]]
      : [[1,0],[-1,-1],[0,-1],[0,1],[-1,1],[-1,0]];
    var result = [];
    for (var i = 0; i < dirs.length; i++) {
      result.push({ col: col + dirs[i][0], row: row + dirs[i][1] });
    }
    return result;
  }

  function inBounds(col, row, cols, rows) {
    return col >= 0 && col < cols && row >= 0 && row < rows;
  }

  // === MAP GENERATION ===

  function generateMap(cols, rows) {
    var grid = [];
    for (var r = 0; r < rows; r++) {
      grid[r] = [];
      for (var c = 0; c < cols; c++) {
        grid[r][c] = { terrain: 'grass' };
      }
    }
    // scatter forests
    for (var i = 0; i < 8; i++) {
      var fc = FA.rand(1, cols - 2);
      var fr = FA.rand(1, rows - 2);
      grid[fr][fc].terrain = 'forest';
    }
    // mountains (center band)
    for (var m = 0; m < 3; m++) {
      var mc = FA.rand(3, 6);
      var mr = FA.rand(2, rows - 3);
      grid[mr][mc].terrain = 'mountain';
    }
    // water
    var wr = FA.rand(2, rows - 3);
    grid[wr][4].terrain = 'water';
    grid[wr][5].terrain = 'water';
    return grid;
  }

  // === BFS PATHFINDING ===

  function findReachable(grid, startCol, startRow, moveRange, units) {
    var cols = grid[0].length;
    var rows = grid.length;
    var visited = {};
    var queue = [{ col: startCol, row: startRow, cost: 0 }];
    var reachable = [];
    visited[startCol + ',' + startRow] = true;

    while (queue.length > 0) {
      var cur = queue.shift();
      var neighbors = hexNeighbors(cur.col, cur.row);
      for (var i = 0; i < neighbors.length; i++) {
        var n = neighbors[i];
        var key = n.col + ',' + n.row;
        if (visited[key]) continue;
        if (!inBounds(n.col, n.row, cols, rows)) continue;

        var terrain = FA.lookup('terrain', grid[n.row][n.col].terrain);
        var cost = cur.cost + (terrain ? terrain.moveCost : 1);
        if (cost > moveRange) continue;

        // check unit blocking
        var blocked = false;
        if (units) {
          for (var u = 0; u < units.length; u++) {
            if (units[u].hp > 0 && units[u].col === n.col && units[u].row === n.row) {
              blocked = true; break;
            }
          }
        }

        visited[key] = true;
        if (!blocked) {
          reachable.push(n);
          queue.push({ col: n.col, row: n.row, cost: cost });
        }
      }
    }
    return reachable;
  }

  function findAttackable(col, row, range, units, team) {
    var targets = [];
    for (var i = 0; i < units.length; i++) {
      var u = units[i];
      if (u.hp <= 0 || u.team === team) continue;
      var dist = hexDistance({ col: col, row: row }, { col: u.col, row: u.row });
      if (dist <= range) targets.push(u);
    }
    return targets;
  }

  window.GameMap = {
    generate: generateMap,
    hexToPixel: hexToPixel,
    pixelToHex: pixelToHex,
    hexDistance: hexDistance,
    hexNeighbors: hexNeighbors,
    findReachable: findReachable,
    findAttackable: findAttackable,
    inBounds: inBounds
  };

})();
