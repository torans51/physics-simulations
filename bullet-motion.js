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
    restart: true,
    timeFactor: 1, // increase or decrease simulation speed
    initPosX: 0,
    initPosY: 0,
    initSpeedX: 100,
    initSpeedY: 100,
    initAccX: 0,
    initAccY: -20,
    displayPos: true,
    displayPosX: false,
    displayPosY: false,
    displaySpeed: true,
    displaySpeedX: false,
    displaySpeedY: false,
    displayAcc: true,
    displayAccX: false,
    displayAccY: false,
  }
  const state = {
    stageWidth: STAGE_WIDTH,
    stageHeight: STAGE_HEIGHT,
    paddingPerc: PADDING_PERC,
    stage,
    layer,
    timestamp: null, // current timestamp (milliseconds)
    prevTimestamp: null, // (milliseconds)
    deltaT: null, // timestamp - prevTimestamp (seconds)
    pos: { x: guiData.initPosX, y: guiData.initPosY }, // position of point
    speed: { x: guiData.initSpeedX, y: guiData.initSpeedY }, // speed of point
    acc: { x: guiData.initAccX, y: guiData.initAccY }, // acceleration of point

    // UI options
    guiData,
  }

  gui.add(state.guiData, "running").name("Run").onChange(value => {
    state.guiData.running = !!value
  })
  gui.add(state.guiData, "restart").name("Restart").onChange(() => {
    state.pos.x = guiData.initPosX
    state.pos.y = guiData.initPosY
    state.speed.x = guiData.initSpeedX
    state.speed.y = guiData.initSpeedY
    state.acc.x = guiData.initAccX
    state.acc.y = guiData.initAccY
  })
  gui.add(state.guiData, "timeFactor").name("Time speed").step(0.2).min(0.2).max(10).onFinishChange(value => {
    state.guiData.timeFactor = value
  })
  gui.add(state.guiData, "initPosX").name("Init position X").step(10).min(0).max(state.stageWidth).onFinishChange(value => {
    state.guiData.initPosX = value
  })
  gui.add(state.guiData, "initPosY").name("Init position Y").step(10).min(0).max(state.stageHeight).onFinishChange(value => {
    state.guiData.initPosY = value
  })
  gui.add(state.guiData, "initSpeedX").name("Init speed X").step(10).min(0).max(300).onFinishChange(value => {
    state.guiData.initSpeedX = value
  })
  gui.add(state.guiData, "initSpeedY").name("Init speed Y").step(10).min(0).max(300).onFinishChange(value => {
    state.guiData.initSpeedY = value
  })
  gui.add(state.guiData, "initAccX").name("Init acceleration X").step(5).min(-50).max(50).onFinishChange(value => {
    state.guiData.initAccX = value
  })
  gui.add(state.guiData, "initAccY").name("Init acceleration Y").step(5).min(-50).max(50).onFinishChange(value => {
    state.guiData.initAccY = value
  })
  const guiDisplayPosFolder = gui.addFolder("Display position")
  guiDisplayPosFolder.open()
  guiDisplayPosFolder.add(state.guiData, "displayPos").name("Vector").onChange(value => {
    state.guiData.displayPos = !!value
  })
  guiDisplayPosFolder.add(state.guiData, "displayPosX").name("Component X").onChange(value => {
    state.guiData.displayPosX = !!value
  })
  guiDisplayPosFolder.add(state.guiData, "displayPosY").name("Component Y").onChange(value => {
    state.guiData.displayPosY = !!value
  })

  const guiDisplaySpeedFolder = gui.addFolder("Display speed")
  guiDisplaySpeedFolder.open()
  guiDisplaySpeedFolder.add(state.guiData, "displaySpeed").name("Vector").onChange(value => {
    state.guiData.displaySpeed = !!value
  })
  guiDisplaySpeedFolder.add(state.guiData, "displaySpeedX").name("Component X").onChange(value => {
    state.guiData.displaySpeedX = !!value
  })
  guiDisplaySpeedFolder.add(state.guiData, "displaySpeedY").name("Component Y").onChange(value => {
    state.guiData.displaySpeedY = !!value
  })

  const guiDisplayAccFolder = gui.addFolder("Display acceleration")
  guiDisplayAccFolder.open()
  guiDisplayAccFolder.add(state.guiData, "displayAcc").name("Vector").onChange(value => {
    state.guiData.displayAcc = !!value
  })
  guiDisplayAccFolder.add(state.guiData, "displayAccX").name("Component X").onChange(value => {
    state.guiData.displayAccX = !!value
  })
  guiDisplayAccFolder.add(state.guiData, "displayAccY").name("Component Y").onChange(value => {
    state.guiData.displayAccY = !!value
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
    const { pos, guiData } = state

    if (guiData.displayPos) {
      const arrow = new Konva.Arrow({
        points: [0, 0, pos.x, pos.y],
        stroke: "purple",
        strokeWidth: 3,
      })
      state.layer.add(arrow)
    }
    if (guiData.displayPos && guiData.displayPosX) {
      const arrow = new Konva.Arrow({
        points: [0, 0, pos.x, 0],
        stroke: "purple",
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
    if (guiData.displayPos && guiData.displayPosY) {
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
    const { pos, speed, guiData } = state

    if (guiData.displaySpeed) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + speed.x, pos.y + speed.y],
        stroke: "red",
        strokeWidth: 3,
      })
      state.layer.add(arrow)
    }
    if (guiData.displaySpeed && guiData.displaySpeedX && speed.x !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x, pos.y + speed.y],
        stroke: "red",
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
    if (guiData.displaySpeed && guiData.displaySpeedY && speed.y !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + speed.x, pos.y],
        stroke: "red",
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
  }
  function drawAcc(state) {
    const { pos, acc, guiData } = state

    if (guiData.displayAcc) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + acc.x, pos.y + acc.y],
        stroke: "yellow",
        strokeWidth: 3,
      })
      state.layer.add(arrow)
    }
    if (guiData.displayAcc && guiData.displayAccX && acc.x !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x, pos.y + acc.y],
        stroke: "yellow",
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
    if (guiData.displayAcc && guiData.displayAccY && acc.y !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + acc.x, pos.y],
        stroke: "yellow",
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
      state.deltaT = (timestamp - state.prevTimestamp) / 1000

      // UI options
      state.deltaT *= state.guiData.timeFactor

      if (state.guiData.running) updateState(state)

      drawAxis(state)
      drawPoint(state)

      drawPos(state)
      drawSpeed(state)
      drawAcc(state)

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
