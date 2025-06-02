import { useEffect } from 'react'
import { DicomService } from '../services/DicomService'
import useAnnotationStore from '../store/useAnnotationStore'

export const useDicomLoader = (dicomFile, elementRef, onPatientDataParsed) => {
  const { 
    image, 
    viewport, 
    setImage, 
    setViewport,
    setPatientData 
  } = useAnnotationStore()

  // 更新視窗資訊
  const updateViewportFromCornerstone = () => {
    if (elementRef.current) {
      const cornerstoneViewport = DicomService.getCornerstoneViewport(elementRef.current)
      if (cornerstoneViewport) {
        console.log('🎯 Cornerstone viewport data:', cornerstoneViewport)
        setViewport(cornerstoneViewport)
      } else {
        console.log('📊 No viewport data available (no image loaded)')
      }
    }
  }

  // 強制重新調整 Cornerstone 以適應容器
  const forceResize = () => {
    if (elementRef.current) {
      DicomService.forceResize(elementRef.current)
      setTimeout(updateViewportFromCornerstone, 100)
    }
  }

  // 初始化 Cornerstone
  useEffect(() => {
    DicomService.initializeCornerstone()
  }, [])

  // 設置 Cornerstone 元素和事件監聽
  useEffect(() => {
    if (elementRef.current) {
      const element = elementRef.current

      // 只啟用元素，不顯示影像
      try {
        DicomService.setupCornerstoneElement(element, null)
      } catch (error) {
        console.warn('Error setting up cornerstone element:', error)
      }
      
      // 監聽所有相關的 Cornerstone 事件
      const onViewportChanged = () => {
        console.log('🔄 Cornerstone viewport changed')
        updateViewportFromCornerstone()
      }
      
      element.addEventListener('cornerstoneimagerendered', onViewportChanged)
      element.addEventListener('cornerstonenewimage', onViewportChanged)
      element.addEventListener('cornerstoneviewportchanged', onViewportChanged)
      element.addEventListener('cornerstoneresize', onViewportChanged)
      
      // 使用 ResizeObserver 監聽容器大小變化
      const resizeObserver = new ResizeObserver(() => {
        console.log('📏 Container resized, forcing Cornerstone resize')
        setTimeout(forceResize, 50)
      })
      
      if (element) {
        resizeObserver.observe(element)
        element._resizeObserver = resizeObserver
      }

      // 清理函數
      return () => {
        try {
          element.removeEventListener('cornerstoneimagerendered', onViewportChanged)
          element.removeEventListener('cornerstonenewimage', onViewportChanged)
          element.removeEventListener('cornerstoneviewportchanged', onViewportChanged)
          element.removeEventListener('cornerstoneresize', onViewportChanged)
          
          if (element._resizeObserver) {
            element._resizeObserver.disconnect()
          }
          
          DicomService.cleanupCornerstoneElement(element)
        } catch (error) {
          console.warn('Error cleaning up cornerstone:', error)
        }
      }
    }
  }, []) // 只在組件掛載時執行一次

  // 處理視窗大小變化
  useEffect(() => {
    const handleResize = () => {
      console.log('🪟 Window resized')
      setTimeout(forceResize, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 載入 DICOM 檔案
  useEffect(() => {
    if (dicomFile && elementRef.current) {
      loadDicomFile(dicomFile)
    }
  }, [dicomFile])

  const loadDicomFile = async (file) => {
    try {
      console.log('🔄 Loading DICOM file...')
      
      // 使用服務層載入檔案
      const result = await DicomService.loadDicomFile(file)
      const { image: loadedImage, patientData } = result

      // 更新狀態
      setPatientData(patientData)
      onPatientDataParsed?.(patientData)

      // 確保元素已啟用，然後顯示影像
      if (elementRef.current) {
        await DicomService.setupCornerstoneElement(elementRef.current, loadedImage)
        
        // 確保影像適應容器並居中
        setTimeout(() => {
          DicomService.forceResize(elementRef.current)
          updateViewportFromCornerstone()
          console.log('✅ Image loaded, fitted to window, and viewport updated')
        }, 200)

        setImage(loadedImage)
      }
    } catch (error) {
      console.error('❌ Error loading DICOM file:', error)
      alert(`Error loading DICOM file: ${error.message}`)
    }
  }

  return { image, viewport }
}