// utils/coordinateUtils.js
import { ANNOTATION_CONFIG } from '../config/annotation'

export class CoordinateUtils {
  /**
   * 計算縮放比例
   * @param {Object} viewport - 視窗資訊
   * @param {Object} stageSize - 舞台尺寸
   * @returns {Object} 縮放比例
   */
  static getScaleRatio(viewport, stageSize) {
    if (!viewport.width || !viewport.height || !stageSize.width || !stageSize.height) {
      return { scaleX: 1, scaleY: 1 }
    }
    
    const scaleX = stageSize.width / viewport.width
    const scaleY = stageSize.height / viewport.height
    
    return { scaleX, scaleY }
  }

  /**
   * 將儲存的像素座標轉換為當前顯示座標
   * @param {number[]} points - 像素座標點陣列
   * @param {Object} viewport - 視窗資訊
   * @param {Object} stageSize - 舞台尺寸
   * @returns {number[]} 顯示座標點陣列
   */
  static transformPointsToDisplay(points, viewport, stageSize) {
    if (!viewport.scale || !viewport.translation || !points) {
      return points
    }
    
    const { scale, translation } = viewport
    const { scaleX, scaleY } = this.getScaleRatio(viewport, stageSize)
    
    const transformedPoints = []
    for (let i = 0; i < points.length; i += 2) {
      let x = points[i] * scale + translation.x + (viewport.width / 2)
      let y = points[i + 1] * scale + translation.y + (viewport.height / 2)
      
      x = x * scaleX
      y = y * scaleY
      
      transformedPoints.push(x, y)
    }
    
    return transformedPoints
  }

  /**
   * 將顯示座標轉換回像素座標
   * @param {number} displayX - 顯示 X 座標
   * @param {number} displayY - 顯示 Y 座標
   * @param {Object} viewport - 視窗資訊
   * @param {Object} stageSize - 舞台尺寸
   * @returns {Object} 像素座標
   */
  static transformPointToPixel(displayX, displayY, viewport, stageSize) {
    if (!viewport.scale || !viewport.translation) {
      return { x: displayX, y: displayY }
    }
    
    const { scale, translation } = viewport
    const { scaleX, scaleY } = this.getScaleRatio(viewport, stageSize)
    
    const cornerstoneX = displayX / scaleX
    const cornerstoneY = displayY / scaleY
    
    const pixelX = (cornerstoneX - translation.x - (viewport.width / 2)) / scale
    const pixelY = (cornerstoneY - translation.y - (viewport.height / 2)) / scale
    
    return { x: pixelX, y: pixelY }
  }

  /**
   * 計算自適應的控制點大小
   * @param {Object} viewport - 視窗資訊
   * @param {Object} stageSize - 舞台尺寸
   * @param {number} baseSize - 基礎大小
   * @returns {number} 調整後的大小
   */
  static getAdaptiveSize(viewport, stageSize, baseSize = ANNOTATION_CONFIG.VERTEX_SIZE.BASE) {
    const { scaleX } = this.getScaleRatio(viewport, stageSize)
    const viewportScale = viewport.scale || 1
    
    const adaptiveSize = baseSize / viewportScale / Math.max(scaleX, 0.5)
    
    return Math.max(
      ANNOTATION_CONFIG.VERTEX_SIZE.MIN,
      Math.min(ANNOTATION_CONFIG.VERTEX_SIZE.MAX, adaptiveSize)
    )
  }

  /**
   * 計算自適應的線寬
   * @param {Object} viewport - 視窗資訊
   * @param {Object} stageSize - 舞台尺寸
   * @param {number} baseWidth - 基礎線寬
   * @returns {number} 調整後的線寬
   */
  static getAdaptiveStrokeWidth(viewport, stageSize, baseWidth = ANNOTATION_CONFIG.STROKE_WIDTH.NORMAL) {
    const { scaleX } = this.getScaleRatio(viewport, stageSize)
    const viewportScale = viewport.scale || 1
    
    const adaptiveWidth = baseWidth / viewportScale / Math.max(scaleX, 0.5)
    
    return Math.max(0.5, adaptiveWidth)
  }

  /**
   * 計算兩點之間的距離
   * @param {number} x1 - 第一個點的 X 座標
   * @param {number} y1 - 第一個點的 Y 座標
   * @param {number} x2 - 第二個點的 X 座標
   * @param {number} y2 - 第二個點的 Y 座標
   * @returns {number} 距離
   */
  static getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  /**
   * 計算點到線段的距離和最近點
   * @param {number} px - 點的 X 座標
   * @param {number} py - 點的 Y 座標
   * @param {number} x1 - 線段起點 X 座標
   * @param {number} y1 - 線段起點 Y 座標
   * @param {number} x2 - 線段終點 X 座標
   * @param {number} y2 - 線段終點 Y 座標
   * @returns {Object} 距離和最近點資訊
   */
  static getPointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    
    if (lenSq === 0) {
      return { 
        distance: this.getDistance(px, py, x1, y1), 
        point: { x: x1, y: y1 },
        t: 0
      }
    }
    
    let t = Math.max(0, Math.min(1, dot / lenSq))
    
    const closestX = x1 + t * C
    const closestY = y1 + t * D
    
    return {
      distance: this.getDistance(px, py, closestX, closestY),
      point: { x: closestX, y: closestY },
      t: t
    }
  }

  /**
   * 檢查點是否接近另一個點
   * @param {number} x1 - 第一個點的 X 座標
   * @param {number} y1 - 第一個點的 Y 座標
   * @param {number} x2 - 第二個點的 X 座標
   * @param {number} y2 - 第二個點的 Y 座標
   * @param {number} threshold - 距離閾值
   * @returns {boolean} 是否接近
   */
  static isPointNear(x1, y1, x2, y2, threshold = ANNOTATION_CONFIG.SNAP_DISTANCE.START_POINT) {
    return this.getDistance(x1, y1, x2, y2) < threshold
  }

  /**
   * 將點陣列轉換為頂點對象陣列
   * @param {number[]} points - 點陣列
   * @returns {Object[]} 頂點對象陣列
   */
  static pointsToVertices(points) {
    const vertices = []
    for (let i = 0; i < points.length; i += 2) {
      vertices.push({
        x: points[i],
        y: points[i + 1],
        index: i / 2
      })
    }
    return vertices
  }

  /**
   * 將頂點對象陣列轉換為點陣列
   * @param {Object[]} vertices - 頂點對象陣列
   * @returns {number[]} 點陣列
   */
  static verticesToPoints(vertices) {
    const points = []
    vertices.forEach(vertex => {
      points.push(vertex.x, vertex.y)
    })
    return points
  }

  /**
   * 標準化角度到 0-2π 範圍
   * @param {number} angle - 角度（弧度）
   * @returns {number} 標準化後的角度
   */
  static normalizeAngle(angle) {
    while (angle < 0) angle += 2 * Math.PI
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI
    return angle
  }

  /**
   * 計算兩個向量的角度
   * @param {number} x1 - 第一個向量的 X 分量
   * @param {number} y1 - 第一個向量的 Y 分量
   * @param {number} x2 - 第二個向量的 X 分量
   * @param {number} y2 - 第二個向量的 Y 分量
   * @returns {number} 角度（弧度）
   */
  static getAngleBetweenVectors(x1, y1, x2, y2) {
    const dot = x1 * x2 + y1 * y2
    const mag1 = Math.sqrt(x1 * x1 + y1 * y1)
    const mag2 = Math.sqrt(x2 * x2 + y2 * y2)
    
    if (mag1 === 0 || mag2 === 0) return 0
    
    const cosAngle = dot / (mag1 * mag2)
    return Math.acos(Math.max(-1, Math.min(1, cosAngle)))
  }

  /**
   * 計算多邊形的邊界框
   * @param {number[]} points - 點陣列
   * @returns {Object} 邊界框
   */
  static getBoundingBox(points) {
    if (!points || points.length < 2) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    let minX = points[0]
    let maxX = points[0]
    let minY = points[1]
    let maxY = points[1]

    for (let i = 2; i < points.length; i += 2) {
      minX = Math.min(minX, points[i])
      maxX = Math.max(maxX, points[i])
      minY = Math.min(minY, points[i + 1])
      maxY = Math.max(maxY, points[i + 1])
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
}