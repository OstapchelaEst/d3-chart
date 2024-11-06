import { drawRoundedRect } from '../../helpers/drawRoundedRect'
import { TradeVisualizer } from './trade-visualizer'

export class ResultRenderer {
  _visualizer: TradeVisualizer
  _options = {
    circleRadius: 4,
    label: {
      paddingX: 7,
      paddingY: 5,
      fontSize: 12,
      color: 'white',
      fontFamily: 'Arial',
      strokeWidth: 1,
      borderRadius: 5,
    },
  }
  constructor(visualizer: TradeVisualizer) {
    this._visualizer = visualizer
  }

  private get_rect_with_text_bounds(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string
  ) {
    const { paddingX, paddingY, fontSize, fontFamily } = this._options.label
    ctx.save()
    ctx.font = `${fontSize}px ${fontFamily}`
    const textWidth = ctx.measureText(text).width

    const rectWidth = textWidth + paddingX * 2
    const rectHeight = fontSize + paddingY * 2

    ctx.restore()

    return {
      x1: x,
      y1: y,
      width: rectWidth,
      height: rectHeight,
    }
  }

  private draw_circle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) {
    const radius = this._options.circleRadius

    ctx.fillStyle = color
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1

    ctx.beginPath()
    ctx.arc(x - radius, y - radius, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  private draw_rounded_rect_with_text(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    fillColor: string
  ) {
    const { paddingX, paddingY, fontSize, fontFamily, borderRadius, color } =
      this._options.label

    ctx.save()
    ctx.font = `${fontSize}px ${fontFamily}`
    const textWidth = ctx.measureText(text).width

    const rectWidth = textWidth + paddingX * 2 - this._options.circleRadius * 2
    const rectHeight = fontSize + paddingY * 2

    drawRoundedRect(ctx, x, y, rectWidth, rectHeight, borderRadius, fillColor)

    ctx.fillStyle = color
    ctx.textAlign = 'center'

    ctx.font = `${fontSize}px ${fontFamily}`

    ctx.fillText(text, x + rectWidth / 2, y + rectHeight / 2 + paddingY)
    ctx.restore()
    return { width: rectWidth, height: rectHeight }
  }

  public draw() {
    const { xScale, yScale } = this._visualizer._chart.getScales()

    const ctx = this._visualizer._chart.getCtx()
    ctx.save()
    if (!xScale || !yScale) return

    this._visualizer._results.forEach((result) => {
      const x = xScale(result.time)
      const y = yScale(result.price)

      const text = `+${result.reward}$`

      const bounds = this.get_rect_with_text_bounds(ctx, x, y, text)

      const labelX = x - bounds.width / 2
      const labelY = y - bounds.height - 10

      this.draw_rounded_rect_with_text(ctx, labelX, labelY, text, result.color)
      this.draw_circle(ctx, x, y, result.color)
    })
    ctx.restore()
  }
}
