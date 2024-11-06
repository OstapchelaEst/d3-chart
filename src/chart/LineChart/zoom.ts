import * as d3 from 'd3'
import { LineChart } from './line-chart'

// interface ExtendedD3ZoomEvent
//   extends d3.D3ZoomEvent<HTMLCanvasElement, unknown> {}

export class Zoom {
  _chart: LineChart

  private _zoom_behavior: d3.ZoomBehavior<Element, unknown> | null = null
  private _zoom_transform: d3.ZoomTransform = d3.zoomIdentity
  // private _zoom_lvl: number = 1
  // private _zoom_position: number = 0

  constructor(chart: LineChart) {
    this._chart = chart
  }

  public init_zoom() {
    this.init_zoom_behavior()
    const behavior = this._zoom_behavior

    if (!behavior) return

    d3.select(this._chart.chart_root).call(
      // @ts-expect-error type
      behavior
      // this._zoom_transform
    )
  }

  public rescale_x_scale(xScaleOrigin: d3.ScaleLinear<number, number, never>) {
    this._chart.setScale(
      '_scale_x',
      this._zoom_transform.rescaleX(xScaleOrigin)
    )
  }

  private init_zoom_behavior() {
    console.log('init_zoom_behavior')
    this._zoom_behavior = d3
      .zoom()
      .scaleExtent([0.1, 1]) // Allow zooming between 0.25x and 5x
      .translateExtent([
        [-Infinity, 0],
        [Infinity, 0],
      ])
      .on('zoom', this.handle_zoom_event.bind(this))
  }

  private handle_zoom_event(event: d3.D3ZoomEvent<HTMLCanvasElement, unknown>) {
    // const transform = event.transform
    // const { xScaleOrigin, yScaleOrigin } = this._chart.getScales()
    // if (!xScaleOrigin || !yScaleOrigin) return
    // const zx = transform.rescaleX(xScaleOrigin)
    // const zy = transform.rescaleY(yScaleOrigin)
    // this._zoom_transform = transform
    // this._chart.setScale('_scale_x', zx)
    // this._chart.setScale('_scale_y', zy)

    // this._chart.forceRedraw()

    console.log(event)
    const { xScaleOrigin } = this._chart.getScales()
    if (!xScaleOrigin) return
    if (!event.sourceEvent) return
    let wheelDeltaY = event.sourceEvent.wheelDeltaY
    if (wheelDeltaY > 0) {
      // this._zoom_position++
      if (this._chart._interval_index === 0) {
        console.log('RETURN 1')
        return
      }
      this._chart._interval_index--
    } else if (wheelDeltaY < 0) {
      // this._zoom_position--
      if (this._chart._interval_index + 1 === this._chart._intervals.length) {
        console.log('RETURN 2')
        return
      }
      this._chart._interval_index++
    }
    console.log(event.transform.k, event.transform.x, event.transform.y)
    // this._zoom_lvl = this._zoom_transform.k
    this._chart._display_duration = this._chart.get_interval()
    this._chart._cell_duration = this._chart.calc_cell_interval(
      this._chart._display_duration
    )
    // Constrain zoom level to the scale extent
    // Update the transformation without recursively calling the zoom event
    const updatedTransform = d3.zoomIdentity
      .scale(1)
      .translate(event.transform.x, event.transform.y)
    xScaleOrigin.domain([0, this._chart._display_duration])
    this._zoom_transform = updatedTransform // Update global zoom transform state
    // Update scales
    this._chart.setScale(
      '_scale_x',
      this._zoom_transform.rescaleX(xScaleOrigin)
    ) //= this._zoom_transform.rescaleX(this._scale_x_original)
  }
}
