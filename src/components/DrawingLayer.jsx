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
              className={size === s ? 'active' : ''}
              onClick={() => setSize(s)}
            >
              {s}px
            </button>
          ))}
        </div>
        <button onClick={() => setTool(tool === 'eraser' ? 'brush' : 'eraser')}>
          {tool === 'eraser' ? 'Brush' : 'Eraser'}
        </button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
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
