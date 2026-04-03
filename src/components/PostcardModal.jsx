import { useEffect, useState } from 'react'
import { CARD_HEIGHT, CARD_WIDTH, POSTCARD_MESSAGE_FONT_STACK } from '../constants/presets'

function strokeSvg(strokes) {
  return (strokes || [])
    .map((stroke) => {
      const points = stroke.points?.map((p) => `${p.x},${p.y}`).join(' ') || ''
      return `<polyline points="${points}" fill="none" stroke="${stroke.color}" stroke-width="${stroke.size}" stroke-linecap="round" stroke-linejoin="round" />`
    })
    .join('')
}

function postcardMarkup(postcard, side = 'front', { fill = false } = {}) {
  if (!postcard) return ''

  const box = fill
    ? 'position:relative;width:100%;height:100%;'
    : `position:relative;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;`

  if (side === 'front') {
    return `
      <div style="${box}border-radius:0;overflow:hidden;background:#fffdf7;border:1px solid rgba(0,0,0,0.14)">
        <img src="${postcard.image_url}" style="display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1)" />
        <svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" style="position:absolute;inset:0;mix-blend-mode:multiply">${strokeSvg(postcard.front_drawing)}</svg>
      </div>
    `
  }

  const sizePt = (postcard.text_style?.size ?? 13) * 1.3

  return `
    <div style="${box}border-radius:0;overflow:hidden;background:#fffdf7;border:1px solid rgba(0,0,0,0.14)">
      <svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" style="position:absolute;inset:0">${strokeSvg(postcard.back_drawing)}</svg>
      <div style="position:absolute;inset:16px;overflow:auto;box-sizing:border-box">
        <div style="min-height:100%;width:100%;display:flex;align-items:center;justify-content:center;box-sizing:border-box">
          <div style="font-family:${POSTCARD_MESSAGE_FONT_STACK};font-size:${sizePt}pt;text-align:center;white-space:pre-wrap;word-break:break-word;max-width:100%;color:#141414">${(postcard.text_content || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</div>
        </div>
      </div>
    </div>
  `
}

function DownloadIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.75v10.5m0 0l-4-4m4 4l4-4M5.25 19.5h13.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PostcardModal({ postcard, onClose, onDownload, onShare }) {
  const [side, setSide] = useState('back')

  useEffect(() => {
    const hasFrontDrawing = (postcard?.front_drawing || []).some((stroke) => (stroke.points || []).length > 1)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSide(hasFrontDrawing ? 'front' : 'back')
  }, [postcard?.id, postcard?.front_drawing])

  if (!postcard) return null

  const saved = postcard.download_count || 0
  const memoryLabel =
    saved === 1 ? 'Memory saved 1 time' : `Memory saved ${saved} times`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-postcard"
          style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
        >
          <div
            className="modal-postcard-fill"
            dangerouslySetInnerHTML={{ __html: postcardMarkup(postcard, side, { fill: true }) }}
          />
        </div>
        <button
          type="button"
          className="flip-btn flip-btn--labeled modal-flip-btn"
          onClick={() => setSide(side === 'front' ? 'back' : 'front')}
        >
          Flip to {side === 'front' ? 'back' : 'front'}
        </button>
        <div className="modal-icon-actions">
          <button
            type="button"
            className="modal-icon-btn"
            onClick={() => onDownload(postcard)}
            aria-label="Download"
          >
            <DownloadIcon />
          </button>
          <button
            type="button"
            className="modal-icon-btn"
            onClick={() => onShare(postcard)}
            aria-label="Share"
          >
            <ShareIcon />
          </button>
        </div>
        <p className="modal-memory-caption">{memoryLabel}</p>
      </div>
    </div>
  )
}

export default PostcardModal
