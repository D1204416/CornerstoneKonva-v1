// DrawingCanvasUI.jsx
import React from 'react'

// 繪圖引導面板組件
export const DrawingGuidePanel = ({ isDrawing, currentPoints, mousePos, isNearStartPoint }) => {
  if (!isDrawing) return null

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 20,
      background: 'rgba(39, 174, 96, 0.95)',
      color: 'white',
      borderRadius: 8,
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      fontSize: '13px',
      fontWeight: '500',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#2ecc71',
          animation: 'pulse 1.5s infinite'
        }} />
        <span>繪圖模式</span>
      </div>
      <div style={{ fontSize: '11px', opacity: 0.9 }}>
        已點擊 {currentPoints.length / 2} 個頂點
      </div>
      <div style={{ 
        fontSize: '10px', 
        opacity: 0.8,
        borderTop: '1px solid rgba(255,255,255,0.3)',
        paddingTop: '6px',
        lineHeight: '1.3'
      }}>
        {currentPoints.length === 0 ? (
          <>點擊開始繪製第一個頂點</>
        ) : currentPoints.length === 2 ? (
          <>繼續點擊添加第二個頂點</>
        ) : currentPoints.length < 6 ? (
          <>點擊添加頂點 (至少需要3個)</>
        ) : mousePos && isNearStartPoint(mousePos.x, mousePos.y) ? (
          <>🎯 點擊起始點完成繪圖 (大紅圈範圍內)</>
        ) : (
          <>雙擊完成 | 點擊添加頂點</>
        )}
      </div>
    </div>
  )
}

// 編輯模式控制面板組件
export const EditModePanel = ({ selectedLabelId, editMode, setEditMode, onDeselectLabel }) => {
  if (!selectedLabelId) return null

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 20,
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 8,
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontSize: '12px',
      minWidth: '200px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <span style={{ 
          fontWeight: 'bold', 
          color: '#2c3e50',
          fontSize: '13px'
        }}>
          編輯模式
        </span>
        <button
          onClick={() => onDeselectLabel && onDeselectLabel()}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
        >
          完成 ✓
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button
          onClick={() => setEditMode('move')}
          style={{
            padding: '6px 10px',
            border: 'none',
            borderRadius: 4,
            backgroundColor: editMode === 'move' ? '#3498db' : '#ecf0f1',
            color: editMode === 'move' ? 'white' : '#2c3e50',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '500'
          }}
        >
          🔄 移動
        </button>
      </div>
      
      <div style={{ 
        fontSize: '12px',
        color: '#7f8c8d',
        lineHeight: '1.3',
        borderTop: '1px solid #ecf0f1',
        paddingTop: '6px'
      }}>
        <div>🔵 拖拽頂點調整位置</div>
        <div>🟢 點擊添加新頂點</div>
        <div>❌ 雙擊頂點刪除</div>
        <div style={{ marginTop: '4px', fontWeight: '500' }}>
          ESC 或點擊空白處結束編輯
        </div>
      </div>
    </div>
  )
}