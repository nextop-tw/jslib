# Table

資料表元件，支援 AJAX 載入、分頁、排序、搜尋。

---

## 引入

```js
import Table from '/path/to/nekojs/components/table.js'
```

---

## 基本用法

```html
<div id="my-table" data-action="/api/list">

  <input data-search placeholder="搜尋..." />

  <table>
    <thead>
      <tr>
        <th data-sort="name">名稱</th>
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

  <div data-pagination></div>
  <div data-empty>目前沒有資料</div>
</div>
```

```js
const table = new Table('#my-table')
```

---

## HTML 屬性

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | API URL | — |
| `data-mode` | `server`（預設）/ `client` | `server` |
| `data-limit` | 每頁筆數 | `10` |

### 元素屬性

| 屬性 | 說明 |
|---|---|
| `data-body` | 渲染列的容器 |
| `data-search` | 搜尋輸入框（input） |
| `data-pagination` | 分頁容器 |
| `data-empty` | 無資料時顯示 |
| `data-per-page` | 每頁筆數選單（select） |
| `data-sort="field"` | 可排序的欄位標題 |

### 自訂 API 參數名稱

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-param-page` | 頁碼參數名稱 | `page` |
| `data-param-limit` | 每頁筆數參數名稱 | `limit` |
| `data-param-sort` | 排序欄位參數名稱 | `sort` |
| `data-param-order` | 排序方向參數名稱 | `order` |
| `data-param-search` | 搜尋參數名稱 | `search` |

---

## Template

使用 `${key}` 替換資料欄位：

```html
<template>
  <tr>
    <td>${id}</td>
    <td>${name}</td>
    <td>
      <a href="/edit/${id}">編輯</a>
    </td>
  </tr>
</template>
```

---

## API Response 格式

```json
{
  "status": true,
  "results": {
    "list": [{ "id": 1, "name": "John" }],
    "meta": { "page": 1, "total": 10, "results": 100, "limit": 10 }
  }
}
```

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `beforeFetch` | `params` | 請求前觸發，可直接修改 `params` 物件 |
| `afterFetch` | `result` | 收到資料後，渲染前觸發 |
| `render` | `el, data, index` | 每列渲染後觸發，可修改 DOM |
| `done` | `result` | 渲染完成後觸發 |
| `error` | `err` | 請求失敗時觸發 |

```js
// 修改請求參數
table.on('beforeFetch', (params) => {
  params.keyword = params.search
  delete params.search
})

// 渲染後修改每列
table.on('render', (el, data) => {
  if (data.status === 0) el.classList.add('is-disabled')
})
```

---

## Methods

| 方法 | 說明 |
|---|---|
| `fetch(extra)` | 載入資料，可傳入額外參數 |
| `reload()` | 用目前條件重新載入 |
| `setPage(page)` | 跳至指定頁碼 |

---

## Client 模式

一次載入全部資料，前端處理分頁、排序、搜尋：

```html
<div data-action="/api/list" data-mode="client">
```

適合資料量不大（< 500 筆）的情境。

---

## 搭配 neko-el

```html
<neko-el data-import="components/table.js">
  <div data-action="/api/list">
    ...
  </div>
</neko-el>
```
