class Clock {

  intersect(tan, width, height) {
    const y = width * tan;
    return y <= height ? { x: width, y } : { x: height / tan, y: height }
  }

  drawLine(ctx, x1, y1, x2, y2, width) {
    ctx.beginPath()
    ctx.lineWidth = width
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  drawNumber(ctx, x, y, number) {
    ctx.fillText(number.toString(), x, y)
  }

  drawCircle(ctx, x, y, r) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, r, 0, 2 * Math.PI, true);
    ctx.fill()
  }

  drawHand(ctx, width, radius, ofs) {
    this.drawCircle(ctx, 0, 0, width / 2)
    this.drawLine(ctx, 0, 0, 0, -ofs, width / 4)
    this.drawLine(ctx, 0, -ofs, 0, -radius, width)
  }

  drawSecHand(ctx, width, radius, ext) {
    this.drawCircle(ctx, 0, 0, width / 2)
    this.drawLine(ctx, 0, ext, 0, -radius, width / 3)
  }

  drawFace(ctx, width, height, roundFace) {
    const radius = Math.min(width, height) / 2
    const inc = (2 * Math.PI / 60) // minute increment

    const shortLineLen = radius / 25
    const shortLineWidth = radius / 125
    const longLineLen = radius / 10
    const longLineWidth = radius / 50
    const digitsOfs = radius / 5

    const faceRadius = radius - radius / 50
    const faceWidth = width / 2 - radius / 50
    const faceHeight = height / 2 - radius / 50

    const horOfs = roundFace ? faceRadius : faceHeight
    const verOfs = roundFace ? faceRadius : faceWidth

    this.drawLine(ctx, 0, -horOfs, 0, longLineLen - horOfs, longLineWidth)
    this.drawLine(ctx, 0, horOfs, 0, horOfs - longLineLen, longLineWidth)
    this.drawLine(ctx, verOfs, 0, verOfs - longLineLen, 0, longLineWidth)
    this.drawLine(ctx, -verOfs, 0, longLineLen - verOfs, 0, longLineWidth)

    this.drawNumber(ctx, 0, digitsOfs - horOfs, 12)
    this.drawNumber(ctx, 0, horOfs - digitsOfs, 6)
    this.drawNumber(ctx, verOfs - digitsOfs, 0, 3)
    this.drawNumber(ctx, digitsOfs - verOfs, 0, 9)

    var ang = inc
    for (let i = 1; i < 15; i++) { // only 1/4 circle
      const atHour = (i % 5 == 0)
      const lineLen = atHour ? longLineLen : shortLineLen
      const lineWidth = atHour ? longLineWidth : shortLineWidth

      var startPt = { x: 0, y: 0 }
      var endPt = { x: 0, y: 0 }
      var digitPos = { x: 0, y: 0 }

      if (roundFace) {
        const cos = Math.cos(ang)
        const sin = Math.sin(ang)
        startPt = { x: faceRadius * cos, y: faceRadius * sin }
        endPt = { x: (faceRadius - lineLen) * cos, y: (faceRadius - lineLen) * sin }
        digitPos = { x: (faceRadius - digitsOfs) * cos, y: (faceRadius - digitsOfs) * sin }
      }
      else {
        const tan = Math.tan(ang)
        startPt = this.intersect(tan, faceWidth, faceHeight)
        endPt = this.intersect(tan, faceWidth - lineLen, faceHeight - lineLen)
        digitPos = this.intersect(tan, faceWidth - digitsOfs, faceHeight - digitsOfs)
      }

      this.drawLine(ctx, startPt.x, startPt.y, endPt.x, endPt.y, lineWidth)
      this.drawLine(ctx, -startPt.x, startPt.y, -endPt.x, endPt.y, lineWidth)
      this.drawLine(ctx, startPt.x, -startPt.y, endPt.x, -endPt.y, lineWidth)
      this.drawLine(ctx, -startPt.x, -startPt.y, -endPt.x, -endPt.y, lineWidth)

      if (atHour) {
        const hour = i / 5
        this.drawNumber(ctx, digitPos.x, digitPos.y, hour + 3)
        this.drawNumber(ctx, -digitPos.x, digitPos.y, 9 - hour)
        this.drawNumber(ctx, digitPos.x, -digitPos.y, 3 - hour)
        this.drawNumber(ctx, -digitPos.x, -digitPos.y, hour + 9)
      }
      ang += inc
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

    const faceCtx = this.createContext(this.face, width, height)
    faceCtx.font = `${fontSize}px arial`
    faceCtx.textAlign = 'center'
    faceCtx.textBaseline = 'middle'
    this.drawFace(faceCtx, width, height, roundFace)

    const hmRad = radius - radius / 8
    const hmWidth = radius / 15
    const hmOfs = radius / 6
    const sRad = radius - radius / 20
    const sWidth = radius / 20
    const sExt = radius / 6

    const hCtx = this.createContext(this.hour, width, height)
    this.drawHand(hCtx, hmWidth, hmRad * 2 / 3, hmOfs)

    const mCtx = this.createContext(this.min, width, height)
    this.drawHand(mCtx, hmWidth, hmRad, hmOfs)

    const sCtx = this.createContext(this.sec, width, height)
    sCtx.strokeStyle = 'red'
    sCtx.fillStyle = 'red'
    this.drawSecHand(sCtx, sWidth, sRad, sExt)
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

  constructor(face, hour, min, sec, width, height, roundFace) {
    this.face = face
    this.hour = hour
    this.min = min
    this.sec = sec
    this.redraw(width, height, roundFace)
    this.setTime(new Date())
  }

}