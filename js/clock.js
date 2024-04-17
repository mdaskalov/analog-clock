class Clock {

  intersect(tan, width, height) {
    const x = height * tan
    const y = width / tan;
    return { x: x > width ? width : x, y: y > height ? -height : -y }
  }

  drawLine(ctx, start, end, width, flip_x, flip_y) {
    ctx.beginPath()
    ctx.lineWidth = width
    ctx.moveTo(flip_x === true ? -start.x : start.x, flip_y === true ? -start.y : start.y)
    ctx.lineTo(flip_x === true ? -end.x : end.x, flip_y === true ? -end.y : end.y)
    ctx.stroke()
  }

  drawNumber(ctx, p, number, flip_x, flip_y) {
    ctx.fillText(number.toString(), flip_x === true ? -p.x : p.x, flip_y === true ? -p.y : p.y)
  }

  drawCircle(ctx, p, r) {
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.arc(p.x, p.y, r, 0, 2 * Math.PI, true);
    ctx.fill()
  }

  drawHand(ctx, width, radius, ofs, thick) {
    this.drawLine(ctx, { x: 0, y: thick ? -ofs : ofs }, { x: 0, y: -radius }, width / (thick ? 1 : 3))
    if (thick)
      this.drawLine(ctx, { x: 0, y: -ofs }, { x: 0, y: 0 }, width / 4)
    this.drawCircle(ctx, { x: 0, y: 0 }, width / 2)
  }

  drawFace(ctx, width, height, roundFace) {
    const radius = Math.min(width, height) / 2

    const shortLineLen = radius / 25
    const shortLineWidth = radius / 125
    const longLineLen = radius / 10
    const longLineWidth = radius / 50
    const digitsOfs = radius / 5

    const faceRadius = radius - radius / 50
    const faceWidth = width / 2 - radius / 50
    const faceHeight = height / 2 - radius / 50

    const hOfs = roundFace ? faceRadius : faceWidth
    const vOfs = roundFace ? faceRadius : faceHeight

    this.drawLine(ctx, { x: 0, y: -vOfs }, { x: 0, y: longLineLen - vOfs }, longLineWidth)
    this.drawLine(ctx, { x: hOfs, y: 0 }, { x: hOfs - longLineLen, y: 0 }, longLineWidth)
    this.drawLine(ctx, { x: 0, y: vOfs }, { x: 0, y: vOfs - longLineLen }, longLineWidth)
    this.drawLine(ctx, { x: -hOfs, y: 0 }, { x: longLineLen - hOfs, y: 0 }, longLineWidth)

    this.drawNumber(ctx, { x: 0, y: digitsOfs - vOfs }, 12)
    this.drawNumber(ctx, { x: hOfs - digitsOfs, y: 0 }, 3)
    this.drawNumber(ctx, { x: 0, y: vOfs - digitsOfs }, 6)
    this.drawNumber(ctx, { x: digitsOfs - hOfs, y: 0 }, 9,)

    for (let min = 1, ang = Math.PI / 30; min < 15; min++, ang += Math.PI / 30) { // 1/4 circle (14 min)
      const atHour = (min % 5 == 0)
      const lineLen = atHour ? longLineLen : shortLineLen
      const lineWidth = atHour ? longLineWidth : shortLineWidth

      var start, end, digit
      if (roundFace) {
        const sin = Math.sin(ang)
        const cos = -Math.cos(ang)
        start = { x: sin * faceRadius, y: cos * faceRadius }
        end = { x: sin * (faceRadius - lineLen), y: cos * (faceRadius - lineLen) }
        digit = { x: sin * (faceRadius - digitsOfs), y: cos * (faceRadius - digitsOfs) }
      }
      else {
        const tan = Math.tan(ang)
        start = this.intersect(tan, faceWidth, faceHeight)
        end = this.intersect(tan, faceWidth - lineLen, faceHeight - lineLen)
        digit = this.intersect(tan, faceWidth - digitsOfs, faceHeight - digitsOfs)
      }

      this.drawLine(ctx, start, end, lineWidth)
      this.drawLine(ctx, start, end, lineWidth, false, true)
      this.drawLine(ctx, start, end, lineWidth, true, true)
      this.drawLine(ctx, start, end, lineWidth, true, false)

      if (atHour) {
        const hour = min / 5
        this.drawNumber(ctx, digit, hour)
        this.drawNumber(ctx, digit, 6 - hour, false, true)
        this.drawNumber(ctx, digit, 6 + hour, true, true)
        this.drawNumber(ctx, digit, 12 - hour, true, false)
      }
    }
  }

  createContext(canvas, width, height) {
    var ctx = canvas.getContext("2d", { alpha: true })
    ctx.canvas.width = width
    ctx.canvas.height = height
    ctx.translate(width / 2, height / 2)
    ctx.fillStyle = 'black'
    ctx.strokeStyle = 'black'
    ctx.lineCap = 'round'
    return ctx
  }

  redraw(width, height, roundFace) {
    const radius = Math.min(width, height) / 2

    const fontSize = radius / 9
    const hmRad = radius - radius / 8
    const hmWidth = radius / 15
    const hmOfs = radius / 6
    const sRad = radius - radius / 20
    const sWidth = radius / 20
    const sOfs = radius / 6

    const faceCtx = this.createContext(this.face, width, height)
    faceCtx.font = `${fontSize}px arial`
    faceCtx.textAlign = 'center'
    faceCtx.textBaseline = 'middle'
    this.drawFace(faceCtx, width, height, roundFace)

    const hCtx = this.createContext(this.hour, width, height)
    this.drawHand(hCtx, hmWidth, hmRad * 2 / 3, hmOfs, true)

    const mCtx = this.createContext(this.min, width, height)
    this.drawHand(mCtx, hmWidth, hmRad, hmOfs, true)

    const sCtx = this.createContext(this.sec, width, height)
    sCtx.strokeStyle = 'red'
    sCtx.fillStyle = 'red'
    this.drawHand(sCtx, sWidth, sRad, sOfs, false)
  }

  setTime(now) {
    const h = now.getHours()
    const m = now.getMinutes()
    const s = now.getSeconds()
    const ms = now.getMilliseconds();
    // 6° per sec + 6 / 1000 per ms
    // 6° per min + 6 / 60 per sec + 6 / 60 / 1000 per ms
    // 30° per hour + 30 / 60 per min + 30 / 60 / 60 per sec + 30 / 60 / 60 / 1000 per ms
    this.sec.style.transform = `rotate(${6 * s + 6 / 1000 * ms}deg)`
    this.min.style.transform = `rotate(${6 * m + s / 10 + ms / 10000}deg)`
    this.hour.style.transform = `rotate(${30 * (h % 12) + m / 2 + s / 120}deg)`
  }

  createCanvas(width, height, zIndex) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = "absolute";
    canvas.style.left = 0
    canvas.style.top = 0
    canvas.style.zIndex = zIndex
    this.stack.appendChild(canvas)
    return canvas
  }

  constructor(stack, width, height, roundFace) {
    this.stack = stack
    this.stack.style.position = "relative"
    this.face = this.createCanvas(width, height, -4)
    this.hour = this.createCanvas(width, height, -3)
    this.min = this.createCanvas(width, height, -2)
    this.sec = this.createCanvas(width, height, -1)
    this.redraw(width, height, roundFace)
    this.setTime(new Date())
  }

}