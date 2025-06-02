import React from 'react'
import './App.css'
import DicomViewer from "./components/DicomViewer/DicomViewer"
import PatientInfo from './components/PatientInfo'
import LabelTools from './components/LabelTools'
import LabelList from './components/LabelList'
import useAnnotationStore from './store/useAnnotationStore'

function App() {
  // 從 store 獲取狀態和操作
  const {
    dicomFile,
    patientData,
    selectedLabelId,
    isDrawingMode,
    setDicomFile,
    setPatientData,
    addLabel,
    updateLabel,
    deleteLabel,
    selectLabel,
    deselectLabel,
    toggleDrawingMode,
    setDrawingMode,
    getLabelsWithNames
  } = useAnnotationStore()

  // 獲取帶有動態名稱的標註列表
  const labelsWithNames = getLabelsWithNames()

  const handleFileUpload = (file) => {
    setDicomFile(file)
  }

  const handlePatientDataParsed = (data) => {
    setPatientData(data)
  }

  const handleAddLabel = (labelData) => {
    addLabel(labelData)
  }

  const handleEditLabel = (labelId) => {
    selectLabel(labelId)
  }

  const handleDeleteLabel = (labelId) => {
    deleteLabel(labelId)
  }

  const handleUpdateLabel = (labelId, updatedData) => {
    updateLabel(labelId, updatedData)
  }

  const handleDeselectLabel = () => {
    deselectLabel()
  }

  const handleToggleDrawing = () => {
    toggleDrawingMode()
  }

  const handleDrawingComplete = () => {
    setDrawingMode(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="upload-section">
          <input
            type="file"
            accept=".dcm,.dicom"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            id="dicom-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="dicom-upload" className="upload-btn">
            Upload DICOM
          </label>
        </div>
        
        {/* 全域編輯狀態指示 */}
        {selectedLabelId && (
          <div style={{
            background: '#3498db',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: '12px',
            fontWeight: '500'
          }}>
            編輯模式 - 按 ESC 結束
          </div>
        )}
      </header>

      <div className="app-content">
        <div className="left-panel">
          <PatientInfo patientData={patientData} />
          <div className="viewer-container">
            <DicomViewer
              dicomFile={dicomFile}
              labels={labelsWithNames}
              selectedLabelId={selectedLabelId}
              isDrawingMode={isDrawingMode}
              onPatientDataParsed={handlePatientDataParsed}
              onAddLabel={handleAddLabel}
              onUpdateLabel={handleUpdateLabel}
              onDrawingComplete={handleDrawingComplete}
              onDeselectLabel={handleDeselectLabel}
            />
          </div>
        </div>

        <div className="right-panel">
          <LabelTools
            isDrawing={isDrawingMode}
            onToggleDrawing={handleToggleDrawing}
          />

          <LabelList
            labels={labelsWithNames}
            selectedLabelId={selectedLabelId}
            onEditLabel={handleEditLabel}
            onDeleteLabel={handleDeleteLabel}
          />
        </div>
      </div>
    </div>
  )
}

export default App