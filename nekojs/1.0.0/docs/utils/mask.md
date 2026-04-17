# Mask

在容器上顯示半透明遮罩與 spinner，常用於表單送出等待期間。

與 [Loading](loading.md) 的差異：Mask 只有容器模式，API 更簡單。

---

## 引入

```js
import Mask from '/path/to/nekojs/utils/mask.js'
```

---

## 基本用法

```js
const mask = new Mask('#my-form')
mask.show()
mask.hide()
```

---

## 自訂 HTML

容器內若有 `[data-mask]` 元素，直接使用（不產生預設 spinner）：

```html
<div id="my-form">
  <div data-mask>處理中，請稍候...</div>
  <form>...</form>
</div>
```

---

## 預設樣式

自動在容器上設定 `position: relative`，並插入白色半透明遮罩 + CSS spinner。
