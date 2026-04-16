/**
 * neko.js
 * 主要單例 object，對外提供統一 API
 */

import EventsMixin from './core/events.js';
import loader from './core/loader.js';
import browser from './utils/browser.js';

// 路徑命名空間，可用 @name/path 引用
const _src = document.currentScript?.src || import.meta?.url || '';
const paths = {
  neko:    new URL('./',  _src).href,         // neko.js 所在目錄
  cdn:     new URL(_src).origin + '/',        // CDN 根目錄
  origin:  location.origin + '/',             // 網站根目錄
};

class Neko extends EventsMixin() {
  #modules = {};
  #aliases = {};

  /**
   * 註冊短名稱對應路徑，支援單一或物件批次設定
   * @param {string|Record<string,string>} name
   * @param {string} [path]
   * @returns {this}
   *
   * @example
   * neko.alias('ajax', 'utils/ajax.js')
   * neko.alias({
   *   ajax: 'utils/ajax.js',
   *   form: 'components/form.js',
   * })
   */
  alias(name, path) {
    if (typeof name === 'object' && name !== null) {
      Object.assign(this.#aliases, name);
    } else {
      this.#aliases[name] = path;
    }
    return this;
  }

  /**
   * 解析短名稱或路徑
   * @param {string} url
   * @returns {string}
   */
  #resolve(url) {
    let path = this.#aliases[url] ?? url;

    // @name/... → 展開命名空間
    if (path.startsWith('@')) {
      const slash = path.indexOf('/');
      const ns    = slash === -1 ? path.slice(1) : path.slice(1, slash);
      const rest  = slash === -1 ? '' : path.slice(slash + 1);
      const base  = this.paths[ns] ?? paths.cdn;
      return base + rest;
    }

    // 相對路徑 → 以 neko.js 所在目錄為基準
    if (!/^https?:|^\/\/|^\//.test(path)) {
      return new URL(path, paths.neko).href;
    }

    return path;
  }

  /**
   * 載入一或多個資源（短名稱、逗號字串、陣列、路徑）
   * @param {string|string[]} urls
   * @param {Function|object} [callbackOrOptions]
   * @returns {Promise<any|any[]>}
   *
   * @example
   * neko.use('ajax').then((_ajax) => { ... })
   * neko.use('ajax,form').then((_ajax, _form) => { ... })  // 逗號字串
   * neko.use(['ajax', 'style.css']).then(([_ajax]) => { ... })
   * neko.use('ajax,form', function(_ajax, _form) { ... })  // callback 風格
   */
  async use(urls, callbackOrOptions = {}) {
    const callback = typeof callbackOrOptions === 'function' ? callbackOrOptions : null;
    const options  = typeof callbackOrOptions === 'object'   ? callbackOrOptions : {};

    // 統一轉成陣列
    const list = Array.isArray(urls)
      ? urls
      : String(urls).split(',').map((s) => s.trim()).filter(Boolean);

    const isSingle = !Array.isArray(urls) && list.length === 1;

    const resolved = list.map((url) => this.#resolve(url));
    const mods     = await loader.load(resolved, options);
    const results  = mods.map((m) => m?.default ?? m);

    if (callback) callback(...results);

    return isSingle ? results[0] : results;
  }

  /**
   * 註冊模組實例到 neko，方便統一存取
   * @param {string} name
   * @param {any} instance
   * @returns {this}
   *
   * @example
   * neko.register('ajax', ajaxInstance)
   * neko.ajax.get('/api/data')
   */
  register(name, instance) {
    this.#modules[name] = instance;
    Object.defineProperty(this, name, {
      get: () => this.#modules[name],
      configurable: true,
    });
    this.emit('register', name, instance);
    return this;
  }

  /**
   * 取得已註冊的模組
   * @param {string} name
   * @returns {any}
   */
  get(name) {
    return this.#modules[name];
  }
}

const neko = new Neko();
neko.paths = paths;
neko.register('browser', browser);

export default neko;
