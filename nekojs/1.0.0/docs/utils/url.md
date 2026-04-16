# URL

繼承原生 `URL`，加入便利方法，支援與 Transition 整合的跳轉。

---

## 引入

```js
import NekoURL from '/path/to/nekojs/utils/url.js'
```

---

## 基本用法

```js
// 指定路徑
const url = new NekoURL('/search')
url.setParams({ keyword: 'hello', page: 2 }).go()
// → https://mysite.com/search?keyword=hello&page=2

// 目前頁面 URL
const url = new NekoURL()
url.clearParams().setParams({ page: 1 }).go()
```

---

## Methods

| 方法 | 說明 |
|---|---|
| `setParams(params)` | 批次設定 query 參數（可串接） |
| `removeParams(...keys)` | 批次移除 query 參數（可串接） |
| `clearParams()` | 清空所有 query 參數（可串接） |
| `go()` | 跳轉到此 URL |

```js
const url = new NekoURL('/list')
url
  .clearParams()
  .setParams({ sort: 'name', order: 'asc', page: 1 })
  .go()

url.removeParams('page', 'order').go()
```

---

## 與 Transition 整合

`go()` 會先 dispatch `neko:navigate` 事件。若頁面有 [Transition](transition.md)，會自動播放轉場動畫後再跳轉。若無 Transition，直接跳轉。

---

## 繼承 URL

所有原生 `URL` 屬性和方法都可使用：

```js
const url = new NekoURL('/search?keyword=hello')
url.searchParams.get('keyword')  // 'hello'
url.pathname  // '/search'
url.toString()  // 'https://mysite.com/search?keyword=hello'
```
