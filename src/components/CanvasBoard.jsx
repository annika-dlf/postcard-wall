import { Layer, Rect, Stage } from 'react-konva'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FAB from './FAB'
import ImagePicker from './ImagePicker'
import PostcardEditor from './PostcardEditor'
import PostcardNode from './PostcardNode'
import PostcardModal from './PostcardModal'
import { wrapPostcardTextLines } from '../lib/postcardTextLayout'
import {
  getClusterBounds,
  randomPlacementOffset,
  randomRotation,
  resolveOverlap,
} from '../lib/postcardUtils'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  POSTCARD_MESSAGE_FONT_FAMILY,
  POSTCARD_MESSAGE_FONT_STACK,
  POSTCARD_EXPORT_FONT_CALIBRATION,
  POSTCARD_TEXT_INSET,
  POSTCARD_TEXT_INNER_WIDTH,
  POSTCARD_TEXT_LINE_HEIGHT,
  PRESET_IMAGES,
  postcardMessageFontSizePt,
  withResolvedPresetImage,
} from '../constants/presets'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

const INITIAL_VIEWPORT = { x: 0, y: 0, scale: 1 }
const LONG_PRESS_MS = 500
const GRID_STEP = CARD_WIDTH / 6 // 6 vertical grid columns per postcard width
const GRID_LINE_COLOR = 'rgba(0,0,0,0.03)'
const GRID_RANGE_PADDING = 100 // extra world units beyond viewport to avoid popping

