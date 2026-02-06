import { useState } from 'react';

export function rodSliding(scene, rodHitbox, rodElements, constraints) {
    const { tableTopEdge, tableBottomEdge, playerHeight } = constraints

    scene.input.setDraggable(rodHitbox)

    const offsets = rodElements.map(element => element.y - rodHitbox.y)

    // player bounds
    const players = rodElements.filter(el => el.displayHeight && el.displayHeight < 50)

    // goalkeeper bounds
    const isGoalkeeper = players.length === 1

    const topPlayerY = Math.min(...players.map(el => el.y))
    const bottomPlayerY = Math.max(...players.map(el => el.y))

    const topDistance = rodHitbox.y - topPlayerY
    const bottomDistance = bottomPlayerY - rodHitbox.y

    // for goalkeeper add extra padding to prevent handle from leaving table
    const padding = isGoalkeeper ? 205 : (playerHeight / 2)  

    const minY = tableTopEdge + topDistance + padding
    const maxY = tableBottomEdge - bottomDistance - padding

    rodHitbox.on('drag', (pointer, dragX, dragY) => {
        rodHitbox.y = Phaser.Math.Clamp(dragY, minY, maxY)

        rodElements.forEach((element, index) => {
            element.y = rodHitbox.y + offsets[index]
        })
    })

}

export function kickRod(scene, players, level = 1, direction = 'right') {
  const powerByLevel = {
    1: { widthMultiplier: 1.2, kickDistance: 6, duration: 110 },
    2: { widthMultiplier: 1.4, kickDistance: 12, duration: 90 },
    3: { widthMultiplier: 1.7, kickDistance: 20, duration: 70 }
  }

  const power = powerByLevel[level] || powerByLevel[1]
  const kickSign = direction === 'right' ? 1 : -1

  players.forEach(player => {
    if (player.isKicking) return
    player.isKicking = true

    scene.tweens.add({
      targets: player,
      displayWidth: player.originalHeight * power.widthMultiplier,
      x: player.homeX + (kickSign * power.kickDistance),
      duration: power.duration,
      ease: 'Power2',
      yoyo: true,
      hold: 60,
      onComplete: () => {
        player.x = player.homeX
        player.displayWidth = player.originalWidth
        player.isKicking = false
      }
    })
  })
}
