/**
 * <neko> Custom Element
 * 動態載入指定模組並初始化到元素上
 *
 * @example
 * <neko data-import="form.js">
 *   <form action="/api/save" data-ajax="1">
 *     <input name="title" required />
 *     <button type="submit">送出</button>
 *   </form>
 * </neko>
 */

import loader from '../core/loader.js';

customElements.define('neko-el', class extends HTMLElement {
  async connectedCallback() {
    const src = this.dataset.import;
    if (!src) return;

    const mod = await loader.loadModule(src);
    const Cls = mod?.default ?? mod;

    if (typeof Cls !== 'function') {
      console.warn(`[neko] ${src} 匯出的不是 class 或 function`);
      return;
    }

    this._instance = new Cls(this);
  }

  disconnectedCallback() {
    this._instance = null;
  }
});
