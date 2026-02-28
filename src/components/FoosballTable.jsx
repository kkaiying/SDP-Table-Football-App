import { useEffect } from 'react'
import Phaser from 'phaser'
import './FoosballTable.css'
import { rodSliding, kickRod } from './foosballControls'
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
        input: {
          mouse: {
            wheel: true
          },
          gamepad: true // enable gamepad support
        },
        scene: {
          create,
          update
        }
      }

      function create() {

        this.allPlayerRods = []
        this.controllerKickLocked = false
        this.selectedRodIndex = 0

        // dimensions for components in the table
        const canvasWidth = this.scale.width
        const canvasHeight = this.scale.height
        const tableCenterX = canvasWidth / 2
        const tableWidth = canvasWidth * 0.857
        const tableHeight = canvasHeight * 0.714
        const tableCenterY = canvasHeight / 2
        const tableLeftEdge = tableCenterX - (tableWidth / 2)
        const tableRightEdge = tableCenterX + (tableWidth / 2) 
        const tableTopEdge = tableCenterY - (tableHeight / 2)
        const tableBottomEdge = tableCenterY + (tableHeight / 2)
        const canvasTop = 0
        const betweenCanvasAndTableTop = (canvasTop + tableTopEdge) / 2
        const betweenCanvasAndTableBottom = (canvasHeight + tableBottomEdge) / 2
        const numOfRods = 8
        const rodSpacing = tableWidth / (numOfRods + 1)
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
        const playerColour = 0xff0000
        const opponentColour = 0xffff00

        this.input.gamepad.once('connected', (pad) => {
          console.log('Gamepad connected:', pad.id)
        })

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
        this.add.rectangle(tableCenterX, tableCenterY, tableWidth, tableHeight, tableColour).setStrokeStyle(4, tableBorder)
        
        // markings on the table
        this.add.circle(tableCenterX, tableCenterY, circleMarkerRadius).setStrokeStyle(2, tableMarkings).setFillStyle(tableColour)
        // goal markings
        this.add.rectangle(tableLeftEdge + (bigGoalWidth / 2), tableCenterY, bigGoalWidth, bigGoalHeight)
        .setStrokeStyle(2, tableMarkings).setFillStyle(tableColour, 0)
        this.add.rectangle(tableRightEdge - (bigGoalWidth / 2), tableCenterY, bigGoalWidth, bigGoalHeight)
        .setStrokeStyle(2, tableMarkings).setFillStyle(tableColour, 0)
        this.add.rectangle(tableLeftEdge + (smallGoalWidth / 2), tableCenterY, smallGoalWidth, smallGoalHeight)
        .setStrokeStyle(2, tableMarkings).setFillStyle(tableColour, 0)
        this.add.rectangle(tableRightEdge - (smallGoalWidth / 2), tableCenterY, smallGoalWidth, smallGoalHeight)
        .setStrokeStyle(2, tableMarkings).setFillStyle(tableColour, 0)

        const leftSemiCircle = this.add.graphics()
        leftSemiCircle.lineStyle(2, tableMarkings)
        leftSemiCircle.beginPath()
        leftSemiCircle.arc(
        tableLeftEdge + bigGoalWidth,
        tableCenterY,
        semiCircleWidth,
        Phaser.Math.DegToRad(270),
        Phaser.Math.DegToRad(90),
        false
        )
        leftSemiCircle.strokePath()

        const rightSemiCircle = this.add.graphics()
        rightSemiCircle.lineStyle(2, tableMarkings)
        rightSemiCircle.beginPath()
        rightSemiCircle.arc(
        tableRightEdge - bigGoalWidth,
        tableCenterY,
        semiCircleWidth,
        Phaser.Math.DegToRad(90),
        Phaser.Math.DegToRad(270),
        false
        )
        rightSemiCircle.strokePath()

        // redraw the table border 
        this.add.rectangle(tableCenterX, tableCenterY, tableWidth, tableHeight).setStrokeStyle(4, tableBorder).setFillStyle(tableColour, 0)

        // ball
        this.add.circle(tableCenterX, tableCenterY, ballRadius, ballColour)

        for (let i = 1; i <= numOfRods; i++) {
          const rodX = tableLeftEdge + (rodSpacing * i)
          const rodTopY = betweenCanvasAndTableTop
          const rodBottomY = betweenCanvasAndTableBottom
          const rod = this.add.line(0, 0, rodX, rodTopY, rodX, rodBottomY, 0xaaaaaa).setLineWidth(3).setOrigin(0,0) 
          
          // make the handles
          let handle
          if (playerRods.includes(i)) {
            const handleHeight = canvasHeight - betweenCanvasAndTableBottom
            const handleCenterY = (betweenCanvasAndTableBottom + canvasHeight) / 2
            handle = this.add.rectangle(rodX, handleCenterY, handleWidth, handleHeight, handleColour) // bottom handles
          } 
          else {
            const handleHeight = betweenCanvasAndTableTop - canvasTop 
            const handleCenterY = (canvasTop + betweenCanvasAndTableTop) / 2
            handle = this.add.rectangle(rodX, handleCenterY, handleWidth, handleHeight, handleColour) // top handles
          }

          // make the players
          const rodHeight = tableHeight
          const boxHeight = rodHeight / 21
          const playerWidth = tableWidth * 0.01
          const playerHeight = boxHeight * 1.3

          const playerConfig = football_players[i]
          const playerObjects = []
          playerConfig.positions.forEach(boxNum => {
            const playerCenterY = tableTopEdge + (boxHeight * (boxNum - 0.5))
            const player = this.add.rectangle(rodX, playerCenterY, playerWidth, playerHeight, playerConfig.colour)
            // store original dimensions for later
            player.originalWidth = playerWidth
            player.originalHeight = playerHeight
            player.homeX = rodX
            player.isKicking = false
            playerObjects.push(player)
          })

          const rodElements = [rod, handle, ...playerObjects]

          const hitboxWidth = 50 // might change this to scale with canvas size too
          const hitboxHeight = tableHeight
          const rodHitbox = this.add.rectangle(rodX, tableCenterY, hitboxWidth, hitboxHeight, 0x000000, 0)
          rodHitbox.setInteractive({ draggable: true, useHandCursor: true })
          rodSliding(this, rodHitbox, rodElements, {
            tableTopEdge, 
            tableBottomEdge, 
            tableCenterY, 
            playerHeight,
            rodId: i})
          // per-rod scroll state
          rodHitbox.scrollCount = 0 // count of wheel events
          rodHitbox.scrollTimer = null // timer to reset count and trigger kick

          rodHitbox.on('wheel', (pointer, dx, dy) => { // dy < 0 = scroll up, dy > 0 = scroll down
            rodHitbox.scrollCount += 1

            // store last scroll direction
            rodHitbox.lastScrollDirection = dy < 0 ? 'right' : 'left'

            if (rodHitbox.scrollTimer) {
              rodHitbox.scrollTimer.remove(false)
            }

            // make sure scrolling is finished, fire kick
            rodHitbox.scrollTimer = this.time.delayedCall(120, () => {
              let level

              // scroll speed determines kick level - faster scroll = stronger kick
              if (rodHitbox.scrollCount <= 2) level = 1
              else if (rodHitbox.scrollCount <= 4) level = 2
              else level = 3

              kickRod(this, playerObjects, level, rodHitbox.lastScrollDirection, i)

              rodHitbox.scrollCount = 0
              rodHitbox.scrollTimer = null
            })
          })

          if (playerRods.includes(i)) {
            this.allPlayerRods.push({
              players: playerObjects,
              elements: rodElements,
              hitbox: rodHitbox,
              bounds: { tableTopEdge, tableBottomEdge }
            })
          }

        }
    
        // left goal 
        this.add.rectangle(tableLeftEdge, tableCenterY, 20, tableHeight / 3, 0xffffff).setStrokeStyle(2, 0x000000)
  
        // right goal
        this.add.rectangle(tableRightEdge, tableCenterY, 20, tableHeight / 3, 0xffffff).setStrokeStyle(2, 0x000000)
      }

      function update() {
        const pad = this.input.gamepad.getPad(0)
        if (!pad) return

        const stickYRaw = pad.axes[1]?.getValue() || 0
        const stickY = Math.abs(stickYRaw) > 0.2 ? stickYRaw : 0
        
        const trigger = pad.buttons.find(b => b.value > 0.2)
        const triggerValue = trigger ? trigger.value : 0
        const stickX = pad.axes[0]?.getValue() || 0

        if (stickY !== 0) {
          const rodData = this.allPlayerRods[this.selectedRodIndex]
          const speed = 5

          rodData.elements.forEach(element => {
            element.y += stickY * speed
          })

          // clamp movement to table bounds
          const topLimit = rodData.bounds.tableTopEdge
          const bottomLimit = rodData.bounds.tableBottomEdge

          rodData.elements.forEach(element => {
            if (element.y < topLimit) element.y = topLimit
            if (element.y > bottomLimit) element.y = bottomLimit
          })
        }

        if (triggerValue > 0.2 && !this.controllerKickLocked) {
          this.controllerKickLocked = true

          let level
          if (triggerValue < 0.4) level = 1
          else if (triggerValue < 0.75) level = 2
          else level = 3

          const direction = stickX >= 0 ? 'right' : 'left'

          // kick all player rods
          this.allPlayerRods.forEach(players => {
            kickRod(this, players, level, direction)
          })

          this.time.delayedCall(200, () => {
            this.controllerKickLocked = false
          })
        }
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