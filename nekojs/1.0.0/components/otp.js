/**
 * OTP
 * 一次性驗證碼元件，整合 Timer + ajax + dialog
 *
 * 事件流程：
 * 點發送 → send(account) → ajax.post() → 成功 → timer 倒數 → 按鈕恢復
 *
 * @example
 * import OTP from './components/otp.js'
 *
 * const otp = new OTP('#my-otp')
 *
 * otp.on('sent', (res) => {
 *   // 發送成功，timer 已啟動
 * })
 * otp.on('error', (res) => {
 *   // 發送失敗
 * })
 * otp.on('tick', (sec) => {
 *   // 每秒倒數
 * })
 * otp.on('ready', () => {
 *   // 倒數結束，可重新發送
 * })
 *
 * <!-- HTML -->
 * <div id="my-otp"
 *      data-action="/api/otp/send"
 *      data-seconds="60">
 *
 *   <input name="email" type="email" placeholder="輸入信箱" />
 *
 *   <button data-send type="button">
 *     發送驗證碼
 *     <span data-timer></span>
 *   </button>
 *
 *   <input name="code" placeholder="輸入驗證碼" />
 * </div>
 */

import EventsMixin from '../core/events.js';
import Timer from '../utils/timer.js';
import ajax from '../utils/ajax.js';
import dialog from './dialog.js';

export default class OTP extends EventsMixin() {
  #container = null;
  #accountEl = null;
  #sendBtn   = null;
  #timerEl   = null;
  #timer     = null;

  #action  = '';
  #seconds = 60;

  /**
   * @param {HTMLElement|string} container
   */
  constructor(container) {
    super();
    this.#container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.#action  = this.#container.dataset.action  || '';
    this.#seconds = parseInt(this.#container.dataset.seconds || 60);

    this.#accountEl = this.#container.querySelector('[data-account]')
      ?? this.#container.querySelector('input[type="email"]')
      ?? this.#container.querySelector('input[type="tel"]')
      ?? this.#container.querySelector('input');

    this.#sendBtn = this.#container.querySelector('[data-send]');
    this.#timerEl = this.#container.querySelector('[data-timer]');

    this.#timer = new Timer(this.#seconds);
    this.#bindTimer();
    this.#bindSend();
  }

  // ── Public API ──────────────────────────────────────

  /** 目前是否在倒數中（不可重送） */
  get counting() {
    return this.#timer.running;
  }

  /** 手動啟動倒數（不打 API，適合預先鎖定） */
  start(seconds = null) {
    this.#lockBtn();
    this.#timer.start(seconds);
  }

  // ── Timer 綁定 ────────────────────────────────────────

  #bindTimer() {
    this.#timer.on('tick', (sec) => {
      if (this.#timerEl) {
        this.#timerEl.textContent = `(${String(sec).padStart(2, '0')})`;
      }
      this.emit('tick', sec);
    });

    this.#timer.on('stop', () => {
      if (this.#timerEl) this.#timerEl.textContent = '';
      this.#unlockBtn();
      this.emit('ready');
    });
  }

  // ── 發送按鈕 ─────────────────────────────────────────

  #bindSend() {
    if (!this.#sendBtn) return;

    this.#sendBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (this.counting) return;

      const account = this.#accountEl?.value?.trim() ?? '';

      if (!account) {
        const label = this.#accountEl?.placeholder || '帳號';
        dialog.alert(`請輸入${label}`);
        return;
      }

      if (!this.#action) return;

      try {
        const response = await ajax.post(this.#action, { account });

        if (response?.status === true) {
          this.#lockBtn();
          this.#timer.start();
          await this.emit('sent', response);
        } else {
          const message = response?.message || '發送失敗，請稍後再試';
          dialog.alert(message);
          await this.emit('error', response);
        }
      } catch (err) {
        dialog.alert('發送失敗，請稍後再試');
        await this.emit('error', err);
      }
    });
  }

  // ── 按鈕狀態 ─────────────────────────────────────────

  #lockBtn() {
    if (!this.#sendBtn) return;
    this.#sendBtn.disabled = true;
    this.#sendBtn.classList.add('is-disabled');
  }

  #unlockBtn() {
    if (!this.#sendBtn) return;
    this.#sendBtn.disabled = false;
    this.#sendBtn.classList.remove('is-disabled');
  }
}
