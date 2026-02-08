import { rodSliding } from '../components/foosballControls'

global.Phaser = {
  Math: {
    Clamp: jest.fn((value, min, max) =>
      Math.min(Math.max(value, min), max)
    )
  }
}

function setup() {
  const scene = {
    input: {
      setDraggable: jest.fn()
    }
  }

  const rodHitbox = {
    y: 200,
    on: jest.fn()
  }

  const rodElements = [
    { y: 180, displayHeight: 40 },
    { y: 220, displayHeight: 40 }
  ]

  const constraints = {
    tableTopEdge: 0,
    tableBottomEdge: 500,
    playerHeight: 40
  }

  rodSliding(scene, rodHitbox, rodElements, constraints)

  const dragHandler =
    rodHitbox.on.mock.calls.find(call => call[0] === 'drag')[1]

  return { rodHitbox, rodElements, dragHandler }
}

test('moves rod down when dragged down', () => {
  const { rodHitbox, rodElements, dragHandler } = setup()

  dragHandler(null, null, 260)

  expect(rodHitbox.y).toBe(260)
  expect(rodElements[0].y).toBe(260 - 20)
  expect(rodElements[1].y).toBe(260 + 20)
})

test('moves rod up when dragged up', () => {
  const { rodHitbox, rodElements, dragHandler } = setup()

  dragHandler(null, null, 140)

  expect(rodHitbox.y).toBe(140)
  expect(rodElements[0].y).toBe(120)
  expect(rodElements[1].y).toBe(160)
})

test('does not exceed max bound', () => {
  const { rodHitbox, dragHandler } = setup()

  dragHandler(null, null, 1000)

  expect(rodHitbox.y).toBeLessThanOrEqual(500)
})

test('does not go below min bound', () => {
  const { rodHitbox, dragHandler } = setup()

  dragHandler(null, null, -500)

  expect(rodHitbox.y).toBeGreaterThanOrEqual(0)
})
