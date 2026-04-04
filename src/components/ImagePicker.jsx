import { PRESET_IMAGES } from '../constants/presets'

function ImagePicker({ selectedImage, onSelect, onNext, onClose }) {
  return (
    <div className="sheet-overlay">
      <div className="sheet">
        <div className="sheet-header">
          <h2>Pick your postcard 💌</h2>
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
        <div className="sheet-actions image-picker-actions">
          <button type="button" disabled={!selectedImage} onClick={onNext}>
            make my card :)
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImagePicker
