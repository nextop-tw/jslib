# Transition

頁面轉場工具，支援 fade 動畫與 loading screen 兩種模式。自動攔截內部連結與 Form 跳轉。

---

## 引入

```js
import Transition from '/path/to/nekojs/utils/transition.js'
```

---

## 基本用法

```js
// Fade 模式（預設）
const transition = new Transition()

// Loading screen 模式
const transition = new Transition({ type: 'loading' })

// Loading screen + 自訂名稱
const transition = new Transition({ type: 'loading', loading: 'page' })
```

頁面載入時自動播放**進場動畫**，點擊內部連結時自動播放**離場動畫**後跳轉。

---

## Constructor 選項

| 選項 | 說明 | 預設 |
|---|---|---|
| `type` | `'fade'` / `'loading'` | `'fade'` |
| `loading` | Loading 名稱，對應 `[data-loading="name"]` | — |
| `links` | 是否攔截 `<a>` 連結 | `true` |
| `duration` | 動畫時間（ms） | `300` |

---

## Fade 模式

自動注入 CSS，使用 `html.neko-enter` / `html.neko-exit` class 觸發動畫：

```css
/* 可覆蓋預設動畫 */
html.neko-enter { animation: ... }
html.neko-exit  { animation: ... }
```

---

## Loading Screen 模式

頁面開始載入時顯示 loading，`window.load` 後隱藏。跳轉前顯示 loading。

自訂 loading HTML：

```html
<body>
  <div data-loading="page">
    <img src="/loading.gif" />
  </div>
</body>
```

```js
const transition = new Transition({ type: 'loading', loading: 'page' })
```

---

## 程式跳轉

```js
transition.go('/dashboard')
```

---

## 自動排除的連結

- 外部連結（不同 origin）
- `target="_blank"`
- `download` attribute
- 同頁錨點（`#section`）

---

## 與 Form / URL 整合

攔截 `neko:navigate` 事件，Form 的 `data-next` 跳轉和 [NekoURL](url.md) 的 `go()` 都會自動觸發轉場。
