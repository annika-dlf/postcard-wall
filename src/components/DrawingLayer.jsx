import { useRef, useState } from 'react'

const COLORS = ['#111111', '#de3163', '#0f766e', '#2563eb', '#9333ea', '#eab308']
const SIZES = [2, 4, 7]

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
              className={`swatch ${color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => {
                setTool('brush')
                setColor(c)
              }}
            />
          ))}
        </div>
        <div className="sizes">
          {SIZES.map((s) => (
            <button
              key={s}
              className={`size-option ${size === s ? 'active' : ''}`}
              onClick={() => setSize(s)}
              aria-label={`Brush size ${s}`}
              title={`Brush size ${s}`}
            >
              <span className="size-dot" style={{ width: s + 4, height: s + 4 }} />
            </button>
          ))}
        </div>
        <button
          className={`icon-button ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool(tool === 'eraser' ? 'brush' : 'eraser')}
          aria-label={tool === 'eraser' ? 'Use brush' : 'Use eraser'}
          title={tool === 'eraser' ? 'Use brush' : 'Use eraser'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.4 3.4a2 2 0 0 1 2.8 0l3.4 3.4a2 2 0 0 1 0 2.8l-8.3 8.3a3 3 0 0 1-2.1.9H7.3a3 3 0 0 1-2.1-.9l-1.1-1.1a2 2 0 0 1 0-2.8z" />
            <path d="M3 21h18" />
          </svg>
        </button>
        <button className="icon-button" onClick={undo} aria-label="Undo" title="Undo">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 7 4 12l5 5" />
            <path d="M20 12H4" />
          </svg>
        </button>
        <button className="icon-button" onClick={redo} aria-label="Redo" title="Redo">
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
