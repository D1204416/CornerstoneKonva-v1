import React from 'react'
import { Stage, Layer } from 'react-konva'
import { ANNOTATION_CONFIG } from '../../config/annotation'

const InteractionHandler = ({
  stageRef,
  stageSize,
  isDrawing,
  selectedLabelId,
  onClick,
  onDoubleClick,
  onMouseMove,
  children
}) => {
  // 處理點擊事件
  const handleStageClick = (e) => {
    // 防止事件冒泡和重複觸發
    e.evt.preventDefault()
    e.evt.stopPropagation()
    
    onClick(e)
  }

  // 處理滑鼠移動事件
  const handleMouseMove = (e) => {
    onMouseMove(e)
  }

  // 處理雙擊事件
  const handleStageDoubleClick = (e) => {
    onDoubleClick(e)
  }

  if (stageSize.width === 0 || stageSize.height === 0) {
    return null
  }

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      onClick={handleStageClick}
      onDblClick={handleStageDoubleClick}
      onMouseMove={handleMouseMove}
      listening={true}
      style={{
        cursor: isDrawing ? 'crosshair' : 'default'
      }}
    >
      <Layer>
        {children}
      </Layer>
    </Stage>
  )
}

export default InteractionHandler