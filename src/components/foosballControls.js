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