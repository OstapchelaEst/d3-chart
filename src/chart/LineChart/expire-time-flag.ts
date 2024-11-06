import dayjs from 'dayjs'
import { LineChart } from './line-chart'

export class ExpireTimeFlag {
  private _chart: LineChart
  private _offset_time: number = 30 // 30s
  private _color = 'gold'
  private _text_color = '6B748E'
  private _flag_size = {
    width: 7,
    height: 5,
  }

  constructor(chart: LineChart) {
    this._chart = chart
  }

  public draw() {
    const chart = this._chart
    const data = chart.getInterpolatedData()

    if (data.length === 0) return

    const { xScale } = chart.getScales()

    if (!xScale) return

    const lastPoint = data[data.length - 1]
    const x = xScale(lastPoint.time + this._offset_time)

    this.draw_line(x)
    this.draw_flag(x)
    this.draw_text(x, lastPoint.time)
  }

  private draw_line(x: number) {
    const ctx = this._chart.getCtx()
    const { height } = this._chart.get_chart_size()

    ctx.save()
    ctx.lineWidth = 1
    ctx.strokeStyle = this._color
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height - 30)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }

  private draw_flag(x: number) {
    const ctx = this._chart.getCtx()
    ctx.save()
    ctx.fillStyle = this._color

    const { width, height } = this._flag_size
    const cornerSize = width * 0.2

    const baseWidth = width - cornerSize

    ctx.fillRect(x, 0, baseWidth, height)

    // Создаем форму выреза
    ctx.beginPath()
    ctx.moveTo(x + baseWidth, 0)
    ctx.lineTo(x + width, 0)
    ctx.lineTo(x + baseWidth, height / 2)
    ctx.lineTo(x + width, height)
    ctx.lineTo(x + baseWidth, height)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  private draw_text(x: number, time: number) {
    const ctx = this._chart.getCtx()

    ctx.save()
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.fillStyle = this._text_color

    const text = 'Время закрытия'
    const expireTime = dayjs(
      (time + this._offset_time) * 1000 + this._chart._start_timestamp
    ).format('HH:mm:ss')

    ctx.fillText(text, x + 10, this._flag_size.height + 10)

    ctx.fillStyle = this._color
    ctx.fillText(expireTime, x + 10, this._flag_size.height + 25)

    ctx.restore()
  }
}
