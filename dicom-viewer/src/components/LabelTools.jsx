import React from 'react'
import './LabelTools.css'

const LabelTools = ({ isDrawing, onToggleDrawing }) => {
  return (
    <div className="label-tools">
      <h3>Label Tools</h3>
      <div className="tools-section">
        <button
          className={`add-label-btn ${isDrawing ? 'active' : ''}`}
          onClick={onToggleDrawing}
        >
          {isDrawing ? 'Drawing...' : 'Add'}
        </button>
        <div className="tool-info">
          <p>
            請點擊『Add』，接著在影像上逐點點擊以繪製多邊形。最後，點擊起始點即可完成繪製。
          </p>
        </div>
      </div>
    </div>
  )
}

export default LabelTools
