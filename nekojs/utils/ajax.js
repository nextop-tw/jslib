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
   * 核心請求方法
   * @param {string} method
   * @param {string} url
   * @param {any} [data]
   * @param {RequestInit} [options]
   * @returns {Promise<any>}
   */
  async #request(method, url, data, options = {}) {
    const fullURL = this.#baseURL + url;
    const config = {
      method,
      headers: { ...this.#defaultHeaders, ...options.headers },
      ...options,
    };

    if (data !== undefined) {
      config.body = JSON.stringify(data);
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
