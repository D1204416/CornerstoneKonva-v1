// services/DicomService.js
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import * as dicomParser from 'dicom-parser'
import { ANNOTATION_CONFIG } from '../config/annotation'

export class DicomService {
  /**
   * 初始化 Cornerstone 庫
   */
  static initializeCornerstone() {
    try {
      // Configure WADO Image Loader
      cornerstoneWADOImageLoader.external.cornerstone = cornerstone
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser

      // Configure WADO Image Loader settings
      cornerstoneWADOImageLoader.configure(ANNOTATION_CONFIG.DICOM.WADO_CONFIG)

      console.log('✅ Cornerstone initialized successfully')
      return true
    } catch (error) {
      console.error('❌ Error initializing Cornerstone:', error)
      return false
    }
  }

  /**
   * 載入 DICOM 檔案
   * @param {File} file - DICOM 檔案
   * @returns {Promise<{image: Object, patientData: Object}>}
   */
  static async loadDicomFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const byteArray = new Uint8Array(arrayBuffer)
      const dataSet = dicomParser.parseDicom(byteArray)

      // 解析病患資訊
      const patientData = this.parsePatientData(dataSet)

      // 載入影像
      const blob = new Blob([byteArray], { type: 'application/dicom' })
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(blob)
      const image = await cornerstone.loadImage(imageId)

      return {
        image,
        patientData,
        imageId
      }
    } catch (error) {
      console.error('❌ Error loading DICOM file:', error)
      throw new Error(`Failed to load DICOM file: ${error.message}`)
    }
  }

  /**
   * 解析 DICOM 病患資訊
   * @param {Object} dataSet - DICOM 資料集
   * @returns {Object} 病患資訊
   */
  static parsePatientData(dataSet) {
    const birthdateRaw = dataSet.string('x00100030')
    const birthdate = this.formatDate(birthdateRaw) || 'Unknown'

    const ageRaw = dataSet.string('x00101010')
    const age = ageRaw || this.calculateAgeFromBirthdate(birthdate)

    return {
      patientName: dataSet.string('x00100010') || 'Unknown',
      patientId: dataSet.string('x00100020') || 'Unknown',
      birthdate,
      age,
      sex: dataSet.string('x00100040') || 'Unknown',
      studyDate: this.formatDate(dataSet.string('x00080020')) || 'Unknown',
      studyDescription: dataSet.string('x00081030') || 'Unknown',
      seriesDescription: dataSet.string('x0008103e') || 'Unknown'
    }
  }

  /**
   * 格式化 DICOM 日期
   * @param {string} dateString - DICOM 日期字串
   * @returns {string} 格式化後的日期
   */
  static formatDate(dateString) {
    if (!dateString || dateString.length !== 8) return dateString
    return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`
  }

  /**
   * 從生日計算年齡
   * @param {string} birthdateStr - 生日字串
   * @returns {string} 年齡
   */
  static calculateAgeFromBirthdate(birthdateStr) {
    if (!birthdateStr || birthdateStr === 'Unknown') return 'Unknown'
    
    try {
      const today = new Date()
      const birthdate = new Date(birthdateStr)
      let age = today.getFullYear() - birthdate.getFullYear()
      const monthDiff = today.getMonth() - birthdate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--
      }
      
      return age.toString()
    } catch (error) {
      console.warn('Error calculating age:', error)
      return 'Unknown'
    }
  }

  /**
   * 檢查元素是否已啟用
   * @param {HTMLElement} element - DOM 元素
   * @returns {boolean} 是否已啟用
   */
  static isElementEnabled(element) {
    try {
      return !!cornerstone.getEnabledElement(element)
    } catch (error) {
      return false
    }
  }

  /**
   * 設置 Cornerstone 元素
   * @param {HTMLElement} element - DOM 元素
   * @param {Object} image - Cornerstone 影像物件（可選）
   */
  static async setupCornerstoneElement(element, image = null) {
    try {
      // 只有當元素未啟用時才啟用
      if (!this.isElementEnabled(element)) {
        cornerstone.enable(element)
        console.log('✅ Cornerstone element enabled')
      }

      // 如果有影像，則顯示影像
      if (image) {
        await cornerstone.displayImage(element, image)
        console.log('✅ Image displayed in Cornerstone element')
        
        // 自動適應視窗
        setTimeout(() => {
          cornerstone.fitToWindow(element)
          console.log('✅ Image fitted to window')
        }, 100)
      }
    } catch (error) {
      console.error('❌ Error setting up Cornerstone element:', error)
      throw error
    }
  }

  /**
   * 獲取 Cornerstone 視窗資訊
   * @param {HTMLElement} element - DOM 元素
   * @returns {Object|null} 視窗資訊
   */
  static getCornerstoneViewport(element) {
    try {
      if (!element || !this.isElementEnabled(element)) {
        return null
      }

      const enabledElement = cornerstone.getEnabledElement(element)
      
      // 檢查是否有影像載入
      if (!enabledElement.image) {
        console.log('No image loaded in Cornerstone element')
        return null
      }

      const cornerstoneViewport = cornerstone.getViewport(element)
      const canvas = enabledElement.canvas

      // 確保所有必要的屬性都存在
      if (!cornerstoneViewport || !canvas) {
        console.warn('Incomplete viewport or canvas data')
        return null
      }

      return {
        width: canvas.width,
        height: canvas.height,
        scale: cornerstoneViewport.scale || 1,
        translation: cornerstoneViewport.translation || { x: 0, y: 0 }
      }
    } catch (error) {
      console.warn('Warning: Could not get cornerstone viewport:', error)
      return null
    }
  }

  /**
   * 強制重新調整 Cornerstone 元素大小
   * @param {HTMLElement} element - DOM 元素
   */
  static forceResize(element) {
    try {
      if (element && this.isElementEnabled(element)) {
        cornerstone.resize(element, true)
        
        const enabledElement = cornerstone.getEnabledElement(element)
        if (enabledElement.image) {
          cornerstone.fitToWindow(element)
        }
      }
    } catch (error) {
      console.warn('Warning: Error forcing resize:', error)
    }
  }

  /**
   * 清理 Cornerstone 元素
   * @param {HTMLElement} element - DOM 元素
   */
  static cleanupCornerstoneElement(element) {
    try {
      if (element && this.isElementEnabled(element)) {
        cornerstone.disable(element)
        console.log('✅ Cornerstone element disabled')
      }
    } catch (error) {
      console.warn('Warning: Error disabling cornerstone element:', error)
    }
  }
}