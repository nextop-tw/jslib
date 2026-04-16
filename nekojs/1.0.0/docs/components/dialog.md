# Dialog

統一對話框介面，預設使用 SweetAlert2（alert / confirm）和 iziToast（toast 通知）。套件從 CDN 自動載入。

---

## 引入

```js
import dialog from '/path/to/nekojs/components/dialog.js'
```

---

## Alert / 提示

```js
dialog.alert('請填寫必填欄位')
dialog.success('儲存成功！')
dialog.error('發生錯誤，請稍後再試')
dialog.warning('此操作無法復原')
dialog.info('系統將於明日維護')
```

---

## Confirm / 確認

```js
const ok = await dialog.confirm('確定要刪除嗎？')
if (ok) {
  // 使用者點了確定
}
```

---

## Toast / 通知

輕量通知，自動消失，不需要使用者操作。

```js
dialog.toast('已更新')
dialog.toast.success('儲存成功')
dialog.toast.error('操作失敗')
dialog.toast.info('已複製到剪貼簿')
```

`dialog.notify` 為 `dialog.toast` 的 alias，兩者完全相同：

```js
dialog.notify('已更新')
dialog.notify.success('儲存成功')
```

### Toast 選項

```js
dialog.toast('已更新', {
  position: 'bottomRight',  // 預設 topRight
  timeout: 3000,            // 預設 2000ms
  onClosed: () => { ... }   // 關閉後回呼
})
```

---

## 自訂 Adapter

可抽換底層套件，adapter 需實作 `show`、`confirm`、`toast` 方法：

```js
dialog.setAdapter({
  show(options)    { ... },
  confirm(options) { ... return Promise<boolean> },
  toast(options)   { ... },
})
```
