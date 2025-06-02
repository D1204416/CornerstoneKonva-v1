// services/AnnotationService.js
import { ANNOTATION_CONFIG } from '../config/annotation'

export class AnnotationService {
  /**
   * 驗證多邊形標註
   * @param {number[]} points - 點陣列
   * @returns {Object} 驗證結果
   */
  static validatePolygon(points) {
    const errors = []
    const warnings = []

    // 檢查基本格式
    if (!Array.isArray(points)) {
      errors.push('Points must be an array')
      return { isValid: false, errors, warnings }
    }

    if (points.length % 2 !== 0) {
      errors.push('Points array must have even length (x,y pairs)')
      return { isValid: false, errors, warnings }
    }

    const vertexCount = points.length / 2

    // 檢查頂點數量
    if (vertexCount < ANNOTATION_CONFIG.MIN_VERTICES) {
      errors.push(`Polygon must have at least ${ANNOTATION_CONFIG.MIN_VERTICES} vertices`)
    }

    if (vertexCount > ANNOTATION_CONFIG.MAX_VERTICES) {
      errors.push(`Polygon cannot have more than ${ANNOTATION_CONFIG.MAX_VERTICES} vertices`)
    }

    // 檢查是否有無效的座標
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i]
      const y = points[i + 1]

      if (typeof x !== 'number' || typeof y !== 'number') {
        errors.push(`Invalid coordinate at index ${i/2}: (${x}, ${y})`)
      }

      if (!isFinite(x) || !isFinite(y)) {
        errors.push(`Non-finite coordinate at index ${i/2}: (${x}, ${y})`)
      }
    }

    // 檢查是否有重複的連續頂點
    for (let i = 0; i < points.length - 2; i += 2) {
      const x1 = points[i]
      const y1 = points[i + 1]
      const x2 = points[i + 2]
      const y2 = points[i + 3]

      if (Math.abs(x1 - x2) < 0.1 && Math.abs(y1 - y2) < 0.1) {
        warnings.push(`Duplicate consecutive vertices at index ${i/2} and ${(i+2)/2}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      vertexCount
    }
  }

  /**
   * 計算多邊形面積
   * @param {number[]} points - 點陣列
   * @returns {number} 面積
   */
  static calculatePolygonArea(points) {
    if (!points || points.length < 6) return 0

    let area = 0
    const n = points.length / 2

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const xi = points[i * 2]
      const yi = points[i * 2 + 1]
      const xj = points[j * 2]
      const yj = points[j * 2 + 1]

      area += xi * yj - xj * yi
    }

    return Math.abs(area) / 2
  }

  /**
   * 計算多邊形周長
   * @param {number[]} points - 點陣列
   * @returns {number} 周長
   */
  static calculatePolygonPerimeter(points) {
    if (!points || points.length < 4) return 0

    let perimeter = 0
    const n = points.length / 2

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const xi = points[i * 2]
      const yi = points[i * 2 + 1]
      const xj = points[j * 2]
      const yj = points[j * 2 + 1]

      const distance = Math.sqrt(Math.pow(xj - xi, 2) + Math.pow(yj - yi, 2))
      perimeter += distance
    }

    return perimeter
  }

  /**
   * 檢查點是否在多邊形內部
   * @param {number} x - 點的 x 座標
   * @param {number} y - 點的 y 座標
   * @param {number[]} points - 多邊形點陣列
   * @returns {boolean} 是否在內部
   */
  static isPointInPolygon(x, y, points) {
    if (!points || points.length < 6) return false

    let inside = false
    const n = points.length / 2

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = points[i * 2]
      const yi = points[i * 2 + 1]
      const xj = points[j * 2]
      const yj = points[j * 2 + 1]

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }

    return inside
  }

  /**
   * 簡化多邊形（移除共線的點）
   * @param {number[]} points - 點陣列
   * @param {number} tolerance - 容差
   * @returns {number[]} 簡化後的點陣列
   */
  static simplifyPolygon(points, tolerance = 1.0) {
    if (!points || points.length < 6) return points

    const simplified = []
    const n = points.length / 2

    for (let i = 0; i < n; i++) {
      const prev = ((i - 1) + n) % n
      const curr = i
      const next = (i + 1) % n

      const x1 = points[prev * 2]
      const y1 = points[prev * 2 + 1]
      const x2 = points[curr * 2]
      const y2 = points[curr * 2 + 1]
      const x3 = points[next * 2]
      const y3 = points[next * 2 + 1]

      // 計算角度或使用其他方法判斷是否為共線點
      const crossProduct = Math.abs((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1))
      
      if (crossProduct > tolerance) {
        simplified.push(x2, y2)
      }
    }

    return simplified.length >= 6 ? simplified : points
  }

  /**
   * 匯出標註為 JSON
   * @param {Object[]} annotations - 標註陣列
   * @param {Object} metadata - 額外的元資料
   * @returns {string} JSON 字串
   */
  static exportToJSON(annotations, metadata = {}) {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      metadata: {
        toolName: 'DICOM Labeling Tool',
        ...metadata
      },
      annotations: annotations.map(annotation => ({
        id: annotation.id,
        type: annotation.type,
        points: annotation.points,
        properties: {
          area: this.calculatePolygonArea(annotation.points),
          perimeter: this.calculatePolygonPerimeter(annotation.points),
          vertexCount: annotation.points.length / 2
        },
        metadata: annotation.metadata || {}
      }))
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 從 JSON 匯入標註
   * @param {string} jsonString - JSON 字串
   * @returns {Object} 匯入結果
   */
  static importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      const annotations = []
      const errors = []

      if (!data.annotations || !Array.isArray(data.annotations)) {
        throw new Error('Invalid format: missing annotations array')
      }

      data.annotations.forEach((annotation, index) => {
        try {
          const validation = this.validatePolygon(annotation.points)
          if (validation.isValid) {
            annotations.push({
              id: annotation.id || Date.now() + index,
              type: annotation.type || 'polygon',
              points: annotation.points,
              metadata: annotation.metadata || {}
            })
          } else {
            errors.push(`Annotation ${index}: ${validation.errors.join(', ')}`)
          }
        } catch (error) {
          errors.push(`Annotation ${index}: ${error.message}`)
        }
      })

      return {
        success: true,
        annotations,
        errors,
        metadata: data.metadata || {}
      }
    } catch (error) {
      return {
        success: false,
        annotations: [],
        errors: [error.message],
        metadata: {}
      }
    }
  }

  /**
   * 創建新的標註 ID
   * @returns {string} 唯一 ID
   */
  static generateAnnotationId() {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}