import { useState } from 'react';
import { sendKickCommand, sendSlideCommand } from '../utils/websocket'

export function rodSliding(scene, rodHitbox, rodElements, constraints) {
    const { tableTopEdge, tableBottomEdge, playerHeight, rodId } = constraints

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

    // extra padding for goalkeeper to prevent handle from leaving table
    const padding = isGoalkeeper ? 205 : (playerHeight / 2)  

    const minY = tableTopEdge + topDistance + padding
    const maxY = tableBottomEdge - bottomDistance - padding

    rodHitbox.on('drag', (pointer, dragX, dragY) => {
        rodHitbox.y = Phaser.Math.Clamp(dragY, minY, maxY)

        rodElements.forEach((element, index) => {
            element.y = rodHitbox.y + offsets[index]
        })

        sendSlideCommand(rodId, rodHitbox.y, 0)
    })

}

export function kickRod(scene, players, level = 1, direction = 'right', rodId) {
  const powerByLevel = {
    1: { widthMultiplier: 1.2, kickDistance: 6, duration: 110 },  // short pass
    2: { widthMultiplier: 1.7, kickDistance: 20, duration: 70 }   // strong kick
  }

  const power = powerByLevel[level] || powerByLevel[1]
  const kickSign = 1

  players.forEach(player => {
    if (player.isKicking) return
    player.isKicking = true
    if (player.chargeTween) {
      player.chargeTween.stop()
      player.chargeTween = null
    }

    sendKickCommand(rodId, level, direction)

    player.kickTween = scene.tweens.add({
      targets: player, // rectangle animated
      displayWidth: player.originalHeight * power.widthMultiplier, // visually widens player
      x: player.homeX + (kickSign * power.kickDistance), // right or left kick
      duration: power.duration, // how fast kick happens
      ease: 'Power2',
      yoyo: true, // returns to original position
      hold: 60, // pauses at extension
      onComplete: () => {
        player.x = player.homeX
        player.displayWidth = player.originalWidth // restore original size
        player.isKicking = false
        player.isCharging = false
      }
    })
  })
}

export function chargeRod(scene, players, triggerValue) {

  const maxWidthMultiplier = 1.3
  const smoothSpeed = 0.1   // lower = smoother, higher = faster

  players.forEach(player => {

    if (player.isKicking) return

    const raw = Phaser.Math.Clamp(triggerValue, 0, 1)
    const strength = raw * raw

    const targetWidth =
      player.originalHeight *
      (1 + (maxWidthMultiplier - 1) * strength)

    // Smoothly move current width toward target
    const newWidth = Phaser.Math.Linear(
      player.displayWidth,
      targetWidth,
      smoothSpeed
    )

    const offset = (newWidth - player.originalWidth) / 2

    player.displayWidth = newWidth
    player.x = player.homeX - offset

    player.isCharging = strength > 0
  })
}

export function releaseCharge(players) {

  players.forEach(player => {

    if (player.chargeTween) {
      player.chargeTween.stop()
      player.chargeTween = null
    }

    player.x = player.homeX
    player.displayWidth = player.originalWidth
    player.isCharging = false

  })
}