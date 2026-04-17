/**
 * FormData prototype 擴充
 *
 * @example
 * import './src/prototypes/formdata.js'
 *
 * // 物件轉 FormData（支援巢狀）
 * const fd = FormData.fromObject({ user: { name: 'John', age: 30 } })
 * // → user[name]=John, user[age]=30
 *
 * // FormData 轉物件（支援巢狀）
 * const obj = fd.toObject()
 * // → { user: { name: 'John', age: '30' } }
 */

// ── fromObject ───────────────────────────────────────────

function buildFormData(fd, data, parentKey = '') {
  if (data !== null && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
    for (const key of Object.keys(data)) {
      const fullKey = parentKey ? `${parentKey}[${key}]` : key;
      buildFormData(fd, data[key], fullKey);
    }
  } else {
    fd.append(parentKey, data ?? '');
  }
}

FormData.fromObject = FormData.prototype.fromObject = function (data) {
  if (this instanceof FormData) {
    // 實例呼叫：將資料加入現有 FormData
    buildFormData(this, data);
    return this;
  }
  // 靜態呼叫：建立新 FormData
  const fd = new FormData();
  buildFormData(fd, data);
  return fd;
};

// ── toObject ─────────────────────────────────────────────

function setNested(obj, path, value) {
  const parts = path.replace(/\[/g, '.').replace(/\]/g, '').split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] === undefined) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  return obj;
}

FormData.prototype.toObject = function () {
  const result = {};
  for (const [key, value] of this.entries()) {
    setNested(result, key, value);
  }
  return result;
};

// ── isFormData ───────────────────────────────────────────

FormData.isFormData = function (value) {
  return value instanceof FormData;
};
