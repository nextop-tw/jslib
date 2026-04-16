/**
 * Mask
 * 在容器上顯示半透明遮罩與 spinner
 *
 * @example
 * import Mask from './utils/mask.js'
 *
 * const mask = new Mask('#my-form')
 * mask.show()
 * mask.hide()
 */

let spinInjected = false;

function injectSpin() {
  if (spinInjected) return;
  const style = document.createElement('style');
  style.textContent = '@keyframes neko-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
  spinInjected = true;
}

export default class Mask {
  #el = null;

  /**
   * @param {HTMLElement|string} container
   */
  constructor(container) {
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    // 若已有 [data-mask]，直接使用
    const existing = el.querySelector('[data-mask]');
    if (existing) {
      this.#el = existing;
      return;
    }

    injectSpin();

    el.style.position = 'relative';

    const mask = document.createElement('div');
    mask.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;background:rgba(255,255,255,0.75);z-index:10;';
    mask.innerHTML = '<div style="width:2rem;height:2rem;border:3px solid #ddd;border-top-color:#555;border-radius:50%;animation:neko-spin 0.8s linear infinite"></div>';

    el.appendChild(mask);
    this.#el = mask;
  }

  show() {
    this.#el.style.display = 'flex';
  }

  hide() {
    this.#el.style.display = 'none';
  }
}
