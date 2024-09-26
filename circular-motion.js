const initCircularMotion = (containerId) => {
  const STAGE_WIDTH = 1200
  const STAGE_HEIGHT = 800
  const PADDING_PERC = 0.1

  const stage = new Konva.Stage({
    container: containerId,
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  })
  const layer = new Konva.Layer({
    offsetX: -STAGE_WIDTH * 0.5,
    offsetY: STAGE_HEIGHT * 0.5,
    scaleY: -1
  })
  stage.add(layer)

  const gui = new dat.GUI()
  const guiData = {
    running: false,
    restart: true,
    timeFactor: 0.4, // increase or decrease simulation speed
    radius: 150,
    period: 10,
    displayPos: false,
    displayPosX: false,
    displayPosY: false,
    displaySpeed: false,
    displaySpeedX: false,
    displaySpeedY: false,
    displayAcc: false,
    displayAccX: false,
    displayAccY: false,
    drawTrajectory: false,
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
    time: 0, // time elapsed from the beginning (seconds)
    radius: guiData.radius,
    period: guiData.period,
    omega: (2 * Math.PI) / guiData.period,
    pos: {
      x: guiData.radius * Math.cos(0),
      y: guiData.radius * Math.sin(0)
    }, // position of point
    speed: {
      x: -(2 * Math.PI / guiData.period) * guiData.radius * Math.sin(0),
      y: (2 * Math.PI / guiData.period) * guiData.radius * Math.cos(0)
    }, // speed of point
    acc: {
      x: -(2 * Math.PI / guiData.period) * (2 * Math.PI / guiData.period) * guiData.radius * Math.cos(0),
      y: -(2 * Math.PI / guiData.period) * (2 * Math.PI / guiData.period) * guiData.radius * Math.sin(0)
    }, // acceleration of point

    // UI options
    guiData,
  }

  function restart(state) {
    state.prevTimestamp = state.timestamp
    state.time = 0
    state.radius = guiData.radius
    state.omega = 2 * Math.PI / guiData.period
    state.pos = {
      x: state.radius * Math.cos(state.time),
      y: state.radius * Math.sin(state.time)
    }
    state.speed = {
      x: -state.omega * state.radius * Math.sin(state.time),
      y: state.omega * state.radius * Math.cos(state.time)
    }
    state.acc = {
      x: -state.omega * state.omega * state.radius * Math.cos(state.time),
      y: -state.omega * state.omega * state.radius * Math.sin(state.time)
    }
  }

  gui.add(state.guiData, "running").name("Run").onChange(value => {
    state.guiData.running = !!value
  })
  gui.add(state.guiData, "restart").name("Restart").onChange(() => restart(state))
  gui.add(state.guiData, "timeFactor").name("Time speed").step(0.2).min(0.2).max(10).onFinishChange(value => {
    state.guiData.timeFactor = value
  })
  gui.add(state.guiData, "drawTrajectory").name("Trajectory").onChange(value => {
    state.guiData.drawTrajectory = !!value
  })
  gui.add(state.guiData, "radius").name("Radius").step(10).min(0).max(300).onFinishChange(value => {
    state.guiData.initPosX = value
    state.guiData.initPosY = 0
    restart(state)
  })
  gui.add(state.guiData, "period").name("Period").step(1).min(1).max(20).onFinishChange(value => {
    state.guiData.period = value
    restart(state)
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
    const { time, radius, omega } = state
    state.pos = {
      x: radius * Math.cos(omega * time),
      y: radius * Math.sin(omega * time)
    }
    state.speed = {
      x: -omega * radius * Math.sin(omega * time),
      y: omega * radius * Math.cos(omega * time)
    }
    state.acc = {
      x: -omega * omega * radius * Math.cos(omega * time),
      y: -omega * omega * radius * Math.sin(omega * time)
    }
  }

  function drawPoint(state, color) {
    const circle = new Konva.Circle({
      x: state.pos.x,
      y: state.pos.y,
      radius: 8,
      fill: color,
    })

    state.layer.add(circle)
  }

  function drawPos(state, color) {
    const { pos, guiData } = state

    if (guiData.displayPos) {
      const arrow = new Konva.Arrow({
        points: [0, 0, pos.x, pos.y],
        stroke: color,
        strokeWidth: 3,
      })
      state.layer.add(arrow)
    }
    if (guiData.displayPos && guiData.displayPosX) {
      const arrow = new Konva.Arrow({
        points: [0, 0, pos.x, 0],
        stroke: color,
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
    if (guiData.displayPos && guiData.displayPosY) {
      const arrow = new Konva.Arrow({
        points: [0, 0, 0, pos.y],
        stroke: color,
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
  }
  function drawSpeed(state, color) {
    const { pos, speed, guiData } = state

    if (guiData.displaySpeed) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + speed.x, pos.y + speed.y],
        stroke: color,
        strokeWidth: 3,
      })
      state.layer.add(arrow)
    }
    if (guiData.displaySpeed && guiData.displaySpeedX && speed.x !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x, pos.y + speed.y],
        stroke: color,
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
    if (guiData.displaySpeed && guiData.displaySpeedY && speed.y !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + speed.x, pos.y],
        stroke: color,
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
  }
  function drawAcc(state, color) {
    const { pos, acc, guiData } = state

    if (guiData.displayAcc) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + acc.x, pos.y + acc.y],
        stroke: color,
        strokeWidth: 3,
      })
      state.layer.add(arrow)
    }
    if (guiData.displayAcc && guiData.displayAccX && acc.x !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x, pos.y + acc.y],
        stroke: color,
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
    if (guiData.displayAcc && guiData.displayAccY && acc.y !== 0) {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x + acc.x, pos.y],
        stroke: color,
        strokeWidth: 3,
        dash: [5, 5],
      })
      state.layer.add(arrow)
    }
  }

  function drawTrajectory(state, color) {
    const { radius } = state
    const line = new Konva.Circle({
      x: 0,
      y: 0,
      radius,
      stroke: color,
      dash: [2, 2]
    })
    state.layer.add(line)
  }

  function drawAxis(state) {
    const { stageWidth, stageHeight, paddingPerc } = state
    const axisX = new Konva.Arrow({
      points: [-stageWidth / 2, 0, (stageWidth * (1 - paddingPerc)) / 2, 0],
      stroke: "white",
      strokeWidth: 3
    })
    state.layer.add(axisX)

    const axisY = new Konva.Arrow({
      points: [0, -stageHeight, 0, (stageHeight * (1 - paddingPerc)) / 2],
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
      state.time += state.guiData.running ? state.deltaT : 0

      if (state.guiData.running) updateState(state)

      drawAxis(state)
      drawPoint(state, "blue")

      if (state.guiData.displayPos) drawPos(state, "purple")
      if (state.guiData.displaySpeed) drawSpeed(state, "red")
      if (state.guiData.displayAcc) drawAcc(state, "yellow")
      if (state.guiData.drawTrajectory) drawTrajectory(state, "green")

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
