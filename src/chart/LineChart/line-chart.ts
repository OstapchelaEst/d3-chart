import * as d3 from 'd3'
import { PulsingDote } from './pulsing-circle'
import { Axis } from './axis'
import { Grid } from './grid'
import { LastPrice } from './last-price'
import { ExpireTimeFlag } from './expire-time-flag'
import { TradeVisualizer } from './trade-visualizers/trade-visualizer'
import { IAddTrade } from './trade-visualizers/types'
import { Zoom } from './zoom'
import { Series } from './series'

const diapozones = new Array(200).fill(null).map((_, i) => {
  return (i + 5) * 10
})

const INTERVALS = diapozones

interface ExtendedD3ZoomEvent
  extends d3.D3ZoomEvent<HTMLCanvasElement, unknown> {}

type IIntervals = typeof INTERVALS

type IInterval = (typeof INTERVALS)[number]

const DEFAULT_GRID_OPTIONS: GridOptions = {
  cell_min_width: 70,
  cell_max_width: 80,
  color: '#a4a4a4',
}

interface GridOptions {
  cell_min_width: number
  cell_max_width: number
  color: string
}

interface InitOptions {
  scaleX: {
    intervalIndex: number
  }
  scaleY: {
    labelMargin?: number
  }
}

interface Point {
  time: number
  value: number
}

export class LineChart {
  chart_root: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  public _grid_options: GridOptions = DEFAULT_GRID_OPTIONS
  private _options: InitOptions

  private _is_auto_scroll: boolean = false

  _interval_index: number
  _intervals: IIntervals = INTERVALS

  _display_duration: IInterval
  _cell_duration: number

  private _zoom_behavior: d3.ZoomBehavior<Element, unknown> | null = null
  // private _zoom_transform: d3.ZoomTransform = d3.zoomIdentity
  private _zoom_lvl: number = 1
  private _zoom_position: number = 0

  private _last_point_time: number = 0
  private _next_point_time: number = 0
  private _interpolation_factor: number = 1
  private _date_update_interval: number = 500

  private _data: Point[] = []
  private _data_interpolated: Point[] = []

  public _start_timestamp: number

  private _pulsing_dot: PulsingDote
  private _axis: Axis
  private _grid: Grid
  private _last_price: LastPrice
  private _expire_time_flag: ExpireTimeFlag
  private _trade_visualizer: TradeVisualizer
  private _series: Series
  private _zoom: Zoom

  constructor(root: HTMLCanvasElement, options: InitOptions) {
    this.chart_root = root
    this._ctx = root.getContext('2d')!
    this._options = options
    this._interval_index = options.scaleX.intervalIndex

    this.set_chart_size()
    this._display_duration = this.get_interval()
    this._cell_duration = this.calc_cell_interval(this._display_duration)

    this._start_timestamp = Date.now()

    this._pulsing_dot = new PulsingDote(this)
    this._axis = new Axis(this)
    this._grid = new Grid(this)
    this._last_price = new LastPrice(this)
    this._expire_time_flag = new ExpireTimeFlag(this)
    this._trade_visualizer = new TradeVisualizer(this)
    this._zoom = new Zoom(this)
    this._series = new Series(this)
  }

  public getScales() {
    return this._axis.getScales()
  }

  public setScale(
    scaleKey:
      | '_scale_x'
      | '_scale_x_original'
      | '_scale_y'
      | '_scale_y_original',
    value: d3.ScaleLinear<number, number, never>
  ) {
    this._axis.setScale(scaleKey, value)
  }

  public autoScroll(val: boolean) {
    this._is_auto_scroll = val
  }

  public addTrade(trade: Omit<IAddTrade, 'price' | 'openTime'>) {
    if (this._data_interpolated.length === 0) return

    const closeTime = (trade.closeTime - this._start_timestamp) / 1000
    const price =
      this._data_interpolated[this._data_interpolated.length - 1].value
    const openTime =
      this._data_interpolated[this._data_interpolated.length - 1].time

    this._trade_visualizer.addTrade({ ...trade, openTime, closeTime, price })
  }

  public addResult(result: {
    id: string
    type: 'UP' | 'DOWN'
    reward: number
    openPrice: number
    closeTime: number
  }) {
    const price =
      this._data_interpolated[this._data_interpolated.length - 1].value
    const time = (result.closeTime - this._start_timestamp) / 1000

    let reward = 0
    let color = 'red'

    if (result.openPrice > price && result.type === 'DOWN') {
      reward = result.reward
      color = 'green'
    }

    if (result.openPrice < price && result.type === 'UP') {
      reward = result.reward
      color = 'green'
    }

    this._trade_visualizer.addResult({
      ...result,
      reward,
      color,
      time,
      price,
    })
  }

  public removeTrade(tradeId: string) {
    this._trade_visualizer.removeTrade(tradeId)
  }

  private set_chart_size() {
    const ctx = this.chart_root.getContext('2d')
    if (!ctx) return

    const canvas = this.chart_root
    canvas.width = window.innerWidth * window.devicePixelRatio
    canvas.height = window.innerHeight * window.devicePixelRatio

    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  }

  public getOptions() {
    return this._options
  }

  public get_chart_size() {
    return {
      width: this._ctx.canvas.offsetWidth,
      height: this._ctx.canvas.offsetHeight,
    }
  }

