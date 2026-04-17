/**
 * Frame
 * 同源 iframe 自動撐高工具
 * 載入後自動調整高度，並持續監聽內容變化（ResizeObserver）
 *
 * @example
 * import Frame from './utils/frame.js'
 *
 * const frame = new Frame('#my-iframe')
 * frame.on('resize', (height) => {
 *   console.log('iframe 高度：', height)
 * })
 *
 * <!-- HTML -->
 * <iframe id="my-iframe" src="/page" style="width:100%;border:0"></iframe>
 */

import EventsMixin from '../core/events.js';

export default class Frame extends EventsMixin() {
  #iframe   = null;
  #observer = null;

  /**
   * @param {HTMLIFrameElement|string} iframe
   */
  constructor(iframe) {
    super();
    this.#iframe = typeof iframe === 'string'
      ? document.querySelector(iframe)
      : iframe;

    // 已載入（如 src 已有內容）
    if (this.#iframe.contentDocument?.readyState === 'complete') {
      this.#setup();
    }

    this.#iframe.addEventListener('load', () => this.#setup());
  }

  // ── Public API ──────────────────────────────────────

  /** 手動觸發一次高度調整 */
  adjust() {
    this.#adjust();
  }

  /** 停止監聽 */
  destroy() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  // ── 內部 ─────────────────────────────────────────────

  #setup() {
    this.#adjust();

    // 重新建立 observer（src 換頁時 document 會不同）
    this.#observer?.disconnect();
    const body = this.#iframe.contentDocument?.body;
    if (!body) return;

    this.#observer = new ResizeObserver(() => this.#adjust());
    this.#observer.observe(body);
  }

  #adjust() {
    const doc = this.#iframe.contentDocument;
    if (!doc) return;

    // scrollHeight 取完整內容高度（含超出可視範圍的部分）
    const height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
    if (!height) return;

    this.#iframe.style.height = height + 'px';
    this.emit('resize', height);
  }
}
