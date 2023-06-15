class Clock {

  inside(v, max) {
    return (v >= -max && v <= max)
  }

  intersect(tan, width, height) {
    const hor = { x: width, y: width * tan }
    if (this.inside(hor.y, height)) { return hor }
    const ver = { x: height / tan, y: height }
    if (this.inside(ver.x, width)) { return ver }
  }

  flip(p, x, y) {
    return { x: p.x * x, y: p.y * y }
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
    var ang = 0

    const radius = Math.min(width, height) / 2
    const inc = (2 * Math.PI / 60) // minute increment

    const shortLineLen = radius / 25
    const shortLineWidth = radius / 125
    const longLineLen = radius / 10
    const longLineWidth = radius / 50
    const digitsOfs = radius / 5

    for (let i = 0; i < 16; i++, ang += inc) { // only 1/4 circle
      const atHour = (i % 5 == 0)
      const lineLen = atHour ? longLineLen : shortLineLen
      const lineWidth = atHour ? longLineWidth : shortLineWidth

      var RightBottomStart = { x: 0, y: 0 }
      var RightBottomEnd = { x: 0, y: 0 }
      var RightBottomDigitPos = { x: 0, y: 0 }

      if (roundFace) {
        const cos = Math.cos(ang)
        const sin = Math.sin(ang)
        const rad = radius - radius / 50
        RightBottomStart = { x: rad * cos, y: rad * sin }
        RightBottomEnd = { x: (rad - lineLen) * cos, y: (rad - lineLen) * sin }
        RightBottomDigitPos = { x: (rad - digitsOfs) * cos, y: (rad - digitsOfs) * sin }
      }
      else {
        const tan = Math.tan(ang)
        const w = width / 2 - radius / 50
        const h = height / 2 - radius / 50
        RightBottomStart = this.intersect(tan, w, h)
        RightBottomEnd = this.intersect(tan, w - lineLen, h - lineLen)
        RightBottomDigitPos = this.intersect(tan, w - digitsOfs, h - digitsOfs)
      }

      const BottomLeftStart = this.flip(RightBottomStart, -1, 1)
      const BottomLeftEnd = this.flip(RightBottomEnd, -1, 1)
      const LeftTopStart = this.flip(RightBottomStart, -1, -1)
      const LeftTopEnd = this.flip(RightBottomEnd, -1, -1)
      const TopRightStart = this.flip(RightBottomStart, 1, -1)
      const TopRightEnd = this.flip(RightBottomEnd, 1, -1)

      if (i != 15) {
        this.drawLine(ctx, RightBottomStart, RightBottomEnd, lineWidth)
        this.drawLine(ctx, LeftTopStart, LeftTopEnd, lineWidth)
      }
      if (i != 0) {
        this.drawLine(ctx, BottomLeftStart, BottomLeftEnd, lineWidth)
        this.drawLine(ctx, TopRightStart, TopRightEnd, lineWidth)
      }

      if (atHour) {
        const BottomLeftDigitPos = this.flip(RightBottomDigitPos, -1, 1)
        const LeftTopDigitPos = this.flip(RightBottomDigitPos, -1, -1)
        const TopRightDigitPos = this.flip(RightBottomDigitPos, 1, -1)
        if (i != 15) {
          const RightBottomDigitText = i / 5 + 3
          const LeftTopDigitText = (i / 5) + 9
          this.drawText(ctx, RightBottomDigitPos, RightBottomDigitText)
          this.drawText(ctx, LeftTopDigitPos, LeftTopDigitText)
        }
        if (i != 0) {
          const BottomLeftDigitText = 9 - (i / 5)
          const TopRightDigitText = i == 15 ? 12 : 3 - (i / 5)
          this.drawText(ctx, BottomLeftDigitPos, BottomLeftDigitText)
          this.drawText(ctx, TopRightDigitPos, TopRightDigitText)
        }
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