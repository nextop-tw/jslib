# NekoJS

輕量的前端工具庫，以純 ES Module 組成，無需打包工具。

---

## 目錄

- [安裝](#安裝)
- [Custom Elements](#custom-elements)
  - [neko-el](#neko-el)
  - [neko-vue3](#neko-vue3)
- [Components](#components)
  - [Form](#form)
  - [Table](#table)
  - [Rows](#rows)
  - [OTP](#otp)
  - [Tree](#tree)
  - [Tabs](#tabs)
  - [Modal](#modal)
  - [Dialog](#dialog)
- [Utils](#utils)
  - [Ajax](#ajax)
  - [Queue](#queue)
  - [Timer](#timer)
  - [TreeNodes](#treenodes)
  - [Sortable](#sortable)
  - [Uploader](#uploader)
  - [Mask](#mask)
  - [Loading](#loading)
  - [Transition](#transition)
  - [URL](#url)
  - [Browser](#browser)
  - [Drop](#drop)
- [Prototypes](#prototypes)
  - [String](#string)
  - [Array](#array)
  - [Number](#number)
  - [Element](#element)
  - [FormData](#formdata)

---

## 安裝

無需安裝。透過 jsDelivr CDN 引入（指定版本號確保穩定）：

```html
<!-- Custom Element -->
<script type="module" src="https://cdn.jsdelivr.net/gh/nextop-tw/jslib@main/nekojs/1.0.0/elements/neko.js"></script>

<!-- 或 Vue 3 響應式版本 -->
<script type="module" src="https://cdn.jsdelivr.net/gh/nextop-tw/jslib@main/nekojs/1.0.0/elements/neko-vue3.js"></script>

<!-- 或打包版（IIFE，含全部模組） -->
<script src="https://cdn.jsdelivr.net/gh/nextop-tw/jslib@main/nekojs/1.0.0/neko-app.min.js"></script>
```

> 將 URL 中的 `1.0.0` 替換為所需版本號即可切換版本。

本地開發時可直接引入：

```html
<script type="module" src="elements/neko.js"></script>
```

---

## Custom Elements

### neko-el

動態載入指定模組並初始化到元素上，不需要寫任何 JS。

```html
<script type="module" src="elements/neko.js"></script>

<neko-el data-import="components/form.js">
  <form action="/api/save" data-ajax="1">
    <input name="title" required />
    <button type="submit">送出</button>
  </form>
</neko-el>
```

| 屬性 | 說明 |
|---|---|
| `data-import` | 要載入的模組路徑（必填） |

---

### neko-vue3

與 `neko-el` 相同，但內部 HTML 會被當作 Vue 3 template，自動提供響應式狀態。

Vue 3 從 CDN 自動載入，無需額外安裝。

```html
<script type="module" src="elements/neko-vue3.js"></script>

<neko-vue3 data-import="components/form.js">
  <form action="/api/save" data-ajax="1">
    <input name="title" required />
    <button :disabled="loading">
      {{ loading ? '送出中...' : '送出' }}
    </button>
    <p v-if="fail" style="color:red">{{ message }}</p>
    <p v-if="success" style="color:green">送出成功！</p>
  </form>
</neko-vue3>
```

**自動提供的響應式變數：**

| 變數 | 型別 | 說明 |
|---|---|---|
| `loading` | `boolean` | AJAX 送出中 |
| `success` | `boolean` | 送出成功 |
| `fail` | `boolean` | 送出失敗 |
| `message` | `string` | 失敗訊息 |
| `data` | `object` | 成功回應資料 |

---

## Components

### Form

表單處理元件，支援 AJAX 送出、欄位驗證、成功/失敗通知、轉址。

```js
import Form from './components/form.js'

const form = new Form('#my-form')
form.on('success', (res) => { console.log(res) })
form.on('fail', (res) => { console.log(res) })
```

#### HTML 屬性

放在容器或 `<form>` 上：

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | 送出的 API 網址 | `form.action` |
| `data-method` | HTTP 方法 | `post` |
| `data-ajax` | 是否 AJAX 送出（`1` / `0`） | `1` |
| `data-notify` | 通知方式（`toast` / `alert`） | `toast` |
| `data-success` | 成功通知訊息 | — |
| `data-next` | 成功後轉址（`reload` 表示重新整理） | — |

#### 轉址行為

| `data-success` | `data-next` | `data-notify` | 行為 |
|---|---|---|---|
| 無 | 有 | — | 直接跳轉 |
| 有 | 有 | `toast`（預設） | toast 消失後跳轉 |
| 有 | 有 | `alert` | 點確定後跳轉 |
| 有 | 無 | — | 只顯示通知 |

`data-next` 支援 response 變數替換：

```html
data-next="/order/{id}"
<!-- 成功後跳至 /order/123，{id} 取自 response.result.id -->
```

#### 事件

```js
form.on('validate', (input) => {
  // 自訂欄位驗證，return false 中止送出
})

form.on('submit', async (formData) => {
  // 送出前攔截，return false 取消
})

form.on('done', (response) => {
  // 收到回應後攔截，return false 不繼續處理
})

form.on('success', (response) => { })
form.on('fail', (response) => { })
```

#### 方法

```js
form.submit()              // 程式觸發送出
form.reset()               // 重設表單
form.setSuccessCheck(fn)   // 自訂成功判斷，預設 res.status === '1' || res.success === true
```

#### 欄位驗證

使用原生 HTML 驗證屬性：

```html
<input name="email" type="email" required />
<input name="age" type="number" min="18" />
```

`data-confirm` — 比對兩個欄位是否相同：

```html
<input name="password" type="password" />
<input name="confirm" data-confirm="password" data-error="密碼不一致" />
```

`data-change="1"` — 欄位變更時自動送出：

```html
<select name="category" data-change="1"></select>
```

---

### Table

資料表元件，支援 AJAX 載入、分頁、排序、搜尋，適用任何容器（不限 `<table>`）。

```js
import Table from './components/table.js'

const table = new Table('#my-table')
table.on('beforeFetch', (params) => {
  // 可直接修改 params（傳參考）
  params.keyword = params.search
  delete params.search
})
table.on('render', (el, data, index) => {
  // 每列渲染後呼叫，可修改 DOM
})
```

#### 模式

| `data-mode` | 說明 |
|---|---|
| `server`（預設） | 每次操作重新打 API |
| `client` | 載入一次，前端處理分頁 / 排序 / 搜尋 |

#### HTML 屬性

放在容器上：

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | API 網址 | — |
| `data-mode` | `server` / `client` | `server` |
| `data-limit` | 每頁筆數 | `10` |
| `data-param-page` | 自訂 page 參數名稱 | `page` |
| `data-param-limit` | 自訂 limit 參數名稱 | `limit` |
| `data-param-sort` | 自訂 sort 參數名稱 | `sort` |
| `data-param-order` | 自訂 order 參數名稱 | `order` |
| `data-param-search` | 自訂 search 參數名稱 | `search` |

#### 子元素

| 選擇器 | 說明 |
|---|---|
| `[data-body]` | 資料列容器，每次渲染會清空後重建 |
| `<template>` | 每列的模板，使用 `${key}` 替換資料 |
| `[data-empty]` | 無資料時顯示 |
| `[data-pagination]` | 分頁按鈕容器 |
| `[data-search]` | 搜尋輸入框 |
| `[data-per-page]` | 每頁筆數下拉選單 |
| `[data-sort]` | 排序欄位（`data-sort="name"` 指定欄位名稱） |

#### HTML 範例

```html
<div id="my-table" data-action="/api/users" data-mode="server" data-limit="10">

  <input data-search placeholder="搜尋..." />
  <select data-per-page>
    <option value="10">10</option>
    <option value="25">25</option>
  </select>

  <table>
    <thead>
      <tr>
        <th data-sort="name">姓名</th>
        <th data-sort="email">Email</th>
      </tr>
    </thead>
    <tbody data-body></tbody>
  </table>

  <template>
    <tr>
      <td>${name}</td>
      <td>${email}</td>
    </tr>
  </template>

  <p data-empty>暫無資料</p>
  <div data-pagination></div>
</div>
```

#### API Response 格式

```json
{
  "status": true,
  "results": {
    "list": [...],
    "meta": { "results": 100, "limit": 10, "total": 10, "page": 1 }
  }
}
```

#### 事件

```js
table.on('beforeFetch', (params) => {
  // 可直接修改 params 物件，影響送出的查詢參數
})

table.on('afterFetch', (result) => { })

table.on('render', (el, data, index) => {
  // 每列渲染後，可修改 DOM
})

table.on('done', (result) => { })
table.on('error', (err) => { })
```

#### 方法

```js
table.fetch()        // 載入（可帶額外參數）
table.reload()       // 重新載入目前頁
table.setPage(3)     // 跳至指定頁碼
```

---

### Rows

動態新增 / 刪除列元件，適合標籤清單、明細項目等可變長度欄位。

```js
import Rows from './components/rows.js'

const rows = new Rows('#my-rows')

rows.on('append', (data) => {
  // 新增前，return false 取消
})

rows.on('remove', (el, data) => {
  // 刪除前，return false 取消
})

rows.on('render', (el, data) => {
  // 列渲染後，可修改 DOM
})

// 批次載入
rows.load([
  { title: 'Item A', value: '1' },
  { title: 'Item B', value: '2' },
])

// 程式新增
rows.append({ title: 'Item C', value: '3' })

rows.clear()      // 清空
rows.count        // 目前列數
rows.getRows()    // 所有列元素陣列
```

#### HTML 屬性 / 子元素

| 屬性 / 選擇器 | 說明 |
|---|---|
| `[data-body]` | 列容器 |
| `<template>` | 每列模板，使用 `${key}` 替換資料 |
| `[data-append]` | 新增按鈕；若為 `<input>` 則按 Enter 新增，搭配 `data-key` 指定填入欄位名稱 |
| `[data-remove]` | 刪除按鈕（放在 template 內） |
| `[data-rank]` | 顯示序號（1 開始），每次變動自動更新 |
| `[data-counter]` | 顯示總列數 |
| `[data-name="items[{index}][title]"]` | 欄位自動命名，`{index}` 自動替換為 0-based 索引 |

#### HTML 範例

```html
<div id="my-rows">
  <button data-append type="button">新增</button>
  <!-- 或 input enter 新增 -->
  <!-- <input data-append data-key="title" placeholder="輸入後按 Enter" /> -->

  <span>共 <b data-counter>0</b> 筆</span>

  <div data-body></div>

  <template>
    <div data-row>
      <span data-rank></span>
      <input data-name="items[{index}][title]" value="${title}" />
      <button data-remove type="button">刪除</button>
    </div>
  </template>
</div>
```

---

### OTP

一次性驗証碼元件，整合 Timer + ajax + dialog。

```js
import OTP from './components/otp.js'

const otp = new OTP('#my-otp')

otp.on('sent', (res) => {
  // 發送成功，倒數開始
})
otp.on('tick', (sec) => { })
otp.on('ready', () => {
  // 倒數結束，可重新發送
})
otp.on('error', (res) => { })
```

#### HTML 屬性

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | 發送 API 網址 | — |
| `data-seconds` | 倒數秒數 | `60` |

#### 子元素

| 選擇器 | 說明 |
|---|---|
| `[data-account]` | 帳號輸入框（找不到則自動取第一個 `<input>`） |
| `[data-send]` | 發送按鈕，倒數中自動 disabled + `is-disabled` class |
| `[data-timer]` | 倒數秒數顯示區（選用） |

#### HTML 範例

```html
<div id="my-otp"
     data-action="/api/otp/send"
     data-seconds="60">

  <input data-account type="email" placeholder="信箱" />

  <button data-send type="button">
    發送驗證碼 <span data-timer></span>
  </button>

  <input name="code" placeholder="驗證碼" />
</div>
```

API 送出格式：`POST data-action` with `{ account }`

#### 方法

```js
otp.counting    // 是否倒數中
otp.start(30)   // 手動啟動倒數（不打 API）
```

---

### Tree

樹狀結構 UI 元件，從 API 或資料渲染，支援 Drop 拖移、current 標記、breadcrumb。

```js
import Tree from './components/tree.js'

const tree = new Tree('#my-tree')

tree.on('click', (node, el) => {
  // return false → 阻止跳轉
})

tree.on('drop', (el, node, payload) => {
  // 拖曳放入節點
})

tree.on('done', (list) => { })

tree.load()   // 從 data-action 打 API 載入

// 手動帶資料
tree.render([
  { id: 1, parent_id: 0, name: '根' },
  { id: 2, parent_id: 1, name: '子 A' },
])

tree.current(2)              // 設定當前節點，自動加 is-current class
tree.breadcrumb()            // [根, 子 A]（由根到當前節點）
tree.isLeaf(2)               // true
tree.children(1)             // [{ id: 2, ... }]
tree.node(2)                 // { id: 2, parent_id: 1, name: '子 A' }
tree.nodeEl(2)               // DOM 元素
```

#### HTML 屬性

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | API 網址 | — |
| `data-node-key` | 節點 ID 欄位名稱 | `id` |
| `data-parent-key` | 父節點 ID 欄位名稱 | `parent_id` |
| `data-drop` | 是否啟用 Drop 拖移（`true`） | — |

#### Template（3 種）

| `data-template` | 說明 |
|---|---|
| `root` | 根容器，需含 `[data-body="children"]` |
| `node` | 有子節點，需含 `[data-node]` + `[data-body="children"]` |
| `leaf` | 葉節點，需含 `[data-node]` |

均使用 `${key}` 替換節點資料欄位。

#### HTML 範例

```html
<div id="my-tree" data-action="/api/categories" data-drop="true">
  <div data-body></div>

  <template data-template="root">
    <ul data-body="children"></ul>
  </template>

  <template data-template="node">
    <li data-node data-id="${id}">
      <a href="/c/${id}">${name}</a>
      <ul data-body="children"></ul>
    </li>
  </template>

  <template data-template="leaf">
    <li data-node data-id="${id}">
      <a href="/c/${id}">${name}</a>
    </li>
  </template>
</div>
```

#### 事件

```js
tree.on('node.ready', (el, node) => { })    // 節點 DOM 就緒
tree.on('click', (node, el) => { })         // 點擊節點，return false 阻止跳轉
tree.on('drop.over', (el, node) => { })     // 拖曳經過節點，return false 標記禁止
tree.on('drop', (el, node, payload) => { }) // 放入節點
tree.on('drop.cleanup', () => { })          // drop 後清理
tree.on('done', (list) => { })              // load() 完成
```

---

### TreeNodes

純資料結構工具，處理平坦陣列 ↔ 樹狀結構轉換，可獨立使用。

```js
import TreeNodes from './utils/tree-nodes.js'

const nodes = new TreeNodes({ nodeKey: 'id', parentKey: 'parent_id' })

nodes.load([
  { id: 1, parent_id: 0, name: '根' },
  { id: 2, parent_id: 1, name: '子 A' },
  { id: 3, parent_id: 1, name: '子 B' },
  { id: 4, parent_id: 2, name: '孫 A' },
])

nodes.toTree()
// [{ id: 1, children: [{ id: 2, children: [{ id: 4 }] }, { id: 3 }] }]

nodes.get(2)           // { id: 2, parent_id: 1, name: '子 A' }
nodes.ancestors(4)     // [根, 子 A, 孫 A]（由根到自身）
nodes.descendants(1)   // [子 A, 孫 A, 子 B]（所有子孫）
nodes.children(1)      // [子 A, 子 B]（直接子節點）
nodes.isLeaf(4)        // true
nodes.size             // 4
```

---

### Tabs

頁籤切換元件，純 DOM，無依賴。

```js
import Tabs from './components/tabs.js'

const tabs = new Tabs('#my-tabs')

tabs.on('change', (name, panel) => {
  // name  — 頁籤名稱
  // panel — 對應的 panel DOM 元素
})

tabs.show('address')  // 程式切換
tabs.active           // 目前頁籤名稱
```

#### HTML 範例

```html
<div id="my-tabs">
  <!-- Tabs 導覽 -->
  <button data-tab="info">基本資料</button>
  <button data-tab="address">地址</button>
  <button data-tab="orders">訂單</button>

  <!-- Panels -->
  <div data-panel="info">基本資料內容...</div>
  <div data-panel="address">地址內容...</div>
  <div data-panel="orders">訂單內容...</div>
</div>
```

初始化時自動顯示第一個頁籤，或有 `is-active` class 的頁籤。

#### CSS 配合

```css
[data-panel]          { display: none; }
[data-panel].is-active{ display: block; }

[data-tab].is-active  { font-weight: bold; border-bottom: 2px solid currentColor; }
```

---

### Modal

對話視窗元件，純 DOM，無需 Bootstrap / jQuery。

```js
import Modal from './components/modal.js'

const modal = new Modal('#my-modal')

modal.on('open', (params) => {
  // 用 params 填入表單欄位
  modal.el.querySelector('[name="id"]').value = params.id
})

modal.on('close', () => { })

modal.open({ id: 1, name: 'John' })
modal.close()
modal.toggle()
```

#### HTML 結構

```html
<div id="my-modal" data-modal-dialog>
  <div data-modal-backdrop></div>
  <div data-modal-content>
    <button data-modal-close type="button">&times;</button>
    <form>
      <input name="name" />
    </form>
  </div>
</div>
```

#### 觸發按鈕（自動綁定）

```html
<!-- data-modal 指向目標，data-params 傳入 JSON 資料 -->
<button data-modal="#my-modal" data-params='{"id":1,"name":"John"}'>編輯</button>
```

引入 `modal.js` 後自動在 `document` 監聽點擊，支援動態新增的觸發元素。

#### 狀態 CSS

開啟時在 dialog 元素加上 `data-open` 屬性：

```css
[data-modal-dialog]            { display: none; }
[data-modal-dialog][data-open] { display: flex; position: fixed; inset: 0; }

[data-modal-backdrop] { position: absolute; inset: 0; background: rgba(0,0,0,.5); }
[data-modal-content]  { position: relative; background: #fff; border-radius: 8px; padding: 24px; }
```

#### 關閉方式

| 方式 | 說明 |
|---|---|
| `modal.close()` | 程式呼叫 |
| `[data-modal-close]` | 點擊關閉按鈕 |
| `[data-modal-backdrop]` | 點擊背景遮罩 |
| `ESC` | 鍵盤 |

#### 方法 / 屬性

```js
modal.open(params)   // 開啟，params 傳給 open 事件
modal.close()        // 關閉
modal.toggle()       // 切換
modal.isOpen         // boolean
modal.el             // dialog DOM 元素
```

#### 靜態方法

```js
// 取得已建立的實例（singleton per selector）
const modal = Modal.getInstance('#my-modal')
```

---

### Dialog

統一對話框介面，預設使用 SweetAlert2，可替換底層套件。

```js
import dialog from './components/dialog.js'

dialog.success('儲存成功')
dialog.error('發生錯誤')
dialog.warning('注意！')
dialog.info('提示訊息')
dialog.alert('一般提示')

// 確認對話框
const ok = await dialog.confirm('確定刪除？')
if (ok) { ... }

// Toast 通知（自動消失）
dialog.toast('已更新')
dialog.toast.success('成功')
dialog.toast.error('失敗')
dialog.toast.info('提示')

// notify 為 toast 的 alias
dialog.notify('已更新')
```

#### 替換底層套件

```js
dialog.setAdapter({
  show(options)    { ... },  // alert / success / error / warning / info
  confirm(options) { ... },  // 回傳 Promise<boolean>
  toast(options)   { ... },  // toast 通知
})
```

---

## Utils

### Ajax

HTTP 請求工具，基於 `fetch`，支援事件攔截。

```js
import ajax from './utils/ajax.js'

ajax.get('/api/data')
ajax.post('/api/save', { title: 'hello' })
ajax.put('/api/item/1', { title: 'updated' })
ajax.delete('/api/item/1')
```

#### 設定

```js
ajax.setBaseURL('https://api.example.com')
ajax.setHeaders({ 'X-Token': 'abc123' })

// Laravel CSRF（靜態 token）
ajax.setCsrf(document.querySelector('meta[name="csrf-token"]').content)

// Laravel Sanctum SPA（動態讀 cookie，每次請求重新取值）
ajax.setCsrf(() => decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''))
```

> `setCsrf()` 適用於 JSON 請求。使用 `Form` 元件時，CSRF token 會自動從 `@csrf` 產生的 `_token` 欄位提取，無需額外設定。

#### 事件

```js
ajax.on('beforeRequest', ({ method, url, config }) => {
  // return false 取消請求
})

ajax.on('afterRequest', ({ method, url, result }) => { })

ajax.on('error', (error) => {
  // error.status — HTTP 狀態碼
})
```

---

### Queue

依序執行一組 function，支援 async，任一步驟 return false 或 reject 即中止。

```js
import Queue from './utils/queue.js'

const q = new Queue()

q.append(() => validate())
q.append(async () => {
  const ok = await confirm('確定？')
  if (!ok) return false  // 中止
})
q.append(() => fetch('/api/save'))

const results = await q.run()
```

#### 方法

| 方法 | 說明 |
|---|---|
| `append(fn)` | 加入任務 |
| `run()` | 依序執行，回傳 `Promise<any[]>` |
| `clear()` | 清空所有任務 |

---

### Timer

倒數計時工具，支援暫停 / 恢復 / 循環，適用 OTP 倒數、送出冷卻等情境。

```js
import Timer from './utils/timer.js'

const timer = new Timer(60)  // 60 秒倒數

timer.on('tick', (sec) => {
  btn.textContent = `重新發送 (${sec})`
})

timer.on('stop', () => {
  btn.disabled = false
  btn.textContent = '重新發送'
})

timer.start()
```

#### 建構子

```js
new Timer(seconds, { interval, loop })
```

| 參數 | 說明 | 預設 |
|---|---|---|
| `seconds` | 初始秒數 | `0` |
| `interval` | 每次 tick 間隔（ms） | `1000` |
| `loop` | 結束後自動重新開始 | `false` |

#### 方法

```js
timer.start(60)      // 開始（可傳入新秒數）
timer.pause()        // 暫停
timer.resume()       // 繼續
timer.stop()         // 停止並重設
timer.format('{mm}:{ss}')  // 格式化，→ '01:00'
```

支援 `{hh}` `{mm}` `{ss}`（補零）與 `{h}` `{m}` `{s}`（不補零）。

#### 屬性

```js
timer.current   // 目前剩餘秒數
timer.running   // 是否計時中
```

#### 事件

```js
timer.on('tick', (sec) => { })   // 每次 tick
timer.on('stop', () => { })      // 時間到
timer.on('pause', (sec) => { })  // 暫停
timer.on('resume', (sec) => { }) // 繼續
```

---

### Sortable

拖曳排序工具，基於 SortableJS（CDN 自動載入），支援 AJAX 回寫順序。

```js
import Sortable from './components/sortable.js'

const s = new Sortable('#my-list')

s.on('sort', (items, payload) => {
  // items: [{ id, sort, el }, ...]
  // payload.data 預設已設好，可直接修改

  // 改成只送 ID 陣列
  payload.data = items.map(i => i.id)

  // return false → 取消 AJAX，不打 API
})

s.on('done', (response) => { })
s.on('error', (err) => { })
```

#### HTML 屬性

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | 排序 API 網址 | — |
| `data-handle` | 拖曳把手選擇器（如 `.drag-handle`） | — |
| `data-group` | SortableJS group 名稱（跨列表拖曳） | — |
| `data-id-key` | payload 中 id 的欄位名稱 | `id` |
| `data-sort-key` | payload 中排序值的欄位名稱 | `sort` |

#### HTML 範例

```html
<ul id="my-list"
    data-action="/api/items/sort"
    data-handle=".drag-handle">
  <li data-id="1"><span class="drag-handle">☰</span> Item 1</li>
  <li data-id="2"><span class="drag-handle">☰</span> Item 2</li>
  <li data-id="3"><span class="drag-handle">☰</span> Item 3</li>
</ul>
```

#### payload.data 預設格式

```json
[
  { "id": "1", "sort": 1 },
  { "id": "2", "sort": 2 }
]
```

欄位名稱可透過 `data-id-key` / `data-sort-key` 自訂：

```html
<!-- payload.data 變成 [{ item_id: '1', position: 1 }, ...] -->
<ul data-id-key="item_id" data-sort-key="position" ...>
```

#### 事件

```js
s.on('sort', (items, payload) => {
  // items  — 拖曳後的完整順序 [{ id, sort, el }]
  // payload.data — 預設 API payload，可直接修改
  // return false → 取消，不打 API
})

s.on('done', (response) => { })   // API 成功
s.on('error', (err) => { })       // API 失敗
```

#### 方法

```js
s.enable()     // 啟用拖曳
s.disable()    // 停用拖曳
s.destroy()    // 銷毀實例
s.getItems()   // 取得目前順序 [{ id, sort, el }]
```

---

### Uploader

檔案上傳工具，支援點擊選取、拖曳上傳、圖片預覽、即時 AJAX 上傳。

```js
import Uploader from './components/uploader.js'

const up = new Uploader('#my-uploader')

up.on('done', (response, el) => {
  // response.results.url — 已上傳檔案資訊
})

up.on('remove', (el, file) => {
  // return false → 取消刪除
})

up.on('error', (err, el) => { })
```

#### HTML 屬性

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | 上傳 API 網址 | — |
| `data-name` | hidden input 的 name（送出表單用） | `file` |
| `data-max` | 最多上傳幾個 | 無限制 |
| `data-accept` | 檔案類型（如 `image/*`） | — |
| `data-preload` | 預載 JSON（`[{ id, src, name }]`） | — |

#### 子元素

| 選擇器 | 說明 |
|---|---|
| `[data-trigger]` | 點擊或拖曳區，超過 `data-max` 自動隱藏 |
| `[data-body]` | 已上傳列表容器 |
| `<template>` | 每列模板（選用，不提供則使用預設樣式） |
| `[data-preview]` | `<img>` 預覽圖（放在 template 內） |
| `[data-filename]` | 顯示檔名（放在 template 內） |
| `[data-hidden]` | hidden input，存放上傳後的 ID / path |
| `[data-remove]` | 刪除按鈕（放在 template 內） |

#### HTML 範例

```html
<div id="my-uploader"
     data-action="/api/upload"
     data-name="photos[]"
     data-max="5"
     data-accept="image/*">

  <div data-trigger>
    <p>點擊或拖曳上傳圖片</p>
  </div>

  <div data-body></div>

  <template>
    <div data-row>
      <img data-preview style="width:80px;height:80px;object-fit:cover" />
      <span data-filename></span>
      <input data-hidden type="hidden" />
      <button data-remove type="button">&times;</button>
    </div>
  </template>
</div>
```

#### 方法

```js
up.count    // 目前已上傳列數
up.clear()  // 清空所有列
```

---

### Mask

在容器上顯示半透明遮罩與 loading spinner。

```js
import Mask from './utils/mask.js'

const mask = new Mask('#my-container')
mask.show()
mask.hide()
```

若容器內已有 `[data-mask]` 元素，會直接使用該元素而不自動建立。

```html
<div id="my-container">
  <!-- 自訂 loading 樣式 -->
  <div data-mask class="my-spinner">載入中...</div>
</div>
```

---

### Loading

全頁或容器級 loading 畫面，支援多組自訂 HTML。

```js
import Loading from './utils/loading.js'

// 全頁（不帶參數）
const loading = new Loading()

// 全頁，指定名稱
const loading = new Loading(null, 'a')

// 容器
const loading = new Loading('#my-form')

// 容器，指定名稱
const loading = new Loading('#my-form', 'a')

loading.show()
loading.hide()
```

有 `[data-loading]` / `[data-loading="name"]` 元素時使用自訂 HTML，否則自動產生 spinner。

```html
<!-- 全頁，多組自訂 -->
<body>
  <div data-loading="a"><img src="loading.gif" /></div>
  <div data-loading="b"><img src="loading2.gif" /></div>
</body>

<!-- 容器自訂 -->
<div id="my-form">
  <div data-loading>載入中...</div>
</div>
```

---

### Transition

頁面轉場，自動攔截內部連結與 Form 跳轉，支援 fade 與 loading screen 兩種模式。

```js
import Transition from './utils/transition.js'

// fade 淡出淡入（預設）
const transition = new Transition()

// loading screen
const transition = new Transition({ type: 'loading' })

// loading screen + 自訂畫面
const transition = new Transition({ type: 'loading', loading: 'page' })
```

| 選項 | 說明 | 預設 |
|---|---|---|
| `type` | `'fade'` 或 `'loading'` | `'fade'` |
| `loading` | 對應 `[data-loading="name"]` | — |
| `links` | 是否攔截 `<a>` 連結 | `true` |
| `duration` | 動畫時間（ms） | `300` |

**自動排除不攔截的連結：**
外部連結、`target="_blank"`、`download`、同頁錨點

**程式跳轉：**
```js
transition.go('/dashboard')
```

**自訂 loading HTML：**
```html
<body>
  <div data-loading="page">
    <img src="loading.gif" />
  </div>
</body>
```

---

### URL

繼承原生 `URL`，加入批次操作 query 參數與跳轉方法。

```js
import NekoURL from './utils/url.js'

// 不帶參數 → 使用目前頁面 URL
const url = new NekoURL()

// 相對或絕對路徑
const url = new NekoURL('/search')
const url = new NekoURL('https://example.com/page')
```

#### 方法（可串接）

| 方法 | 說明 |
|---|---|
| `setParams(obj)` | 批次設定 query 參數 |
| `removeParams(...keys)` | 批次移除 query 參數 |
| `clearParams()` | 清空所有 query 參數 |
| `go()` | 跳轉，整合 Transition 轉場 |

```js
// 跳轉並帶參數
new NekoURL('/search')
  .setParams({ keyword: 'hello', page: 1 })
  .go()
// → /search?keyword=hello&page=1

// 目前頁面清空參數後重新帶
new NekoURL()
  .clearParams()
  .setParams({ page: 2 })
  .go()

// 移除特定參數
new NekoURL()
  .removeParams('token', 'debug')
  .go()
```

原生 `URL` 的所有屬性與方法仍可使用：

```js
const url = new NekoURL('/search?page=1')
url.searchParams.get('page')   // '1'
url.pathname                   // '/search'
url.toString()                 // 'https://mysite.com/search?page=1'
```

---

### Browser

瀏覽器與裝置偵測工具，以 `navigator.userAgent` 為基礎。

```js
import browser from './utils/browser.js'

browser.isMobile    // true / false（手機）
browser.isTablet    // true / false（平板）
browser.isIOS       // true / false
browser.isAndroid   // true / false
browser.isIPad      // true / false
browser.isIPhone    // true / false
browser.isTouch     // true / false（支援觸控）
browser.device      // 'mobile' | 'tablet' | 'desktop'
browser.name        // 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown'
browser.userAgent   // navigator.userAgent 原始字串
```

```js
// 依裝置類型顯示不同 UI
if (browser.isMobile) {
  document.body.classList.add('is-mobile')
}

// 依瀏覽器條件處理
if (browser.name === 'safari') {
  // Safari 特定相容處理
}
```

---

### Drop

拖放目標區，處理外部元素拖入容器、落在特定節點上的互動。

與 Uploader 的拖曳不同：Uploader 是拖檔案上傳，Drop 是拖 DOM / 資料落點觸發業務邏輯（如看板卡片移欄、拖曳分類）。

```js
import Drop from './components/drop.js'

const drop = new Drop('#kanban')

// 自訂目標節點（預設抓最近的 [data-drop-node]）
drop.setFinder((target) => target.closest('[data-column]'))

// 是否允許放入（return false → 加 drag-over-disabled class）
drop.on('node.over', (node) => {
  if (node.dataset.locked) return false
})

// 放入後處理
drop.on('drop', (node, payload) => {
  console.log('落入節點：', node)
  console.log('payload：', payload)  // 來自 dataTransfer 的 JSON
})

drop.on('cleanup', () => { })
```

#### 拖曳來源端設定 payload

```js
el.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('payload', JSON.stringify({ id: 1, title: 'Task A' }))
})
```

#### HTML 範例

```html
<!-- 目標區 -->
<div id="kanban">
  <div data-drop-node data-column="todo">待辦</div>
  <div data-drop-node data-column="done">完成</div>
</div>

<!-- 拖曳來源 -->
<div draggable="true" class="card">Task A</div>
```

#### CSS 配合

```css
[data-drop-node].drag-over          { outline: 2px solid blue; }
[data-drop-node].drag-over-disabled { outline: 2px solid red; opacity: .5; }
```

#### 方法 / 事件

| | 說明 |
|---|---|
| `setFinder(fn)` | 自訂目標節點，`fn(target)` 回傳節點或 `null` |
| `on('node.over', (node) => {})` | 游標進入節點，return false 標記為不可放入 |
| `on('drop', (node, payload) => {})` | 放入事件，payload 為 JSON 解析結果 |
| `on('cleanup', () => {})` | drop 後清理（非同步，drop 完成後觸發） |

---

## Prototypes

副作用 import，引入後自動擴充原生物件，不需要接收回傳值。

```js
import './prototypes/string.js'
import './prototypes/array.js'
import './prototypes/number.js'
import './prototypes/element.js'
import './prototypes/formdata.js'
```

---

### String

| 方法 | 說明 | 範例 |
|---|---|---|
| `format(params)` | 替換 `{key}` 佔位符 | `'hi {name}'.format({ name: 'Jo' })` → `'hi Jo'` |
| `toJSON(default)` | 安全 JSON.parse，失敗回傳預設值 | `'{"a":1}'.toJSON()` → `{ a: 1 }` |
| `toNumber(default)` | 安全 Number()，失敗回傳預設值 | `'42'.toNumber(0)` → `42` |
| `ucfirst()` | 首字大寫 | `'hello'.ucfirst()` → `'Hello'` |

```js
'hello {name}, age {age}'.format({ name: 'John', age: 30 })  // 'hello John, age 30'
'not json'.toJSON('fallback')  // 'fallback'
'abc'.toNumber(0)              // 0
'world'.ucfirst()              // 'World'
```

---

### Array

| 方法 | 說明 |
|---|---|
| `shuffle()` | 隨機排列，回傳新陣列，不修改原陣列 |

```js
[1, 2, 3, 4, 5].shuffle()  // [3, 1, 5, 2, 4]（隨機）
```

---

### Number

| 方法 | 說明 |
|---|---|
| `between(min, max, inclusive?)` | 判斷數字是否在範圍內，預設包含邊界 |

```js
(5).between(1, 10)         // true
(10).between(1, 10)        // true（含邊界）
(10).between(1, 10, false) // false（不含邊界）
```

---

### Element

| 方法 | 說明 |
|---|---|
| `fill(source, attr?)` | 用物件或 FormData 填入欄位，預設以 `[name]` 對應 |
| `toFormData(attr?)` | 容器內欄位轉成 FormData |
| `toObject(attr?)` | 容器內欄位轉成物件 |

```js
// 填入資料
document.querySelector('#my-form').fill({
  name: 'John',
  role: 'admin',
})

// 讀取資料
const fd  = document.querySelector('#my-form').toFormData()
const obj = document.querySelector('#my-form').toObject()
// → { name: 'John', role: 'admin' }
```

支援 checkbox、radio、select multiple、textarea。

---

### FormData

| 方法 | 說明 |
|---|---|
| `FormData.fromObject(obj)` | 物件轉 FormData，支援巢狀結構 |
| `fd.fromObject(obj)` | 將物件資料加入現有 FormData |
| `fd.toObject()` | FormData 轉物件，支援巢狀結構 |
| `FormData.isFormData(val)` | 判斷是否為 FormData 實例 |

```js
// 物件轉 FormData（巢狀）
const fd = FormData.fromObject({
  user: { name: 'John', age: 30 },
  tags: ['a', 'b'],
})
// → user[name]=John, user[age]=30, tags[0]=a, tags[1]=b

// FormData 轉物件
fd.toObject()
// → { user: { name: 'John', age: '30' }, tags: { 0: 'a', 1: 'b' } }

// 判斷
FormData.isFormData(fd)   // true
FormData.isFormData({})   // false
```
