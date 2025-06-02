import React from 'react'
import './LabelList.css'

const LabelList = ({ labels, selectedLabelId, onEditLabel, onDeleteLabel }) => {
  return (
    <div className="label-list">
      <h3>Label List</h3>
      <div className="labels-container">
        {labels.length === 0 ? (
          <div className="no-labels">
            <p>尚未建立標記</p>
          </div>
        ) : (
          labels.map((label) => (
            <div 
              key={label.id} 
              className={`label-item ${selectedLabelId === label.id ? 'selected' : ''}`}
            >
              <div className="label-info">
                <span className="label-name">{label.name}</span>
                <span className="label-details">
                  Points: {label.points ? label.points.length / 2 : 0}
                </span>
              </div>
              <div className="label-actions">
                <button 
                  className="edit-btn"
                  onClick={() => onEditLabel(label.id)}
                  title="Edit label"
                >
                  ✏️
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => onDeleteLabel(label.id)}
                  title="Delete label"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LabelList