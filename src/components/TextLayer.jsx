import { useEffect, useMemo, useRef } from 'react'

const MIN_TEXT_SIZE = 6
const MAX_TEXT_SIZE = 72

function TextLayer({ text, style, onTextChange, onStyleChange }) {
  const nextStyle = style || { size: 18 }
  const textareaRef = useRef(null)
  const measureRef = useRef(null)

  const content = useMemo(() => (text || ' ').replace(/\n$/, '\n '), [text])

  useEffect(() => {
    const textarea = textareaRef.current
    const measure = measureRef.current
    if (!textarea || !measure) return

    const fitText = () => {
      const width = textarea.clientWidth
      const height = textarea.clientHeight
      if (!width || !height) return

      measure.style.width = `${width}px`
      let low = MIN_TEXT_SIZE
      let high = MAX_TEXT_SIZE
      let best = MIN_TEXT_SIZE

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        measure.style.fontSize = `${mid}px`
        measure.textContent = content

        if (measure.offsetHeight <= height) {
          best = mid
          low = mid + 1
        } else {
          high = mid - 1
        }
      }

      if (nextStyle.size !== best) {
        onStyleChange({ ...nextStyle, size: best })
      }
    }

    fitText()
    const observer = new ResizeObserver(fitText)
    observer.observe(textarea)
    return () => observer.disconnect()
  }, [content, nextStyle, onStyleChange])

  return (
    <div className="text-layer-wrap">
      <textarea
        ref={textareaRef}
        className="text-editor"
        style={{ textAlign: 'left', fontSize: `${nextStyle.size}px` }}
        value={text || ''}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Write your postcard message..."
      />
      <div ref={measureRef} className="text-measure" aria-hidden="true" />
    </div>
  )
}

export default TextLayer
