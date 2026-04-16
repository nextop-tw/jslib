# Modal

對話視窗元件，純 DOM，無需 Bootstrap / jQuery。

---

## 引入

```js
import Modal from '/path/to/nekojs/components/modal.js'
```

---

## HTML 結構

```html
<div id="my-modal" data-modal-dialog>
  <div data-modal-backdrop></div>
  <div data-modal-content>
    <button data-modal-close type="button">&times;</button>
    <h3>標題</h3>
    <form>
      <input name="name" />
      <button type="submit">儲存</button>
    </form>
  </div>
</div>
```

### CSS 狀態

開啟時自動加上 `data-open` attribute，用 CSS 控制顯示：

```css
[data-modal-dialog]            { display: none }
[data-modal-dialog][data-open] { display: flex  }
```

---

## 程式開啟

```js
const modal = new Modal('#my-modal')

modal.open({ id: 1, name: 'John' })
modal.close()
modal.toggle()

modal.isOpen  // true / false
modal.el      // dialog DOM 元素
```

---

## HTML 觸發

不需要寫 JS，直接用 `data-modal` attribute 觸發：

```html
<!-- 開啟 modal -->
<button data-modal="#my-modal">新增</button>

<!-- 開啟並傳入參數 -->
<button data-modal="#my-modal" data-params='{"id":1,"name":"John"}'>編輯</button>
```

---

## 關閉方式

1. 點擊 `[data-modal-close]` 元素
2. 點擊 `[data-modal-backdrop]`
3. 按 ESC 鍵
4. 程式呼叫 `modal.close()`

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `open` | `params` | 開啟時觸發，params 來自 `data-params` 或 `modal.open(params)` |
| `close` | — | 關閉時觸發 |

```js
modal.on('open', (params) => {
  modal.el.querySelector('[name="id"]').value   = params.id
  modal.el.querySelector('[name="name"]').value = params.name
})
```

---

## Singleton

同一個 selector 只會建立一個實例：

```js
const modal = Modal.getInstance('#my-modal')
```
