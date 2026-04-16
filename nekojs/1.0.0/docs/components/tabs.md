# Tabs

頁籤切換元件，純 DOM，無依賴。

---

## 引入

```js
import Tabs from '/path/to/nekojs/components/tabs.js'
```

---

## HTML 結構

```html
<div id="my-tabs">
  <button data-tab="info">基本資料</button>
  <button data-tab="address">地址</button>

  <div data-panel="info">
    基本資料內容...
  </div>
  <div data-panel="address">
    地址內容...
  </div>
</div>
```

```js
const tabs = new Tabs('#my-tabs')
```

---

## CSS 狀態

切換時在對應的 tab 和 panel 上加 `is-active` class：

```css
[data-tab]           { opacity: 0.5 }
[data-tab].is-active { opacity: 1; font-weight: bold }

[data-panel]           { display: none }
[data-panel].is-active { display: block }
```

---

## 預設頁籤

初始化時自動啟用第一個 tab。若 HTML 已有 `is-active`，則以它為準：

```html
<button data-tab="address" class="is-active">地址</button>
```

---

## Methods / Properties

| 名稱 | 說明 |
|---|---|
| `show(name)` | 切換到指定頁籤 |
| `active` | 目前頁籤名稱 |

```js
tabs.show('address')
console.log(tabs.active)  // 'address'
```

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `change` | `name, panel` | 頁籤切換後觸發 |

```js
tabs.on('change', (name, panel) => {
  if (name === 'address') {
    // 切換到地址頁籤時載入資料
  }
})
```
