# Timer

倒數計時工具，支援暫停 / 恢復 / 循環。

---

## 引入

```js
import Timer from '/path/to/nekojs/utils/timer.js'
```

---

## 基本用法

```js
const timer = new Timer(60)  // 60 秒倒數

timer.on('tick', (sec) => {
  btn.textContent = `重新發送 (${sec})`
})

timer.on('stop', () => {
  btn.disabled = false
  btn.textContent = '重新發送'
})

timer.start()
```

---

## Constructor

```js
new Timer(seconds, options)
```

| 參數 | 型別 | 說明 | 預設 |
|---|---|---|---|
| `seconds` | `number` | 倒數秒數 | `0` |
| `options.interval` | `number` | 每次 tick 間隔（ms） | `1000` |
| `options.loop` | `boolean` | 結束後自動重新開始 | `false` |

---

## Methods / Properties

| 名稱 | 說明 |
|---|---|
| `start(seconds?)` | 開始（或重新開始）倒數，可傳入新秒數 |
| `pause()` | 暫停 |
| `resume()` | 從暫停處繼續 |
| `stop()` | 停止並重設 |
| `format(fmt)` | 格式化剩餘時間 |
| `running` | 是否正在計時 |
| `current` | 目前剩餘秒數 |

---

## format()

| 佔位符 | 說明 |
|---|---|
| `{hh}` | 小時（補零） |
| `{mm}` | 分鐘（補零） |
| `{ss}` | 秒數（補零） |
| `{h}` | 小時（不補零） |
| `{m}` | 分鐘（不補零） |
| `{s}` | 秒數（不補零） |

```js
timer.format('{mm}:{ss}')  // '01:30'
timer.format('{m}:{ss}')   // '1:30'
timer.format('{hh}:{mm}:{ss}')  // '00:01:30'
```

---

## 事件

| 事件 | 參數 | 說明 |
|---|---|---|
| `tick` | `sec` | 每次計時觸發（含最後一秒） |
| `stop` | — | 倒數結束 |
| `pause` | `sec` | 暫停時觸發 |
| `resume` | `sec` | 繼續時觸發 |

---

## 循環模式

```js
const timer = new Timer(5, { loop: true })
timer.on('tick', (sec) => console.log(sec))  // 5 4 3 2 1 5 4 3 2 1 ...
timer.start()
```
