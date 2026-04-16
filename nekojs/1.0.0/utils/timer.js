/**
 * Timer
 * 倒數計時工具，支援暫停 / 恢復 / 循環，適用 OTP 倒數、送出冷卻等情境
 *
 * @example
 * import Timer from './utils/timer.js'
 *
 * const timer = new Timer(60)   // 60 秒倒數
 *
 * timer.on('tick', (sec) => {
 *   btn.textContent = `重新發送 (${sec})`
 * })
 * timer.on('stop', () => {
 *   btn.disabled = false
 *   btn.textContent = '重新發送'
 * })
 *
 * timer.start()
 */

import EventsMixin from '../core/events.js';

export default class Timer extends EventsMixin() {
  #seconds  = 0;
  #current  = 0;
  #interval = 1000;
  #loop     = false;
  #timerId  = null;

  /**
   * @param {number} seconds  初始秒數
   * @param {object} [options]
   * @param {number} [options.interval=1000]  每次 tick 間隔（ms）
   * @param {boolean} [options.loop=false]    結束後是否自動重新開始
   */
  constructor(seconds = 0, { interval = 1000, loop = false } = {}) {
    super();
    this.#seconds  = seconds;
    this.#current  = seconds;
    this.#interval = interval;
    this.#loop     = loop;
  }

  // ── Public API ──────────────────────────────────────

  /**
   * 開始（或重新開始）計時
   * @param {number} [seconds]  重設秒數（不傳則沿用初始值）
   */
  start(seconds = null) {
    this.stop();
    if (seconds !== null) {
      this.#seconds = seconds;
    }
    this.#current = this.#seconds;
    this.#tick();
  }

  /** 暫停 */
  pause() {
    if (this.#timerId === null) return;
    clearInterval(this.#timerId);
    this.#timerId = null;
    this.emit('pause', this.#current);
  }

  /** 從暫停處繼續 */
  resume() {
    if (this.#timerId !== null) return;
    this.#tick();
    this.emit('resume', this.#current);
  }

  /** 停止並重設 */
  stop() {
    if (this.#timerId !== null) {
      clearInterval(this.#timerId);
      this.#timerId = null;
    }
  }

  /** 是否正在計時 */
  get running() {
    return this.#timerId !== null;
  }

  /** 目前剩餘秒數 */
  get current() {
    return this.#current;
  }

  /**
   * 格式化剩餘時間
   * @param {string} [format]  支援 {hh} {mm} {ss}（補零）或 {h} {m} {s}（不補零）
   * @returns {string}
   *
   * @example
   * timer.format('{mm}:{ss}')  // '01:30'
   * timer.format('{m}:{ss}')   // '1:30'
   */
  format(fmt = '{mm}:{ss}') {
    const total = this.#current;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return fmt
      .replace('{hh}', String(h).padStart(2, '0'))
      .replace('{mm}', String(m).padStart(2, '0'))
      .replace('{ss}', String(s).padStart(2, '0'))
      .replace('{h}', h)
      .replace('{m}', m)
      .replace('{s}', s);
  }

  // ── 內部計時 ─────────────────────────────────────────

  #tick() {
    this.#timerId = setInterval(() => {
      this.#current--;

      if (this.#current <= 0) {
        if (this.#loop) {
          this.emit('tick', 0);
          this.#current = this.#seconds;
        } else {
          this.stop();
          this.emit('stop');
        }
      } else {
        this.emit('tick', this.#current);
      }
    }, this.#interval);
  }
}
