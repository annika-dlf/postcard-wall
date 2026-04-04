import { useMemo, useState } from 'react'
import DrawingLayer from './DrawingLayer'
import TextLayer from './TextLayer'

function PostcardEditor({ imageUrl, onSave, onClose }) {
  const [side, setSide] = useState('front')
  const [frontDrawing, setFrontDrawing] = useState([])
  const [textContent, setTextContent] = useState('')
  const canPublish = textContent.trim().length > 0

  const cardClass = useMemo(
    () => `flipper editor-flipper ${side === 'back' ? 'is-back' : ''}`,
    [side],
  )

  const save = () => {
    if (!canPublish) return
    onSave({
      image_url: imageUrl,
      front_drawing: frontDrawing,
      back_drawing: [],
      text_content: textContent,
      text_style: { align: 'center', size: 13 },
    })
  }

  return (
    <div className="sheet-overlay">
      <div className="sheet editor-sheet">
        <div className="sheet-header editor-create-header">
          <div className="editor-title-block">
            <h2>Create postcard</h2>
            <p className="editor-subtitle">
              {side === 'front'
                ? 'Draw on your postcard, then flip to write your message on the back.'
                : 'Write your message, then mail it to the wall when you are ready.'}
            </p>
          </div>
          <button
            type="button"
            className="sheet-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M21.3333 21.3333L4.2666 4.2666M21.3333 4.2666L4.2666 21.3333"
                stroke="black"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={cardClass}>
          <div className="editor-face front-face">
            <img src={imageUrl} alt="Front" className="editor-base-image" />
            <DrawingLayer value={frontDrawing} onChange={setFrontDrawing} multiply />
          </div>
          <div className="editor-face back-face">
            <div className="back-paper" />
            <TextLayer text={textContent} onTextChange={setTextContent} />
          </div>
        </div>

        <div className="editor-footer-actions">
          <button
            type="button"
            className="flip-btn flip-btn--labeled"
            onClick={() => setSide(side === 'front' ? 'back' : 'front')}
          >
            Flip to {side === 'front' ? 'back' : 'front'}
          </button>

          <button
            type="button"
            className="flip-btn flip-btn--labeled"
            onClick={save}
            disabled={!canPublish}
          >
            Mail your memory!
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostcardEditor
