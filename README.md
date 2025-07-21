# WiseRSS - 智慧RSS閱讀系統

一個現代化的Web RSS閱讀系統，採用React前端和Flask後端架構，提供優雅的用戶體驗和強大的RSS管理功能。

## 🚀 項目特色

### 核心功能
- **RSS訂閱管理**：輕鬆添加、編輯、刪除RSS源
- **智能文章閱讀**：現代化的閱讀界面，支持筆記和高亮
- **全局搜索**：快速搜索文章、RSS源和標籤
- **分類管理**：靈活的標籤和分類系統
- **閱讀進度追蹤**：自動記錄閱讀狀態和進度
- **收藏系統**：收藏重要文章，方便後續查看
- **響應式設計**：完美適配桌面、平板和手機

### 技術亮點
- **現代化UI**：基於Tailwind CSS的深色主題設計
- **高性能**：React Query實現的智能數據緩存
- **安全認證**：JWT token認證系統
- **RESTful API**：完整的後端API接口
- **數據庫支持**：支持SQLite、PostgreSQL、MySQL
- **自動更新**：定時自動獲取RSS源更新

## 🏗️ 技術架構

### 前端技術棧
- **React 18** - 現代化前端框架
- **React Router** - 單頁應用路由
- **React Query** - 數據獲取和緩存
- **React Hook Form** - 表單處理
- **Tailwind CSS** - 原子化CSS框架
- **FontAwesome** - 圖標庫
- **Axios** - HTTP客戶端
- **React Hot Toast** - 通知系統

### 後端技術棧
- **Flask** - 輕量級Python Web框架
- **SQLAlchemy** - ORM數據庫操作
- **Flask-JWT-Extended** - JWT認證
- **Flask-CORS** - 跨域支持
- **Feedparser** - RSS解析
- **BeautifulSoup** - HTML解析
- **Celery** - 異步任務處理
- **Redis** - 緩存和消息隊列

## 📁 項目結構

```
wiseRSS/
├── frontend/                 # React前端應用
│   ├── public/              # 靜態資源
│   ├── src/
│   │   ├── components/      # React組件
│   │   ├── pages/          # 頁面組件
│   │   ├── hooks/          # 自定義Hooks
│   │   ├── services/       # API服務
│   │   ├── styles/         # 樣式文件
│   │   └── utils/          # 工具函數
│   ├── package.json        # 前端依賴
│   └── tailwind.config.js  # Tailwind配置
│
├── backend/                 # Flask後端應用
│   ├── app/
│   │   ├── models/         # 數據模型
│   │   ├── routes/         # API路由
│   │   ├── services/       # 業務邏輯
│   │   └── utils/          # 工具函數
│   ├── migrations/         # 數據庫遷移
│   ├── requirements.txt    # Python依賴
│   ├── config.py          # 配置文件
│   └── run.py             # 應用入口
│
└── README.md              # 項目說明
```

## 🛠️ 安裝和部署

### 環境要求
- **Node.js** 16+ 和 npm
- **Python** 3.8+
- **Redis** (可選，用於Celery)
- **PostgreSQL/MySQL** (可選，默認使用SQLite)

### 快速開始

#### 1. 克隆項目
```bash
git clone <repository-url>
cd wiseRSS
```

#### 2. 後端設置
```bash
cd backend

# 創建虛擬環境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安裝依賴
pip install -r requirements.txt

# 配置環境變量
cp .env.example .env
# 編輯 .env 文件，設置必要的配置

# 初始化數據庫
python3 run.py init-db

# 創建管理員用戶
python3 run.py create-admin

# 啟動後端服務
python3 run.py
```

#### 3. 前端設置
```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發服務器
npm start
```

#### 4. 訪問應用
- 前端：http://localhost:3000
- 後端API：http://localhost:5000

## 📖 API文檔

