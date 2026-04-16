# OTP

一次性驗證碼發送元件，整合 Timer 倒數、AJAX 發送、按鈕狀態管理。

---

## 引入

```js
import OTP from '/path/to/nekojs/components/otp.js'
```

---

## HTML 結構

```html
<div id="my-otp"
     data-action="/api/otp/send"
     data-seconds="60">

  <input type="email" placeholder="輸入信箱" />

  <button data-send type="button">
    發送驗證碼
    <span data-timer></span>
  </button>

  <input name="code" placeholder="輸入驗證碼" />
</div>
```

```js
const otp = new OTP('#my-otp')
```

---

## HTML 屬性

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | 發送 OTP 的 API URL | — |
| `data-seconds` | 倒數秒數 | `60` |

### 元素屬性

| 屬性 | 說明 |
|---|---|
| `data-account` | 帳號輸入框（省略則自動找 `type=email` > `type=tel` > 第一個 input） |
| `data-send` | 發送按鈕 |
| `data-timer` | 顯示倒數秒數的容器（自動填入 `(59)` 格式） |

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `sent` | `response` | API 發送成功，Timer 已啟動 |
| `error` | `response` | API 發送失敗 |
| `tick` | `sec` | 每秒倒數 |
| `ready` | — | 倒數結束，可重新發送 |

```js
otp.on('sent', (res) => {
  console.log('已發送，開始倒數')
})

otp.on('tick', (sec) => {
  console.log(`剩餘 ${sec} 秒`)
})

otp.on('ready', () => {
  console.log('可重新發送')
})

otp.on('error', (res) => {
  console.log('發送失敗', res)
})
```

---

## Methods / Properties

| 名稱 | 說明 |
|---|---|
| `counting` | `boolean`，是否在倒數中 |
| `start(seconds?)` | 手動啟動倒數（不打 API，適合預先鎖定） |

---

## API 格式

發送成功需回傳 `status: true`：

```json
{ "status": true }
```

失敗時顯示 `message`：

```json
{ "status": false, "message": "此信箱已發送過，請稍後再試" }
```

---

## 搭配 neko-vue3

```html
<neko-vue3 data-import="components/otp.js">
  <div data-action="/api/otp/send" data-seconds="60">
    <input type="email" placeholder="輸入信箱" />
    <button data-send :disabled="loading" type="button">
      {{ loading ? '已發送' : '發送驗證碼' }}
      <span data-timer></span>
    </button>
    <input name="code" placeholder="輸入驗證碼" />
  </div>
</neko-vue3>
```
