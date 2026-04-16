# Queue

依序執行一組 function，支援同步與 async，任一步驟 return false 或 reject 即中止。

---

## 引入

```js
import Queue from '/path/to/nekojs/utils/queue.js'
```

---

## 基本用法

```js
const q = new Queue()

q.append(() => validateForm())
q.append(() => ajax.post('/api/save', data))
q.append((result) => redirect(result.id))

q.run()
  .then((results) => console.log(results))
  .catch(() => console.log('已中止'))
```

---

## Methods

| 方法 | 說明 |
|---|---|
| `append(fn)` | 加入一個任務（可串接） |
| `run()` | 依序執行，回傳 `Promise<any[]>`（所有步驟的回傳值） |
| `clear()` | 清空所有任務（可串接） |

---

## 中止

任一步驟 `return false` 或 `throw` 都會中止後續執行，`run()` 的 Promise 進入 `catch`：

```js
q.append(async () => {
  const ok = await dialog.confirm('確定送出？')
  if (!ok) return false  // 中止後續
})

q.append(() => ajax.post('/api/save', data))
```
