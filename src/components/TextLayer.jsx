import { useLayoutEffect, useRef } from 'react'

function trimToFitDisplayedText(text, textarea, maxHeightPx) {
  const chars = [...String(text ?? '')]
  textarea.style.maxHeight = `${maxHeightPx}px`
  textarea.value = chars.join('')
  while (chars.length > 0 && textarea.scrollHeight > textarea.clientHeight) {
    chars.pop()
    textarea.value = chars.join('')
  }
  return chars.join('')
}

function TextLayer({ text, onTextChange }) {
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  useLayoutEffect(() => {
    const sc = scrollRef.current
    const ta = textareaRef.current
    if (!sc || !ta) return

    const clamp = () => {
      const scrollEl = scrollRef.current
      const taEl = textareaRef.current
      if (!scrollEl || !taEl) return
      const mh = scrollEl.clientHeight
      if (mh <= 0) return
      const fitted = trimToFitDisplayedText(text, taEl, mh)
      if (fitted !== text) onTextChange(fitted)
    }

    clamp()
    const ro = new ResizeObserver(clamp)
    ro.observe(sc)
    return () => ro.disconnect()
  }, [text, onTextChange])

  return (
    <div className="text-layer-wrap">
      <div className="text-editor-scroll" ref={scrollRef}>
        <div className="text-editor-center-wrap">
          <textarea
            ref={textareaRef}
            className="text-editor"
            value={text || ''}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="I will always remember ..."
            rows={1}
          />
        </div>
      </div>
    </div>
  )
}

export default TextLayer
