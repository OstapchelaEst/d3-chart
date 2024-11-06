import dayjs from 'dayjs'
import { drawRoundedRect } from '../../helpers/drawRoundedRect'
import { rectOverlap } from '../../helpers/rectOverlap'
import { setHexColorOpacity } from '../../helpers/setHexColorOpacity'
import { TradeVisualizer } from './trade-visualizer'

interface IBounds {
  x1: number
  x2: number
  y1: number
  y2: number
  width: number
  height: number
}

interface IDrawData {
  circleX: number
  labelX: number
  closeX: number
  y: number
  color: string
  text1: string
  text2: string
}

export class TradeRenderer {
  _visualizer: TradeVisualizer
  private _bounds: IBounds[] = []
  private _draw_data: IDrawData[] = []

  constructor(visualizer: TradeVisualizer) {
    this._visualizer = visualizer
  }

  private format_duration(ms: number) {
    const seconds = Math.floor(ms / 1000)
    const duration = dayjs.duration(seconds, 'seconds')

    const hours = duration.hours()
    const minutes = duration.minutes()
    const secs = duration.seconds()

    const formateHours = hours > 0 ? String(hours).padStart(2, '0') : '00'
    const formattedMinutes =
      minutes > 0 ? String(minutes).padStart(2, '0') : '00'
    const formattedSecs = secs > 0 ? String(secs).padStart(2, '0') : '00'

    if (hours > 0) {
      return `${formateHours}:${formattedMinutes}:${formattedSecs}`
    } else {
      return `${formattedMinutes}:${formattedSecs}`
    }
  }

