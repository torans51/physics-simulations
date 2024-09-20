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

  const gui = new dat.GUI()
  const guiData = {
    running: true,
  }
  const state = {
    stageWidth: STAGE_WIDTH,
    stageHeight: STAGE_HEIGHT,
    paddingPerc: PADDING_PERC,
    stage,
    layer,
    timestamp: null, // current timestamp (milliseconds)
    prevTimestamp: null, // (milliseconds)
    deltaT: null, // timestamp - prevTimestamp (milliseconds)
    pos: { x: 0, y: 0 }, // position of point
    speed: { x: 100, y: 100 }, // speed of point
    acc: { x: 0, y: -40 }, // acceleration of point

    // UI options
    guiData,
    timeFactor: 0.0001, // increase or decrease simulation speed
    displayPos: false,
    displayPosX: false,
    displayPosY: false,
    displaySpeed: false,
    displaySpeedX: false,
    displaySpeedY: false,
    displayAcc: false,
    displayAccX: false,
    displayAccY: false,
  }

  gui.add(state.guiData, "running").name("Run").onChange(value => {
    state.guiData.running = !!value
  })

  state.stage = stage

  function updateState(state) {
    const { deltaT, pos, speed, acc } = state
    nextPos = {
      x: pos.x + speed.x * deltaT + 0.5 * acc.x * deltaT * deltaT,
      y: pos.y + speed.y * deltaT + 0.5 * acc.y * deltaT * deltaT,
    }
    nextSpeed = {
      x: speed.x + acc.x * deltaT,
      y: speed.y + acc.y * deltaT,
    }
    state.pos = nextPos
    state.speed = nextSpeed
  }

  function drawPoint(state) {
    const circle = new Konva.Circle({
      x: state.pos.x,
      y: state.pos.y,
      radius: 8,
      fill: 'blue',
    })

    state.layer.add(circle)
  }

  function drawPos(state) {
    const { pos } = state

    if (state.displayPos) {
      const arrow = new Konva.Arrow({
        points: [0, 0, pos.x, pos.y],
        stroke: "purple",
        strokeWidth: 3,
      })
      state.layer.add(arrow)
    }
    if (state.displayPos && state.displayPosX) {
      const arrow = new Konva.Arrow({
        points: [0, 0, pos.x, 0],
        stroke: "purple",
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
    if (state.displayPos && state.displayPosY) {
      const arrow = new Konva.Arrow({
        points: [0, 0, 0, pos.y],
        stroke: "purple",
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
  }
  function drawSpeed(state) {
    const { pos, speed } = state

    if (state.displaySpeed) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + speed.x, pos.y + speed.y],
        stroke: "red",
        strokeWidth: 3,
      })
      state.layer.add(arrow)
    }
    if (state.displaySpeed && state.displaySpeedX && speed.x !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x, pos.y + speed.y],
        stroke: "red",
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
    if (state.displaySpeed && state.displaySpeedY && speed.x !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + speed.x, pos.y],
        stroke: "red",
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
  }

  function drawAxis(state) {
    const { stageWidth, stageHeight, paddingPerc } = state
    const axisX = new Konva.Arrow({
      points: [-stageWidth, 0, stageWidth * (1 - paddingPerc), 0],
      stroke: "white",
      strokeWidth: 3
    })
    state.layer.add(axisX)

    const axisY = new Konva.Arrow({
      points: [0, -stageHeight, 0, stageHeight * (1 - paddingPerc)],
      stroke: "white",
      strokeWidth: 3
    })
    state.layer.add(axisY)
  }

  function draw(state) {
    return timestamp => {
      state.layer.destroyChildren()
      state.timestamp = timestamp
      state.deltaT = timestamp - state.prevTimestamp

      // UI options
      state.deltaT *= state.timeFactor
      state.displayPos = true
      // state.displayPosX = true
      // state.displayPosY = true
      state.displaySpeed = true
      state.displaySpeedX = true
      state.displaySpeedY = true

      if (state.guiData.running) updateState(state)

      drawAxis(state)
      drawPoint(state)
      drawPos(state)
      drawSpeed(state)

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
