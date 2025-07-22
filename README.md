# WiseRSS - 智慧RSS閱讀系統

WiseRSS 是一個現代化的 RSS 閱讀器，提供智能的文章管理、分類和閱讀體驗。採用 React + Flask 全棧架構，支持多種閱讀模式和個性化設置。

## 🌟 主要特性

### 📖 智能閱讀體驗
- **三欄式佈局**: 導航側欄 + 文章列表 + 閱讀面板
- **多種閱讀狀態**: Later (稍後閱讀) / Shortlist (收藏) / Archive (存檔)
- **實時筆記系統**: 支持文章筆記、重點標記和評分
- **全文搜索**: 快速查找文章內容
- **閱讀進度追蹤**: 自動記錄閱讀位置和時間

### 🗂️ Feed 管理
- **智能分類**: 支持自定義分類和標籤
- **批量管理**: 批量添加、編輯、刪除 RSS 源
- **狀態監控**: 實時監控 Feed 更新狀態
- **錯誤處理**: 智能處理 RSS 源錯誤和重試
- **統計儀表板**: 直觀的 Feed 統計信息

### 🎨 現代化界面
- **深色主題**: 護眼的深色界面設計
- **響應式設計**: 支持桌面、平板、手機多端適配
- **流暢動畫**: 優雅的交互動效
- **個性化設置**: 支持主題、語言、佈局自定義

### 🔒 安全可靠
- **JWT 認證**: 安全的用戶認證系統
- **密碼加密**: bcrypt 加密存儲用戶密碼
- **權限控制**: 細粒度的用戶權限管理
- **數據備份**: 支持數據導入導出

## 🛠 技術架構

### 前端 (React)
```
frontend/
├── src/
│   ├── components/     # React 組件
│   ├── pages/         # 頁面組件
│   ├── services/      # API 服務層
│   ├── contexts/      # React Context
│   ├── hooks/         # 自定義 Hooks
│   └── utils/         # 工具函數
├── public/           # 靜態資源
└── package.json      # 依賴配置
```

**核心技術棧:**
- **React 18**: 前端框架
- **React Router 6**: 路由管理
- **React Query**: 數據獲取和緩存
- **React Hook Form**: 表單管理
- **Tailwind CSS**: 原子化 CSS 框架
- **Axios**: HTTP 客戶端

### 後端 (Flask)
```
backend/
├── app/
│   ├── models/        # 數據模型
│   ├── views/         # API 路由
│   ├── services/      # 業務邏輯
│   └── utils/         # 工具函數
├── config/           # 配置文件
├── migrations/       # 數據庫遷移
└── requirements.txt  # 依賴配置
```

**核心技術棧:**
- **Flask**: Python Web 框架
- **SQLAlchemy**: ORM 數據庫操作
- **Flask-JWT-Extended**: JWT 認證
- **MySQL**: 主數據庫
- **Redis**: 緩存和任務隊列
- **Celery**: 異步任務處理
- **Feedparser**: RSS 解析
- **BeautifulSoup**: HTML 解析

## 📊 數據庫設計

### 用戶表 (users)
| 字段 | 類型 | 說明 |
|------|------|------|
| id | Integer | 主鍵 |
| username | String(80) | 用戶名 |
| email | String(120) | 郵箱 |
| password_hash | String(128) | 密碼哈希 |
| preferences | JSON | 用戶偏好設置 |
| created_at | DateTime | 創建時間 |

### RSS源表 (feeds)
| 字段 | 類型 | 說明 |
|------|------|------|
| id | Integer | 主鍵 |
| user_id | Integer | 用戶ID (外鍵) |
| title | String(200) | Feed 標題 |
| url | String(500) | RSS URL |
| category | String(100) | 分類 |
| tags | Text | 標籤 (JSON) |
| is_active | Boolean | 是否啟用 |
| last_fetched | DateTime | 最後更新時間 |

