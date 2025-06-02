import React, { useRef, useEffect } from 'react'
import { useDicomLoader } from '../../hooks/useDicomLoader'
import { usePolygonDrawing } from '../../hooks/usePolygonDrawing'
import DrawingCanvas from './DrawingCanvas'
import './DicomViewer.css'

const DicomViewer = ({
  dicomFile,
  labels,
  selectedLabelId,
  isDrawingMode,
  onPatientDataParsed,
  onAddLabel,
  onUpdateLabel,
  onDrawingComplete,
  onDeselectLabel  // 新增：取消選擇回調
}) => {
  const elementRef = useRef(null)

  // Load image and handle resizing
  const { image, viewport } = useDicomLoader(dicomFile, elementRef, onPatientDataParsed)
  
  useEffect(() => {
    console.log('📏 DicomViewer - Viewport updated:', viewport)
    console.log('📊 DicomViewer - Labels count:', labels.length)
  }, [viewport, labels])

  // Drawing state and handlers
  const {
    isDrawing,
    currentPoints,
    handleClick,
    handleDoubleClick,
    startDrawing
  } = usePolygonDrawing(isDrawingMode, onAddLabel, onDrawingComplete, viewport)

  return (
    <div className="dicom-viewer">
      <div className="canvas-container">
        {/* Cornerstone Viewer */}
        <div
          ref={elementRef}
          className="cornerstone-element"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '400px',
            position: 'relative'
          }}
        />

        {/* Konva Overlay */}
        {image && viewport.width > 0 && viewport.height > 0 && (
          <DrawingCanvas
            image={image}
            viewport={viewport}
            labels={labels}
            selectedLabelId={selectedLabelId}
            currentPoints={currentPoints}
            isDrawing={isDrawing}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onUpdateLabel={onUpdateLabel}
            onDeselectLabel={onDeselectLabel}  // 傳遞取消選擇函數
            elementRef={elementRef}
          />
        )}

        {/* Fallback when no image loaded */}
        {!image && (
          <div className="no-image">
            <p>Upload a DICOM file to start labeling</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DicomViewer