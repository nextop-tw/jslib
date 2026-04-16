/**
 * NekoURL
 * 繼承原生 URL，加入便利方法
 *
 * 改進：
 * - 不帶參數 → 使用目前頁面 URL
 * - setParams() — 用物件批次設定 query 參數（可串接）
 * - removeParams() — 批次移除 query 參數（可串接）
 * - clearParams() — 清空所有 query 參數（可串接）
 * - go() — 跳轉，整合 Transition（dispatch neko:navigate）
 *
 * @example
 * import NekoURL from './utils/url.js'
 *
 * const url = new NekoURL('/search')
 * url.setParams({ keyword: 'hello', page: 2 }).go()
 * // → https://mysite.com/search?keyword=hello&page=2
 *
 * // 取得目前頁面 URL
 * const url = new NekoURL()
 * url.clearParams().setParams({ page: 1 }).go()
 */

export default class NekoURL extends URL {
  /**
   * @param {string} [url] 省略則使用目前頁面 URL
   * @param {string} [base] base URL，省略則使用目前頁面
   */
  constructor(url = location.href, base = location.href) {
    super(url, base);
  }

  /**
   * 批次設定 query 參數
   * @param {Record<string, any>} params
   * @returns {this}
   */
  setParams(params) {
    for (const [key, val] of Object.entries(params)) {
      this.searchParams.set(key, val);
    }
    return this;
  }

  /**
   * 批次移除 query 參數
   * @param {...string} keys
   * @returns {this}
   */
  removeParams(...keys) {
    for (const key of keys) {
      this.searchParams.delete(key);
    }
    return this;
  }

  /**
   * 清空所有 query 參數
   * @returns {this}
   */
  clearParams() {
    for (const key of [...this.searchParams.keys()]) {
      this.searchParams.delete(key);
    }
    return this;
  }

  /**
   * 跳轉到此 URL
   * 若頁面有 Transition，會透過 neko:navigate 事件觸發轉場
   */
  go() {
    const url = this.toString();
    const event = new CustomEvent('neko:navigate', {
      detail: { url },
      cancelable: true,
    });
    document.dispatchEvent(event);
    if (!event.defaultPrevented) location.href = url;
  }
}
