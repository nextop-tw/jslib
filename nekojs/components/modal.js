/**
 * Modal
 * 對話視窗元件，純 DOM，無需 Bootstrap / jQuery
 *
 * 開啟方式：
 * 1. 程式呼叫：modal.open(params)
 * 2. HTML 觸發：<button data-modal="#my-modal" data-params='{"id":1}'>
 *
 * 關閉方式：
 * 1. 程式呼叫：modal.close()
 * 2. [data-modal-close] 元素點擊
 * 3. 點擊 [data-modal-backdrop]
 * 4. ESC 鍵
 *
 * 狀態 CSS：開啟時在 dialog 元素加上 data-open 屬性
 * [data-modal-dialog]           { display: none }
 * [data-modal-dialog][data-open]{ display: flex  }
 *
 * @example
 * import Modal from './components/modal.js'
 *
 * const modal = new Modal('#my-modal')
 *
 * modal.on('open', (params) => {
 *   // 用 params 填入欄位
 *   modal.el.querySelector('[name="id"]').value = params.id
 * })
 *
 * modal.on('close', () => { })
 *
 * modal.open({ id: 1, name: 'John' })
 * modal.close()
 *
 * <!-- HTML -->
 * <div id="my-modal" data-modal-dialog>
 *   <div data-modal-backdrop></div>
 *   <div data-modal-content>
 *     <button data-modal-close type="button">&times;</button>
 *     <form> ... </form>
 *   </div>
 * </div>
 *
 * <!-- 觸發按鈕 -->
 * <button data-modal="#my-modal" data-params='{"id":1}'>開啟</button>
 */

import EventsMixin from '../core/events.js';

export default class Modal extends EventsMixin() {
  #dialog = null;

  /**
   * @param {HTMLElement|string} dialog
   */
  constructor(dialog) {
    super();
    this.#dialog = typeof dialog === 'string'
      ? document.querySelector(dialog)
      : dialog;

    this.#bindClose();
    this.#bindEsc();
  }

  // ── Public API ──────────────────────────────────────

  /** 對話框元素 */
  get el() {
    return this.#dialog;
  }

  /** 是否開啟中 */
  get isOpen() {
    return this.#dialog.hasAttribute('data-open');
  }

  /**
   * 開啟 modal
   * @param {object} [params]  傳入資料，透過 open 事件取得
   */
  async open(params = {}) {
    // 重設表單
    this.#dialog.querySelectorAll('form').forEach((f) => f.reset());

    this.#dialog.setAttribute('data-open', '');
    document.body.style.overflow = 'hidden';

    await this.emit('open', params);
  }

  /** 關閉 modal */
  async close() {
    if (!this.isOpen) return;
    this.#dialog.removeAttribute('data-open');
    document.body.style.overflow = '';
    await this.emit('close');
  }

  /** 切換開關 */
  toggle(params = {}) {
    return this.isOpen ? this.close() : this.open(params);
  }

  // ── 關閉綁定 ─────────────────────────────────────────

  #bindClose() {
    // [data-modal-close] 按鈕
    this.#dialog.querySelectorAll('[data-modal-close]').forEach((el) => {
      el.addEventListener('click', () => this.close());
    });

    // backdrop 點擊
    const backdrop = this.#dialog.querySelector('[data-modal-backdrop]');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.close());
    }
  }

  // ── ESC 關閉 ─────────────────────────────────────────

  #bindEsc() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }
}

// ── 全域觸發綁定（data-modal="# target"）────────────────

// 統一在 document 層監聽，支援動態新增的觸發元素
const _instances = new Map();

/**
 * 取得或建立 Modal 實例（singleton per element）
 * @param {string} selector
 * @returns {Modal}
 */
Modal.getInstance = function (selector) {
  if (!_instances.has(selector)) {
    const el = document.querySelector(selector);
    if (!el) return null;
    _instances.set(selector, new Modal(el));
  }
  return _instances.get(selector);
};

document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-modal]');
  if (!trigger) return;

  const target = trigger.dataset.modal;
  if (!target?.startsWith('#')) return;

  e.preventDefault();

  const modal = Modal.getInstance(target);
  if (!modal) return;

  let params = {};
  try {
    const raw = trigger.dataset.params;
    if (raw) params = JSON.parse(raw);
  } catch {}

  modal.open(params);
});
