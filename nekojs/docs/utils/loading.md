# Loading

Loading 遮罩工具，支援全頁與容器兩種模式，可自訂 HTML。

---

## 引入

```js
import Loading from '/path/to/nekojs/utils/loading.js'
```

---

## 基本用法

```js
// 全頁 loading
const loading = new Loading()
loading.show()
loading.hide()

// 容器 loading
const loading = new Loading('#my-form')
loading.show()
loading.hide()
```

---

## Constructor

```js
new Loading(container?, name?)
```

| 參數 | 說明 |
|---|---|
| `container` | DOM 元素或 selector，省略或 `null` 為全頁模式 |
| `name` | 對應 `[data-loading="name"]` 的自訂 HTML |

---

## 自訂 HTML

### 全頁（支援多組命名）

```html
<body>
  <div data-loading="page">
    <img src="/loading.gif" />
  </div>
  <div data-loading="upload">
    <p>上傳中...</p>
  </div>
</body>
```

```js
const loading = new Loading(null, 'page')
const uploadLoading = new Loading(null, 'upload')
```

### 容器

```html
<div id="my-form">
  <div data-loading>載入中...</div>
  <form>...</form>
</div>
```

```js
const loading = new Loading('#my-form')
```

---

## 預設樣式

若無自訂 `[data-loading]` 元素，自動產生白色半透明遮罩 + CSS spinner。
