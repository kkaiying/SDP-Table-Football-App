import { useEffect } from 'react'
import Phaser from 'phaser'
import './FoosballTable.css'
import { rodSliding, switchMode, setRodHighlight, kickRod, moveRod, chargeRod, releaseCharge} from './foosballControls'
import { connectToServer } from '../utils/websocket'

function FoosballTable() {
  useEffect(() => {
    const ws = connectToServer()
    const config = {
      type: Phaser.AUTO,
      width: 1400,
      height: 700,
      parent: 'foosball-table',
      transparent: true,
      input: { mouse: { wheel: true } },
      scene: { create, update }
    }

    function create() {

      // "defence" = rods 1 & 2
      // "attack"  = rods 4 & 6
      this.controlMode = "defence"
      this.prevAState = false

      this.leftChargeLocked = false
      this.rightChargeLocked = false

      this.prevLT = 0
      this.prevRT = 0
      this.prevB = false
      this.prevLB = false
      this.prevRB = false
      this.prevDpadLeft = false
      this.prevDpadRight = false

      // dimensions for components in the table
      const canvasWidth = this.scale.width
      const canvasHeight = this.scale.height
      const tableCenterX = canvasWidth / 2
      const tableWidth = canvasWidth * 0.857
      const tableHeight = canvasHeight * 0.714
      const tableCenterY = canvasHeight / 2
      const tableLeftEdge = tableCenterX - tableWidth/2
      const tableRightEdge = tableCenterX + tableWidth/2
      const tableTopEdge = tableCenterY - tableHeight/2
      const tableBottomEdge = tableCenterY + tableHeight/2
      const canvasTop = 0
      const betweenCanvasAndTableTop = (canvasTop + tableTopEdge)/2
      const betweenCanvasAndTableBottom = (canvasHeight + tableBottomEdge)/2
      const numOfRods = 8
      const rodSpacing = tableWidth / (numOfRods+1)
      const playerRods = [1,2,4,6]
      const handleWidth = 30
      const ballRadius = tableWidth * 0.01
      const circleMarkerRadius = rodSpacing

      // goal markings
      const goalSectionsHeight = tableHeight / 9
      const bigGoalHeight = goalSectionsHeight * 5
      const bigGoalWidth = rodSpacing + (rodSpacing * 3 / 7)
      const smallGoalHeight = goalSectionsHeight * 3
      const smallGoalWidth = rodSpacing
      const semiCircleWidth = rodSpacing / 3

      // colours
      const tableColour = 0x2d8659
      const tableBorder = 0x000000
      const tableMarkings = 0xffffff
      const ballColour = 0xf0eceb
      const handleColour = 0x000000
      const playerColour = 0xffff00
      const opponentColour = 0xff0000

      // each rods football players
        const football_players = {
          1: {
            type: 'goalkeeper',
            positions: [11],
            colour: playerColour,
          },
          2: {
            type: '3-players',
            positions: [3, 11, 19],
            colour: playerColour
          },
          3: {
            type: '3-players',
            positions: [3, 11, 19],
            colour: opponentColour
          },
          4: {
            type: '4-players',
            positions: [3, 8, 14, 19],
            colour: playerColour
          },
          5: {
            type: '4-players',
            positions: [3, 8, 14, 19],
            colour: opponentColour
          },
          6: {
            type: '3-players',
            positions: [3, 11, 19],
            colour: playerColour
          },
          7: {
            type: '3-players',
            positions: [3, 11, 19],
            colour: opponentColour
          },
          8: {
            type: 'goalkeeper',
            positions: [11],
            colour: opponentColour
          },
        }

      // table
      this.add.rectangle(tableCenterX, tableCenterY, tableWidth, tableHeight, tableColour)
          .setStrokeStyle(4, tableBorder)
      this.add.circle(tableCenterX, tableCenterY, circleMarkerRadius)
          .setStrokeStyle(2, tableMarkings).setFillStyle(tableColour)

      // markings on table
      this.add.rectangle(tableLeftEdge + bigGoalWidth/2, tableCenterY, bigGoalWidth, bigGoalHeight)
        .setStrokeStyle(2, tableMarkings).setFillStyle(tableColour, 0)
      // goal markings
        this.add.rectangle(tableRightEdge - bigGoalWidth/2, tableCenterY, bigGoalWidth, bigGoalHeight)
        .setStrokeStyle(2, tableMarkings).setFillStyle(tableColour, 0)
      this.add.rectangle(tableLeftEdge + smallGoalWidth/2, tableCenterY, smallGoalWidth, smallGoalHeight)
        .setStrokeStyle(2, tableMarkings).setFillStyle(tableColour, 0)
      this.add.rectangle(tableRightEdge - smallGoalWidth/2, tableCenterY, smallGoalWidth, smallGoalHeight)
        .setStrokeStyle(2, tableMarkings).setFillStyle(tableColour, 0)

      const leftSemiCircle = this.add.graphics()
      leftSemiCircle.lineStyle(2, tableMarkings)
      leftSemiCircle.beginPath()
      leftSemiCircle.arc(
        tableLeftEdge + bigGoalWidth, tableCenterY, semiCircleWidth,
        Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(90), false)
      leftSemiCircle.strokePath()

      const rightSemiCircle = this.add.graphics()
      rightSemiCircle.lineStyle(2, tableMarkings)
      rightSemiCircle.beginPath()
      rightSemiCircle.arc(
        tableRightEdge - bigGoalWidth, tableCenterY, semiCircleWidth,
        Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(270), false)
      rightSemiCircle.strokePath()

      // redraw the table border
      this.add.rectangle(tableCenterX, tableCenterY, tableWidth, tableHeight)
        .setStrokeStyle(4, tableBorder).setFillStyle(tableColour, 0)

      // ball
      this.add.circle(tableCenterX, tableCenterY, ballRadius, ballColour)

      for (let i=1; i<=numOfRods; i++) {
        const rodX = tableLeftEdge + rodSpacing*i
        const rodTopY = betweenCanvasAndTableTop
        const rodBottomY = betweenCanvasAndTableBottom
        const rod = this.add.line(0,0, rodX, rodTopY, rodX, rodBottomY, 0xaaaaaa)
                      .setLineWidth(3).setOrigin(0,0)
        
        // make the handles
        let handle
        if (playerRods.includes(i)) {
          const handleHeight = canvasHeight - betweenCanvasAndTableBottom
          const handleCenterY = (betweenCanvasAndTableBottom + canvasHeight)/2
          handle = this.add.rectangle(rodX, handleCenterY, handleWidth, handleHeight, handleColour)
        } else {
          const handleHeight = betweenCanvasAndTableTop - canvasTop
          const handleCenterY = (canvasTop + betweenCanvasAndTableTop)/2
          handle = this.add.rectangle(rodX, handleCenterY, handleWidth, handleHeight, handleColour)
        }

        // make the players
        const rodHeight = tableHeight
        const boxHeight = rodHeight/21
        const playerWidth = tableWidth*0.01
        const playerHeight = boxHeight*1.3
        const playerConfig = football_players[i]
        const playerObjects = []

        playerConfig.positions.forEach(boxNum => {
          const playerCenterY = tableTopEdge + boxHeight*(boxNum-0.5)
          const player = this.add.rectangle(rodX, playerCenterY, playerWidth, playerHeight, playerConfig.colour)
          player.originalWidth = playerWidth
          player.originalHeight = playerHeight
          player.homeX = rodX
          player.kickAngle = 0
          player.charge = 0
          player.isKicking = false
          player.isCharging = false
          player.chargeTween = null
          player.kickTween = null
          playerObjects.push(player)
        })

        const rodElements = [rod, handle, ...playerObjects]

        const hitboxWidth = 50
        const hitboxHeight = tableHeight
        const rodHitbox = this.add.rectangle(rodX, tableCenterY, hitboxWidth, hitboxHeight, 0x000000, 0)
        rodHitbox.setInteractive({ draggable: true, useHandCursor: true })

        // assign rods
        const offsets = rodElements.map(el => el.y - rodHitbox.y)
        if (i===1) this.leftGoalieRod = { rodId:i, hitbox: rodHitbox, elements: rodElements, offsets, tableTopEdge, tableBottomEdge }
        if (i===2) this.leftDefenderRod = { rodId:i, hitbox: rodHitbox, elements: rodElements, offsets, tableTopEdge, tableBottomEdge }
        if (i===4) this.midfieldRod = { rodId:i, hitbox: rodHitbox, elements: rodElements, offsets, tableTopEdge, tableBottomEdge }
        if (i===6) this.attackRod = { rodId:i, hitbox: rodHitbox, elements: rodElements, offsets, tableTopEdge, tableBottomEdge }

        rodSliding(this, rodHitbox, rodElements, { tableTopEdge, tableBottomEdge, tableCenterY, playerHeight, rodId: i })

        // per rod scroll state
        rodHitbox.scrollCount = 0 // count of wheel events
        rodHitbox.scrollTimer = null // timer to reset count and trigger kick

        rodHitbox.on('wheel', (pointer, dx, dy) => {
          rodHitbox.scrollCount += 1

          // store last scroll direction
          rodHitbox.lastScrollDirection = dy<0 ? 'right':'left'

          if (rodHitbox.scrollTimer) rodHitbox.scrollTimer.remove(false)
          
          // make sure scrolling is finished
            rodHitbox.scrollTimer = this.time.delayedCall(120, () => {
            let level

            // scroll speed determines kick level - faster scrol = stronger kick
            if (rodHitbox.scrollCount <= 2) level = 1
            else if (rodHitbox.scrollCount <= 4) level = 2
            else level = 3

            kickRod(this, playerObjects, level, rodHitbox.lastScrollDirection, i)
            
            rodHitbox.scrollCount = 0
            rodHitbox.scrollTimer = null
          })
        })
      }

      // left goal
      this.add.rectangle(tableLeftEdge, tableCenterY, 20, tableHeight/3, 0xffffff).setStrokeStyle(2,0x000000)
      
      // right goal
      this.add.rectangle(tableRightEdge, tableCenterY, 20, tableHeight/3, 0xffffff).setStrokeStyle(2,0x000000)

      setRodHighlight(this.leftGoalieRod, true)
      setRodHighlight(this.leftDefenderRod, true)
    }

    // function moveRod(rodData, delta) {
    //   const { hitbox, elements, offsets, tableTopEdge, tableBottomEdge } = rodData

    //   // get player rectangles only
    //   const players = elements.filter(el => el.displayHeight && el.displayHeight < 50)

    //   const isGoalkeeper = players.length === 1

    //   const topPlayerY = Math.min(...players.map(el => el.y))
    //   const bottomPlayerY = Math.max(...players.map(el => el.y))

    //   const topDistance = hitbox.y - topPlayerY
    //   const bottomDistance = bottomPlayerY - hitbox.y

    //   const padding = isGoalkeeper ? 205 : (players[0].displayHeight / 2)

    //   const minY = tableTopEdge + topDistance + padding
    //   const maxY = tableBottomEdge - bottomDistance - padding

    //   hitbox.y = Phaser.Math.Clamp(hitbox.y + delta, minY, maxY)

    //   elements.forEach((element, index) => {
    //     element.y = hitbox.y + offsets[index]
    //   })
    // }

    // function switchMode(targetMode = null) {

    //   const newMode =
    //     targetMode ??
    //     (this.controlMode === "defence" ? "attack" : "defence")

    //   if (newMode === this.controlMode) return

    //   if (newMode === "attack") {

    //     setRodHighlight(this.leftGoalieRod, false)
    //     setRodHighlight(this.leftDefenderRod, false)

    //     setRodHighlight(this.midfieldRod, true)
    //     setRodHighlight(this.attackRod, true)

    //   } else {

    //     setRodHighlight(this.midfieldRod, false)
    //     setRodHighlight(this.attackRod, false)

    //     setRodHighlight(this.leftGoalieRod, true)
    //     setRodHighlight(this.leftDefenderRod, true)

    //   }

    //   this.controlMode = newMode
    // }


    // highlight selected rod pairs
    // function setRodHighlight(rodData, active) {
    //   if (!rodData) return

    //   const players = rodData.elements.filter(el => el.originalWidth)

    //   players.forEach(player => {
    //     if (active) {
    //       player.setStrokeStyle(3, 0x000000) // 0x00ffcc for "glow"
    //     } else {
    //       player.setStrokeStyle(0)
    //     }
    //   })
    // }

    function update() {

      const pads = navigator.getGamepads()
      const gamepad = Array.from(pads).find(pad=>pad)
      if (!gamepad) return

      const deadzone = 0.15
      const speed = 8

      const aPressed = gamepad.buttons[0].pressed
      const bPressed = gamepad.buttons[1].pressed
      const lbPressed = gamepad.buttons[4].pressed
      const rbPressed = gamepad.buttons[5].pressed
      const ltValue = gamepad.buttons[6]?.value ?? 0
      const rtValue = gamepad.buttons[7]?.value ?? 0
      const dpadLeft = gamepad.buttons[14].pressed
      const dpadRight = gamepad.buttons[15].pressed

      const aJustPressed = aPressed && !this.prevAState
      const bJustPressed = bPressed && !this.prevB
      const lbJustPressed = lbPressed && !this.prevLB
      const rbJustPressed = rbPressed && !this.prevRB
      const dpadLeftJust = dpadLeft && !this.prevDpadLeft
      const dpadRightJust = dpadRight && !this.prevDpadRight

      // A = toggle
      if (aJustPressed) switchMode.call(this)

      // D-pad right = attack
      if (dpadRightJust) switchMode.call(this,"attack")

      // D-pad left = defence
      if (dpadLeftJust) switchMode.call(this,"defence")

      // stick input
      const leftY = gamepad.axes[1]
      const rightY = gamepad.axes[3]

      if (this.controlMode==="defence") {
        if (this.leftGoalieRod && Math.abs(leftY)>deadzone) moveRod(this.leftGoalieRod,leftY*speed)
        if (this.leftDefenderRod && Math.abs(rightY)>deadzone) moveRod(this.leftDefenderRod,rightY*speed)
      } else {
        if (this.midfieldRod && Math.abs(leftY)>deadzone) moveRod(this.midfieldRod,leftY*speed)
        if (this.attackRod && Math.abs(rightY)>deadzone) moveRod(this.attackRod,rightY*speed)
      }

      // charged shooting kick
      const leftCharging = ltValue > 0.2
      const rightCharging = rtValue > 0.2

      let leftRod = this.controlMode==="defence" ? this.leftGoalieRod : this.midfieldRod
      let rightRod = this.controlMode==="defence" ? this.leftDefenderRod : this.attackRod

      // left trigger
      if (leftCharging && !this.leftChargeLocked && ltValue !== this.prevLT) {
        if (leftRod) chargeRod(this, leftRod.elements.filter(el=>el.originalWidth), ltValue)
      }

      if (!leftCharging) {
        this.leftChargeLocked = false

        if (leftRod) {
          const players = leftRod.elements.filter(el => el.originalWidth)
          releaseCharge(players)
        }
      }

      // right trigger
      if (rightCharging && !this.rightChargeLocked && rtValue !== this.prevRT) {
        if (rightRod) chargeRod(this, rightRod.elements.filter(el=>el.originalWidth), rtValue)
      }

      if (!rightCharging) {
        this.rightChargeLocked = false

        if (rightRod) {
          const players = rightRod.elements.filter(el => el.originalWidth)
          releaseCharge(players)
        }
      }

      if (bJustPressed) {

        if (leftRod && leftCharging) {
          const players = leftRod.elements.filter(el=>el.originalWidth)

          releaseCharge(players)
          kickRod(this, players, 2, "right", leftRod.rodId)

          this.leftChargeLocked = true
        }

        if (rightRod && rightCharging) {
          const players = rightRod.elements.filter(el=>el.originalWidth)

          releaseCharge(players)
          kickRod(this, players, 2, "right", rightRod.rodId)

          this.rightChargeLocked = true
        }

      }

      // short pass LB RB
      if (lbJustPressed) {
        let rod = this.controlMode==="defence" ? this.leftGoalieRod : this.midfieldRod
        if (rod) kickRod(this, rod.elements.filter(el=>el.originalWidth), 1, "right", rod.rodId)
      }
      if (rbJustPressed) {
        let rod = this.controlMode==="defence" ? this.leftDefenderRod : this.attackRod
        if (rod) kickRod(this, rod.elements.filter(el=>el.originalWidth), 1, "right", rod.rodId)
      }

      // update states
      this.prevAState = aPressed
      this.prevB = bPressed
      this.prevLB = lbPressed
      this.prevRB = rbPressed
      this.prevLT = ltValue
      this.prevRT = rtValue
      this.prevDpadLeft = dpadLeft
      this.prevDpadRight = dpadRight
    }

    const game = new Phaser.Game(config)

    return () => {
      game.destroy(true)
      if (ws) ws.close()
    }
  }, [])

  return <div id="foosball-table"></div>
}

export default FoosballTable