# Form

表單處理元件，支援 AJAX 送出、欄位驗證、成功/失敗通知、轉址。

---

## 引入

```js
import Form from '/path/to/nekojs/components/form.js'
```

或搭配 Custom Element（推薦，不需寫 JS）：

```html
<script type="module" src="/path/to/nekojs/elements/neko.js"></script>

<neko-el data-import="components/form.js">
  <form action="/api/save" data-ajax="1">...</form>
</neko-el>
```

---

## 基本用法

```html
<form id="my-form" action="/api/save" data-ajax="1">
  <input name="title" required />
  <button type="submit">送出</button>
</form>
```

```js
const form = new Form('#my-form')

form.on('success', (res) => { console.log('成功', res) })
form.on('fail',    (res) => { console.log('失敗', res) })
```

---

## HTML 屬性

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-ajax="1"` | 啟用 AJAX 送出 | `1` |
| `data-action` | 覆蓋 `<form action>` | — |
| `data-method` | 覆蓋 `<form method>` | `post` |
| `data-notify` | 通知方式：`toast` / `alert` | `toast` |
| `data-success` | 成功後顯示的訊息 | — |
| `data-next` | 成功後轉址 URL，支援 `{key}` 替換 | — |
| `data-next="reload"` | 成功後重新整理 | — |

### 欄位屬性

| 屬性 | 說明 |
|---|---|
| `data-confirm="#other"` | 比對另一個欄位的值（如密碼確認） |
| `data-error="訊息"` | 比對失敗時的錯誤訊息 |
| `data-change="1"` | 值改變時自動送出 |
| `data-event="submit"` | 點擊時觸發送出（非 submit button） |

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `validate` | `input` | 每個欄位驗證時觸發，`return false` 阻止送出 |
| `submit` | `formData` | 送出前觸發，`return false` 取消 |
| `done` | `response` | 收到 API 回應後，`return false` 阻止後續處理 |
| `success` | `response` | API 回應 `status: true` |
| `fail` | `response` | API 回應 `status: false` |

```js
form.on('validate', (input) => {
  if (input.name === 'email' && !input.value.includes('@')) {
    input.setCustomValidity('請輸入有效的 Email')
    input.reportValidity()
    return false
  }
})

form.on('submit', async (formData) => {
  // 可修改 formData 或 return false 取消
})

form.on('done', (res) => {
  // return false → 自己處理，不走預設的 success/fail 流程
})
```

---

## Methods

| 方法 | 說明 |
|---|---|
| `submit()` | 程式觸發送出 |
| `reset()` | 重設表單 |
| `setSuccessCheck(fn)` | 自訂成功判斷（預設為 `res.status === true`） |

```js
// 自訂成功判斷
form.setSuccessCheck((res) => res?.code === 200)
```

---

## 成功後轉址

```html
<!-- 成功後直接跳轉 -->
<form data-ajax="1" data-next="/dashboard">

<!-- 成功後顯示 toast，消失後跳轉 -->
<form data-ajax="1" data-success="儲存成功！" data-next="/dashboard">

<!-- 成功後轉址，用 API 回應的 id 替換 -->
<form data-ajax="1" data-next="/items/{id}">
```

---

## 搭配 neko-vue3

```html
<neko-vue3 data-import="components/form.js">
  <form action="/api/save" data-ajax="1">
    <input name="title" required />
    <button :disabled="loading">{{ loading ? '送出中...' : '送出' }}</button>
    <p v-if="success">儲存成功！</p>
    <p v-if="fail">{{ message }}</p>
  </form>
</neko-vue3>
```
