# Sortable

拖曳排序工具，基於 SortableJS（自動從 CDN 載入），支援 AJAX 回寫順序。

---

## 引入

```js
import Sortable from '/path/to/nekojs/components/sortable.js'
```

---

## HTML 結構

```html
<ul id="my-list"
    data-action="/api/sort"
    data-handle=".drag-handle">
  <li data-id="1"><span class="drag-handle">☰</span> Item 1</li>
  <li data-id="2"><span class="drag-handle">☰</span> Item 2</li>
  <li data-id="3"><span class="drag-handle">☰</span> Item 3</li>
</ul>
```

```js
const sortable = new Sortable('#my-list')
```

---

## HTML 屬性

| 屬性 | 說明 |
|---|---|
| `data-action` | 排序後送出的 API URL |
| `data-handle` | 拖曳把手的 CSS selector |
| `data-group` | SortableJS group，允許跨列表拖曳 |
| `data-id-key` | 子元素 ID 的 data 屬性名稱（預設 `id`，即 `data-id`） |
| `data-sort-key` | 排序值的欄位名稱（預設 `sort`） |

---

## 預設 API Payload

拖曳結束後，自動 POST 到 `data-action`，格式為：

```json
[
  { "id": "1", "sort": 1 },
  { "id": "2", "sort": 2 },
  { "id": "3", "sort": 3 }
]
```

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `sort` | `items, payload` | 拖曳結束後，修改 `payload.data` 或 `return false` 取消 AJAX |
| `done` | `response` | AJAX 完成 |
| `error` | `err` | AJAX 失敗 |

```js
sortable.on('sort', (items, payload) => {
  // items: [{ id, sort, el }, ...]
  // 只送 ID 陣列
  payload.data = items.map(i => i.id)
})

sortable.on('sort', (items, payload) => {
  // return false → 取消 AJAX，自己處理
  updateUI(items)
  return false
})
```

---

## Methods

| 方法 | 說明 |
|---|---|
| `disable()` | 停用拖曳 |
| `enable()` | 啟用拖曳 |
| `destroy()` | 銷毀實例 |
| `getItems()` | 取得目前順序 `[{ id, sort, el }]` |
