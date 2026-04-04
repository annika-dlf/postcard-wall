import { useEffect, useState } from 'react'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  POSTCARD_MESSAGE_FONT_STACK,
  POSTCARD_TEXT_INSET,
  POSTCARD_TEXT_LINE_HEIGHT,
  postcardMessageFontSizePt,
} from '../constants/presets'

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
        <img src="${postcard.image_url}" style="display:block;width:100%;height:100%;object-fit:cover" />
        <svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" style="position:absolute;inset:0;mix-blend-mode:multiply">${strokeSvg(postcard.front_drawing)}</svg>
      </div>
    `
  }

  const sizePt = postcardMessageFontSizePt(postcard.text_style)

  return `
    <div style="${box}border-radius:0;overflow:hidden;background:#fffdf7;border:1px solid rgba(0,0,0,0.14)">
      <svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" style="position:absolute;inset:0">${strokeSvg(postcard.back_drawing)}</svg>
      <div style="position:absolute;inset:${POSTCARD_TEXT_INSET}px;overflow:hidden;box-sizing:border-box">
        <div style="min-height:100%;width:100%;display:flex;align-items:center;justify-content:center;box-sizing:border-box">
          <div style="font-family:${POSTCARD_MESSAGE_FONT_STACK};font-size:${sizePt}pt;line-height:${POSTCARD_TEXT_LINE_HEIGHT};text-align:center;white-space:pre-wrap;overflow-wrap:break-word;word-break:break-word;max-width:100%;color:#141414">${(postcard.text_content || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</div>
        </div>
      </div>
    </div>
  `
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M15.5007 20.6842C15.3451 20.6282 15.2007 20.5335 15.0673 20.4002L10.2673 15.6002C10.0007 15.3335 9.87265 15.0224 9.88332 14.6668C9.89398 14.3113 10.022 14.0002 10.2673 13.7335C10.534 13.4668 10.8509 13.3282 11.218 13.3175C11.5851 13.3068 11.9015 13.4344 12.1673 13.7002L14.6673 16.2002V6.66683C14.6673 6.28906 14.7953 5.97261 15.0513 5.7175C15.3073 5.46239 15.6238 5.33439 16.0007 5.3335C16.3775 5.33261 16.6944 5.46061 16.9513 5.7175C17.2082 5.97439 17.3358 6.29083 17.334 6.66683V16.2002L19.834 13.7002C20.1007 13.4335 20.4175 13.3055 20.7847 13.3162C21.1518 13.3268 21.4682 13.4659 21.734 13.7335C21.9784 14.0002 22.1064 14.3113 22.118 14.6668C22.1295 15.0224 22.0015 15.3335 21.734 15.6002L16.934 20.4002C16.8007 20.5335 16.6562 20.6282 16.5007 20.6842C16.3451 20.7402 16.1784 20.7677 16.0007 20.7668C15.8229 20.7659 15.6562 20.7384 15.5007 20.6842ZM8.00065 26.6668C7.26732 26.6668 6.63976 26.4059 6.11798 25.8842C5.59621 25.3624 5.33487 24.7344 5.33398 24.0002V21.3335C5.33398 20.9557 5.46198 20.6393 5.71798 20.3842C5.97398 20.1291 6.29043 20.0011 6.66732 20.0002C7.04421 19.9993 7.3611 20.1273 7.61798 20.3842C7.87487 20.6411 8.00243 20.9575 8.00065 21.3335V24.0002H24.0007V21.3335C24.0007 20.9557 24.1287 20.6393 24.3847 20.3842C24.6407 20.1291 24.9571 20.0011 25.334 20.0002C25.7109 19.9993 26.0278 20.1273 26.2847 20.3842C26.5415 20.6411 26.6691 20.9575 26.6673 21.3335V24.0002C26.6673 24.7335 26.4064 25.3615 25.8847 25.8842C25.3629 26.4068 24.7349 26.6677 24.0007 26.6668H8.00065Z" fill="white"/>
    </svg>
  )
}

function ShareIcon() {
  return (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M15.057 3.05689C15.307 2.80692 15.6461 2.6665 15.9997 2.6665C16.3532 2.6665 16.6923 2.80692 16.9423 3.05689L20.9423 7.05689C21.1852 7.30836 21.3196 7.64516 21.3166 7.99475C21.3135 8.34435 21.1733 8.67877 20.9261 8.92598C20.6789 9.17319 20.3445 9.31341 19.9949 9.31645C19.6453 9.31949 19.3085 9.1851 19.057 8.94222L17.333 7.21822V19.9996C17.333 20.3532 17.1925 20.6923 16.9425 20.9424C16.6924 21.1924 16.3533 21.3329 15.9997 21.3329C15.6461 21.3329 15.3069 21.1924 15.0569 20.9424C14.8068 20.6923 14.6663 20.3532 14.6663 19.9996V7.21822L12.9423 8.94222C12.6909 9.1851 12.3541 9.31949 12.0045 9.31645C11.6549 9.31341 11.3205 9.17319 11.0732 8.92598C10.826 8.67877 10.6858 8.34435 10.6828 7.99475C10.6797 7.64516 10.8141 7.30836 11.057 7.05689L15.057 3.05689ZM5.33301 14.6662C5.33301 13.959 5.61396 13.2807 6.11406 12.7806C6.61415 12.2805 7.29243 11.9996 7.99967 11.9996H10.6663C11.02 11.9996 11.3591 12.14 11.6092 12.3901C11.8592 12.6401 11.9997 12.9793 11.9997 13.3329C11.9997 13.6865 11.8592 14.0256 11.6092 14.2757C11.3591 14.5257 11.02 14.6662 10.6663 14.6662H7.99967V26.6662H23.9997V14.6662H21.333C20.9794 14.6662 20.6402 14.5257 20.3902 14.2757C20.1402 14.0256 19.9997 13.6865 19.9997 13.3329C19.9997 12.9793 20.1402 12.6401 20.3902 12.3901C20.6402 12.14 20.9794 11.9996 21.333 11.9996H23.9997C24.7069 11.9996 25.3852 12.2805 25.8853 12.7806C26.3854 13.2807 26.6663 13.959 26.6663 14.6662V26.6662C26.6663 27.3735 26.3854 28.0517 25.8853 28.5518C25.3852 29.0519 24.7069 29.3329 23.9997 29.3329H7.99967C7.29243 29.3329 6.61415 29.0519 6.11406 28.5518C5.61396 28.0517 5.33301 27.3735 5.33301 26.6662V14.6662Z" fill="white"/>
  </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M21.3333 21.3333L4.2666 4.2666M21.3333 4.2666L4.2666 21.3333" stroke="white" stroke-width="3" stroke-linecap="round"/>
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
      <button
        type="button"
        className="modal-close-btn"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Close preview"
      >
        <CloseIcon />
      </button>
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