  get_interval() {
    return this._intervals[this._interval_index]
  }

  calc_cell_interval(duration: IInterval) {
    const { width } = this.get_chart_size()
    let { cell_max_width, cell_min_width } = this._grid_options
    let size = cell_min_width
    for (let i = cell_min_width; i <= cell_max_width; i++) {
      if (width % i) {
        size = i
        break
      }
    }
    const cnt = width / size

    return Math.max(2, Math.ceil(duration / cnt))
  }

  private scroll(timeMs: number) {
    const timeS = timeMs / 1000

    const offsetSize = 200

    const timeOffset = timeS - offsetSize

    const { xScaleOrigin } = this.getScales()
    if (!xScaleOrigin) return

    if (this._is_auto_scroll) {
      xScaleOrigin.domain([
        timeOffset,
        timeS + this._display_duration - offsetSize,
      ])
    }

    this._zoom.rescale_x_scale(xScaleOrigin)
  }

  public get_x_ticks() {
    return this._axis.get_x_ticks()
  }
  public get_y_ticks() {
    return this._axis.get_y_ticks()
  }

  public getCtx() {
    return this._ctx
  }

  private init_timer() {
    const timer = d3.timer((timeInMs) => {
      const shouldUpdate = this.should_update(timeInMs)

      if (shouldUpdate) {
        this.updater(timeInMs)
      }
    })
  }

  private should_update(time: number) {
    // мб понадобится в будущем для контроля апдейтов
    return true
  }

  private calc_interpolation_factor(timeMs: number) {
    const lastTime = Number(this._last_point_time.toFixed())
    const finishTime = lastTime + this._date_update_interval
    const differ = this._date_update_interval - (finishTime - timeMs)

    const factor = differ / this._date_update_interval

    this._interpolation_factor = Number(
      Math.min(1, Math.max(0, factor)).toFixed(2)
    )
  }

  private interpolate_data() {
    if (this._data.length < 2) return []

    const data = this._data.slice()
    const lastPoint = data[this._data.length - 2]
    const nextPoint = data[this._data.length - 1]

    data[data.length - 1] = {
      time:
        lastPoint.time +
        this._interpolation_factor * (nextPoint.time - lastPoint.time),
      value:
        lastPoint.value +
        this._interpolation_factor * (nextPoint.value - lastPoint.value),
    }

    this._data_interpolated = data
  }

  private updater(timeMs: number) {
    this.calc_interpolation_factor(timeMs)
    this.scroll(timeMs)

    this.process_new_point(timeMs)
    this.interpolate_data()
    this.draw()

    const { yScaleOrigin } = this.getScales()

    if (yScaleOrigin) {
      this.setScale('_scale_y', yScaleOrigin.copy())
    }
  }

  public forceRedraw() {
    this.draw()
  }

  private process_new_point(timeMs: number) {
    const timeS = timeMs / 1000
    const nextDataTime =
      this._last_point_time / 1000 + this._date_update_interval / 1000

    if (timeS >= nextDataTime) {
      const dataPoint = this.generate_point(timeS)
      this._last_point_time = timeMs
      this._next_point_time += this._date_update_interval
      this._interpolation_factor = 0
      this._data.push(dataPoint)
    }
  }

  private generate_initial_data(length: number) {
    const result: Point[] = []
    for (let i = length; i >= 0; i--) {
      result.push(
        this.generate_point(
          i === 0 ? 0 : 0 - (this._date_update_interval * i) / 1000
        )
      )
    }

    this._last_point_time = result[result.length - 1]?.time ?? 0
    this._data = result
  }

  private generate_point(time: number): Point {
    const minY = 61100.4543
    const maxY = 61102.9999
    const value = Math.random() * (maxY - minY) + minY
    return { time: time, value: value }
  }

  private draw() {
    const ctx = this.getCtx()
    if (!ctx) return

    const { width, height } = this.get_chart_size()
    ctx.clearRect(0, 0, width, height)

    this._grid.draw()
    this._series.draw()
    this._trade_visualizer.draw()
    this._pulsing_dot.draw()
    this._axis.draw()
    this._expire_time_flag.draw()
    this._last_price.draw()
  }

  public getInterpolatedData() {
    return this._data_interpolated
  }

  private init_resize_observer() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  private resize() {
    const width = window.innerWidth * window.devicePixelRatio
    const height = window.innerHeight * window.devicePixelRatio
    this.chart_root.width = width
    this.chart_root.height = height
    this.chart_root.style.width = `${window.innerWidth}px`
    this.chart_root.style.height = `${window.innerHeight}px`
    this._ctx.setTransform(
      window.devicePixelRatio,
      0,
      0,
      window.devicePixelRatio,
      0,
      0
    )

    const { xScaleOrigin, yScaleOrigin } = this.getScales()

    if (xScaleOrigin && yScaleOrigin) {
      xScaleOrigin.range([0, window.innerWidth])
      yScaleOrigin.range([window.innerHeight - 30, 0])

      this._zoom.rescale_x_scale(xScaleOrigin)
    }

    this._cell_duration = this.calc_cell_interval(this._display_duration)

    this.draw()
  }

  public initChart() {
    this._axis.init_scales()
    this._zoom.init_zoom()

    this.generate_initial_data(2000)
    this.init_timer()
    this.init_resize_observer()
  }
}
