import { drawRoundedRect } from '../helpers/drawRoundedRect'
import { getTextMedia } from '../helpers/getTextMedia'
import { LineChart } from './line-chart'

export class LastPrice {
  private _chart: LineChart

  constructor(chart: LineChart) {
    this._chart = chart
  }

  public draw() {
    const chart = this._chart
    const data = chart.getInterpolatedData()

    if (data.length === 0) return

    const { width } = this._chart.get_chart_size()

    const { xScale, yScale } = chart.getScales()

    if (!xScale || !yScale) return

    const lastPoint = data[data.length - 1]
    const y = yScale(lastPoint.value)
    console.debug('---', y, lastPoint.value)

    this.draw_line(width, y)
    this.draw_label(width, y, lastPoint.value)
  }

  private draw_line(x: number, y: number) {
    const ctx = this._chart.getCtx()
    ctx.save()
    // Draw static bullet
    ctx.lineWidth = 1
    ctx.strokeStyle = 'blue'
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(x, y)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }

  private draw_label(x: number, y: number, price: number) {
    const ctx = this._chart.getCtx()
    const text = price.toFixed(2)

    const options = this._chart.getOptions()
    const margin = options.scaleY.labelMargin ?? 0

    const padding = 10

    ctx.font = '12px Arial'

    const { width, height } = getTextMedia(ctx, text)

    const textX = x - width - margin
    const textY = y + height / 2

    drawRoundedRect(
      ctx,
      textX - padding,
      y - padding,
      width + 2 * padding,
      height + padding,
      10,
      'blue'
    )

    ctx.save()
    ctx.fillStyle = 'white'
    ctx.textAlign = 'left'

    ctx.fillText(text, textX, textY)
    ctx.restore()
  }
}
