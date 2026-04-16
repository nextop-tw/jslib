# Browser

瀏覽器 / 裝置偵測工具，singleton，直接 import 使用。

---

## 引入

```js
import browser from '/path/to/nekojs/utils/browser.js'
```

也可透過 `neko.browser`（已自動註冊）：

```js
import neko from '/path/to/nekojs/neko.js'
neko.browser.isMobile
```

---

## 屬性

| 屬性 | 型別 | 說明 |
|---|---|---|
| `isMobile` | `boolean` | 手機（iPhone / Android 手機） |
| `isTablet` | `boolean` | 平板（iPad / Android 平板） |
| `isIOS` | `boolean` | iOS 裝置 |
| `isAndroid` | `boolean` | Android 裝置 |
| `isIPad` | `boolean` | iPad（含 iPadOS 偽裝成 Mac 的情況） |
| `isIPhone` | `boolean` | iPhone |
| `isTouch` | `boolean` | 支援觸控 |
| `device` | `string` | `'mobile'` / `'tablet'` / `'desktop'` |
| `name` | `string` | `'chrome'` / `'firefox'` / `'safari'` / `'edge'` / `'opera'` / `'unknown'` |
| `userAgent` | `string` | `navigator.userAgent` |

---

## 範例

```js
if (browser.isMobile) {
  // 手機版佈局
}

if (browser.device === 'tablet') {
  // 平板版佈局
}

if (browser.name === 'safari') {
  // Safari 特定處理
}
```
