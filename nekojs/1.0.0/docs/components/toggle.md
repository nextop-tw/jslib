# Toggle

開關元件，包裝 `<input type="checkbox">`，支援：
- Adapter 抽換（Bootstrap 5 / Switchery）
- `data-action` AJAX 狀態回寫
- `change` 事件可修改 payload 或取消切換

---

## HTML 結構

```html
<!-- Bootstrap（預設，無需額外 CSS） -->
<input type="checkbox" id="my-toggle"
       data-action="/api/setting/toggle"
       data-id="123" />

<!-- Switchery（自動載入 CDN） -->
<input type="checkbox" id="my-toggle"
       data-adapter="switchery"
       data-action="/api/setting/toggle"
       data-id="123" />
```

---

## 用法

### 1. 純 HTML（零 JS）

```html
<neko-el data-import="/path/to/components/toggle.js">
  <input type="checkbox" data-action="/api/toggle" data-id="1" />
</neko-el>
```

### 2. HTML + Vue 3 響應式

```html
<neko-vue3 data-import="/path/to/components/toggle.js">
  <input type="checkbox"
         data-action="/api/toggle"
         data-id="1"
         :checked="active" />
  <span>{{ active ? '啟用' : '停用' }}</span>
</neko-vue3>
```

### 3. 直接 import

```js
import Toggle from '/path/to/components/toggle.js'

const toggle = new Toggle('#my-toggle')

toggle.on('change', (checked, payload) => {
  console.log('切換為', checked)
  payload.data.note = '額外欄位'  // 追加到 AJAX payload
})
```

---

## 取得實例

```js
const instance = document.querySelector('#my-toggle')._instance
console.log(instance.value)  // true / false
```

---

## 屬性

| 屬性 | 說明 |
|---|---|
| `data-action` | AJAX 回寫 URL，切換後 POST 送出 |
| `data-id` | 自動帶入 payload 的 `id` 欄位（選填） |
| `data-adapter` | `bootstrap`（預設）/ `switchery` |

---

## 事件

### `change`

```js
toggle.on('change', (checked, payload) => {
  // checked  — 切換後的狀態（true / false）
  // payload.data — 即將送出的 AJAX 資料（可修改）
  // return false — 取消切換，UI 還原
})
```

**payload.data 預設格式：**

```json
{ "checked": true, "id": "123" }
```

---

## Public API

| 方法 / 屬性 | 說明 |
|---|---|
| `instance.value` | 取得目前狀態（boolean） |
| `instance.value = bool` | 程式設定狀態（不觸發事件） |
| `instance.destroy()` | 銷毀元件，移除 `_instance` |
| `Toggle.init(el, options)` | 初始化單一元素 |
| `Toggle.initAll(selector, options, onEach)` | 初始化多個元素 |

---

## Adapter

### 切換為 Switchery

透過 `data-adapter="switchery"` 或 options：

```js
const toggle = new Toggle('#my-toggle', { adapter: 'switchery' })
```

Switchery 的外觀選項可在 options 傳入：

```js
new Toggle('#my-toggle', {
  adapter: 'switchery',
  color: '#1abc9c',
  size: 'small',
})
```

---

## AJAX Payload

切換後自動 POST 到 `data-action`，格式：

```json
{
  "checked": true,
  "id": "123"
}
```

可在 `change` 事件內修改：

```js
toggle.on('change', (checked, payload) => {
  payload.data.userId = currentUser.id
})
```

AJAX 失敗時，UI 狀態自動還原。
