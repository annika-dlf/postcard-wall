import { PRESET_IMAGES } from '../constants/presets'

function ImagePicker({ selectedImage, onSelect, onNext, onClose }) {
  return (
    <div className="sheet-overlay">
      <div className="sheet">
        <h2>Choose an image</h2>
        <div className="image-grid">
          {PRESET_IMAGES.map((url) => (
            <button
              key={url}
              className={`image-option ${selectedImage === url ? 'active' : ''}`}
              onClick={() => onSelect(url)}
            >
              <img src={url} alt="Postcard preset" loading="lazy" />
            </button>
          ))}
        </div>
        <div className="sheet-actions">
          <button className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button disabled={!selectedImage} onClick={onNext}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImagePicker
