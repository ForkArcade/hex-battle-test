// sprites.js — ForkArcade pixel art sprites
// Generated from _sprites.json by create_sprite tool

var SPRITE_DEFS = {
  "units": {
    "warrior": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#44c",
        "2": "#88f",
        "3": "#ddd",
        "4": "#a86",
        "5": "#fff"
      },
      "frames": [
        [
          "..3333..",
          "..3553..",
          ".222222.",
          ".112211.",
          "11122111",
          ".112211.",
          ".11..11.",
          ".44..44."
        ]
      ],
      "origin": [
        0,
        0
      ]
    },
    "archer": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#44c",
        "2": "#88f",
        "3": "#ddd",
        "4": "#a86",
        "5": "#4a4"
      },
      "frames": [
        [
          "..3333..",
          "..3333..",
          ".22222..",
          ".11221..",
          ".112215.",
          ".11221..",
          ".11..1..",
          ".44..4.."
        ]
      ],
      "origin": [
        0,
        0
      ]
    },
    "mage": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#44c",
        "2": "#88f",
        "3": "#ddd",
        "4": "#a86",
        "5": "#fd4",
        "6": "#c8b4ff"
      },
      "frames": [
        [
          "..3333..",
          "..6666..",
          ".666666.",
          ".116611.",
          "11166111",
          ".116611.",
          ".1111115",
          ".44..45."
        ]
      ],
      "origin": [
        0,
        0
      ]
    }
  },
  "terrain": {
    "grass": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#3a6b3a",
        "2": "#4a8a4a",
        "3": "#2a5a2a"
      },
      "frames": [
        [
          "11121112",
          "12111211",
          "11211112",
          "21111211",
          "11121111",
          "11111312",
          "12111111",
          "11211121"
        ]
      ],
      "origin": [
        0,
        0
      ]
    },
    "forest": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#2a5a2a",
        "2": "#3a6b3a",
        "3": "#1a4a1a",
        "4": "#5a3a1a"
      },
      "frames": [
        [
          "..2112..",
          ".211112.",
          "21111112",
          "31211213",
          ".311113.",
          "..4114..",
          ".2.44.2.",
          "22.44.22"
        ]
      ],
      "origin": [
        0,
        0
      ]
    },
    "mountain": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#7a7a7a",
        "2": "#999",
        "3": "#bbb",
        "4": "#fff",
        "5": "#555"
      },
      "frames": [
        [
          "...44...",
          "..4331..",
          ".433211.",
          "43322115",
          "33221155",
          "32211555",
          "22115555",
          "11555555"
        ]
      ],
      "origin": [
        0,
        0
      ]
    },
    "water": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#2a5a8a",
        "2": "#3a7aba",
        "3": "#4a8aca",
        "4": "#1a4a7a"
      },
      "frames": [
        [
          "11211121",
          "12321232",
          "23132313",
          "31213121",
          "12321232",
          "23412341",
          "31123112",
          "12311231"
        ]
      ],
      "origin": [
        0,
        0
      ]
    }
  },
  "ui": {
    "selectCursor": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#fd4",
        "2": "#fa0"
      },
      "frames": [
        [
          "12....21",
          "2......2",
          "........",
          "........",
          "........",
          "........",
          "2......2",
          "12....21"
        ]
      ],
      "origin": [
        0,
        0
      ]
    },
    "moveRange": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#4f4",
        "2": "#2a2"
      },
      "frames": [
        [
          "..1111..",
          ".1....1.",
          "1......1",
          "1......1",
          "1......1",
          "1......1",
          ".1....1.",
          "..1111.."
        ]
      ],
      "origin": [
        0,
        0
      ]
    },
    "attackRange": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#f44",
        "2": "#a22"
      },
      "frames": [
        [
          "..1111..",
          ".1....1.",
          "1......1",
          "1......1",
          "1......1",
          "1......1",
          ".1....1.",
          "..1111.."
        ]
      ],
      "origin": [
        0,
        0
      ]
    }
  },
  "effects": {
    "attack": {
      "w": 8,
      "h": 8,
      "palette": {
        "1": "#f44",
        "2": "#fa0",
        "3": "#fd4"
      },
      "frames": [
        [
          "..1..3..",
          ".1.12...",
          "..121.3.",
          ".12221..",
          "..2221..",
          ".3.121..",
          "...21.1.",
          "..3..1.."
        ]
      ],
      "origin": [
        0,
        0
      ]
    }
  }
}

function drawSprite(ctx, spriteDef, x, y, size, frame) {
  if (!spriteDef) return false
  frame = frame || 0
  frame = frame % spriteDef.frames.length
  var key = size + '_' + frame
  if (!spriteDef._c) spriteDef._c = {}
  if (!spriteDef._c[key]) {
    var cv = document.createElement('canvas')
    cv.width = size
    cv.height = size
    var cc = cv.getContext('2d')
    var pixels = spriteDef.frames[frame]
    var pw = size / spriteDef.w
    var ph = size / spriteDef.h
    for (var row = 0; row < spriteDef.h; row++) {
      var line = pixels[row]
      for (var col = 0; col < spriteDef.w; col++) {
        var ch = line[col]
        if (ch === ".") continue
        var color = spriteDef.palette[ch]
        if (!color) continue
        cc.fillStyle = color
        cc.fillRect(col * pw, row * ph, Math.ceil(pw), Math.ceil(ph))
      }
    }
    spriteDef._c[key] = cv
  }
  var ox = spriteDef.origin[0] * (size / spriteDef.w)
  var oy = spriteDef.origin[1] * (size / spriteDef.h)
  ctx.drawImage(spriteDef._c[key], x - ox, y - oy)
  return true
}

function getSprite(category, name) {
  return SPRITE_DEFS[category] && SPRITE_DEFS[category][name] || null
}

function spriteFrames(spriteDef) {
  return spriteDef ? spriteDef.frames.length : 0
}
