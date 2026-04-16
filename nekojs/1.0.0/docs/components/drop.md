# Drop

拖放目標區，處理外部元素拖入容器、落在特定節點的互動。

> 與 [Uploader](uploader.md) 的差異：Uploader 是拖**檔案**進來上傳；Drop 是拖 **DOM 元素 / 資料**進來，落在節點上觸發業務邏輯。

---

## 引入

```js
import Drop from '/path/to/nekojs/components/drop.js'
```

---

## 基本用法

```html
<div id="kanban">
  <div data-drop-node data-id="todo">待處理</div>
  <div data-drop-node data-id="done">已完成</div>
</div>
```

```js
const drop = new Drop('#kanban')

drop.on('drop', (node, payload) => {
  console.log('放入欄位：', node.dataset.id)
  console.log('payload：', payload)
})
```

拖曳來源端設定 payload：

```js
el.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('payload', JSON.stringify({ id: 1, title: 'Task' }))
})
```

---

## 目標節點

預設找最近的 `[data-drop-node]`。可自訂：

```js
drop.setFinder((target) => target.closest('[data-column]'))
```

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `node.over` | `node` | 滑過節點時，`return false` 禁止放入（加 `drag-over-disabled` class） |
| `drop` | `node, payload` | 放入節點，payload 為 dataTransfer 的 JSON |
| `cleanup` | — | drop 事件完成後觸發 |

```js
// 某些欄位不允許放入
drop.on('node.over', (node) => {
  if (node.dataset.locked) return false
})

drop.on('drop', (node, payload) => {
  // 更新資料
})
```

---

## CSS 狀態

| Class | 說明 |
|---|---|
| `drag-over` | 滑過節點時（允許放入） |
| `drag-over-disabled` | 滑過節點時（不允許放入） |

```css
.drag-over          { background: #e8f4fd }
.drag-over-disabled { background: #fde8e8; cursor: not-allowed }
```
