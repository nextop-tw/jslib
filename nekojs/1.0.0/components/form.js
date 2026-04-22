/**
 * Form
 * 表單處理元件，支援 AJAX 送出、驗證、成功/失敗處理
 *
 * 事件流程：
 * 點送出 → confirm比對 → validate(欄位) → submit(可取消) → AJAX → done(可攔截) → success / fail
 *
 * 通知方式（data-notify）：
 * - toast（預設）：輕量通知，自動消失
 * - alert：對話框，需使用者點確定
 *
 * 成功後轉址：
 * - 無 data-success：直接跳
 * - data-success + toast：toast 消失後跳
 * - data-success + alert：點確定後跳
 *
 * @example
 * import Form from './components/form.js'
 *
 * const form = new Form('#my-form')
 * form.on('validate', (input) => { ... })
 * form.on('submit', async (data) => { return false }) // 取消
 * form.on('done', (res) => { ... })
 * form.on('success', (res) => { ... })
 * form.on('fail', (res) => { ... })
 */

import EventsMixin from '../core/events.js';
import Queue from '../utils/queue.js';
import ajax from '../utils/ajax.js';
import dialog from './dialog.js';
import Mask from '../utils/mask.js';

export default class Form extends EventsMixin() {
  #container = null;
  #form      = null;
  #mask      = null;
  #successCheck = (res) => res?.status === true;

  constructor(container) {
    super();
    this.#container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.#form = this.#container.tagName.toLowerCase() === 'form'
      ? this.#container
      : this.#container.querySelector('form');

    this.#mask = new Mask(this.#container);
    this.#bindSubmit();
    this.#bindAutoChange();
  }

  /**
   * 自訂成功判斷
   * @param {Function} fn
   * @returns {this}
   */
  setSuccessCheck(fn) {
    this.#successCheck = fn;
    return this;
  }

  /** 程式觸發送出 */
  submit() {
    this.#form.dispatchEvent(new Event('submit'));
  }

  /** 重設表單 */
  reset() {
    this.#form.reset();
  }

  // ── 初始化 ──────────────────────────────────────────

  #bindSubmit() {
    if (!this.#form) return;
    this.#form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#handleSubmit();
    });

    this.#container.querySelectorAll('[data-event="submit"],[type="submit"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.#form.dispatchEvent(new Event('submit'));
      });
    });
  }

  #bindAutoChange() {
    this.#container.querySelectorAll('[name][data-change="1"]').forEach((input) => {
      input.addEventListener('change', () => this.submit());
    });
  }

  // ── 送出流程 ─────────────────────────────────────────

  async #handleSubmit() {
    // 1. data-confirm 比對
    if (!this.#checkConfirm()) return;

    // 2. 欄位驗證
    const valid = await this.#validateAll();
    if (!valid) return;

    // 3. submit 事件（可取消）
    const formData = new FormData(this.#form);
    const ok = await this.emit('submit', formData);
    if (ok === false) return;

    // 4. 原生送出或 AJAX
    const isAjax = (this.#container.dataset.ajax ?? this.#form.dataset.ajax ?? '1') === '1';
    if (!isAjax) {
      this.#form.submit();
      return;
    }

    const action = this.#container.dataset.action || this.#form.action || location.href;
    const method = (this.#container.dataset.method || this.#form.method || 'post').toLowerCase();

    const csrfToken = formData.get('_token');
    const options = csrfToken ? { headers: { 'X-CSRF-TOKEN': csrfToken } } : {};

    this.#mask.show();
    try {
      const response = await ajax[method](action, formData, options);
      await this.#handleResponse(response);
    } catch (err) {
      this.#mask.hide();
      await this.emit('fail', { error: err });
      this.#notify('error', err.message || '發生錯誤');
    }
  }

  // ── 驗證 ─────────────────────────────────────────────

  async #validateAll() {
    const inputs = Array.from(this.#form.querySelectorAll('[name]'));
    const queue  = new Queue();

    inputs.forEach((input) => {
      queue.append(async () => {
        const ok = await this.emit('validate', input);
        if (ok === false) return false;
        if (!input.checkValidity()) {
          input.reportValidity();
          return false;
        }
        return true;
      });
    });

    try {
      await queue.run();
      return true;
    } catch {
      return false;
    }
  }

  #checkConfirm() {
    let valid = true;
    this.#container.querySelectorAll('[data-confirm]').forEach((input) => {
      if (!valid) return;
      const target = this.#container.querySelector(input.dataset.confirm)
        ?? this.#container.querySelector(`[name="${input.dataset.confirm}"]`);
      if (target && input.value !== target.value) {
        const message = input.dataset.error || input.dataset.message || '輸入不一致';
        input.setCustomValidity(message);
        input.reportValidity();
        valid = false;
      }
    });
    return valid;
  }

  // ── 回應處理 ─────────────────────────────────────────

  async #handleResponse(response) {
    this.#mask.hide();

    const ok = await this.emit('done', response);
    if (ok === false) return;

    if (this.#successCheck(response)) {
      await this.#handleSuccess(response);
    } else {
      await this.#handleFail(response);
    }
  }

  async #handleSuccess(response) {
    await this.emit('success', response);

    const message = this.#container.dataset.success || this.#form.dataset.success;

    if (!message) {
      this.#nextTo(response);
      return;
    }

    await this.#notify('success', message);
    this.#nextTo(response);
  }

  async #handleFail(response) {
    await this.emit('fail', response);
    this.#notify('error', response.message || '發生錯誤');
  }

  // ── 通知 ─────────────────────────────────────────────

  /**
   * 依 data-notify 顯示通知
   * toast（預設）：顯示後 resolve，供 await 等待消失
   * alert：等使用者點確定後 resolve
   * @param {'success'|'error'} type
   * @param {string} message
   * @returns {Promise<void>}
   */
  #notify(type, message) {
    const notify = this.#container.dataset.notify ?? 'toast';

    if (notify === 'alert') {
      return type === 'success'
        ? dialog.success(message)
        : dialog.error(message);
    }

    // toast：等 toast 關閉後 resolve
    return new Promise((resolve) => {
      const fn = type === 'success' ? dialog.toast.success : dialog.toast.error;
      fn(message, { onClosed: resolve });
    });
  }

  // ── 轉址 ─────────────────────────────────────────────

  #nextTo(response = null) {
    const next = this.#container.dataset.next || this.#form.dataset.next;
    if (!next) return;
    if (next === 'reload') { location.reload(); return; }

    const url = response
      ? next.replace(/\{(\w+)\}/g, (_, key) => response.result?.[key] ?? '')
      : next;

    // 發出 neko:navigate 事件，讓 Transition 攔截；若無人攔截則直接跳轉
    const event = new CustomEvent('neko:navigate', { detail: { url }, cancelable: true });
    document.dispatchEvent(event);
    if (!event.defaultPrevented) location.href = url;
  }
}
