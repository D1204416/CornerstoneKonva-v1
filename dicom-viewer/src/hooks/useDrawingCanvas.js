import { useState, useEffect, useRef } from 'react'
import { CoordinateUtils } from '../utils/coordinateUtils'

export const useDrawingCanvas = (viewport, onDeselectLabel) => {
  const stageRef = useRef()
  const containerRef = useRef()
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [editMode, setEditMode] = useState('move')
  const [mousePos, setMousePos] = useState(null)

  // 監聽容器大小變化，確保 Konva Stage 響應式
  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setStageSize({
          width: rect.width,
          height: rect.height
        })
        console.log('🔄 Stage size updated:', { width: rect.width, height: rect.height })
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateStageSize, 50)
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
      updateStageSize()
    }

    window.addEventListener('resize', updateStageSize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateStageSize)
    }
  }, [])

  useEffect(() => {
    console.log('🎯 DrawingCanvas viewport changed:', {
      viewport: { width: viewport.width, height: viewport.height },
      stage: stageSize,
      scale: viewport.scale,
      translation: viewport.translation
    })
  }, [viewport, stageSize])

  // 處理鍵盤事件
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // ESC 鍵結束編輯
        onDeselectLabel && onDeselectLabel()
      } else if (e.key === 'Enter') {
        // Enter 鍵結束編輯
        onDeselectLabel && onDeselectLabel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onDeselectLabel])

  return {
    stageRef,
    containerRef,
    stageSize,
    editMode,
    setEditMode,
    mousePos,
    setMousePos
  }
}

// 座標轉換 Hook - 現在使用工具類
export const useCanvasTransform = (viewport, stageSize) => {
  // 計算縮放比例
  const getScaleRatio = () => {
    return CoordinateUtils.getScaleRatio(viewport, stageSize)
  }

  // 將儲存的像素座標轉換為當前顯示座標
  const transformPoints = (points) => {
    return CoordinateUtils.transformPointsToDisplay(points, viewport, stageSize)
  }

  // 將顯示座標轉換回像素座標儲存
  const inverseTransformPoint = (displayX, displayY) => {
    return CoordinateUtils.transformPointToPixel(displayX, displayY, viewport, stageSize)
  }

  // 獲取自適應大小
  const getAdaptiveSize = (baseSize) => {
    return CoordinateUtils.getAdaptiveSize(viewport, stageSize, baseSize)
  }

  // 獲取自適應線寬
  const getAdaptiveStrokeWidth = (baseWidth) => {
    return CoordinateUtils.getAdaptiveStrokeWidth(viewport, stageSize, baseWidth)
  }

  return {
    getScaleRatio,
    transformPoints,
    inverseTransformPoint,
    getAdaptiveSize,
    getAdaptiveStrokeWidth
  }
}

// 幾何計算工具函數 Hook - 現在使用工具類
export const useGeometryUtils = () => {
  // 計算兩點之間的距離
  const getDistance = (x1, y1, x2, y2) => {
    return CoordinateUtils.getDistance(x1, y1, x2, y2)
  }

  // 計算點到線段的距離和最近點
  const getPointToLineDistance = (px, py, x1, y1, x2, y2) => {
    return CoordinateUtils.getPointToLineDistance(px, py, x1, y1, x2, y2)
  }

  // 檢查點是否接近
  const isPointNear = (x1, y1, x2, y2, threshold) => {
    return CoordinateUtils.isPointNear(x1, y1, x2, y2, threshold)
  }

  return {
    getDistance,
    getPointToLineDistance,
    isPointNear
  }
}