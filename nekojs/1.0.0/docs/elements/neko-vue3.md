# neko-vue3

Custom Element，內部 HTML 當作 Vue 3 template，**自動提供響應式狀態**，不需要寫任何 JS。

Vue 3 從 CDN 自動載入，無需安裝。

---

## 引入

```html
<script type="module" src="/path/to/nekojs/elements/neko-vue3.js"></script>
```

---

## 基本用法

```html
<neko-vue3 data-import="components/form.js">
  <form action="/api/save" data-ajax="1">
    <input name="title" required />
    <button :disabled="loading">
      {{ loading ? '送出中...' : '送出' }}
    </button>
    <p v-if="success" style="color:green">送出成功！</p>
    <p v-if="fail"    style="color:red">{{ message }}</p>
  </form>
</neko-vue3>
```

---

## 自動提供的響應式變數

| 變數 | 型別 | 說明 |
|---|---|---|
| `loading` | `boolean` | AJAX 送出中（`submit` 事件觸發時為 `true`） |
| `success` | `boolean` | 送出成功（`success` 事件觸發時為 `true`） |
| `fail` | `boolean` | 送出失敗（`fail` 事件觸發時為 `true`） |
| `message` | `string` | 失敗訊息（來自 `res.message`） |
| `data` | `object` | 成功回應資料（來自 `success` 事件的 `res`） |

這些變數可直接在 HTML 裡用 `v-if`、`v-bind`、`{{ }}` 等 Vue 指令使用。

---

## 屬性

| 屬性 | 必填 | 說明 |
|---|---|---|
| `data-import` | ✓ | 要載入的模組路徑 |

---

## 取得實例

```js
const el = document.querySelector('neko-vue3')
const instance = el._instance  // new Class(el) 的結果
```

多個時加 `id` 區分：

```html
<neko-vue3 id="login-form"    data-import="components/form.js">
<neko-vue3 id="register-form" data-import="components/form.js">
```

```js
document.querySelector('#login-form')._instance
document.querySelector('#register-form')._instance
```

---

## 與 neko-el 的差異

| | `neko-el` | `neko-vue3` |
|---|---|---|
| 響應式 | 無 | 自動提供 `loading` / `success` 等 |
| Vue 語法 | 不可用 | 可用（`v-if`、`v-bind`、`{{ }}`） |
| 適合場景 | 單純初始化，不需動態 UI | 需要依狀態顯示/隱藏元素 |
