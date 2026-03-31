import { useState } from 'react';
import { sendChargeCommand, sendKickCommand, sendSlideCommand } from '../utils/websocket'

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

    // extra padding for goalkeeper
    const padding = isGoalkeeper ? (tableBottomEdge - tableTopEdge) * 0.412 : (playerHeight / 2)  

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

export function switchMode(targetMode = null) {

  const newMode =
    targetMode ??
    (this.controlMode === "defence" ? "attack" : "defence")

  if (newMode === this.controlMode) return

  if (newMode === "attack") {

    setRodHighlight(this.leftGoalieRod, false)
    setRodHighlight(this.leftDefenderRod, false)

    setRodHighlight(this.midfieldRod, true)
    setRodHighlight(this.attackRod, true)

  } else {

    setRodHighlight(this.midfieldRod, false)
    setRodHighlight(this.attackRod, false)

    setRodHighlight(this.leftGoalieRod, true)
    setRodHighlight(this.leftDefenderRod, true)

  }

  this.controlMode = newMode
}

export function setRodHighlight(rodData, active) {
  if (!rodData) return

  const players = rodData.elements.filter(el => el.originalWidth)

  players.forEach(player => {
    if (active) {
      player.setStrokeStyle(3, 0x000000) // 0x00ffcc for "glow"
    } else {
      player.setStrokeStyle(0)
    }
  })
}

export function kickRod(scene, players, level = 1, direction = 'right', rodId) {
  const powerByLevel = {
    1: { widthMultiplier: 1.2, kickDistance: 6, duration: 110 },  // short pass
    2: { widthMultiplier: 1.9, kickDistance: 20, duration: 70 }   // strong kick
  }

  const power = powerByLevel[level] || powerByLevel[1]
  const kickSign = 1

  sendKickCommand(rodId, level, direction)

  players.forEach(player => {
    if (player.isKicking) return
    player.isKicking = true
    if (player.chargeTween) {
      player.chargeTween.stop()
      player.chargeTween = null
    }

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

export function moveRod(rodData, delta) {
  const { hitbox, elements, offsets, tableTopEdge, tableBottomEdge } = rodData

  const players = elements.filter(el => el.displayHeight && el.displayHeight < 50)

  const isGoalkeeper = players.length === 1

  const topPlayerY = Math.min(...players.map(el => el.y))
  const bottomPlayerY = Math.max(...players.map(el => el.y))

  const topDistance = hitbox.y - topPlayerY
  const bottomDistance = bottomPlayerY - hitbox.y

  const padding = isGoalkeeper ? (tableBottomEdge - tableTopEdge) * 0.412 : (players[0].displayHeight / 2)

  const minY = tableTopEdge + topDistance + padding
  const maxY = tableBottomEdge - bottomDistance - padding

  hitbox.y = Phaser.Math.Clamp(hitbox.y + delta, minY, maxY)

  elements.forEach((element, index) => {
    element.y = hitbox.y + offsets[index]
  })

  if (rodData.rodId !== undefined) {
    sendSlideCommand(rodData.rodId, hitbox.y)
  }
}

export function setRodPosition(rodData, normalizedPosition) {
  const { hitbox, elements, offsets, tableTopEdge, tableBottomEdge } = rodData

  const players = elements.filter(el => el.displayHeight && el.displayHeight < 50)
  const isGoalkeeper = players.length === 1

  const topPlayerY = Math.min(...players.map(el => el.y))                               
  const bottomPlayerY = Math.max(...players.map(el => el.y))

  const topDistance = hitbox.y - topPlayerY
  const bottomDistance = bottomPlayerY - hitbox.y

  const padding = isGoalkeeper ? (tableBottomEdge - tableTopEdge) * 0.412 : (players[0].displayHeight / 2)

  const minY = tableTopEdge + topDistance + padding
  const maxY = tableBottomEdge - bottomDistance - padding

  console.log('minY:', minY, 'maxY:', maxY, 'targetY:', minY + normalizedPosition * (maxY - minY))
  hitbox.y = minY + normalizedPosition * (maxY - minY)

  elements.forEach((element, index) => {
    element.y = hitbox.y + offsets[index]
  })
}

export function chargeRod(scene, rodData, players, triggerValue) {

  const maxWidthMultiplier = 1.3
  const smoothSpeed = 0.1

  let changed = true;

  players.forEach(player => {
    if (player.isCharging)
      changed = false;

    if (player.isKicking) return   // already exists

    const raw = Phaser.Math.Clamp(triggerValue, 0, 1)
    const strength = raw * raw

    if (strength <= 0)
      console.log(strength);

    const targetWidth =
      player.originalHeight *
      (1 + (maxWidthMultiplier - 1) * strength)

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

  if (changed)
    sendChargeCommand(rodData.rodId, true);
}

export function releaseCharge(rodData, players, kicked) {
  let changed = true;
  players.forEach(player => {
    if (!player.isCharging)
      changed = false;

    if (player.isKicking) 
      return;

    if (player.chargeTween) {
      player.chargeTween.stop()
      player.chargeTween = null
    }

    player.x = player.homeX
    player.displayWidth = player.originalWidth
    player.isCharging = false
  })

  if (changed && !kicked) 
    sendChargeCommand(rodData.rodId, false)
}
