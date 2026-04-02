function TextLayer({ text, onTextChange }) {
  return (
    <div className="text-layer-wrap">
      <textarea
        className="text-editor"
        value={text || ''}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Write your postcard message..."
      />
    </div>
  )
}

export default TextLayer