### 文章表 (articles)
| 字段 | 類型 | 說明 |
|------|------|------|
| id | Integer | 主鍵 |
| feed_id | Integer | Feed ID (外鍵) |
| title | String(500) | 文章標題 |
| content | Text | 文章內容 |
| url | String(1000) | 原文連結 |
| published_at | DateTime | 發布時間 |

### 用戶文章關聯表 (user_articles)
| 字段 | 類型 | 說明 |
|------|------|------|
| id | Integer | 主鍵 |
| user_id | Integer | 用戶ID (外鍵) |
| article_id | Integer | 文章ID (外鍵) |
| is_read | Boolean | 是否已讀 |
| is_bookmarked | Boolean | 是否收藏 |
| reading_status | String(20) | 閱讀狀態 |
| notes | Text | 用戶筆記 |
| highlights | Text | 重點標記 (JSON) |

## 🚀 快速開始

### 環境要求
- Node.js 16+
- Python 3.8+
- MySQL 8.0+
- Redis 6.0+

### 安裝步驟

#### 1. 克隆項目
```bash
git clone https://github.com/your-username/wiseRSS.git
cd wiseRSS
```

#### 2. 設置後端
```bash
# 進入後端目錄
cd backend

# 創建虛擬環境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安裝依賴
pip install -r requirements.txt

# 配置環境變數
cp .env.example .env
# 編輯 .env 文件，設置數據庫連接信息

# 創建數據庫
mysql -u root -p -e "CREATE DATABASE wiserss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 初始化數據庫
python run.py init-db

# 創建管理員用戶
python run.py create-admin

# 創建演示數據 (可選)
python run.py create-demo-data

# 啟動後端服務
python run.py
```

#### 3. 設置前端
```bash
# 打開新終端，進入前端目錄
cd frontend

# 安裝依賴
npm install

# 配置 Tailwind CSS
npx tailwindcss init -p

# 啟動前端服務
npm start
```

#### 4. 訪問應用
- 前端: http://localhost:3000
- 後端 API: http://localhost:5000/api

### 默認賬戶
- 管理員: `admin` / `admin123`
- 演示用戶: `demo` / `demo123`

## 📋 API 文檔

### 認證相關
```
POST /api/auth/login          # 用戶登入
POST /api/auth/register       # 用戶註冊
GET  /api/auth/verify         # 驗證 Token
POST /api/auth/refresh        # 刷新 Token
POST /api/auth/logout         # 用戶登出
```

### Feed 管理
```
GET    /api/feeds             # 獲取 Feed 列表
POST   /api/feeds             # 新增 Feed
GET    /api/feeds/{id}        # 獲取單個 Feed
PUT    /api/feeds/{id}        # 更新 Feed
DELETE /api/feeds/{id}        # 刪除 Feed
POST   /api/feeds/{id}/refresh # 刷新 Feed
GET    /api/feeds/stats       # 獲取統計信息
```

### 文章管理
```
GET  /api/articles            # 獲取文章列表
GET  /api/articles/{id}       # 獲取單個文章
PUT  /api/articles/{id}/read  # 標記為已讀
PUT  /api/articles/{id}/bookmark # 切換收藏狀態
GET  /api/articles/search     # 搜索文章
POST /api/articles/{id}/notes # 添加筆記
```

## 🔧 配置說明

### 環境變數配置 (.env)
```bash
# Flask 配置
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# 數據庫配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=cabie
MYSQL_PASSWORD=Aa-12345
MYSQL_DATABASE=wiserss

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# RSS 配置
RSS_UPDATE_INTERVAL=3600  # 更新間隔 (秒)
RSS_REQUEST_TIMEOUT=30    # 請求超時 (秒)

# CORS 配置
CORS_ORIGINS=http://localhost:3000
```

### 數據庫配置
確保 MySQL 服務正在運行，並創建了對應的數據庫：
```sql
CREATE DATABASE wiserss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cabie'@'localhost' IDENTIFIED BY 'Aa-12345';
GRANT ALL PRIVILEGES ON wiserss.* TO 'cabie'@'localhost';
FLUSH PRIVILEGES;
```

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