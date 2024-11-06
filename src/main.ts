import { LineChart } from './chart/LineChart/line-chart'
import './style.css'

const DELAY = 1000 * 3
let idCounter = 10

document.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById(
    'visualization'
  ) as HTMLCanvasElement | null

  if (!canvas) return
  const chart = new LineChart(canvas, {
    scaleX: { intervalIndex: 4 },
    scaleY: { labelMargin: 10 },
  })

  const upBtn = document.getElementById('up')
  const downBtn = document.getElementById('down')
  const toggleAutoScroll = document.getElementById(
    'auto_scroll'
  ) as HTMLInputElement | null

  if (upBtn) {
    upBtn.addEventListener('click', () => {
      const id = Date.now() + '' + idCounter
      const openPrice = idCounter
      const closeTime = Date.now() + DELAY

      chart.addTrade({
        amount: openPrice,
        closeTime,
        id,
        type: 'UP',

        // openTime: Date.now(),
      })
      idCounter++
      setTimeout(() => {
        chart.addResult({
          id,
          type: 'UP',
          reward: openPrice * 2,
          openPrice,
          closeTime,
        })
      }, DELAY)
    })
  }

  if (downBtn) {
    downBtn.addEventListener('click', () => {
      const id = Date.now() + '' + idCounter
      const openPrice = idCounter
      const closeTime = Date.now() + DELAY

      chart.addTrade({
        amount: openPrice,
        closeTime,
        id,
        type: 'DOWN',
        // openTime: Date.now(),
      })

      idCounter++

      setTimeout(() => {
        chart.addResult({
          id,
          type: 'DOWN',
          reward: openPrice * 2,
          openPrice,
          closeTime,
        })
      }, DELAY)
    })
  }

  if (toggleAutoScroll) {
    toggleAutoScroll.addEventListener('change', (e) => {
      const checkbox = e.target as HTMLInputElement

      if (checkbox) {
        chart.autoScroll(checkbox.checked)
      }
    })
  }

  chart.initChart()
  console.debug(chart)
})
