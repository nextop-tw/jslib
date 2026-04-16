# Uploader

檔案上傳工具，支援點擊選取、拖曳上傳、圖片預覽、即時 AJAX 上傳。

---

## 引入

```js
import Uploader from '/path/to/nekojs/components/uploader.js'
```

---

## HTML 結構

```html
<div id="my-uploader"
     data-action="/api/upload"
     data-name="photos[]"
     data-max="5"
     data-accept="image/*">

  <div data-trigger>點擊或拖曳上傳</div>
  <div data-body></div>

  <template>
    <div data-row>
      <img data-preview />
      <span data-filename></span>
      <input data-hidden type="hidden" />
      <button data-remove type="button">移除</button>
    </div>
  </template>
</div>
```

```js
const uploader = new Uploader('#my-uploader')
```

---

## HTML 屬性

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | 上傳 API URL | — |
| `data-name` | hidden input 的 `name`（表單送出用） | `file` |
| `data-max` | 最多上傳數量，達到後隱藏觸發區 | 無限制 |
| `data-accept` | 允許的檔案類型（同 input accept） | — |
| `data-preload` | 預載已有檔案（JSON 陣列） | — |

### 元素屬性

| 屬性 | 說明 |
|---|---|
| `data-trigger` | 點擊 / 拖曳觸發區域 |
| `data-body` | 已上傳列表的容器 |
| `data-row` | 每個檔案的根元素（template 內） |
| `data-preview` | `<img>` 圖片預覽 |
| `data-filename` | 顯示檔案名稱 |
| `data-hidden` | `<input type="hidden">` 存放上傳後的 ID / 路徑 |
| `data-remove` | 移除按鈕 |

---

## 預載已有檔案

```html
<div data-preload='[{"id":1,"src":"/uploads/a.jpg","name":"a.jpg"}]'>
```

---

## Methods / Properties

| 名稱 | 說明 |
|---|---|
| `count` | 目前已上傳的列數 |
| `clear()` | 清空所有列 |

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `select` | `file` | 選取檔案後，`return false` 取消上傳 |
| `done` | `response, el` | 上傳成功，`response.results.id` 已寫入 `data-hidden` |
| `remove` | `el, file` | 移除前，`return false` 取消 |
| `error` | `err, el` | 上傳失敗 |

```js
uploader.on('done', (res, el) => {
  // res.results.url — 已上傳檔案的 URL
  el.querySelector('[data-preview]').src = res.results.url
})

uploader.on('remove', async (el, file) => {
  const ok = await dialog.confirm('確定移除？')
  if (!ok) return false
})
```

---

## 拖曳狀態 CSS

拖曳進入觸發區域時，自動加 `data-dragover` attribute：

```css
[data-trigger][data-dragover] {
  border: 2px dashed #007bff;
  background: #f0f8ff;
}
```