function CanvasBoard() {
  const navigate = useNavigate()
  const { id: deepLinkId } = useParams()
  const stageRef = useRef(null)
  const longPressRef = useRef(null)
  const pinchRef = useRef({ distance: 0 })
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT)
  const debouncedViewport = useDebouncedValue(viewport, 50)
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [postcards, setPostcards] = useState([])
  const [selected, setSelected] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0])
  const [dragEnabledId, setDragEnabledId] = useState(null)

  useEffect(() => {
    const resize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!supabase) return
      const { data, error } = await supabase.from('postcards').select('*').order('created_at', { ascending: true })
      if (!mounted) return
      if (error) {
        console.error('[Supabase] Failed to load postcards:', error)
        return
      }
      if (!data) return
      setPostcards(data.map(withResolvedPresetImage))
      const bounds = getClusterBounds(data)
      const clusterCx = (bounds.minX + bounds.maxX) / 2
      const clusterCy = (bounds.minY + bounds.maxY) / 2
      setViewport((prev) => ({
        ...prev,
        x: size.width / 2 - clusterCx,
        y: size.height / 2 - clusterCy,
      }))
    }

    load()

    if (!supabase) return
    const channel = supabase
      .channel('postcards-inserts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'postcards' }, (payload) => {
        setPostcards((prev) => {
          const next = withResolvedPresetImage(payload?.new)
          if (!next?.id) return prev
          // Avoid duplicates when we also optimistically insert after `.insert()`.
          if (prev.some((p) => p.id === next.id)) return prev
          return [...prev, next]
        })
      })
      .subscribe()

    return () => {
      mounted = false
      channel.unsubscribe()
    }
  }, [size.height, size.width])

  useEffect(() => {
    if (!deepLinkId || !postcards.length) return
    const found = postcards.find((p) => p.id === deepLinkId)
    if (!found) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewport((prev) => ({
      ...prev,
      x: size.width / 2 - found.x - CARD_WIDTH / 2,
      y: size.height / 2 - found.y - CARD_HEIGHT / 2,
    }))
    setSelected(found)
  }, [deepLinkId, postcards, size.height, size.width])

  const visiblePostcards = useMemo(() => {
    const buffer = 360
    const left = -debouncedViewport.x / debouncedViewport.scale - buffer
    const top = -debouncedViewport.y / debouncedViewport.scale - buffer
    const right = left + size.width / debouncedViewport.scale + buffer * 2
    const bottom = top + size.height / debouncedViewport.scale + buffer * 2

    return postcards.filter((p) => {
      const x = p.localX ?? p.x
      const y = p.localY ?? p.y
      return x + CARD_WIDTH > left && x < right && y + CARD_HEIGHT > top && y < bottom
    })
  }, [debouncedViewport, postcards, size.height, size.width])

  const openCreateFlow = () => {
    setPickerOpen(true)
  }

  const handleWheelOrPinch = (event) => {
    event.evt.preventDefault()
    const stage = stageRef.current
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    const direction = event.evt.deltaY > 0 ? -1 : 1
    const scaleBy = 1.04
    const nextScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clamped = Math.min(2.2, Math.max(0.5, nextScale))

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    setViewport({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
      scale: clamped,
    })
  }

  const handleTouchMove = (event) => {
    const touches = event.evt.touches
    if (!touches || touches.length !== 2) return
    event.evt.preventDefault()
    const stage = stageRef.current
    const [touchA, touchB] = touches
    const pointA = { x: touchA.clientX, y: touchA.clientY }
    const pointB = { x: touchB.clientX, y: touchB.clientY }
    const distance = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y)
    const center = { x: (pointA.x + pointB.x) / 2, y: (pointA.y + pointB.y) / 2 }

    if (!pinchRef.current.distance) {
      pinchRef.current.distance = distance
      return
    }

    const oldScale = stage.scaleX()
    const scaleFactor = distance / pinchRef.current.distance
    const clamped = Math.min(2.2, Math.max(0.5, oldScale * scaleFactor))
    const pointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    }

    setViewport({
      x: center.x - pointTo.x * clamped,
      y: center.y - pointTo.y * clamped,
      scale: clamped,
    })

    pinchRef.current.distance = distance
  }

  const handleCreate = async (draft) => {
    const center = {
      x: (size.width / 2 - viewport.x) / viewport.scale - CARD_WIDTH / 2,
      y: (size.height / 2 - viewport.y) / viewport.scale - CARD_HEIGHT / 2,
    }
    const jitter = randomPlacementOffset()
    const candidate = {
      x: center.x + jitter.x,
      y: center.y + jitter.y,
      rotation: randomRotation(),
    }
    const placed = resolveOverlap(postcards, candidate)

    const payload = {
      ...draft,
      x: placed.x,
      y: placed.y,
      rotation: placed.rotation,
    }

    if (!supabase) {
      const local = {
        ...payload,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        download_count: 0,
      }
      setPostcards((prev) => [...prev, local])
      setEditorOpen(false)
      return
    }

    const { data, error } = await supabase.from('postcards').insert(payload).select('*').single()
    if (error) {
      console.error('[Supabase] Failed to insert postcard:', error)
      // Fallback: still show the postcard on the canvas even if the insert fails.
      const local = {
        ...payload,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        download_count: 0,
      }
      setPostcards((prev) => (prev.some((p) => p.id === local.id) ? prev : [...prev, local]))
    } else if (data?.id) {
      setPostcards((prev) =>
        prev.some((p) => p.id === data.id) ? prev : [...prev, withResolvedPresetImage(data)],
      )
    }
    setEditorOpen(false)
  }

  const handleDownload = async (postcard) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    // Download layout:
    // 1080 x 1920 canvas
    // - Front (photo) card: 560 x 747, 50px from left, 180px from top
    // - Back (message) card: 560 x 747, 50px from right, overlapping the front by 140px
    // - URL label centered at the bottom
    const totalWidth = 1080
    const totalHeight = 1920

    const cardWidth = 560
    const cardHeight = 747

    const photo = {
      x: 50,
      y: 180,
      w: cardWidth,
      h: cardHeight,
    }

    const message = {
      x: totalWidth - 50 - cardWidth,
      // Top of the back overlaps the front by 140px.
      y: photo.y + cardHeight - 140,
      w: cardWidth,
      h: cardHeight,
    }

    const canvas = document.createElement('canvas')
    // Increase output pixel density (keeps apparent size the same).
    const resolutionScale = 3
    canvas.width = totalWidth * resolutionScale
    canvas.height = totalHeight * resolutionScale
    const ctx = canvas.getContext('2d')

    if (!ctx) return
    ctx.setTransform(resolutionScale, 0, 0, resolutionScale, 0, 0)

    const roundRectPath = (x, y, w, h, r) => {
      const radius = Math.max(0, Math.min(r, w / 2, h / 2))
      if (!radius) {
        ctx.rect(x, y, w, h)
        return
      }
      ctx.moveTo(x + radius, y)
      ctx.arcTo(x + w, y, x + w, y + h, radius)
      ctx.arcTo(x + w, y + h, x, y + h, radius)
      ctx.arcTo(x, y + h, x, y, radius)
      ctx.arcTo(x, y, x + w, y, radius)
      ctx.closePath()
    }

    const drawCard = (face, background = '#ffffff') => {
      // Card with shadow, no border outline.
      ctx.save()
      ctx.beginPath()
      roundRectPath(face.x, face.y, face.w, face.h, 4)
      ctx.shadowColor = 'rgba(0,0,0,0.25)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 4
      ctx.shadowOffsetY = 4
      ctx.fillStyle = background
      ctx.fill()
      ctx.restore()
    }

    const loadImage = async (src) => {
      if (!src) return null
      return await new Promise((resolve) => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
      })
    }

    const getStrokePoints = (stroke) => {
      const pts = (stroke?.points || [])
        .map((p) => [Number(p?.x), Number(p?.y)])
        .filter((xy) => Number.isFinite(xy[0]) && Number.isFinite(xy[1]))
      return pts
    }

    const drawStrokes = (
      strokes,
      { composite = 'source-over', scaleX = 1, scaleY = 1, strokeScale = (scaleX + scaleY) / 2 } = {},
    ) => {
      ctx.save()
      ctx.globalCompositeOperation = composite
      for (const stroke of strokes || []) {
        const pts = getStrokePoints(stroke)
        if (pts.length < 2) continue

        ctx.beginPath()
        ctx.moveTo(pts[0][0] * scaleX, pts[0][1] * scaleY)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * scaleX, pts[i][1] * scaleY)

        ctx.strokeStyle = stroke.color || '#000'
        ctx.lineWidth = (Number(stroke.size) || 2) * strokeScale
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
      }
      ctx.restore()
    }

    const stampSrc = `${import.meta.env.BASE_URL}Stamp.png`
    const [frontImg, stampImg] = await Promise.all([
      loadImage(postcard.image_url),
      loadImage(stampSrc),
    ])

    // Background: use the postcard image as a soft, full-bleed backdrop.
    ctx.fillStyle = '#d8d0c1'
    ctx.fillRect(0, 0, totalWidth, totalHeight)
    if (frontImg) {
      ctx.save()
      const coverScale = Math.max(totalWidth / frontImg.width, totalHeight / frontImg.height)
      const coverW = frontImg.width * coverScale
      const coverH = frontImg.height * coverScale
      const offsetX = (totalWidth - coverW) / 2
      const offsetY = (totalHeight - coverH) / 2
      ctx.filter = 'blur(12px)'
      ctx.drawImage(frontImg, offsetX, offsetY, coverW, coverH)
      ctx.restore()
    }

    // Slight wash over the background so the cards pop.
    ctx.save()
    ctx.globalAlpha = 0.85
    ctx.fillStyle = '#d8d0c1'
    ctx.fillRect(0, 0, totalWidth, totalHeight)
    ctx.restore()

    // Photo card (front).
    drawCard(photo, '#111111')
    if (frontImg) {
      ctx.save()
      ctx.beginPath()
      roundRectPath(photo.x, photo.y, photo.w, photo.h, 4)
      ctx.clip()
      ctx.drawImage(frontImg, photo.x, photo.y, photo.w, photo.h)
      ctx.restore()
    }

    // Draw front strokes on top of the photo (multiply blend).
    ctx.save()
    ctx.translate(photo.x, photo.y)
    drawStrokes(postcard.front_drawing, {
      composite: 'multiply',
      scaleX: photo.w / CARD_WIDTH,
      scaleY: photo.h / CARD_HEIGHT,
    })
    ctx.restore()

    // Message card (back).
    drawCard(message, '#fffefb')

    // Optional back drawing (if present) on the message card.
    ctx.save()
    ctx.translate(message.x, message.y)
    drawStrokes(postcard.back_drawing, {
      composite: 'source-over',
      scaleX: message.w / CARD_WIDTH,
      scaleY: message.h / CARD_HEIGHT,
    })
    ctx.restore()

    // Message text on the bottom card (inset + font scale match editor / modal on CARD_WIDTH×CARD_HEIGHT).
    const padX = (POSTCARD_TEXT_INSET * message.w) / CARD_WIDTH
    const padY = (POSTCARD_TEXT_INSET * message.h) / CARD_HEIGHT
    const inner = {
      x: message.x + padX,
      y: message.y + padY,
      w: message.w - padX * 2,
      h: message.h - padY * 2,
    }
    const exportTextScale = inner.w / POSTCARD_TEXT_INNER_WIDTH
    const fontPt = postcardMessageFontSizePt(postcard.text_style)
    const fontPx =
      fontPt * (96 / 72) * exportTextScale * POSTCARD_EXPORT_FONT_CALIBRATION

    if (document.fonts?.load) {
      try {
        await document.fonts.load(`${fontPx}px ${POSTCARD_MESSAGE_FONT_FAMILY}`)
      } catch {
        /* ignore */
      }
      await document.fonts.ready
    }

    ctx.save()
    // Clip to message area so we don't draw outside the back face.
    ctx.beginPath()
    ctx.rect(inner.x, inner.y, inner.w, inner.h)
    ctx.clip()
    ctx.fillStyle = '#141414'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `${fontPx}px ${POSTCARD_MESSAGE_FONT_STACK}`

    const lines = wrapPostcardTextLines(ctx, postcard.text_content || '', inner.w)
    const lineHeight = fontPx * POSTCARD_TEXT_LINE_HEIGHT
    const totalTextHeight = lines.length * lineHeight
    const topPad = totalTextHeight <= inner.h ? (inner.h - totalTextHeight) / 2 : 0
    const startY = inner.y + topPad + lineHeight / 2

    // Draw centered lines within the inner rect.
    ctx.save()
    ctx.beginPath()
    ctx.rect(inner.x, inner.y, inner.w, inner.h)
    ctx.clip()
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], inner.x + inner.w / 2, startY + i * lineHeight)
    }
    ctx.restore()
    ctx.restore()

    // Stamp: 386×236, 180px from canvas left, 270px from canvas bottom.
    const stampW = 386
    const stampH = 236
    const stampX = 180
    const stampY = totalHeight - 270 - stampH
    if (stampImg) {
      ctx.drawImage(stampImg, stampX, stampY, stampW, stampH)
    }

    // URL label at the very bottom, centered (not clipped by message area).
    const labelText = 'take-this-with-you.vercel.app/'
    ctx.save()
    ctx.font = `40px system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif`
    const labelMetrics = ctx.measureText(labelText)
    const labelPaddingX = 24
    const labelPaddingY = 24
    const labelW = labelMetrics.width + labelPaddingX * 2
    const labelH = 16 + labelPaddingY * 2
    const labelX = totalWidth / 2 - labelW / 2
    const labelY = totalHeight - 110 - labelH

    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 4
    ctx.shadowOffsetY = 4
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(labelX, labelY, labelW, labelH)
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(labelText, labelX + labelW / 2, labelY + labelH / 2)
    ctx.restore()

    // Download.
    // Give the browser a tick to avoid any rare canvas capture timing issues.
    await sleep(0)
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `postcard-${postcard.id}.png`
    a.click()

    setPostcards((prev) =>
      prev.map((p) => (p.id === postcard.id ? { ...p, download_count: (p.download_count || 0) + 1 } : p)),
    )
    if (supabase) {
      await supabase.rpc('increment_download_count', { card_id: postcard.id })
    }
  }

  const handleShare = async (postcard) => {
    const shareUrl = `${window.location.origin}/card/${postcard.id}`
    await navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div className="board-root">
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        draggable
        onDragEnd={(e) =>
          setViewport((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() }))
        }
        onWheel={handleWheelOrPinch}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          pinchRef.current.distance = 0
        }}
      >
        <Layer>
          <Rect x={-10000} y={-10000} width={20000} height={20000} fill="#f4efe6" />
          {(() => {
            // Convert viewport (screen space) to world space so grid stays stable while panning/zooming.
            const leftWorld = -viewport.x / viewport.scale
            const topWorld = -viewport.y / viewport.scale
            const rightWorld = leftWorld + size.width / viewport.scale
            const bottomWorld = topWorld + size.height / viewport.scale

            const paddedLeft = leftWorld - GRID_RANGE_PADDING
            const paddedTop = topWorld - GRID_RANGE_PADDING
            const paddedRight = rightWorld + GRID_RANGE_PADDING
            const paddedBottom = bottomWorld + GRID_RANGE_PADDING

            const startX = Math.floor(paddedLeft / GRID_STEP) * GRID_STEP
            const endX = Math.ceil(paddedRight / GRID_STEP) * GRID_STEP
            const startY = Math.floor(paddedTop / GRID_STEP) * GRID_STEP
            const endY = Math.ceil(paddedBottom / GRID_STEP) * GRID_STEP

            const verticalLines = []
            for (let x = startX; x <= endX; x += GRID_STEP) {
              verticalLines.push(
                <Rect key={`v-${x}`} x={x} y={paddedTop} width={1} height={paddedBottom - paddedTop} fill={GRID_LINE_COLOR} />,
              )
            }

            const horizontalLines = []
            for (let y = startY; y <= endY; y += GRID_STEP) {
              horizontalLines.push(
                <Rect
                  key={`h-${y}`}
                  x={paddedLeft}
                  y={y}
                  width={paddedRight - paddedLeft}
                  height={1}
                  fill={GRID_LINE_COLOR}
                />,
              )
            }

            return (
              <>
                {verticalLines}
                {horizontalLines}
              </>
            )
          })()}
          {visiblePostcards.map((p) => (
            <PostcardNode
              key={p.id}
              postcard={p}
              draggable={dragEnabledId === p.id}
              onDragStart={() => setDragEnabledId(p.id)}
              onDragEnd={({ x, y }) => {
                setPostcards((prev) => prev.map((card) => (card.id === p.id ? { ...card, localX: x, localY: y } : card)))
                setDragEnabledId(null)
              }}
              onClick={() => {
                setSelected(p)
                navigate(`/card/${p.id}`)
              }}
              onPointerDown={() => {
                longPressRef.current = setTimeout(() => setDragEnabledId(p.id), LONG_PRESS_MS)
              }}
              onPointerUp={() => {
                clearTimeout(longPressRef.current)
              }}
            />
          ))}
        </Layer>
      </Stage>

      <FAB onClick={openCreateFlow} />

      {pickerOpen ? (
        <ImagePicker
          selectedImage={selectedImage}
          onSelect={setSelectedImage}
          onNext={() => {
            setPickerOpen(false)
            setEditorOpen(true)
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      {editorOpen ? (
        <PostcardEditor
          imageUrl={selectedImage}
          onSave={handleCreate}
          onClose={() => setEditorOpen(false)}
        />
      ) : null}

      {selected ? (
        <PostcardModal
          postcard={selected}
          onClose={() => {
            setSelected(null)
            navigate('/')
          }}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      ) : null}
    </div>
  )
}

export default CanvasBoard
