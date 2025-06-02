// store/useAnnotationStore.js
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useAnnotationStore = create(
  subscribeWithSelector((set, get) => ({
    // 標註相關狀態
    labels: [],
    selectedLabelId: null,
    isDrawingMode: false,
    
    // DICOM 相關狀態
    dicomFile: null,
    patientData: null,
    image: null,
    viewport: { 
      width: 800, 
      height: 600,
      scale: 1,
      translation: { x: 0, y: 0 }
    },

    // 標註操作
    addLabel: (labelData) => {
      const newLabel = {
        id: Date.now(),
        points: labelData.points,
        type: 'polygon',
        name: `Label ${get().labels.length + 1}`,
        ...labelData
      }
      set((state) => ({
        labels: [...state.labels, newLabel]
      }))
    },

    updateLabel: (labelId, updatedData) => {
      set((state) => ({
        labels: state.labels.map(label =>
          label.id === labelId ? { ...label, ...updatedData } : label
        )
      }))
    },

    deleteLabel: (labelId) => {
      set((state) => ({
        labels: state.labels.filter(label => label.id !== labelId),
        selectedLabelId: state.selectedLabelId === labelId ? null : state.selectedLabelId
      }))
    },

    selectLabel: (labelId) => {
      set({ selectedLabelId: labelId })
    },

    deselectLabel: () => {
      set({ selectedLabelId: null })
    },

    // 繪圖模式控制
    setDrawingMode: (isDrawing) => {
      set({ 
        isDrawingMode: isDrawing,
        // 開始繪圖時自動取消選擇
        selectedLabelId: isDrawing ? null : get().selectedLabelId
      })
    },

    toggleDrawingMode: () => {
      const currentMode = get().isDrawingMode
      set({ 
        isDrawingMode: !currentMode,
        selectedLabelId: !currentMode ? null : get().selectedLabelId
      })
    },

    // DICOM 文件管理
    setDicomFile: (file) => {
      set({ dicomFile: file })
    },

    setPatientData: (data) => {
      set({ patientData: data })
    },

    setImage: (image) => {
      set({ image })
    },

    setViewport: (viewport) => {
      set({ viewport })
    },

    // 重置所有狀態
    reset: () => {
      set({
        labels: [],
        selectedLabelId: null,
        isDrawingMode: false,
        dicomFile: null,
        patientData: null,
        image: null,
        viewport: { 
          width: 800, 
          height: 600,
          scale: 1,
          translation: { x: 0, y: 0 }
        }
      })
    },

    // 獲取帶有動態名稱的標註列表
    getLabelsWithNames: () => {
      const labels = get().labels
      return labels.map((label, index) => ({
        ...label,
        name: `Label ${index + 1}`
      }))
    }
  }))
)

export default useAnnotationStore