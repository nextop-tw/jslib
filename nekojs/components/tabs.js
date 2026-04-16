/**
 * Tabs
 * 頁籤切換元件，純 DOM，無依賴
 *
 * 狀態：切換時在 tab / panel 上加 is-active class
 *
 * @example
 * import Tabs from './components/tabs.js'
 *
 * const tabs = new Tabs('#my-tabs')
 *
 * tabs.on('change', (name, panel) => { })
 *
 * tabs.show('address')  // 程式切換
 * tabs.active           // 目前頁籤名稱
 *
 * <!-- HTML -->
 * <div id="my-tabs">
 *   <button data-tab="info">基本資料</button>
 *   <button data-tab="address">地址</button>
 *
 *   <div data-panel="info">...</div>
 *   <div data-panel="address">...</div>
 * </div>
 */

import EventsMixin from '../core/events.js';

export default class Tabs extends EventsMixin() {
  #container = null;
  #active    = null;

  /**
   * @param {HTMLElement|string} container
   */
  constructor(container) {
    super();
    this.#container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.#bindTabs();
    this.#initActive();
  }

  // ── Public API ──────────────────────────────────────

  /** 目前頁籤名稱 */
  get active() {
    return this.#active;
  }

  /**
   * 切換至指定頁籤
   * @param {string} name  data-tab / data-panel 的值
   */
  async show(name) {
    const tab   = this.#container.querySelector(`[data-tab="${name}"]`);
    const panel = this.#container.querySelector(`[data-panel="${name}"]`);

    if (!panel) return;

    // 移除所有 is-active
    this.#container.querySelectorAll('[data-tab]').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.tab === name);
    });
    this.#container.querySelectorAll('[data-panel]').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.panel === name);
    });

    this.#active = name;
    await this.emit('change', name, panel);
  }

  // ── 初始化 ──────────────────────────────────────────

  #initActive() {
    // 優先：已有 is-active 的 tab
    const activeTab = this.#container.querySelector('[data-tab].is-active');
    if (activeTab) {
      this.show(activeTab.dataset.tab);
      return;
    }
    // 其次：第一個 tab
    const firstTab = this.#container.querySelector('[data-tab]');
    if (firstTab) this.show(firstTab.dataset.tab);
  }

  #bindTabs() {
    this.#container.querySelectorAll('[data-tab]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.show(el.dataset.tab);
      });
    });
  }
}
