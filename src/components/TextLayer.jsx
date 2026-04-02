function TextLayer({ text, style, onTextChange, onStyleChange }) {
  const nextStyle = style || { align: 'left', size: 18 }

  return (
    <div className="text-layer-wrap">
      <div className="text-toolbar">
        <label>
          Size
          <input
            type="range"
            min="12"
            max="36"
            value={nextStyle.size}
            onChange={(e) => onStyleChange({ ...nextStyle, size: Number(e.target.value) })}
          />
        </label>
        <div className="align-options">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              className={nextStyle.align === align ? 'active' : ''}
              onClick={() => onStyleChange({ ...nextStyle, align })}
            >
              {align}
            </button>
          ))}
        </div>
      </div>
      <textarea
        className="text-editor"
        style={{ textAlign: nextStyle.align, fontSize: `${nextStyle.size}px` }}
        value={text || ''}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Write your postcard message..."
      />
    </div>
  )
}

export default TextLayer
