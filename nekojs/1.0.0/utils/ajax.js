/**
 * Ajax 模組
 * 透過 neko.use('ajax') 載入
 *
 * @example
 * neko.alias('ajax', 'utils/ajax.js')
 * neko.use('ajax').then((_ajax) => {
 *   _ajax.get('/api/data').then(console.log)
 * })
 */

import EventsMixin from '../core/events.js';

class Ajax extends EventsMixin() {
  #baseURL = '';
  #defaultHeaders = { 'Content-Type': 'application/json' };
  #csrf = null; // string | () => string

  /**
   * 設定 base URL
   * @param {string} url
   * @returns {this}
   */
  setBaseURL(url) {
    this.#baseURL = url.replace(/\/$/, '');
    return this;
  }

  /**
   * 設定或合併預設 headers
   * @param {Record<string, string>} obj
   * @returns {this}
   */
  setHeaders(obj) {
    Object.assign(this.#defaultHeaders, obj);
    return this;
  }

  /**
   * 設定 CSRF token 來源
   * - 傳入字串：靜態 token（如 meta tag 讀取的值）
   * - 傳入函式：動態 getter（如每次讀 cookie，適合 Laravel Sanctum）
   * @param {string | () => string} tokenOrGetter
   * @returns {this}
   *
   * @example
   * // 靜態（meta tag）
   * ajax.setCsrf(document.querySelector('meta[name="csrf-token"]').content)
   *
   * // 動態（cookie，適合 Laravel Sanctum SPA）
   * ajax.setCsrf(() => document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '')
   */
  setCsrf(tokenOrGetter) {
    this.#csrf = tokenOrGetter;
    return this;
  }

  /**
   * 核心請求方法
   * @param {string} method
   * @param {string} url
   * @param {any} [data]
   * @param {RequestInit} [options]
   * @returns {Promise<any>}
   */
  async #request(method, url, data, options = {}) {
    const fullURL = this.#baseURL + url;

    const csrfToken = typeof this.#csrf === 'function' ? this.#csrf() : this.#csrf;
    const csrfHeader = csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {};

    const isFormData = data instanceof FormData;
    const baseHeaders = isFormData
      ? (({ 'Content-Type': _, ...rest }) => rest)(this.#defaultHeaders)
      : this.#defaultHeaders;

    const config = {
      method,
      headers: { ...baseHeaders, ...csrfHeader, ...options.headers },
      ...options,
    };

    if (data !== undefined) {
      config.body = isFormData ? data : JSON.stringify(data);
    }

    // 觸發 beforeRequest，可 return false 取消請求
    const ok = await this.emit('beforeRequest', { method, url: fullURL, config });
    if (ok === false) return null;

    const response = await fetch(fullURL, config);

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      await this.emit('error', error);
      throw error;
    }

    const contentType = response.headers.get('content-type') ?? '';
    const result = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    await this.emit('afterRequest', { method, url: fullURL, result });

    return result;
  }

  /**
   * GET 請求
   * @param {string} url
   * @param {RequestInit} [options]
   */
  get(url, options) {
    return this.#request('GET', url, undefined, options);
  }

  /**
   * POST 請求
   * @param {string} url
   * @param {any} data
   * @param {RequestInit} [options]
   */
  post(url, data, options) {
    return this.#request('POST', url, data, options);
  }

  /**
   * PUT 請求
   * @param {string} url
   * @param {any} data
   * @param {RequestInit} [options]
   */
  put(url, data, options) {
    return this.#request('PUT', url, data, options);
  }

  /**
   * DELETE 請求
   * @param {string} url
   * @param {RequestInit} [options]
   */
  delete(url, options) {
    return this.#request('DELETE', url, undefined, options);
  }
}

export default new Ajax();
