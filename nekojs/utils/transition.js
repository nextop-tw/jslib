/**
 * Transition
 * 頁面轉場，支援多頁（傳統換頁）模式
 *
 * 功能：
 * - 頁面載入時自動播放進場動畫
 * - 攔截內部 <a> 連結，播放離場動畫後再跳轉
 * - 攔截 Form 的 neko:navigate 事件
 *
 * 自動排除：外部連結、_blank、download、錨點
 *
 * @example
 * import Transition from './utils/transition.js'
 *
 * // 預設（fade）
 * const transition = new Transition()
 *
 * // Loading screen 模式
 * const transition = new Transition({ type: 'loading' })
 *
 * // Loading screen + 自訂名稱
 * const transition = new Transition({ type: 'loading', loading: 'page' })
 *
 * // 程式跳轉
 * transition.go('/dashboard')
 */

import Loading from './loading.js';

export default class Transition {
  #options  = {};
  #loading  = null;

  /**
   * @param {object} [options]
   * @param {'fade'|'loading'} [options.type='fade'] 轉場類型
   * @param {string} [options.loading] loading 名稱，對應 [data-loading="name"]
   * @param {boolean} [options.links=true] 是否攔截 <a> 連結
   * @param {number} [options.duration=300] 動畫時間（ms）
   */
  constructor(options = {}) {
    this.#options = { type: 'fade', links: true, duration: 300, ...options };

    if (this.#options.type === 'loading') {
      this.#loading = new Loading(null, this.#options.loading ?? undefined);
    } else {
      this.#injectStyles();
    }

    this.#enter();

    if (this.#options.links) this.#bindLinks();
    this.#bindNavigateEvent();
  }

  /**
   * 播放轉場並跳轉至指定網址
   * @param {string} url
   */
  go(url) {
    if (this.#options.type === 'loading') {
      this.#loading.show();
      // 等 loading 顯示後再跳轉
      requestAnimationFrame(() => { location.href = url; });
    } else {
      document.documentElement.classList.add('neko-exit');
      setTimeout(() => { location.href = url; }, this.#options.duration);
    }
  }

  // ── 進場動畫 ─────────────────────────────────────────

  #enter() {
    if (this.#options.type === 'loading') {
      // 先顯示 loading，等頁面完全載入後隱藏
      this.#loading.show();
      const hide = () => setTimeout(() => this.#loading.hide(), 50);
      if (document.readyState === 'complete') {
        hide();
      } else {
        window.addEventListener('load', hide, { once: true });
      }
    } else {
      // fade 進場
      document.documentElement.classList.add('neko-enter');
      setTimeout(() => {
        document.documentElement.classList.remove('neko-enter');
      }, this.#options.duration);
    }
  }

  // ── 攔截連結 ─────────────────────────────────────────

  #bindLinks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || this.#shouldSkip(a)) return;
      e.preventDefault();
      this.go(a.href);
    });
  }

  #shouldSkip(a) {
    if (!a.href)                        return true;
    if (a.target === '_blank')          return true;
    if (a.hasAttribute('download'))     return true;
    const url = new URL(a.href);
    if (url.hash && url.pathname === location.pathname) return true; // 同頁錨點
    if (url.origin !== location.origin) return true; // 外部連結
    return false;
  }

  // ── 攔截 Form 跳轉 ───────────────────────────────────

  #bindNavigateEvent() {
    document.addEventListener('neko:navigate', (e) => {
      e.preventDefault();
      this.go(e.detail.url);
    });
  }

  // ── 樣式注入（fade 模式） ─────────────────────────────

  #injectStyles() {
    if (document.querySelector('#neko-transition')) return;
    const d = this.#options.duration;
    const style = document.createElement('style');
    style.id = 'neko-transition';
    style.textContent = `
      @keyframes neko-fade-in  { from { opacity: 0 } to { opacity: 1 } }
      @keyframes neko-fade-out { from { opacity: 1 } to { opacity: 0 } }
      html.neko-enter { animation: neko-fade-in  ${d}ms ease both; }
      html.neko-exit  { animation: neko-fade-out ${d}ms ease both; }
    `.trim();
    document.head.appendChild(style);
  }
}
