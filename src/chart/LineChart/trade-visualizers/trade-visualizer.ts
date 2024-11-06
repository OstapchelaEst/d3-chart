import { IAddTrade } from './types'
import { LineChart } from '../line-chart'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { TradeRenderer } from './trade-renderer'
import { ResultRenderer } from './result-renderer'

dayjs.extend(duration)

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

interface IResult {
  type: 'UP' | 'DOWN'
  id: string
  reward: number
  time: number
  price: number
  color: string
}

export class TradeVisualizer {
  _chart: LineChart
  _bounds: IBounds[] = []
  _draw_data: IDrawData[] = []

  _trade_renderer: TradeRenderer
  _result_renderer: ResultRenderer

  _trades: Map<string, IAddTrade> = new Map()
  _results: Map<string, IResult> = new Map()

  _result_duration: number = 3000

  _options = {
    upColor: '#008000',
    downColor: '#ff0000',
    lineWidth: 1,
    radius: 3,
    circleFill: 'white',
    labelPadding: 10,
    flagColor: 'gold',
    circleRadius: 3,

    label: {
      paddingX: 10,
      paddingY: 7,
      lineSpacing: 5,
      fontSize1: 12,
      fontSize2: 8,
    },

    text: {
      timeFontSize: 8,
      amountFontSize: 10,
    },
    flagSize: {
      width: 7,
      height: 5,
      lineWidth: 1,
    },
  }

  constructor(chart: LineChart) {
    this._chart = chart
    this._trade_renderer = new TradeRenderer(this)
    this._result_renderer = new ResultRenderer(this)
  }

  public getTrades() {
    return this._trades
  }

  public addTrade(trade: IAddTrade) {
    this._trades.set(trade.id, trade)
  }

  public addResult(result: IResult) {
    this._results.set(result.id, result)
    this._trades.delete(result.id)

    setTimeout(() => {
      this._results.delete(result.id)
    }, this._result_duration)
  }

  public removeTrade(id: string) {
    this._trades.delete(id)
  }

  public clear() {
    this._trades.clear()
    this._results.clear()
  }

  public draw() {
    this._result_renderer.draw()
    this._trade_renderer.draw()
  }
}
