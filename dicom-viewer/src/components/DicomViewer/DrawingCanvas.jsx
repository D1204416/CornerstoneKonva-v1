import React from 'react'
import { useDrawingCanvas, useCanvasTransform, useGeometryUtils } from '../../hooks/useDrawingCanvas'
import { DrawingGuidePanel, EditModePanel } from './DrawingCanvasUI'
import PolygonRenderer from '../Annotation/PolygonRenderer'
import DrawingPreview from '../Annotation/DrawingPreview'
import InteractionHandler from '../Annotation/InteractionHandler'
import { ANNOTATION_CONFIG } from '../../config/annotation'

const DrawingCanvas = ({
  image,
  viewport,
  labels,
  selectedLabelId,
  currentPoints,
  isDrawing,
  onClick,
  onDoubleClick,
  onUpdateLabel,
  onDeselectLabel,
  elementRef
}) => {
  // 使用自定義 hooks
  const {
    stageRef,
    containerRef,
    stageSize,
    editMode,
    setEditMode,
    mousePos,
    setMousePos
  } = useDrawingCanvas(viewport, onDeselectLabel)

  const { 
    transformPoints, 
    inverseTransformPoint, 
    getAdaptiveSize, 
    getAdaptiveStrokeWidth 
  } = useCanvasTransform(viewport, stageSize)
  
  const { getDistance } = useGeometryUtils()

  // 檢查是否接近起始點（用於自動閉合提示）
  const isNearStartPoint = (mouseX, mouseY) => {
    if (currentPoints.length < 6) return false
    
    const startDisplayPoints = transformPoints([currentPoints[0], currentPoints[1]])
    const mouseDisplayPos = transformPoints([mouseX, mouseY])
    
    if (!startDisplayPoints || !mouseDisplayPos) return false
    
    const distance = getDistance(
      mouseDisplayPos[0], mouseDisplayPos[1],
      startDisplayPoints[0], startDisplayPoints[1]
    )
    
    return distance < ANNOTATION_CONFIG.SNAP_DISTANCE.START_POINT
  }

  // 檢查點擊是否在起始點附近（用於完成繪圖）
  const isClickNearStartPoint = (clickX, clickY) => {
    if (currentPoints.length < 6) return false
    
    const startDisplayPoints = transformPoints([currentPoints[0], currentPoints[1]])
    if (!startDisplayPoints) return false
    
    const distance = getDistance(
      clickX, clickY,
      startDisplayPoints[0], startDisplayPoints[1]
    )
    
    return distance < ANNOTATION_CONFIG.SNAP_DISTANCE.CLICK_START_POINT
  }

  // 處理頂點拖拽
  const handleVertexDrag = (vertexIndex, newX, newY, label) => {
    const pixelPos = inverseTransformPoint(newX, newY)
    const newPoints = [...label.points]
    newPoints[vertexIndex * 2] = pixelPos.x
    newPoints[vertexIndex * 2 + 1] = pixelPos.y
    
    onUpdateLabel(label.id, { 
      points: newPoints,
      type: label.type
    })
  }

  // 處理在邊上添加新頂點
  const handleAddVertex = (insertIndex, newX, newY, label) => {
    const pixelPos = inverseTransformPoint(newX, newY)
    const newPoints = [...label.points]
    
    // 在指定位置插入新頂點
    newPoints.splice(insertIndex * 2, 0, pixelPos.x, pixelPos.y)
    
    onUpdateLabel(label.id, { 
      points: newPoints,
      type: label.type
    })
  }

  // 處理刪除頂點
  const handleDeleteVertex = (vertexIndex, label) => {
    // 至少保持3個頂點
    if (label.points.length <= 6) return
    
    const newPoints = [...label.points]
    newPoints.splice(vertexIndex * 2, 2)
    
    onUpdateLabel(label.id, { 
      points: newPoints,
      type: label.type
    })
  }

  // 處理多邊形拖拽
  const handlePolygonDrag = (e, label) => {
    const node = e.target
    const dragOffsetX = node.x()
    const dragOffsetY = node.y()
    
    const pixelOffset = inverseTransformPoint(dragOffsetX, dragOffsetY)
    const originPixel = inverseTransformPoint(0, 0)
    
    const pixelOffsetX = pixelOffset.x - originPixel.x
    const pixelOffsetY = pixelOffset.y - originPixel.y
    
    const newPoints = []
    for (let i = 0; i < label.points.length; i += 2) {
      newPoints.push(
        label.points[i] + pixelOffsetX,
        label.points[i + 1] + pixelOffsetY
      )
    }
    
    onUpdateLabel(label.id, { 
      points: newPoints,
      type: label.type
    })
    
    node.position({ x: 0, y: 0 })
  }

  // 處理點擊事件
  const handleStageClick = (e) => {
    // 如果點擊的是空白區域（非多邊形），結束編輯
    if (selectedLabelId && e.target === e.target.getStage()) {
      onDeselectLabel && onDeselectLabel()
      return
    }
    
    if (!isDrawing) return
    
    const stage = e.target.getStage()
    const pointerPos = stage.getPointerPosition()
    
    if (pointerPos) {
      // 檢查是否點擊了起始點（完成繪圖）
      if (currentPoints.length >= 6 && isClickNearStartPoint(pointerPos.x, pointerPos.y)) {
        console.log('🎯 Clicked near start point - completing drawing')
        onDoubleClick(e)
        return
      }
      
      const pixelPos = inverseTransformPoint(pointerPos.x, pointerPos.y)
      
      onClick({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: pixelPos.x, y: pixelPos.y })
          })
        }
      })
    }
  }

  // 處理滑鼠移動（顯示預覽線）
  const handleMouseMove = (e) => {
    if (!isDrawing || currentPoints.length === 0) return
    
    const stage = e.target.getStage()
    const pointerPos = stage.getPointerPosition()
    
    if (pointerPos) {
      const pixelPos = inverseTransformPoint(pointerPos.x, pointerPos.y)
      setMousePos(pixelPos)
    }
  }

  if (stageSize.width === 0 || stageSize.height === 0) {
    return <div ref={containerRef} style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    }} />
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isDrawing || selectedLabelId ? 'auto' : 'none',
        zIndex: isDrawing || selectedLabelId ? 10 : 1
      }}
    >
      {/* UI 面板 */}
      <DrawingGuidePanel 
        isDrawing={isDrawing}
        currentPoints={currentPoints}
        mousePos={mousePos}
        isNearStartPoint={isNearStartPoint}
      />

      <EditModePanel 
        selectedLabelId={selectedLabelId}
        editMode={editMode}
        setEditMode={setEditMode}
        onDeselectLabel={onDeselectLabel}
      />

      {/* 交互處理器 */}
      <InteractionHandler
        stageRef={stageRef}
        stageSize={stageSize}
        isDrawing={isDrawing}
        selectedLabelId={selectedLabelId}
        onClick={handleStageClick}
        onDoubleClick={onDoubleClick}
        onMouseMove={handleMouseMove}
      >
        {/* 渲染已完成的多邊形 */}
        {labels.map(label => (
          <PolygonRenderer
            key={label.id}
            label={label}
            isSelected={label.id === selectedLabelId}
            displayPoints={transformPoints(label.points)}
            editMode={editMode}
            onVertexDrag={handleVertexDrag}
            onAddVertex={handleAddVertex}
            onDeleteVertex={handleDeleteVertex}
            onPolygonDrag={handlePolygonDrag}
            adaptiveSize={() => getAdaptiveSize()}
            adaptiveStrokeWidth={(width) => getAdaptiveStrokeWidth(width)}
          />
        ))}
        
        {/* 渲染正在繪製的元素 */}
        <DrawingPreview
          isDrawing={isDrawing}
          currentPoints={currentPoints}
          mousePos={mousePos}
          transformPoints={transformPoints}
          isNearStartPoint={isNearStartPoint}
          adaptiveSize={() => getAdaptiveSize()}
          adaptiveStrokeWidth={(width) => getAdaptiveStrokeWidth(width)}
        />
      </InteractionHandler>
    </div>
  )
}

export default DrawingCanvas