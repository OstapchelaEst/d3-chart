import { LineChart } from './line-chart'

export class PulsingDote {
  private _chart: LineChart

  constructor(chart: LineChart) {
    this._chart = chart
  }

  public draw() {
    const chart = this._chart
    const data = chart.getInterpolatedData()

    if (data.length === 0) return

    const { xScale, yScale } = chart.getScales()

    if (!xScale || !yScale) return

    const lastPoint = data[data.length - 1]

    const x = xScale(lastPoint.time)
    const y = yScale(lastPoint.value)

    this.draw_imp(x, y, lastPoint.time * 1000)
  }

  private draw_imp(x: number, y: number, time: number) {
    const ctx = this._chart.getCtx()
    ctx.save()
    // Draw static bullet
    const bulletRadius = 5 // Fixed radius for the bullet
    ctx.fillStyle = 'blue'
    ctx.globalAlpha = 1.0 // Opaque bullet
    ctx.beginPath()
    ctx.arc(x, y, bulletRadius, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()

    // Draw expanding transparent circle for pulsating effect
    const pulseRadius = 6 + (time % 1000) / 100 // Expands from 10 to 20 pixels
    const alpha = 0.8 * (1 - (time % 1000) / 1000)

    ctx.strokeStyle = 'blue'
    ctx.globalAlpha = alpha // Apply transparency
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}
