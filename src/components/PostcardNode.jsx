import { Group, Rect, Image as KonvaImage } from 'react-konva'
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
      {image ? (
        <KonvaImage image={image} width={CARD_WIDTH} height={CARD_HEIGHT} cornerRadius={6} />
      ) : null}
      <Rect
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        cornerRadius={6}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth={1}
      />
    </Group>
  )
}

export default PostcardNode
