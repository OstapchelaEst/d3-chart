import { LineChart } from './line-chart'

export class Grid {
  private _chart: LineChart
  constructor(chart: LineChart) {
    this._chart = chart
  }

  public draw() {
    this.draw_x_ticks()
    this.draw_y_ticks()
  }

  private draw_y_ticks() {
    const chart = this._chart

    const ctx = chart.getCtx()
    const { yScale } = chart.getScales()
    const { width } = chart.get_chart_size()
    if (!ctx || !yScale) return

    const yTicks = chart.get_y_ticks()
    ctx.strokeStyle = chart._grid_options.color
    ctx.lineWidth = 1
    // Draw horizontal grid lines
    yTicks.forEach((d) => {
      ctx.beginPath()
      const y = yScale(d)
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    })

    ctx.restore()
  }

  private draw_x_ticks() {
    const chart = this._chart

    const ctx = chart.getCtx()
    const { xScale } = chart.getScales()
    const xTicks = chart.get_x_ticks()
    const { height } = chart.get_chart_size()

    if (!ctx || !xScale) return
    ctx.save()
    ctx.strokeStyle = chart._grid_options.color
    ctx.lineWidth = 1

    xTicks.forEach((d) => {
      const x = xScale(d)
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    })

    ctx.restore()
  }
}
