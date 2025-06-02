// config/annotation.js
export const ANNOTATION_CONFIG = {
  // 視覺配置
  VERTEX_SIZE: {
    BASE: 8,
    MIN: 4,
    MAX: 15
  },
  
  STROKE_WIDTH: {
    NORMAL: 2,
    SELECTED: 3,
    DRAWING: 2
  },
  
  COLORS: {
    DRAWING: '#27ae60',
    SELECTED: '#3498db',
    NORMAL: '#e74c3c',
    VERTEX: '#3498db',
    VERTEX_BORDER: '#2980b9',
    EDGE_POINT: '#27ae60',
    EDGE_POINT_BORDER: '#229954',
    START_POINT: '#e74c3c',
    START_POINT_BORDER: '#c0392b'
  },
  
  // 交互配置
  SNAP_DISTANCE: {
    START_POINT: 25,
    CLICK_START_POINT: 30,
    VERTEX_HOVER: 15
  },
  
  // 幾何約束
  MIN_VERTICES: 3,
  MAX_VERTICES: 50,
  
  // 動畫配置
  ANIMATION: {
    PULSE_DURATION: '1.5s',
    TRANSITION_DURATION: '0.3s',
    SLIDE_DURATION: '0.3s'
  },
  
  // 畫布配置
  CANVAS: {
    MIN_HEIGHT: 400,
    DEFAULT_VIEWPORT: {
      width: 800,
      height: 600,
      scale: 1,
      translation: { x: 0, y: 0 }
    }
  },
  
  // DICOM 配置
  DICOM: {
    SUPPORTED_EXTENSIONS: ['.dcm', '.dicom'],
    WADO_CONFIG: {
      useWebWorkers: false,
      decodeConfig: {
        convertToPaletteColor: false,
        safeVOILUTApplication: false
      }
    }
  }
}