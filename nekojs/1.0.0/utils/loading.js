/**
 * Loading
 * 顯示 loading 畫面，支援全頁與容器兩種模式，可指定名稱對應多組自訂 HTML
 *
 * - 不帶參數 → 全頁遮罩
 * - 帶容器參數 → 容器遮罩
 * - 帶名稱參數 → 使用 [data-loading="name"] 的自訂 HTML
 * - 無對應元素 → 自動產生 spinner
 *
 * @example
 * import Loading from './utils/loading.js'
 *
 * // 全頁
 * const loading = new Loading()
 *
 * // 全頁，指定名稱
 * const loading = new Loading(null, 'a')
 *
 * // 容器
 * const loading = new Loading('#my-form')
 *
 * // 容器，指定名稱
 * const loading = new Loading('#my-form', 'a')
 *
 * loading.show()
 * loading.hide()
 *
 * // 自訂 HTML（全頁，多組）
 * <body>
 *   <div data-loading="a"><img src="loading.gif" /></div>
 *   <div data-loading="b"><img src="loading2.gif" /></div>
 * </body>
 *
 * // 自訂 HTML（容器）
 * <div id="my-form">
 *   <div data-loading>載入中...</div>
 * </div>
 */

let spinInjected = false;

function injectSpin() {
  if (spinInjected) return;
  const style = document.createElement('style');
  style.textContent = '@keyframes neko-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
  spinInjected = true;
}

export default class Loading {
  #el       = null;
  #fullPage = false;

  /**
   * @param {HTMLElement|string|null} [container] 不帶參數或 null 為全頁模式
   * @param {string} [name] 對應 [data-loading="name"] 的自訂 HTML
   */
  constructor(container, name) {
    this.#fullPage = container == null;

    const root = this.#fullPage
      ? document.body
      : (typeof container === 'string' ? document.querySelector(container) : container);

    // 有自訂 [data-loading] / [data-loading="name"] 就直接使用
    const selector = name
      ? `:scope > [data-loading="${name}"]`
      : ':scope > [data-loading]';
    const existing = root.querySelector(selector);
    if (existing) {
      this.#el = existing;
      return;
    }

    injectSpin();

    const el = document.createElement('div');

    if (this.#fullPage) {
      el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;background:rgba(255,255,255,0.85);z-index:9999;';
    } else {
      root.style.position = 'relative';
      el.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;background:rgba(255,255,255,0.75);z-index:10;';
    }

    el.innerHTML = '<div style="width:2rem;height:2rem;border:3px solid #ddd;border-top-color:#555;border-radius:50%;animation:neko-spin 0.8s linear infinite"></div>';

    root.appendChild(el);
    this.#el = el;
  }

  show() {
    this.#el.style.display = 'flex';
  }

  hide() {
    this.#el.style.display = 'none';
  }
}
