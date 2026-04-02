import { CARD_HEIGHT, CARD_WIDTH } from '../constants/presets'

export function randomRotation() {
  return Math.random() * 30 - 15
}

export function randomPlacementOffset() {
  return {
    x: Math.random() * 40 - 20,
    y: Math.random() * 30 - 15,
  }
}

export function doesOverlap(existing, candidate) {
  const pad = 8
  return existing.some((card) => {
    return !(
      candidate.x + CARD_WIDTH + pad < card.x ||
      candidate.x > card.x + CARD_WIDTH + pad ||
      candidate.y + CARD_HEIGHT + pad < card.y ||
      candidate.y > card.y + CARD_HEIGHT + pad
    )
  })
}

export function resolveOverlap(existing, candidate) {
  const next = { ...candidate }
  while (doesOverlap(existing, next)) {
    next.x += 40
  }
  return next
}

export function getClusterBounds(postcards) {
  if (!postcards.length) {
    return {
      minX: -CARD_WIDTH / 2,
      minY: -CARD_HEIGHT / 2,
      maxX: CARD_WIDTH / 2,
      maxY: CARD_HEIGHT / 2,
    }
  }

  return postcards.reduce(
    (acc, p) => ({
      minX: Math.min(acc.minX, p.x),
      minY: Math.min(acc.minY, p.y),
      maxX: Math.max(acc.maxX, p.x + CARD_WIDTH),
      maxY: Math.max(acc.maxY, p.y + CARD_HEIGHT),
    }),
    {
      minX: postcards[0].x,
      minY: postcards[0].y,
      maxX: postcards[0].x + CARD_WIDTH,
      maxY: postcards[0].y + CARD_HEIGHT,
    },
  )
}
