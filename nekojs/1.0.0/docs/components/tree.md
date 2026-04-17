# Tree

樹狀結構 UI 元件，支援 API 載入、拖放整合、當前節點、麵包屑。

---

## 引入

```js
import Tree from '/path/to/nekojs/components/tree.js'
```

---

## HTML 結構

```html
<div id="my-tree" data-action="/api/categories">

  <div data-body></div>

  <template data-template="root">
    <ul><li>${name}</li></ul>
  </template>

  <template data-template="node">
    <li data-node data-id="${id}">
      <a href="/category/${id}">${name}</a>
      <ul data-body="children"></ul>
    </li>
  </template>

  <template data-template="leaf">
    <li data-node data-id="${id}">
      <a href="/category/${id}">${name}</a>
    </li>
  </template>
</div>
```

```js
const tree = new Tree('#my-tree')
tree.load()
```

---

## 三種 Template

| `data-template` | 說明 |
|---|---|
| `root` | 根節點容器，只渲染一次 |
| `node` | 有子節點的節點，需含 `data-body="children"` |
| `leaf` | 葉節點（無子節點） |

Template 使用 `${key}` 替換資料欄位。子節點放入含 `data-body="children"` 的容器內。

---

## HTML 屬性

| 屬性 | 說明 | 預設 |
|---|---|---|
| `data-action` | API URL | — |
| `data-drop="true"` | 啟用拖放 | — |
| `data-node-key` | 節點 ID 欄位名稱 | `id` |
| `data-parent-key` | 父節點 ID 欄位名稱 | `parent_id` |

---

## Methods

| 方法 | 說明 |
|---|---|
| `load(url?)` | 從 API 載入並渲染 |
| `render(nodes)` | 直接傳入資料渲染 |
| `current(id?)` | 設定/取得當前節點，同步更新 `is-current` class |
| `breadcrumb(id?)` | 取得麵包屑路徑（由根到自身） |
| `node(id)` | 取得節點資料 |
| `nodeEl(id)` | 取得節點 DOM 元素 |
| `isLeaf(id)` | 是否為葉節點 |
| `children(id)` | 取得直接子節點陣列 |

```js
tree.current(5)              // 設定當前節點，加 is-current class
tree.current()               // 取得當前節點資料

tree.breadcrumb(5)           // [根節點, ..., 節點5]
tree.breadcrumb()            // 用當前節點
```

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `click` | `node, el` | 點擊節點，`return false` 阻止跳轉 |
| `node.ready` | `el, node` | 每個節點 DOM 建立後觸發 |
| `done` | `list` | 載入完成 |
| `drop` | `el, node, payload` | 拖放至節點（需啟用 `data-drop="true"`） |
| `drop.over` | `el, node` | 滑過節點時，`return false` 禁止放入 |

```js
tree.on('click', (node, el) => {
  tree.current(node.id)
  return false  // 阻止預設的 href 跳轉
})

tree.on('drop', (el, node, payload) => {
  console.log('放入節點', node.id, '，payload：', payload)
})
```

---

## 拖放

啟用 `data-drop="true"` 後，拖曳來源端需設定 payload：

```js
el.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('payload', JSON.stringify({ id: 1 }))
})
```
