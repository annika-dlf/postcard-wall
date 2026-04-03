import { Layer, Rect, Stage } from 'react-konva'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FAB from './FAB'
import ImagePicker from './ImagePicker'
import PostcardEditor from './PostcardEditor'
import PostcardNode from './PostcardNode'
import PostcardModal from './PostcardModal'
import {
  getClusterBounds,
  randomPlacementOffset,
  randomRotation,
  resolveOverlap,
} from '../lib/postcardUtils'
import { CARD_HEIGHT, CARD_WIDTH, POSTCARD_MESSAGE_FONT_STACK, PRESET_IMAGES } from '../constants/presets'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

const INITIAL_VIEWPORT = { x: 0, y: 0, scale: 1 }
const LONG_PRESS_MS = 500

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
      setPostcards(data)
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
          const next = payload?.new
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
      setPostcards((prev) => (prev.some((p) => p.id === data.id) ? prev : [...prev, data]))
    }
    setEditorOpen(false)
  }

  const handleDownload = async (postcard) => {
    const strokeSvg = (strokes) =>
      (strokes || [])
        .map((stroke) => {
          const points = stroke.points?.map((p) => `${p.x},${p.y}`).join(' ') || ''
          if (!points) return ''
          return `<polyline points="${points}" fill="none" stroke="${stroke.color}" stroke-width="${stroke.size}" stroke-linecap="round" stroke-linejoin="round" />`
        })
        .join('')

    const wrapper = document.createElement('div')
    wrapper.style.width = `${CARD_WIDTH}px`
    wrapper.style.background = '#fff'
    wrapper.style.padding = '12px'
    wrapper.innerHTML = `<div style="position:relative;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;margin-bottom:12px">
      <img src="${postcard.image_url}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" style="display:block;object-fit:cover;filter:grayscale(1)" />
      <svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" style="position:absolute;inset:0;mix-blend-mode:multiply">${strokeSvg(postcard.front_drawing)}</svg>
    </div>
      <div style="width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;background:#fffdf7;border:1px solid rgba(0,0,0,0.1);position:relative;overflow:hidden">
        <div style="position:absolute;inset:12px;overflow:auto;box-sizing:border-box">
          <div style="min-height:100%;width:100%;display:flex;align-items:center;justify-content:center;box-sizing:border-box">
            <div style="font-family:${POSTCARD_MESSAGE_FONT_STACK};font-size:${postcard.text_style?.size ?? 13}pt;text-align:center;white-space:pre-wrap;word-break:break-word;max-width:100%">${postcard.text_content || ''}</div>
          </div>
        </div>
      </div>`
    document.body.appendChild(wrapper)

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH + 24}" height="${CARD_HEIGHT * 2 + 36}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${wrapper.innerHTML}</div>
      </foreignObject>
    </svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = CARD_WIDTH + 24
      canvas.height = CARD_HEIGHT * 2 + 36
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `postcard-${postcard.id}.png`
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(wrapper)

      setPostcards((prev) =>
        prev.map((p) =>
          p.id === postcard.id ? { ...p, download_count: (p.download_count || 0) + 1 } : p,
        ),
      )
      if (supabase) {
        await supabase.rpc('increment_download_count', { card_id: postcard.id })
      }
    }
    image.src = url
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
          {Array.from({ length: 240 }).map((_, idx) => (
            <Rect
              key={idx}
              x={-10000 + (idx % 20) * 1000}
              y={-10000 + Math.floor(idx / 20) * 800}
              width={1}
              height={20000}
              fill="rgba(0,0,0,0.03)"
            />
          ))}
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
