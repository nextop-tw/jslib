# TreeNodes

樹狀節點資料結構，處理平坦陣列 ↔ 樹狀結構轉換，可獨立使用，也可搭配 [Tree](../components/tree.md) 元件。

---

## 引入

```js
import TreeNodes from '/path/to/nekojs/utils/tree-nodes.js'
```

---

## 基本用法

```js
const nodes = new TreeNodes()

nodes.load([
  { id: 1, parent_id: 0, name: '根節點' },
  { id: 2, parent_id: 1, name: '子節點 A' },
  { id: 3, parent_id: 1, name: '子節點 B' },
  { id: 4, parent_id: 2, name: '孫節點' },
])

nodes.toTree()
// { id: 1, name: '根節點', children: [
//   { id: 2, name: '子節點 A', children: [{ id: 4, ... }] },
//   { id: 3, name: '子節點 B', children: [] }
// ]}

nodes.ancestors(4)   // [根節點, 子節點A, 孫節點]
nodes.children(1)    // [子節點A, 子節點B]
nodes.isLeaf(4)      // true
```

---

## Constructor

```js
new TreeNodes({ nodeKey, parentKey })
```

| 選項 | 說明 | 預設 |
|---|---|---|
| `nodeKey` | 節點 ID 欄位名稱 | `'id'` |
| `parentKey` | 父節點 ID 欄位名稱 | `'parent_id'` |

---

## Methods / Properties

| 名稱 | 說明 |
|---|---|
| `load(nodes)` | 載入資料（支援平坦陣列、巢狀陣列、物件 map） |
| `get(id)` | 取得單一節點 |
| `all()` | 取得所有節點（flat map） |
| `size` | 節點總數 |
| `toTree()` | 轉成巢狀樹狀結構 |
| `ancestors(id)` | 取得從根到自身的路徑陣列 |
| `descendants(id)` | 取得所有子孫（平坦陣列） |
| `children(id)` | 取得直接子節點 |
| `isLeaf(id)` | 是否為葉節點（無子節點） |
| `current(id?)` | 設定/取得當前節點 |

---

## 支援的輸入格式

```js
// 平坦陣列
nodes.load([
  { id: 1, parent_id: 0 },
  { id: 2, parent_id: 1 },
])

// 巢狀陣列（含 children）
nodes.load([
  { id: 1, children: [{ id: 2 }] }
])

// 物件 map
nodes.load({
  1: { id: 1, parent_id: 0 },
  2: { id: 2, parent_id: 1 },
})
```
