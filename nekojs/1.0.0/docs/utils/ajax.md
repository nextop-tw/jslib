# Ajax

AJAX 工具，封裝 `fetch`，支援 JSON 自動解析、base URL、全域 headers、請求事件。

---

## 引入

```js
import ajax from '/path/to/nekojs/utils/ajax.js'
```

---

## 基本用法

```js
// GET
const res = await ajax.get('/api/users')

// POST
const res = await ajax.post('/api/users', { name: 'John', email: 'john@example.com' })

// PUT
const res = await ajax.put('/api/users/1', { name: 'John' })

// DELETE
const res = await ajax.delete('/api/users/1')
```

---

## 設定

```js
// Base URL（之後所有請求都會加上此前綴）
ajax.setBaseURL('https://api.example.com')

// 設定預設 Headers（會合併，不覆蓋）
ajax.setHeaders({ 'X-CSRF-Token': token })
ajax.setHeaders({ Authorization: `Bearer ${token}` })
```

---

## 上傳檔案

直接傳 `FormData`，會自動移除 `Content-Type`（讓瀏覽器設定 `multipart/form-data`）：

```js
const formData = new FormData()
formData.set('file', fileInput.files[0])

const res = await ajax.post('/api/upload', formData)
```

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `beforeRequest` | `{ method, url, config }` | 請求前觸發，`return false` 取消請求 |
| `afterRequest` | `{ method, url, result }` | 請求成功後觸發 |
| `error` | `error` | HTTP 錯誤時觸發（4xx / 5xx） |

```js
// 統一加入 loading 狀態
ajax.on('beforeRequest', () => { loading.show() })
ajax.on('afterRequest',  () => { loading.hide() })

// 統一處理 401 未授權
ajax.on('error', (err) => {
  if (err.status === 401) location.href = '/login'
})
```

---

## Response 格式

回傳值為 API 的 JSON 內容（已自動解析），非 JSON 則回傳字串。

HTTP 4xx / 5xx 會拋出 Error，可用 try/catch 處理：

```js
try {
  const res = await ajax.post('/api/save', data)
} catch (err) {
  console.log(err.status)    // HTTP 狀態碼
  console.log(err.response)  // 原始 Response 物件
}
```
