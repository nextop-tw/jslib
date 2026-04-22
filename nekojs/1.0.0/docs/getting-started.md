# Getting Started

NekoJS 是輕量的前端工具庫，以純 ES Module 組成，**無需打包工具、無需 npm install**。

---

## 引入方式

### 透過 jsDelivr（推薦用於正式環境）

直接從 CDN 引入，指定版本號確保穩定：

```html
<!-- Custom Element（推薦，不用寫 JS） -->
<script type="module" src="https://cdn.jsdelivr.net/gh/nextop-tw/jslib@main/nekojs/1.0.0/elements/neko.js"></script>

<!-- 或 Vue 3 響應式版本 -->
<script type="module" src="https://cdn.jsdelivr.net/gh/nextop-tw/jslib@main/nekojs/1.0.0/elements/neko-vue3.js"></script>
```

或引入打包後的單一檔案（IIFE，含全部模組）：

```html
<script src="https://cdn.jsdelivr.net/gh/nextop-tw/jslib@main/nekojs/1.0.0/neko-app.min.js"></script>
```

或以 ESM 方式引入打包檔：

```js
import neko from 'https://cdn.jsdelivr.net/gh/nextop-tw/jslib@main/nekojs/1.0.0/neko-app.esm.min.js'
```

> 將 URL 中的 `1.0.0` 替換為所需版本號即可切換版本。

---

### 本地引入（開發環境）

直接在 HTML 用 `<script type="module">` 引入你需要的模組：

```html
<!-- Custom Element（推薦，不用寫 JS） -->
<script type="module" src="/path/to/nekojs/elements/neko.js"></script>

<!-- 或 Vue 3 響應式版本 -->
<script type="module" src="/path/to/nekojs/elements/neko-vue3.js"></script>
```

或在 JS 裡直接 import：

```js
import Form from '/path/to/nekojs/components/form.js'
import ajax from '/path/to/nekojs/utils/ajax.js'
```

---

## 三種使用方式

### 1. Custom Element — 純 HTML，零 JS

最簡單的用法，把 HTML 包在 `<neko-el>` 裡，模組自動載入初始化：

```html
<neko-el data-import="components/form.js">
  <form action="/api/save" data-ajax="1">
    <input name="title" required />
    <button type="submit">送出</button>
  </form>
</neko-el>
```

→ 詳見 [elements/neko-el.md](elements/neko-el.md)

---

### 2. Custom Element + Vue 3 — HTML + 響應式

需要響應式狀態（顯示/隱藏、動態文字）時，改用 `<neko-vue3>`：

```html
<neko-vue3 data-import="components/form.js">
  <form action="/api/save" data-ajax="1">
    <button :disabled="loading">{{ loading ? '送出中...' : '送出' }}</button>
    <p v-if="success">送出成功！</p>
    <p v-if="fail">{{ message }}</p>
  </form>
</neko-vue3>
```

自動提供 `loading`、`success`、`fail`、`message`、`data` 響應式變數，不需要寫任何 JS。

→ 詳見 [elements/neko-vue3.md](elements/neko-vue3.md)

---

### 3. 直接 import — 完整控制

需要完整控制時，直接 import class 使用：

```js
import Form from './components/form.js'

const form = new Form('#my-form')
form.on('success', (res) => { console.log(res) })
form.on('fail',    (res) => { console.log(res) })
```

---

## 目錄

| 模組 | 說明 | 文件 |
|---|---|---|
| `elements/neko.js` | Custom Element，動態載入模組 | [neko-el.md](elements/neko-el.md) |
| `elements/neko-vue3.js` | Custom Element + Vue 3 響應式 | [neko-vue3.md](elements/neko-vue3.md) |
| `components/form.js` | 表單 AJAX 提交 | [form.md](components/form.md) |
| `components/table.js` | 資料表（分頁、排序、搜尋） | [table.md](components/table.md) |
| `components/dialog.js` | 彈出訊息（alert / confirm） | [dialog.md](components/dialog.md) |
| `components/otp.js` | OTP 驗證碼發送 | [otp.md](components/otp.md) |
| `components/modal.js` | Modal 對話視窗 | [modal.md](components/modal.md) |
| `components/tabs.js` | 頁籤切換 | [tabs.md](components/tabs.md) |
| `components/rows.js` | 動態新增 / 刪除列 | [rows.md](components/rows.md) |
| `components/tree.js` | 樹狀 UI | [tree.md](components/tree.md) |
| `utils/ajax.js` | AJAX 工具 | [ajax.md](utils/ajax.md) |
| `utils/timer.js` | 倒數計時 | [timer.md](utils/timer.md) |
| `utils/uploader.js` | 檔案上傳 | [uploader.md](utils/uploader.md) |
| `utils/sortable.js` | 拖曳排序 | [sortable.md](utils/sortable.md) |
| `utils/loading.js` | Loading 遮罩 | [loading.md](utils/loading.md) |
| `utils/mask.js` | 容器遮罩 | [mask.md](utils/mask.md) |
| `utils/url.js` | URL 工具 | [url.md](utils/url.md) |
| `utils/browser.js` | 瀏覽器 / 裝置偵測 | [browser.md](utils/browser.md) |
| `utils/queue.js` | 非同步佇列 | [queue.md](utils/queue.md) |
| `utils/drop.js` | 拖放目標區 | [drop.md](utils/drop.md) |
| `utils/frame.js` | iframe 自動撐高 | [frame.md](utils/frame.md) |
| `utils/transition.js` | 頁面轉場 | [transition.md](utils/transition.md) |
| `utils/tree-nodes.js` | 樹狀資料結構 | [tree-nodes.md](utils/tree-nodes.md) |
