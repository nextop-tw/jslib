# Frame

同源 iframe 自動撐高工具，使用 ResizeObserver 持續監聽內容變化。

---

## 引入

```js
import Frame from '/path/to/nekojs/utils/frame.js'
```

---

## 基本用法

```html
<iframe id="my-iframe" src="/page" style="width:100%;border:0"></iframe>
```

```js
const frame = new Frame('#my-iframe')
```

iframe 載入後自動調整高度，並持續監聽內容變化（如 AJAX 更新後內容增減）。

---

## 限制

僅支援**同源** iframe（相同 domain）。跨域 iframe 無法存取 `contentDocument`。

---

## Methods

| 方法 | 說明 |
|---|---|
| `adjust()` | 手動觸發一次高度調整 |
| `destroy()` | 停止監聽 |

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `resize` | `height` | 高度調整後觸發 |

```js
frame.on('resize', (height) => {
  console.log('iframe 高度：', height)
})
```

---

## src 切換

切換 iframe 的 `src` 後，Frame 會自動在新頁面 `load` 後重新建立監聽：

```js
document.querySelector('#my-iframe').src = '/other-page'
// Frame 自動偵測到 load 事件，重新調整高度
```
