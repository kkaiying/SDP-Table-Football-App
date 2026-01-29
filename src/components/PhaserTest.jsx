import { useEffect } from 'react'
  import Phaser from 'phaser'

  function PhaserTest() {
    useEffect(() => {
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'phaser-game',
        backgroundColor: '#2d2d2d',
        scene: {
          create: create,
          update: update
        }
      }

      let ball
      let speed = { x: 2, y: 2 }

      function create() {
        // Create a white ball
        ball = this.add.circle(400, 300, 20, 0xffffff)
      }

      function update() {
        // Move the ball
        ball.x += speed.x
        ball.y += speed.y

        // Bounce off walls
        if (ball.x > 800 || ball.x < 0) speed.x *= -1
        if (ball.y > 600 || ball.y < 0) speed.y *= -1
      }

      const game = new Phaser.Game(config)

      return () => game.destroy(true)
    }, [])

    return <div id="phaser-game"></div>
  }

export default PhaserTest