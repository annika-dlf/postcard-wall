import { useRef, useState } from 'react'

const COLORS = ['#111111', '#de3163', '#0f766e', '#2563eb', '#9333ea', '#eab308']
const SIZES = [2, 4, 7]

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  )
}

function EraserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.4 3.4a2 2 0 0 1 2.8 0l3.4 3.4a2 2 0 0 1 0 2.8l-8.3 8.3a3 3 0 0 1-2.1.9H7.3a3 3 0 0 1-2.1-.9l-1.1-1.1a2 2 0 0 1 0-2.8z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M3 21h18"
      />
    </svg>
  )
}

function DrawingLayer({ value, onChange, multiply = false }) {
  const [tool, setTool] = useState('brush')
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(SIZES[1])
  const [redoStack, setRedoStack] = useState([])
  const drawingRef = useRef(false)

  const strokes = value || []

  const addPoint = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }

    if (!drawingRef.current) {
      drawingRef.current = true
      setRedoStack([])
      onChange([
        ...strokes,
        {
          points: [point],
          color: tool === 'eraser' ? '#ffffff' : color,
          size,
          eraser: tool === 'eraser',
        },
      ])
      return
    }

    const next = [...strokes]
    next[next.length - 1] = {
      ...next[next.length - 1],
      points: [...next[next.length - 1].points, point],
    }
    onChange(next)
  }

  const endStroke = () => {
    drawingRef.current = false
  }

  const undo = () => {
    if (!strokes.length) return
    const next = [...strokes]
    const last = next.pop()
    setRedoStack((prev) => [...prev, last])
    onChange(next)
  }

  const redo = () => {
    if (!redoStack.length) return
    const nextRedo = [...redoStack]
    const stroke = nextRedo.pop()
    setRedoStack(nextRedo)
    onChange([...strokes, stroke])
  }

  return (
    <div className="drawing-tool-wrap">
      <div className="drawing-tools">
        <div className="swatches">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch ${color === c ? 'active' : ''}`}
              onClick={() => {
                setTool('brush')
                setColor(c)
              }}
              aria-label={`Color ${c}`}
              title={c}
            >
              <span className="swatch-fill" style={{ background: c }} />
            </button>
          ))}
        </div>
        <div className="sizes">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={`size-option ${size === s ? 'active' : ''}`}
              onClick={() => setSize(s)}
              aria-label={`Brush size ${s}`}
              title={`Brush size ${s}`}
            >
              <span className="size-dot" style={{ width: s + 6, height: s + 6 }} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="icon-button active"
          onClick={() => setTool(tool === 'eraser' ? 'brush' : 'eraser')}
          aria-label={tool === 'eraser' ? 'Switch to pen' : 'Switch to eraser'}
          title={tool === 'eraser' ? 'Switch to pen' : 'Switch to eraser'}
        >
          {tool === 'eraser' ? <EraserIcon /> : <PenIcon />}
        </button>
        <button type="button" className="icon-button" onClick={undo} aria-label="Undo" title="Undo">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 7 4 12l5 5" />
            <path d="M20 12H4" />
          </svg>
        </button>
        <button type="button" className="icon-button" onClick={redo} aria-label="Redo" title="Redo">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 7 5 5-5 5" />
            <path d="M4 12h16" />
          </svg>
        </button>
      </div>

      <svg
        className={`drawing-surface ${multiply ? 'multiply' : ''}`}
        onPointerDown={addPoint}
        onPointerMove={(e) => {
          if (drawingRef.current) addPoint(e)
        }}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
      >
        {strokes.map((stroke, idx) => (
          <polyline
            key={idx}
            points={stroke.points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.size}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  )
}

export default DrawingLayer
