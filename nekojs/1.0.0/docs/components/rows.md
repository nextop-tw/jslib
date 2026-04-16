# Rows

動態新增 / 刪除列元件，支援 template 渲染、欄位自動命名、列數計數。

---

## 引入

```js
import Rows from '/path/to/nekojs/components/rows.js'
```

---

## HTML 結構

```html
<div id="my-rows">

  <div data-body></div>

  <template>
    <div data-row>
      <span data-rank></span>
      <input data-name="items[{index}][title]" placeholder="標題" />
      <button data-remove type="button">刪除</button>
    </div>
  </template>

  <button data-append type="button">新增一列</button>
  <span>共 <span data-counter>0</span> 筆</span>
</div>
```

```js
const rows = new Rows('#my-rows')
```

---

## Template

使用 `${key}` 替換資料：

```html
<template>
  <div data-row>
    <span data-rank></span>
    <input data-name="items[{index}][title]" value="${title}" />
    <input data-name="items[{index}][sort]"  value="${sort}"  type="hidden" />
    <button data-remove type="button">刪除</button>
  </div>
</template>
```

---

## 元素屬性

| 屬性 | 說明 |
|---|---|
| `data-body` | 列的容器 |
| `data-row` | 每一列的根元素（template 內） |
| `data-append` | 新增按鈕（button）或輸入框（input，Enter 觸發） |
| `data-remove` | 刪除按鈕（在每列內） |
| `data-rank` | 自動填入序號（從 1 開始） |
| `data-name="items[{index}][field]"` | 欄位名稱，`{index}` 自動替換為索引 |
| `data-counter` | 顯示目前列數 |

### data-append 用於 input

```html
<!-- 輸入後按 Enter 新增 -->
<input data-append data-key="tag" placeholder="輸入標籤，按 Enter 新增" />
```

`data-key` 指定資料欄位名稱（預設 `value`）。

---

## Methods / Properties

| 名稱 | 說明 |
|---|---|
| `load(sources)` | 批次載入資料陣列 |
| `append(data?)` | 新增一列 |
| `clear()` | 清空所有列 |
| `getRows()` | 取得所有列元素陣列 |
| `count` | 目前列數 |

```js
rows.load([
  { title: '項目 A', sort: 1 },
  { title: '項目 B', sort: 2 },
])

rows.append({ title: '項目 C' })
rows.clear()
console.log(rows.count)
```

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `append` | `data` | 新增前觸發，`return false` 取消 |
| `render` | `el, data` | 列插入 DOM 後觸發 |
| `remove` | `el, data` | 刪除前觸發，`return false` 取消 |

```js
rows.on('render', (el, data) => {
  // 可對 el 做額外處理
})

rows.on('remove', async (el, data) => {
  const ok = await dialog.confirm('確定刪除？')
  if (!ok) return false
})
```
