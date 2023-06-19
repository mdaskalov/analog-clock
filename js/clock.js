class Clock {

  intersect(tan, width, height) {
    const y = width * tan;
    return y <= height ? { x: width, y } : { x: height / tan, y: height }
  }

  drawLine(ctx, p1, p2, width) {
    ctx.beginPath()
    ctx.lineWidth = width
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }

  drawText(ctx, p, txt) {
    ctx.fillText(txt.toString(), p.x, p.y)
  }

  drawCircle(ctx, p, r) {
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.arc(p.x, p.y, r, 0, 2 * Math.PI, true);
    ctx.fill()
  }

  drawHand(ctx, width, radius, ofs) {
    this.drawCircle(ctx, { x: 0, y: 0 }, width / 2)
    this.drawLine(ctx, { x: 0, y: 0 }, { x: 0, y: -ofs }, width / 4)
    this.drawLine(ctx, { x: 0, y: -ofs }, { x: 0, y: -radius }, width)
  }

  drawSecHand(ctx, width, radius, ext) {
    this.drawCircle(ctx, { x: 0, y: 0 }, width / 2)
    this.drawLine(ctx, { x: 0, y: ext }, { x: 0, y: -radius }, width / 3)
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

    var ang = 0
    for (let i = 0; i < 15; i++) { // only 1/4 circle
      const atHour = (i % 5 == 0)
      const hour = i / 5
      const lineLen = atHour ? longLineLen : shortLineLen
      const lineWidth = atHour ? longLineWidth : shortLineWidth

      var rightBottomStart = { x: 0, y: 0 }
      var rightBottomEnd = { x: 0, y: 0 }
      var rightBottomDigitPos = { x: 0, y: 0 }
      var atZeroStart = 0
      var atZeroEnd = 0
      var atZeroDigitPos = 0

      if (roundFace) {
        const cos = Math.cos(ang)
        const sin = Math.sin(ang)
        rightBottomStart = { x: faceRadius * cos, y: faceRadius * sin }
        rightBottomEnd = { x: (faceRadius - lineLen) * cos, y: (faceRadius - lineLen) * sin }
        rightBottomDigitPos = { x: (faceRadius - digitsOfs) * cos, y: (faceRadius - digitsOfs) * sin }
        atZeroStart = faceRadius
        atZeroEnd = faceRadius - lineLen
        atZeroDigitPos = faceRadius - digitsOfs
      }
      else {
        const tan = Math.tan(ang)
        rightBottomStart = this.intersect(tan, faceWidth, faceHeight)
        rightBottomEnd = this.intersect(tan, faceWidth - lineLen, faceHeight - lineLen)
        rightBottomDigitPos = this.intersect(tan, faceWidth - digitsOfs, faceHeight - digitsOfs)
        atZeroStart = faceHeight
        atZeroEnd = faceHeight - lineLen
        atZeroDigitPos = faceHeight - digitsOfs
      }

      const bottomLeftStart = (i == 0) ? { x: 0, y: atZeroStart } : { x: -rightBottomStart.x, y: rightBottomStart.y }
      const bottomLeftEnd = (i == 0) ? { x: 0, y: atZeroEnd } : { x: -rightBottomEnd.x, y: rightBottomEnd.y }
      const leftTopStart = { x: -rightBottomStart.x, y: -rightBottomStart.y }
      const leftTopEnd = { x: -rightBottomEnd.x, y: -rightBottomEnd.y }
      const topRightStart = (i == 0) ? { x: 0, y: -atZeroStart } : { x: rightBottomStart.x, y: -rightBottomStart.y }
      const topRightEnd = (i == 0) ? { x: 0, y: -atZeroEnd } : { x: rightBottomEnd.x, y: -rightBottomEnd.y }

      this.drawLine(ctx, rightBottomStart, rightBottomEnd, lineWidth)
      this.drawLine(ctx, leftTopStart, leftTopEnd, lineWidth)
      this.drawLine(ctx, bottomLeftStart, bottomLeftEnd, lineWidth)
      this.drawLine(ctx, topRightStart, topRightEnd, lineWidth)

      if (atHour) {
        const bottomLeftDigitPos = (i == 0) ? { x: 0, y: atZeroDigitPos } : { x: -rightBottomDigitPos.x, y: rightBottomDigitPos.y }
        const leftTopDigitPos = { x: -rightBottomDigitPos.x, y: -rightBottomDigitPos.y }
        const topRightDigitPos = (i == 0) ? { x: 0, y: -atZeroDigitPos } : { x: rightBottomDigitPos.x, y: -rightBottomDigitPos.y }
        this.drawText(ctx, rightBottomDigitPos, hour + 3)
        this.drawText(ctx, bottomLeftDigitPos, i == 0 ? 6 : 9 - hour)
        this.drawText(ctx, leftTopDigitPos, hour + 9)
        this.drawText(ctx, topRightDigitPos, i == 0 ? 12 : 3 - hour)
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