  private draw_flag_line(ctx: CanvasRenderingContext2D, x: number) {
    const { height } = this._visualizer._chart.get_chart_size()
    const { lineWidth } = this._visualizer._options

    ctx.save()
    ctx.fillStyle = this._visualizer._options.flagColor
    ctx.strokeStyle = this._visualizer._options.flagColor
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height - 30)
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  }

  private draw_flag_top(ctx: CanvasRenderingContext2D, x: number) {
    const { width, height, lineWidth } = this._visualizer._options.flagSize

    ctx.save()

    const cornerSize = width * 0.2
    const baseWidth = width - cornerSize

    ctx.beginPath()
    ctx.fillStyle = this._visualizer._options.flagColor
    ctx.strokeStyle = this._visualizer._options.flagColor
    ctx.lineWidth = lineWidth
    ctx.fillRect(x, 0, baseWidth, height)
    ctx.moveTo(x + baseWidth, 0)
    ctx.lineTo(x + width, 0)
    ctx.lineTo(x + baseWidth, height / 2)
    ctx.lineTo(x + width, height)
    ctx.lineTo(x + baseWidth, height)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  private draw_line(
    ctx: CanvasRenderingContext2D,

    point1: { x: number; y: number },
    point2: { x: number; y: number },
    color: string
  ) {
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineDashOffset = 0
    ctx.lineWidth = this._visualizer._options.lineWidth
    ctx.beginPath()
    ctx.moveTo(point1.x, point1.y)
    ctx.lineTo(point2.x, point2.y)
    ctx.stroke()
    ctx.restore()
  }

  private draw_flag(ctx: CanvasRenderingContext2D, x: number) {
    this.draw_flag_line(ctx, x)
    this.draw_flag_top(ctx, x)
  }

  private get_rect_with_text_bounds(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    textLine1: string,
    textLine2: string
  ) {
    const { paddingX, paddingY, lineSpacing, fontSize1, fontSize2 } =
      this._visualizer._options.label

    ctx.font = `${fontSize1}px Arial`
    const line1Width = ctx.measureText(textLine1).width
    ctx.font = `${fontSize2}px Arial`
    const line2Width = ctx.measureText(textLine2).width

    const textWidth = Math.max(line1Width, line2Width)
    const rectWidth = textWidth + paddingX * 2
    const rectHeight = fontSize1 + fontSize2 + lineSpacing + paddingY * 2

    const Y = y - rectHeight / 2

    return {
      x1: x,
      y1: y,
      x2: x + rectWidth,
      y2: Y + rectHeight,
      width: rectWidth,
      height: rectHeight,
    }
  }

  private draw_rounded_rect_with_text(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    textLine1: string,
    textLine2: string,
    color: string
  ) {
    const { paddingX, paddingY, lineSpacing, fontSize1, fontSize2 } =
      this._visualizer._options.label

    ctx.font = `${fontSize1}px Arial`
    const line1Width = ctx.measureText(textLine1).width
    ctx.font = `${fontSize2}px Arial`
    const line2Width = ctx.measureText(textLine2).width

    const textWidth = Math.max(line1Width, line2Width)
    const rectWidth = textWidth + paddingX * 2
    const rectHeight = fontSize1 + fontSize2 + lineSpacing + paddingY * 2

    const X = x - rectWidth
    const Y = y - rectHeight / 2

    drawRoundedRect(ctx, X, Y, rectWidth, rectHeight, 5, color)

    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'

    ctx.font = `${fontSize1}px Arial`
    ctx.fillText(textLine1, X + rectWidth / 2, Y + paddingY + fontSize1)

    ctx.font = `${fontSize2}px Arial`
    ctx.fillText(
      textLine2,
      X + rectWidth / 2,
      Y + paddingY + fontSize1 + lineSpacing + fontSize2
    )

    return { width: rectWidth, height: rectHeight }
  }

  private draw_circle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) {
    ctx.fillStyle = this._visualizer._options.circleFill
    ctx.strokeStyle = color
    ctx.lineWidth = 1

    ctx.beginPath()
    ctx.arc(x, y, this._visualizer._options.circleRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  public draw() {
    const { xScale, yScale } = this._visualizer._chart.getScales()

    if (!xScale || !yScale) return

    const ctx = this._visualizer._chart.getCtx()
    ctx.save()
    this._bounds = []
    this._draw_data = []

    this._visualizer._trades.forEach((trade) => {
      const color = setHexColorOpacity(
        trade.type === 'UP'
          ? this._visualizer._options.upColor
          : this._visualizer._options.downColor,
        0.75
      )

      const x1 = xScale(trade.openTime)
      const x2 = xScale(trade.closeTime)
      const y = yScale(trade.price)

      this.draw_flag(ctx, x2)

      const text = `${trade.type === 'UP' ? '▲' : '▼'} ${String(trade.amount)}$`
      const duration = this.format_duration(
        (trade.closeTime + 1) * 1000 +
          this._visualizer._chart._start_timestamp -
          Date.now()
      )

      let bounds = this.get_rect_with_text_bounds(ctx, x1, y, text, duration)

      this._bounds.forEach((value) => {
        const isOverlap = rectOverlap(
          {
            x: bounds.x1,
            y: bounds.y1,
            width: bounds.width,
            height: bounds.height,
          },
          {
            x: value.x1,
            y: value.y1,
            width: value.width,
            height: value.height,
          }
        )

        if (isOverlap) {
          const newX1 =
            value.x1 -
            value.width -
            this._visualizer._options.circleRadius * 2 -
            10

          bounds = {
            x1: newX1,
            x2: newX1 + bounds.width,
            y1: bounds.y1,
            y2: bounds.x2,
            width: bounds.width,
            height: bounds.height,
          }
        }
      })

      this._bounds.push(bounds)
      this._draw_data.push({
        circleX: x1,
        labelX: bounds.x1,
        closeX: x2,
        y,
        text1: text,
        text2: duration,
        color,
      })
    })

    this._draw_data.forEach((data) => {
      this.draw_line(
        ctx,
        { x: data.labelX, y: data.y },
        { x: data.closeX, y: data.y },
        data.color
      )
    })

    this._draw_data.forEach((data) => {
      this.draw_rounded_rect_with_text(
        ctx,
        data.labelX,
        data.y,
        data.text1,
        data.text2,
        data.color
      )
      this.draw_circle(ctx, data.circleX, data.y, data.color)
    })

    ctx.restore()
  }
}
