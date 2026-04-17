/**
 * String prototype 擴充
 *
 * @example
 * import './src/prototypes/string.js'
 *
 * 'hello {name}'.format({ name: 'world' })  // 'hello world'
 * '{"a":1}'.toJSON()                        // { a: 1 }
 * '42px'.toNumber()                         // NaN
 * '42'.toNumber(0)                          // 42
 * 'hello'.ucfirst()                         // 'Hello'
 */

/**
 * 替換 {key} 佔位符
 * @param {Record<string, any>} params
 * @returns {string}
 */
String.prototype.format = function (params = {}) {
  return this.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '');
};

/**
 * 安全的 JSON.parse，失敗回傳 null 或預設值
 * @param {any} [defaultValue=null]
 * @returns {any}
 */
String.prototype.toJSON = function (defaultValue = null) {
  try {
    return JSON.parse(this);
  } catch {
    return defaultValue;
  }
};

/**
 * 安全的 Number()，失敗回傳預設值
 * @param {number} [defaultValue=NaN]
 * @returns {number}
 */
String.prototype.toNumber = function (defaultValue = NaN) {
  const n = Number(this);
  return isNaN(n) ? defaultValue : n;
};

/**
 * 首字大寫
 * @returns {string}
 */
String.prototype.ucfirst = function () {
  if (!this) return String(this);
  return this.charAt(0).toUpperCase() + this.slice(1);
};
