# Strategy RPG — ForkArcade

Turn-based strategy with units on a hex grid — combat, AI, progression.

## REQUIREMENTS — screens and narrative

Every game MUST have at least 3 screens (`screen` state):

1. **Start screen** (`screen: 'start'`) — game title, short description, controls, prompt to begin (e.g. `[SPACE]`)
2. **Game screen** (`screen: 'playing'`) — actual gameplay
3. **End screen** (`screen: 'victory'` or `screen: 'defeat'`) — narrative text, stats, score, prompt to restart (e.g. `[R]`)

Narrative MUST be visible in the game:

- Register narrative texts: `FA.register('narrativeText', nodeId, { text, color })`
- Display them in the game (e.g. bar at the top of the screen with fade out, line in the message log)
- Call `showNarrative(nodeId)` at key moments (battle start, first kill, phase change, victory, defeat)
- End screen shows appropriate narrative text
- Narrative is not just data for the platform — the player MUST see it

## File structure

| File | Description |
|------|-------------|
| `data.js` | Data registration: `FA.register('unitTypes', ...)`, `FA.register('terrain', ...)`, config, abilities, narrative |
| `map.js` | Hex grid: math (hex↔pixel, distance, neighbors), map generation, pathfinding |
| `battle.js` | Battle logic: turn system, combat, enemy AI, select/move/attack, win conditions |
| `render.js` | Rendering layers: grid, highlights, units, floats, UI, overlay |
| `main.js` | Entry point: keybindings, click handling, event wiring, game loop, `ForkArcade.onReady/submitScore` |

Files copied by the platform (do not edit):
- `fa-engine.js`, `fa-renderer.js`, `fa-input.js`, `fa-audio.js`, `fa-narrative.js` — engine
- `forkarcade-sdk.js` — SDK
- `sprites.js` — generated from `_sprites.json`

## Engine API (window.FA)

- **Event bus**: `FA.on(event, fn)`, `FA.emit(event, data)`, `FA.off(event, fn)`
- **State**: `FA.resetState(obj)`, `FA.getState()`, `FA.setState(key, val)`
- **Registry**: `FA.register(registry, id, def)`, `FA.lookup(registry, id)`, `FA.lookupAll(registry)`
- **Game loop**: `FA.setUpdate(fn)`, `FA.setRender(fn)`, `FA.start()`, `FA.stop()`
- **Canvas**: `FA.initCanvas(id, w, h)`, `FA.getCtx()`, `FA.getCanvas()`
- **Layers**: `FA.addLayer(name, drawFn, order)`, `FA.renderLayers()`
- **Draw**: `FA.draw.clear/rect/text/bar/hex/circle/sprite/withAlpha`
- **Input**: `FA.bindKey(action, keys)`, `FA.isAction(action)`, `FA.consumeClick()`
- **Audio**: `FA.defineSound(name, fn)`, `FA.playSound(name)` — built-in: hit, pickup, death, step, spell, levelup
- **Effects**: `FA.addFloat(x, y, text, color, dur)`, `FA.addEffect(obj)`, `FA.updateFloats(dt)`
- **Narrative**: `FA.narrative.init(cfg)`, `.transition(nodeId, event)`, `.setVar(name, val, reason)`
- **Utils**: `FA.rand(min,max)`, `FA.clamp`, `FA.pick(arr)`, `FA.shuffle(arr)`, `FA.uid()`

## Hex Math (GameMap)

- `GameMap.hexToPixel(col, row, size)` — hex coords → pixel
- `GameMap.pixelToHex(px, py, size)` — pixel → hex coords
- `GameMap.hexDistance(a, b)` — distance between hexes
- `GameMap.hexNeighbors(col, row)` — adjacent hexes
- `GameMap.findReachable(grid, col, row, range)` — reachable hexes within movement range

## Events

| Event | Description |
|-------|-------------|
| `input:action` | Key bound to action |
| `input:click` | Click on canvas |
| `entity:damaged` | Unit took damage |
| `entity:killed` | Unit died |
| `game:over` | Battle ended (victory/score) |
| `state:changed` | State changed |
| `narrative:transition` | Narrative graph transition |

## Scoring

`ForkArcade.submitScore(score)` in the `game:over` handler. Score = victory bonus minus penalty for number of turns.

## Sprite fallback

`FA.draw.sprite(category, name, x, y, size, fallbackChar, fallbackColor)` — if sprite is missing, draws text.
