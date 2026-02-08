import { kickRod } from '../components/foosballControls'

function setup(level = 1, direction = 'right') {
  const tweenConfig = {}

  const scene = {
    tweens: {
      add: jest.fn(config => {
        Object.assign(tweenConfig, config)
        return config
      })
    }
  }

  const player = {
    x: 100,
    homeX: 100,
    displayWidth: 20,
    originalWidth: 20,
    originalHeight: 40,
    isKicking: false
  }

  kickRod(scene, [player], level, direction)

  return { scene, player, tweenConfig }
}

test('kicks player to the right', () => {
  const { tweenConfig } = setup(1, 'right')

  expect(tweenConfig.x).toBe(106) // homeX + 6
})

test('kicks player to the left', () => {
  const { tweenConfig } = setup(1, 'left')

  expect(tweenConfig.x).toBe(94) // homeX - 6
})

test('uses correct force for level 1', () => {
  const { tweenConfig } = setup(1)

  expect(tweenConfig.displayWidth).toBe(40 * 1.2)
  expect(tweenConfig.duration).toBe(110)
})

test('uses correct force for level 2', () => {
  const { tweenConfig } = setup(2)

  expect(tweenConfig.displayWidth).toBe(40 * 1.4)
  expect(tweenConfig.duration).toBe(90)
})

test('uses correct force for level 3', () => {
  const { tweenConfig } = setup(3)

  expect(tweenConfig.displayWidth).toBe(40 * 1.7)
  expect(tweenConfig.duration).toBe(70)
})

test('resets player state on kick completion', () => {
  const { player, tweenConfig } = setup(1)

  expect(player.isKicking).toBe(true)

  // simulate tween completion
  tweenConfig.onComplete()

  expect(player.x).toBe(player.homeX)
  expect(player.displayWidth).toBe(player.originalWidth)
  expect(player.isKicking).toBe(false)
})

