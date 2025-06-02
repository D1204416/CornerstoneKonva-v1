import { useEffect, useState } from 'react'

export const usePolygonDrawing = (isDrawingMode, onAddLabel, onDrawingComplete, viewport) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState([])

  useEffect(() => {
    if (isDrawingMode) {
      setIsDrawing(true)
      setCurrentPoints([])
    } else {
      // 修復：當外部關閉繪圖模式時，也清理內部狀態
      setIsDrawing(false)
      setCurrentPoints([])
    }
  }, [isDrawingMode])

  const handleClick = (e) => {
    if (!isDrawing) return
    
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    
    if (pos) {
      console.log('Adding point:', pos.x, pos.y)
      setCurrentPoints(prev => [...prev, pos.x, pos.y])
    }
  }

  const handleDoubleClick = () => {
    if (isDrawing && currentPoints.length >= 6) {
      console.log('Completing polygon with image coordinates:', currentPoints)
      
      onAddLabel({
        points: currentPoints,
        type: 'polygon'
        // 不再需要 baseViewport，因為我們直接存儲影像座標
      })

      setCurrentPoints([])
      setIsDrawing(false)
      onDrawingComplete && onDrawingComplete()
    } else if (isDrawing) {
      console.log('Need at least 3 points to create polygon. Current:', currentPoints.length / 2)
    }
  }

  const startDrawing = () => {
    console.log('Starting drawing manually')
    setIsDrawing(true)
    setCurrentPoints([])
  }

  return {
    isDrawing,
    currentPoints,
    handleClick,
    handleDoubleClick,
    startDrawing
  }
}