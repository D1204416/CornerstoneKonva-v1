import React from 'react'
import { Line, Circle } from 'react-konva'
import { ANNOTATION_CONFIG } from '../../config/annotation'

const DrawingPreview = ({
  isDrawing,
  currentPoints,
  mousePos,
  transformPoints,
  isNearStartPoint,
  adaptiveSize,
  adaptiveStrokeWidth
}) => {
  if (!isDrawing || currentPoints.length < 2) return null

  const controlSize = adaptiveSize()
  const strokeWidth = adaptiveStrokeWidth(ANNOTATION_CONFIG.STROKE_WIDTH.DRAWING)

  return (
    <>
      {/* 單個頂點顯示（第一個點） */}
      {currentPoints.length === 2 && (
        <Circle
          x={transformPoints([currentPoints[0], currentPoints[1]])[0]}
          y={transformPoints([currentPoints[0], currentPoints[1]])[1]}
          radius={controlSize}
          fill={ANNOTATION_CONFIG.COLORS.DRAWING}
          stroke={ANNOTATION_CONFIG.COLORS.EDGE_POINT_BORDER}
          strokeWidth={2}
          opacity={0.9}
        />
      )}
      
      {/* 多頂點連線（2個點以上才顯示線條） */}
      {currentPoints.length >= 4 && (
        <>
          {/* 主要的繪圖線條 */}
          <Line
            points={transformPoints(currentPoints)}
            stroke={ANNOTATION_CONFIG.COLORS.DRAWING}
            strokeWidth={strokeWidth}
            dash={[8, 4]}
            closed={false}
          />
          
          {/* 起始點特殊高亮（3個點以上） */}
          {currentPoints.length >= 6 && (
            <>
              {/* 起始點外圈（增大點擊範圍） */}
              <Circle
                x={transformPoints([currentPoints[0], currentPoints[1]])[0]}
                y={transformPoints([currentPoints[0], currentPoints[1]])[1]}
                radius={controlSize * 1.8}
                fill="rgba(231, 76, 60, 0.2)"
                stroke="rgba(231, 76, 60, 0.4)"
                strokeWidth={1}
                opacity={0.7}
                listening={false}
              />
              {/* 起始點內圈（視覺標示） */}
              <Circle
                x={transformPoints([currentPoints[0], currentPoints[1]])[0]}
                y={transformPoints([currentPoints[0], currentPoints[1]])[1]}
                radius={controlSize * 1.2}
                fill={ANNOTATION_CONFIG.COLORS.START_POINT}
                stroke={ANNOTATION_CONFIG.COLORS.START_POINT_BORDER}
                strokeWidth={2}
                opacity={0.9}
                listening={false}
              />
            </>
          )}
          
          {/* 所有頂點標記 */}
          {(() => {
            const displayPoints = transformPoints(currentPoints)
            const points = []
            for (let i = 0; i < displayPoints.length; i += 2) {
              const isStartPoint = i === 0 && currentPoints.length >= 6
              points.push(
                <Circle
                  key={`point-${i/2}`}
                  x={displayPoints[i]}
                  y={displayPoints[i + 1]}
                  radius={controlSize * 0.6}
                  fill={isStartPoint ? 
                    ANNOTATION_CONFIG.COLORS.START_POINT : 
                    ANNOTATION_CONFIG.COLORS.DRAWING
                  }
                  stroke={isStartPoint ? 
                    ANNOTATION_CONFIG.COLORS.START_POINT_BORDER : 
                    ANNOTATION_CONFIG.COLORS.EDGE_POINT_BORDER
                  }
                  strokeWidth={isStartPoint ? 2 : 1}
                  opacity={0.8}
                />
              )
            }
            return points
          })()}
        </>
      )}
      
      {/* 預覽線（從最後一個點到滑鼠位置） */}
      {mousePos && currentPoints.length >= 2 && (
        <>
          <Line
            points={[
              ...transformPoints([currentPoints[currentPoints.length - 2], currentPoints[currentPoints.length - 1]]),
              ...transformPoints([mousePos.x, mousePos.y])
            ]}
            stroke={ANNOTATION_CONFIG.COLORS.DRAWING}
            strokeWidth={strokeWidth * 0.8}
            dash={[4, 4]}
            opacity={0.6}
          />
          
          {/* 如果接近起始點，顯示閉合預覽 */}
          {currentPoints.length >= 6 && isNearStartPoint(mousePos.x, mousePos.y) && (
            <Line
              points={[
                ...transformPoints([mousePos.x, mousePos.y]),
                ...transformPoints([currentPoints[0], currentPoints[1]])
              ]}
              stroke={ANNOTATION_CONFIG.COLORS.START_POINT}
              strokeWidth={strokeWidth * 1.2}
              dash={[6, 3]}
              opacity={0.8}
            />
          )}
        </>
      )}
    </>
  )
}

export default DrawingPreview