### 認證接口
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/me` - 獲取當前用戶信息
- `PUT /api/auth/profile` - 更新用戶資料

### RSS源管理
- `GET /api/feeds` - 獲取RSS源列表
- `POST /api/feeds` - 添加新RSS源
- `PUT /api/feeds/{id}` - 更新RSS源
- `DELETE /api/feeds/{id}` - 刪除RSS源
- `POST /api/feeds/{id}/refresh` - 手動更新RSS源

### 文章管理
- `GET /api/articles` - 獲取文章列表
- `GET /api/articles/{id}` - 獲取單篇文章
- `PUT /api/articles/{id}/read` - 標記為已讀
- `POST /api/articles/{id}/favorite` - 添加到收藏
- `GET /api/articles/search` - 搜索文章

## 🎨 UI設計說明

### 設計理念
本項目的UI設計完全基於提供的原型圖，採用現代化的深色主題設計：

- **配色方案**：深灰色背景 (#0f0f0f, #1a1a1a, #2d2d2d)
- **布局結構**：三欄布局 (側邊欄 + 主內容 + 右側面板)
- **交互設計**：流暢的動畫效果和懸停狀態
- **響應式**：適配各種屏幕尺寸

### 主要頁面
1. **登入頁面**：現代化的認證界面，支持社交登入
2. **首頁**：文章列表展示，三欄布局設計
3. **Feed管理**：RSS源的增刪改查，統計儀表板
4. **搜索頁面**：全局搜索功能，智能篩選

## 🔧 開發指南

### 前端開發
```bash
cd frontend

# 安裝新依賴
npm install <package-name>

# 運行測試
npm test

# 構建生產版本
npm run build
```

### 後端開發
```bash
cd backend

# 安裝新依賴
pip install <package-name>
pip freeze > requirements.txt

# 運行測試
python -m pytest

# 代碼格式化
black app/
```

## 🚀 功能特色詳解

### RSS源管理
- **智能驗證**：自動驗證RSS URL有效性
- **批量操作**：支持批量添加、刪除、更新
- **健康監控**：監控RSS源狀態，自動處理錯誤
- **分類管理**：靈活的標籤和分類系統

### 文章閱讀
- **智能解析**：自動提取文章內容和元數據
- **閱讀追蹤**：記錄閱讀進度和狀態
- **筆記系統**：支持文章筆記和高亮標記
- **收藏功能**：收藏重要文章，方便管理

### 搜索功能
- **全文搜索**：搜索文章標題、內容、作者
- **多類型搜索**：支持文章、RSS源、標籤搜索
- **智能篩選**：按時間、來源、狀態篩選
- **搜索建議**：提供熱門搜索和相關建議

## 📊 數據庫模型

### User (用戶)
- 基本信息：用戶名、郵箱、密碼
- 個人設置：主題、語言、時區
- 閱讀偏好：每頁文章數、自動標記已讀

### Feed (RSS源)
- 基本信息：標題、URL、描述
- 分類標籤：分類、標籤數組
- 狀態管理：活躍、停用、錯誤
- 更新設置：自動更新、更新頻率

### Article (文章)
- 內容信息：標題、內容、摘要
- 元數據：作者、發布時間、字數
- 媒體資源：圖片、視頻URL
- 分類標籤：分類、標籤數組

### UserArticle (用戶文章關聯)
- 閱讀狀態：已讀、收藏、閱讀進度
- 用戶內容：筆記、高亮標記
- 時間戳：閱讀時間、收藏時間

## 🔒 安全特性

### 認證安全
- **JWT Token**：安全的token認證機制
- **密碼加密**：bcrypt加密存儲用戶密碼
- **Token刷新**：自動刷新過期token
- **登出機制**：安全的登出處理

### 數據安全
- **SQL注入防護**：ORM防止SQL注入攻擊
- **XSS防護**：前端輸入驗證和轉義
- **CORS配置**：合理的跨域資源共享配置
- **輸入驗證**：嚴格的前後端輸入驗證

## 🤝 貢獻指南

### 開發流程
1. Fork項目到個人倉庫
2. 創建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 創建Pull Request

### 代碼規範
- **前端**：遵循ESLint和Prettier配置
- **後端**：遵循PEP 8 Python代碼規範
- **提交信息**：使用語義化提交信息
- **文檔**：更新相關文檔和註釋

## 📝 更新日誌

### v1.0.0 (2024-01-01)
- ✨ 初始版本發布
- 🎨 完整的UI設計實現
- 🚀 核心功能開發完成
- 📱 響應式設計支持
- 🔒 安全認證系統
- 📊 RSS源管理功能
- 🔍 全局搜索功能

## 📄 許可證

本項目採用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情。

---

**WiseRSS** - 讓RSS閱讀變得更智慧、更優雅 ✨