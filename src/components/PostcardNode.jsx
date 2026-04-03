import { Group, Rect, Image as KonvaImage, Line } from 'react-konva'
import { useEffect, useState } from 'react'
import { CARD_HEIGHT, CARD_WIDTH } from '../constants/presets'

function useImage(src) {
  const [image, setImage] = useState(null)

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    img.onload = () => setImage(img)
  }, [src])

  return image
}

function PostcardNode({
  postcard,
  onClick,
  onDragStart,
  onDragEnd,
  onPointerDown,
  onPointerUp,
  draggable,
}) {
  const image = useImage(postcard.image_url)
  const strokes = postcard?.front_drawing || []

  return (
    <Group
      x={postcard.localX ?? postcard.x}
      y={postcard.localY ?? postcard.y}
      rotation={postcard.rotation}
      draggable={draggable}
      onClick={onClick}
      onTap={onClick}
      onDragStart={onDragStart}
      onDragEnd={(e) => onDragEnd({ x: e.target.x(), y: e.target.y() })}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      onMouseUp={onPointerUp}
      onTouchEnd={onPointerUp}
    >
      {/* Shadow wrapper so drop shadow isn't clipped */}
      <Rect
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        fill="#fffdf7"
        cornerRadius={6}
        shadowColor="#000"
        shadowBlur={16}
        shadowOffset={{ x: 0, y: 8 }}
        shadowOpacity={0.22}
      />

      {/* Everything visually on the postcard is clipped to the *rotated* card shape. */}
      <Group
        clipFunc={(ctx) => {
          const pad = 8
          const x = -pad
          const y = -pad
          const w = CARD_WIDTH + pad * 2
          const h = CARD_HEIGHT + pad * 2
          const r = 6 + pad
          const rr = Math.min(r, w / 2, h / 2)

          // Rounded-rect path for clipping.
          ctx.beginPath()
          ctx.moveTo(x + rr, y)
          ctx.lineTo(x + w - rr, y)
          ctx.arcTo(x + w, y, x + w, y + rr, rr)
          ctx.lineTo(x + w, y + h - rr)
          ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr)
          ctx.lineTo(x + rr, y + h)
          ctx.arcTo(x, y + h, x, y + h - rr, rr)
          ctx.lineTo(x, y + rr)
          ctx.arcTo(x, y, x + rr, y, rr)
          ctx.closePath()
        }}
      >
        {image ? (
          <KonvaImage image={image} width={CARD_WIDTH} height={CARD_HEIGHT} cornerRadius={6} />
        ) : null}

        {strokes.map((stroke, idx) => {
          const points = (stroke.points || [])
            .map((p) => [Number(p.x), Number(p.y)])
            .flat()
            .filter((n) => typeof n === 'number' && Number.isFinite(n))

          if (points.length < 4) return null

          return (
            <Line
              key={idx}
              points={points}
              stroke={stroke.color}
              strokeWidth={stroke.size}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation="multiply"
            />
          )
        })}

        <Rect
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          cornerRadius={6}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth={1}
        />
      </Group>
    </Group>
  )
}

export default PostcardNode
