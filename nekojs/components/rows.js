/**
 * Rows
 * 動態新增 / 刪除列元件，支援 template 渲染、欄位自動命名、計數顯示
 *
 * 事件流程（新增）：append(data) → render(el, data) → 插入 DOM → 更新排序
 * 事件流程（刪除）：remove(el, data) → return false 取消 → 移除 DOM → 更新排序
 *
 * Template：使用 ${key} 替換資料
 * 欄位命名：data-name="items[{index}][title]" → name="items[0][title]"
 *
 * @example
 * import Rows from './components/rows.js'
 *
 * const rows = new Rows('#my-rows')
 * rows.on('render', (el, data) => { ... })
 * rows.load([{ title: 'A' }, { title: 'B' }])
 * rows.append({ title: 'C' })
 */

import EventsMixin from '../core/events.js';

export default class Rows extends EventsMixin() {
  #container  = null;
  #body       = null;
  #template   = null;
  #counterEls = null;

  /**
   * @param {HTMLElement|string} container
   */
  constructor(container) {
    super();
    this.#container  = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.#body       = this.#container.querySelector('[data-body]');
    this.#template   = this.#container.querySelector('template');
    this.#counterEls = this.#container.querySelectorAll('[data-counter]');

    this.#bindAppend();
  }

  // ── Public API ──────────────────────────────────────

  /**
   * 批次載入資料
   * @param {object[]} sources
   */
  load(sources = []) {
    sources.forEach((data) => this.append(data));
  }

  /**
   * 新增一列
   * @param {object} [data]
   */
  async append(data = {}) {
    const ok = await this.emit('append', data);
    if (ok === false) return;

    const el = this.#renderRow(data);
    if (!el) return;

    this.#bindRemove(el, data);
    this.#body.appendChild(el);
    this.#resort();

    await this.emit('render', el, data);
  }

  /** 清空所有列 */
  clear() {
    this.#body.innerHTML = '';
    this.#resort();
  }

  /** 取得所有列元素 */
  getRows() {
    return Array.from(this.#body.querySelectorAll('[data-row]'));
  }

  /** 列數 */
  get count() {
    return this.getRows().length;
  }

  // ── 渲染 ─────────────────────────────────────────────

  #renderRow(data) {
    if (!this.#template) return null;

    const html = this.#template.innerHTML.replace(
      /\$\{(\w+)\}/g,
      (_, key) => data[key] ?? '',
    );

    const wrap = document.createElement('template');
    wrap.innerHTML = html;
    return wrap.content.firstElementChild;
  }

  // ── 刪除綁定 ─────────────────────────────────────────

  #bindRemove(el, data) {
    el.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const ok = await this.emit('remove', el, data);
        if (ok === false) return;
        el.remove();
        this.#resort();
      });
    });
  }

  // ── 新增綁定 ─────────────────────────────────────────

  #bindAppend() {
    this.#container.querySelectorAll('[data-append]').forEach((el) => {
      if (el.tagName.toLowerCase() === 'input') {
        // input：Enter 鍵新增
        el.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const value = el.value.trim();
          if (!value) return;
          const key = el.dataset.key || 'value';
          el.value = '';
          this.append({ [key]: value });
        });
      } else {
        // 按鈕：click 新增
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.append();
        });
      }
    });
  }

  // ── 重新排序 ─────────────────────────────────────────

  #resort() {
    const rows = this.getRows();

    rows.forEach((row, index) => {
      // [data-rank] 顯示序號（從 1 開始）
      row.querySelectorAll('[data-rank]').forEach((el) => {
        el.textContent = index + 1;
      });

      // [data-name="items[{index}][title]"] → name="items[0][title]"
      row.querySelectorAll('[data-name]').forEach((input) => {
        input.name = input.dataset.name.replace(/\{index\}/g, index);
      });
    });

    // [data-counter] 顯示總列數
    this.#counterEls.forEach((el) => {
      el.textContent = rows.length;
    });
  }
}
