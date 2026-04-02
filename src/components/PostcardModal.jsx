import { useMemo, useState } from 'react'
import { CARD_HEIGHT, CARD_WIDTH } from '../constants/presets'

function strokeSvg(strokes) {
  return (strokes || [])
    .map((stroke) => {
      const points = stroke.points?.map((p) => `${p.x},${p.y}`).join(' ') || ''
      return `<polyline points="${points}" fill="none" stroke="${stroke.color}" stroke-width="${stroke.size}" stroke-linecap="round" stroke-linejoin="round" />`
    })
    .join('')
}

function postcardMarkup(postcard, side = 'front') {
  if (!postcard) return ''

  if (side === 'front') {
    return `
      <div style="position:relative;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;border-radius:8px;overflow:hidden;background:#fffdf7;border:1px solid rgba(0,0,0,0.14)">
        <img src="${postcard.image_url}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1)" />
        <svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" style="position:absolute;inset:0;mix-blend-mode:multiply">${strokeSvg(postcard.front_drawing)}</svg>
      </div>
    `
  }

  const align = postcard.text_style?.align || 'left'
  const size = postcard.text_style?.size || 18

  return `
    <div style="position:relative;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;border-radius:8px;overflow:hidden;background:#fffdf7;border:1px solid rgba(0,0,0,0.14)">
      <svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" style="position:absolute;inset:0">${strokeSvg(postcard.back_drawing)}</svg>
      <div style="position:absolute;inset:16px;font-family:system-ui;font-size:${size}px;text-align:${align};white-space:pre-wrap;overflow:hidden;color:#141414">${(postcard.text_content || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</div>
    </div>
  `
}

function PostcardModal({ postcard, onClose, onDownload, onShare }) {
  const [side, setSide] = useState('front')
  const dynamicRotation = useMemo(() => (Math.random() > 0.5 ? 5 : -5), [])

  if (!postcard) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-postcard"
          style={{ transform: `rotate(${postcard.rotation + dynamicRotation}deg)` }}
        >
          <div dangerouslySetInnerHTML={{ __html: postcardMarkup(postcard, side) }} />
        </div>
        <div className="modal-controls">
          <button onClick={() => setSide(side === 'front' ? 'back' : 'front')}>
            Flip to {side === 'front' ? 'back' : 'front'}
          </button>
          <button onClick={() => onDownload(postcard)}>Download</button>
          <button onClick={() => onShare(postcard)}>Share</button>
          <p>Downloaded {postcard.download_count || 0} times</p>
        </div>
      </div>
    </div>
  )
}

export default PostcardModal
