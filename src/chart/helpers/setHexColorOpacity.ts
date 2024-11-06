/**
 * Возращает hex цвет с указанной прозрачностью.
 * @param hex - hex код цвета.
 * @param opacity - прозрачность.
 */
export const setHexColorOpacity = (hex: string, opacity: number) => {
  opacity = Math.max(0, Math.min(1, opacity))

  hex = hex.replace('#', '')

  return `#${hex}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')}`
}
