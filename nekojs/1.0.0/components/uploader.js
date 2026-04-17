/**
 * Uploader
 * 檔案上傳工具，支援點擊選取、拖曳上傳、圖片預覽、即時 AJAX 上傳
 *
 * 事件流程：
 * 選取檔案 → select(file) → AJAX 上傳 → done(res, el) → 插入列表
 * 移除 → remove(el) → return false 取消 → 移除 DOM
 *
 * @example
 * import Uploader from './components/uploader.js'
 *
 * const up = new Uploader('#my-uploader')
 * up.on('done', (res, el) => {
 *   // res.results.url — 已上傳檔案的 URL
 * })
 *
 * <!-- HTML -->
 * <div id="my-uploader"
 *      data-action="/api/upload"
 *      data-name="photos[]"
 *      data-max="5"
 *      data-accept="image/*">
 *
 *   <div data-trigger>點擊或拖曳上傳</div>
 *   <div data-body></div>
 *
 *   <template>
 *     <div data-row>
 *       <img data-preview />
 *       <span data-filename></span>
 *       <button data-remove type="button">移除</button>
 *     </div>
 *   </template>
 * </div>
 */

import EventsMixin from '../core/events.js';
import ajax from './ajax.js';

export default class Uploader extends EventsMixin() {
  #container = null;
  #body      = null;
  #template  = null;
  #trigger   = null;
  #input     = null;

  #action  = '';
  #name    = 'file';
  #max     = Infinity;
  #accept  = '';

  /**
   * @param {HTMLElement|string} container
   */
  constructor(container) {
    super();
    this.#container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.#action  = this.#container.dataset.action  || '';
    this.#name    = this.#container.dataset.name    || 'file';
    this.#max     = parseInt(this.#container.dataset.max || '0') || Infinity;
    this.#accept  = this.#container.dataset.accept  || '';

    this.#body     = this.#container.querySelector('[data-body]');
    this.#template = this.#container.querySelector('template');
    this.#trigger  = this.#container.querySelector('[data-trigger]');

    this.#createInput();
    this.#bindTrigger();
    this.#bindDrop();

    // 預載已有檔案
    const preload = this.#container.dataset.preload;
    if (preload) {
      try {
        const files = JSON.parse(preload);
        files.forEach((f) => this.#appendRow(f, null));
      } catch {}
    }
  }

  // ── Public API ──────────────────────────────────────

  /** 目前已上傳的列數 */
  get count() {
    return this.#body.querySelectorAll('[data-row]').length;
  }

  /** 清空所有列 */
  clear() {
    this.#body.innerHTML = '';
    this.#updateTrigger();
  }

  // ── 隱藏 input ───────────────────────────────────────

  #createInput() {
    this.#input = document.createElement('input');
    this.#input.type   = 'file';
    this.#input.hidden = true;
    if (this.#accept) this.#input.accept = this.#accept;
    this.#input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      e.target.value = '';
      files.forEach((f) => this.#handleFile(f));
    });
    this.#container.appendChild(this.#input);
  }

  // ── 觸發器 ──────────────────────────────────────────

  #bindTrigger() {
    if (!this.#trigger) return;
    this.#trigger.style.cursor = 'pointer';
    this.#trigger.addEventListener('click', () => {
      if (this.count >= this.#max) return;
      this.#input.click();
    });
  }

  // ── 拖曳 ────────────────────────────────────────────

  #bindDrop() {
    const zone = this.#trigger || this.#container;
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.dataset.dragover = '';
    });
    zone.addEventListener('dragleave', () => {
      delete zone.dataset.dragover;
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      delete zone.dataset.dragover;
      if (this.count >= this.#max) return;
      Array.from(e.dataTransfer.files).forEach((f) => this.#handleFile(f));
    });
  }

  // ── 檔案處理 ─────────────────────────────────────────

  async #handleFile(file) {
    if (this.count >= this.#max) return;

    const ok = await this.emit('select', file);
    if (ok === false) return;

    const el = this.#appendRow(null, file);

    if (!this.#action) return;

    const formData = new FormData();
    formData.set('file', file);

    try {
      const response = await ajax.post(this.#action, formData);
      await this.emit('done', response, el);

      // 寫入 hidden input value（取 results.path / results.id 等，由 done 事件自行處理也可）
      const hiddenInput = el.querySelector('[data-hidden]');
      if (hiddenInput) {
        hiddenInput.value = response?.results?.id
          ?? response?.results?.path
          ?? response?.result?.id
          ?? '';
      }
    } catch (err) {
      await this.emit('error', err, el);
      el.remove();
      this.#updateTrigger();
    }
  }

  // ── 渲染列 ───────────────────────────────────────────

  #appendRow(data, file) {
    let el;

    if (this.#template) {
      const html = this.#template.innerHTML;
      const wrap = document.createElement('template');
      wrap.innerHTML = html;
      el = wrap.content.firstElementChild;
    } else {
      el = this.#createDefaultRow();
    }

    // 圖片預覽
    const previewEl = el.querySelector('[data-preview]');
    if (previewEl) {
      if (file instanceof File && /^image/.test(file.type)) {
        previewEl.src = URL.createObjectURL(file);
      } else if (data?.src) {
        previewEl.src = data.src;
      }
    }

    // 檔名
    const filenameEl = el.querySelector('[data-filename]');
    if (filenameEl) {
      filenameEl.textContent = file?.name ?? data?.name ?? '';
    }

    // hidden input（送出表單用）
    const hiddenInput = el.querySelector('[data-hidden]') ?? document.createElement('input');
    hiddenInput.type  = 'hidden';
    hiddenInput.name  = this.#name;
    hiddenInput.value = data?.id ?? data?.file_id ?? '';
    if (!el.querySelector('[data-hidden]')) {
      hiddenInput.dataset.hidden = '';
      el.appendChild(hiddenInput);
    }

    // 刪除按鈕
    el.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const ok = await this.emit('remove', el, data ?? file);
        if (ok === false) return;
        el.remove();
        this.#updateTrigger();
      });
    });

    this.#body.appendChild(el);
    this.#updateTrigger();
    return el;
  }

  // 無 template 時的預設列結構
  #createDefaultRow() {
    const el = document.createElement('div');
    el.dataset.row = '';
    el.innerHTML = `
      <img data-preview style="max-width:80px;max-height:80px" />
      <span data-filename></span>
      <button data-remove type="button">&times;</button>
      <input data-hidden type="hidden" />
    `;
    return el;
  }

  // ── 觸發器顯示控制 ────────────────────────────────────

  #updateTrigger() {
    if (!this.#trigger) return;
    this.#trigger.style.display = this.count >= this.#max ? 'none' : '';
  }
}
