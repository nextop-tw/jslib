# neko-el

純 DOM Custom Element，動態載入指定模組並初始化到元素上。**不需要寫任何 JS。**

---

## 引入

```html
<script type="module" src="/path/to/nekojs/elements/neko.js"></script>
```

---

## 基本用法

```html
<neko-el data-import="components/form.js">
  <form action="/api/save" data-ajax="1">
    <input name="title" required />
    <button type="submit">送出</button>
  </form>
</neko-el>
```

`data-import` 指定的模組必須 export default 一個 class，`<neko-el>` 會自動 `new Class(el)` 並將自身 DOM 傳入。

---

## 屬性

| 屬性 | 必填 | 說明 |
|---|---|---|
| `data-import` | ✓ | 要載入的模組路徑 |

---

## 取得實例

```js
const el = document.querySelector('neko-el')
const instance = el._instance  // new Class(el) 的結果
```

多個時用 `querySelectorAll`：

```js
document.querySelectorAll('neko-el[data-import="components/form.js"]')
  .forEach(el => {
    const form = el._instance
  })
```

---

## 與各模組搭配

### Form

```html
<neko-el data-import="components/form.js">
  <form action="/api/save" data-ajax="1">
    <input name="title" required />
    <button type="submit">送出</button>
  </form>
</neko-el>
```

### Table

```html
<neko-el data-import="components/table.js">
  <div data-action="/api/list"></div>
</neko-el>
```

### OTP

```html
<neko-el data-import="components/otp.js">
  <div data-action="/api/otp/send" data-seconds="60">
    <input type="email" placeholder="輸入信箱" />
    <button data-send>發送驗證碼</button>
    <input name="code" placeholder="輸入驗證碼" />
  </div>
</neko-el>
```

---

## 注意事項

- 模組路徑為相對於頁面的路徑，或絕對路徑
- 模組必須 `export default` 一個 class 或 function
- 元素從 DOM 移除時，`_instance` 會自動清除
