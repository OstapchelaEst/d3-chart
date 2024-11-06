export const getTextMedia = (ctx: CanvasRenderingContext2D, text: string) => {
  const textMetrics = ctx.measureText(text)

  const height =
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent

  const width = textMetrics.width

  return {
    width,
    height,
  }
}
