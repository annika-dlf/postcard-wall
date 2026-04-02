import { useMemo, useState } from 'react'
import DrawingLayer from './DrawingLayer'
import TextLayer from './TextLayer'

function PostcardEditor({ imageUrl, onSave, onClose }) {
  const [side, setSide] = useState('front')
  const [frontDrawing, setFrontDrawing] = useState([])
  const [textContent, setTextContent] = useState('')
  const [textStyle, setTextStyle] = useState({ size: 18 })

  const cardClass = useMemo(() => `flipper ${side === 'back' ? 'is-back' : ''}`, [side])

  const save = () => {
    onSave({
      image_url: imageUrl,
      front_drawing: frontDrawing,
      back_drawing: [],
      text_content: textContent,
      text_style: { ...textStyle, align: 'left' },
    })
  }

  return (
    <div className="sheet-overlay">
      <div className="sheet editor-sheet">
        <div className="editor-header">
          <h2>Create postcard</h2>
          <div className="editor-actions">
            <button className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button onClick={save}>Publish</button>
          </div>
        </div>

        <div className={cardClass}>
          <div className="editor-face front-face">
            <img src={imageUrl} alt="Front" className="editor-base-image" />
            <DrawingLayer value={frontDrawing} onChange={setFrontDrawing} multiply />
          </div>
          <div className="editor-face back-face">
            <div className="back-paper" />
            <TextLayer
              text={textContent}
              style={textStyle}
              onTextChange={setTextContent}
              onStyleChange={setTextStyle}
            />
          </div>
        </div>

        <button className="flip-btn" onClick={() => setSide(side === 'front' ? 'back' : 'front')}>
          Flip to {side === 'front' ? 'back' : 'front'}
        </button>
      </div>
    </div>
  )
}

export default PostcardEditor
