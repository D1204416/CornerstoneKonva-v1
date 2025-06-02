import React from 'react'
import { Line, Circle } from 'react-konva'
import { ANNOTATION_CONFIG } from '../../config/annotation'

const PolygonRenderer = ({
  label,
  isSelected = false,
  displayPoints,
  editMode,
  onVertexDrag,
  onAddVertex,
  onDeleteVertex,
  onPolygonDrag,
  adaptiveSize,
  adaptiveStrokeWidth
}) => {
  if (!label.points || label.points.length < 6) return null

  const color = isSelected ? ANNOTATION_CONFIG.COLORS.SELECTED : ANNOTATION_CONFIG.COLORS.NORMAL
  const strokeWidth = isSelected ? 
    ANNOTATION_CONFIG.STROKE_WIDTH.SELECTED : 
    ANNOTATION_CONFIG.STROKE_WIDTH.NORMAL

  const adjustedStrokeWidth = adaptiveStrokeWidth(strokeWidth)
  const controlSize = adaptiveSize()

  // 渲染頂點控制點
  const renderVertexControls = () => {
    const vertices = []
    const edges = []
    
    // 渲染頂點控制點
    for (let i = 0; i < displayPoints.length; i += 2) {
      const vertexIndex = i / 2
      vertices.push(
        <Circle
          key={`vertex-${vertexIndex}`}
          x={displayPoints[i]}
          y={displayPoints[i + 1]}
          radius={controlSize}
          fill={ANNOTATION_CONFIG.COLORS.VERTEX}
          stroke={ANNOTATION_CONFIG.COLORS.VERTEX_BORDER}
          strokeWidth={2}
          draggable={true}
          onDragMove={(e) => {
            const node = e.target
            onVertexDrag(vertexIndex, node.x(), node.y(), label)
          }}
          onDblClick={(e) => {
            e.cancelBubble = true
            onDeleteVertex(vertexIndex, label)
          }}
          onMouseEnter={(e) => {
            e.target.getStage().container().style.cursor = 'move'
          }}
          onMouseLeave={(e) => {
            e.target.getStage().container().style.cursor = 'default'
          }}
        />
      )
    }

    // 渲染邊中點（用於添加新頂點）
    for (let i = 0; i < displayPoints.length; i += 2) {
      const nextI = (i + 2) % displayPoints.length
      const midX = (displayPoints[i] + displayPoints[nextI]) / 2
      const midY = (displayPoints[i + 1] + displayPoints[nextI + 1]) / 2
      const insertIndex = (i / 2) + 1
      
      edges.push(
        <Circle
          key={`edge-${i/2}`}
          x={midX}
          y={midY}
          radius={controlSize * 0.7}
          fill={ANNOTATION_CONFIG.COLORS.EDGE_POINT}
          stroke={ANNOTATION_CONFIG.COLORS.EDGE_POINT_BORDER}
          strokeWidth={1}
          opacity={0.8}
          onMouseDown={(e) => {
            e.cancelBubble = true
            onAddVertex(insertIndex, midX, midY, label)
          }}
          onMouseEnter={(e) => {
            e.target.getStage().container().style.cursor = 'copy'
            e.target.opacity(1)
          }}
          onMouseLeave={(e) => {
            e.target.getStage().container().style.cursor = 'default'
            e.target.opacity(0.8)
          }}
        />
      )
    }

    return [...vertices, ...edges]
  }

  const polygonElements = [
    <Line
      key={`polygon-${label.id}`}
      points={[...displayPoints, displayPoints[0], displayPoints[1]]}
      stroke={color}
      strokeWidth={Math.max(adjustedStrokeWidth, 0.5)}
      fill={`${color}30`}
      closed={true}
      draggable={isSelected && editMode === 'move'}
      onDragEnd={(e) => {
        if (editMode !== 'move') return
        onPolygonDrag(e, label)
      }}
    />
  ]

  // 如果選中且處於編輯模式，添加控制點
  if (isSelected) {
    polygonElements.push(...renderVertexControls())
  }

  return polygonElements
}

export default PolygonRenderer