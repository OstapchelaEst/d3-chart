import { LineChart } from './line-chart'

export class Series {
  _chart: LineChart

  constructor(chart: LineChart) {
    this._chart = chart
  }

  public draw() {
    const ctx = this._chart.getCtx()
    const data = this._chart.getInterpolatedData()

    const { xScale, yScale } = this._chart.getScales()

    if (data.length < 2 || !xScale || !yScale) return

    // Draw area
    ctx.save()
    ctx.fillStyle = 'lightblue'
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.moveTo(xScale(data[0].time), yScale(yScale.domain()[0]))
    data.forEach((d) => {
      ctx.lineTo(xScale(d.time), yScale(d.value))
    })

    ctx.lineTo(xScale(data[data.length - 1].time), yScale(yScale.domain()[0]))
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1.0

    // Draw line
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(xScale(data[0].time), yScale(data[0].value))
    data.forEach((d) => {
      ctx.lineTo(xScale(d.time), yScale(d.value))
    })
    ctx.stroke()
    ctx.restore()
  }
}
