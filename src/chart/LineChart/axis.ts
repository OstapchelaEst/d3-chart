import * as d3 from 'd3'
import dayjs from 'dayjs'
import { LineChart } from './line-chart'
import { getTextMedia } from '../helpers/getTextMedia'

export class Axis {
  private _chart: LineChart
  private _scale_x: d3.ScaleLinear<number, number, never> | null = null
  private _scale_y: d3.ScaleLinear<number, number, never> | null = null
  private _scale_x_original: d3.ScaleLinear<number, number, never> | null = null
  private _scale_y_original: d3.ScaleLinear<number, number, never> | null = null

  constructor(chart: LineChart) {
    this._chart = chart
  }

  public getScales() {
    return {
      xScale: this._scale_x,
      xScaleOrigin: this._scale_x_original,
      yScale: this._scale_y,
      yScaleOrigin: this._scale_y_original,
    }
  }

  public setScale(
    scaleKey:
      | '_scale_x'
      | '_scale_x_original'
      | '_scale_y'
      | '_scale_y_original',
    value: d3.ScaleLinear<number, number, never>
  ) {
    this[scaleKey] = value
  }

  public init_scales() {
    const cellInterval = this._chart.get_interval()
    const { width, height } = this._chart.get_chart_size()

    const xOriginalScale = d3
      .scaleLinear()
      .domain([0, cellInterval])
      .range([0, width])

    const yOriginalScale = d3
      .scaleLinear()
      .domain([61090, 61105])
      .range([height - 30, 0])

    this._scale_x = xOriginalScale.copy()
    this._scale_y = yOriginalScale.copy()
    this._scale_x_original = xOriginalScale
    this._scale_y_original = yOriginalScale
  }

  private generate_ticks(domain: number[], interval: number) {
    let [start, end] = domain
    let ticks = []

    const adjustedStart = Math.floor(start / interval) * interval

    // Generate tick values from adjusted start to end with the given interval
    for (let i = adjustedStart; i <= end; i += interval) {
      ticks.push(i)
    }

    return ticks
  }

  public get_x_ticks() {
    const { xScale } = this.getScales()
    if (!xScale) return []
    return this.generate_ticks(xScale.domain(), this._chart._cell_duration)
  }

  public get_y_ticks() {
    const { yScale } = this.getScales()
    if (!yScale) return []
    return yScale.ticks(20)
  }

  public draw() {
    this.draw_x_axis()
    this.draw_y_axis()
  }

  private draw_x_axis() {
    const ctx = this._chart.getCtx()
    const xScale = this._scale_x
    if (!ctx || !xScale) return

    const xTicks = this.get_x_ticks()
    const { width, height } = this._chart.get_chart_size()
    ctx.save()
    ctx.fillStyle = 'black'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'

    xTicks.forEach((d) => {
      const x = xScale(d)
      const date = new Date(d * 1000 + this._chart._start_timestamp)
      const timeString = dayjs(date).format('HH:mm:ss')
      if (x >= 0 && x <= width) {
        ctx.fillText(timeString, x, height - 15)
      }
    })

    ctx.restore()
  }

  private draw_y_axis() {
    const ctx = this._chart.getCtx()
    const yScale = this._scale_y
    if (!ctx || !yScale) return

    const yTicks = this.get_y_ticks()
    const { width: chartWidth } = this._chart.get_chart_size()
    const options = this._chart.getOptions()
    const margin = options.scaleY.labelMargin ?? 0

    ctx.save()
    ctx.fillStyle = 'black'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'

    yTicks.forEach((d) => {
      const y = yScale(d)
      const text = d.toFixed(2)

      const { width: textWidth } = getTextMedia(ctx, text)

      ctx.fillText(d.toFixed(2), chartWidth - textWidth - margin, y + 3)
    })

    ctx.restore()
  }
}
