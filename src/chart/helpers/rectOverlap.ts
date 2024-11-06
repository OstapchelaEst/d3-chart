interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export const rectOverlap = (A: Rect, B: Rect): boolean => {
  const noHorizontalOverlap = A.x + A.width <= B.x || B.x + B.width <= A.x
  const noVerticalOverlap = A.y + A.height <= B.y || B.y + B.height <= A.y

  return !(noHorizontalOverlap || noVerticalOverlap)
}
