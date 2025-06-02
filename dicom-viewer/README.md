# 🦷 DICOM Labeling App with Cornerstone & Konva

這是一個基於 React、Cornerstone.js 與 Konva.js 的 DICOM 標註應用程式，支援 DICOM 影像的瀏覽與自由多邊形標記，可用於醫療影像的教學、注解或資料標註工作。

---

## 📌 主要功能

* 📂 上傳並顯示 DICOM 檔案（\*.dcm）
* 🖊️ 支援自由多邊形標註（可繪製、移動、編輯、刪除頂點）
* 🔍 圖像與標註位置自動同步、支援放大縮小
* 💬 互動提示（完成標記、退出編輯等）
* 🧠 使用 Zustand 管理全域狀態

---

## 🔧 技術使用

* **React 18 + Vite**：快速開發與模組燒製
* **Cornerstone.js**：DICOM 醫療影像顯示
* **Konva.js / React-Konva**：Canvas 圖像互動與標註
* **Zustand**：軟量高效的全域狀態管理
* **dicom-parser**：解析 DICOM 資料欄位

---

## 📁 專案結構
```
dicom-viewer/
├── 📁 public/
│   └── index.html                # React 預設入口頁面模板
│
├── 📁 src/
│   ├── 📁 assets/                # 放置圖片、圖示等靜態資源
│
│   ├── 📁 components/            # 所有可視化 UI 元件
│   │   ├── 📁 Annotation/        # Konva 標註繪圖相關元件
│   │   │   ├── DrawingPreview.jsx       # 多邊形繪製預覽效果（頂點、虛線、紅圈）
│   │   │   ├── InteractionHandler.jsx   # Konva 的 Stage 與事件包裝器（點擊/滑鼠移動等）
│   │   │   └── PolygonRenderer.jsx      # 多邊形呈現與編輯（可拖拉、增減頂點）
│   │   │
│   │   ├── 📁 DicomViewer/       # DICOM 顯示與繪圖疊加層元件
│   │   │   ├── DicomViewer.jsx         # 顯示影像、掛載 Cornerstone、Konva Canvas
│   │   │   ├── DicomViewer.css         # 影像與畫布樣式設定
│   │   │   ├── DrawingCanvas.jsx       # Konva 畫布，統整繪圖/編輯功能
│   │   │   └── DrawingCanvasUI.jsx     # 顯示繪圖/編輯控制面板（右上角提示）
│   │   │
│   │   ├── LabelList.jsx         # 顯示所有標註的清單（可編輯/刪除）
│   │   ├── LabelList.css         # 標註清單樣式
│   │   ├── LabelTools.jsx        # 控制繪圖工具列（Add 按鈕）
│   │   ├── LabelTools.css        # 繪圖工具樣式
│   │   ├── PatientInfo.jsx       # 顯示病患資料（姓名、性別、生日等）
│   │   └── PatientInfo.css       # 病患資訊區樣式
│
│   ├── 📁 config/
│   │   └── annotation.js         # 標註全域設定（顏色、點半徑、距離閾值等）
│
│   ├── 📁 hooks/                 # 自定義 React hooks（功能邏輯抽離）
│   │   ├── useDicomLoader.js        # Cornerstone 初始化與影像載入 Hook
│   │   ├── useDrawingCanvas.js     # Konva 畫布尺寸控制、滑鼠位置、鍵盤事件
│   │   └── usePolygonDrawing.js    # 多邊形繪圖狀態與點擊/雙擊事件處理
│
│   ├── 📁 services/              # 邏輯與資料處理
│   │   ├── DicomService.js          # DICOM 檔案載入、解析、顯示與 Cornerstone 控制
│   │   └── AnnotationService.js     # 標註驗證、面積/周長計算、匯入/匯出 JSON
│
│   ├── 📁 store/
│   │   └── useAnnotationStore.js    # 使用 Zustand 管理全域狀態（標註、DICOM、繪圖狀態）
│
│   ├── 📁 utils/
│   │   └── coordinateUtils.js       # Canvas <-> DICOM 座標轉換工具（拖拉/繪圖核心）
│
│   ├── App.jsx                  # 主畫面，整合病患資訊、DICOM Viewer、標註工具與清單
│   ├── App.css                  # 主畫面樣式
│   ├── main.jsx                 # React 入口，掛載 App 至 DOM
│   └── index.css               # 全域樣式（reset、body 配置）
│
├── .gitignore                  # 忽略 node_modules、log、環境檔等不納入版本控制
├── package.json                # npm 設定與依賴列表
└── vite.config.js              # Vite 開發伺服器與 Cornerstone 依賴配置
```
       

## 🚀 安裝與啟動方式

```bash
# 進入資料夾
cd dicom-viewer

# 安裝依賴套件
npm install

# 啟動開發伺服器
npm run dev
```

預設啟動於 [http://localhost:3000](http://localhost:3000)

---

## 📷 使用說明

1. 點選「Upload DICOM」按鈕上傳 `.dcm` 影像
2. 點選「Add」按鈕進入繪圖模式
3. 在影像上主動點擊設立多邊形（至少三個點）
4. 點擊起始點或雙擊以結束繪圖
5. 使用標註清單編輯或刪除標註

---




