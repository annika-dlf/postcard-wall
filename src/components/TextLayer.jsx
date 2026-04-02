function TextLayer({ text, onTextChange }) {
  return (
    <div className="text-layer-wrap">
      <div className="text-editor-scroll">
        <div className="text-editor-center-wrap">
          <textarea
            className="text-editor"
            value={text || ''}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Write your postcard message..."
            rows={1}
          />
        </div>
      </div>
    </div>
  )
}

export default TextLayer
