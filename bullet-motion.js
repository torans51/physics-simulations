const initBulletMotion = (containerId) => {
  const STAGE_WIDTH = 1200
  const STAGE_HEIGHT = 800
  const PADDING_PERC = 0.1

  const stage = new Konva.Stage({
    container: containerId,
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  })
  const layer = new Konva.Layer({
    offsetX: -STAGE_WIDTH * PADDING_PERC,
    offsetY: STAGE_HEIGHT - STAGE_HEIGHT * PADDING_PERC,
    scaleY: -1
  })
  stage.add(layer)

  const state = {
    stageWidth: STAGE_WIDTH,
    stageHeight: STAGE_HEIGHT,
    stage,
    layer,
    timestamp: null, // current timestamp (milliseconds)
    prevTimestamp: null, // (milliseconds)
    deltaT: null, // timestamp - prevTimestamp (milliseconds)
    pos: { x: 0, y: 0 }, // position of point
    speed: { x: 0.1, y: 0.1 }, // speed of point
  }
  state.stage = stage

  function drawPoint(state) {
    const { deltaT, pos, speed } = state
    nextPos = {
      x: speed.x * deltaT + pos.x,
      y: speed.y * deltaT + pos.y,
    }

    state.pos = nextPos

    const circle = new Konva.Circle({
      x: state.pos.x,
      y: state.pos.y,
      radius: 8,
      fill: 'blue',
    })

    console.log(circle)
    state.layer.add(circle)
  }

  function draw(state) {
    return timestamp => {
      state.layer.destroyChildren()
      state.timestamp = timestamp
      state.deltaT = timestamp - state.prevTimestamp

      drawPoint(state)

      state.layer.draw()
      state.prevTimestamp = timestamp
      requestAnimationFrame(draw(state))
    }
  }

  requestAnimationFrame(timestamp => {
    state.prevTimestamp = timestamp
    requestAnimationFrame(draw(state))
  })
}
