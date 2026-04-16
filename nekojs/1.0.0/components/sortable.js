/**
 * Sortable
 * 拖曳排序工具，基於 SortableJS，支援 AJAX 回寫順序
 *
 * 事件流程：
 * 拖曳結束 → sort(items, payload) → 可改 payload.data 或 return false 取消 → AJAX
 *
 * payload.data 預設格式：
 * [{ id: '1', sort: 1 }, { id: '2', sort: 2 }, ...]
 * 其中 id 取自子元素的 data-id，欄位名稱可透過 data-id-key / data-sort-key 自訂
 *
 * @example
 * import Sortable from './components/sortable.js'
 *
 * const s = new Sortable('#my-list')
 * s.on('sort', (items, payload) => {
 *   // items: [{ id, sort, el }, ...]
 *   // payload.data 預設已設好，可直接修改
 *   payload.data = items.map(i => i.id)  // 改成只送 ID 陣列
 *   // return false → 取消 AJAX
 * })
 *
 * <!-- HTML -->
 * <ul id="my-list" data-action="/api/sort" data-handle=".drag-handle">
 *   <li data-id="1"><span class="drag-handle">☰</span> Item 1</li>
 *   <li data-id="2"><span class="drag-handle">☰</span> Item 2</li>
 * </ul>
 */

import EventsMixin from '../core/events.js';
import loader from './loader.js';
import ajax from './ajax.js';

const SORTABLEJS_CDN = 'https://cdn.jsdelivr.net/npm/sortablejs@1/Sortable.min.js';

async function loadSortableJS() {
  if (window.Sortable) return window.Sortable;
  await loader.loadScript(SORTABLEJS_CDN);
  return window.Sortable;
}

export default class Sortable extends EventsMixin() {
  #container = null;
  #action    = '';
  #idKey     = 'id';
  #sortKey   = 'sort';
  #instance  = null;

  /**
   * @param {HTMLElement|string} container
   */
  constructor(container) {
    super();
    this.#container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.#action  = this.#container.dataset.action  || '';
    this.#idKey   = this.#container.dataset.idKey   || 'id';
    this.#sortKey = this.#container.dataset.sortKey || 'sort';

    this.#init();
  }

  // ── 初始化 ──────────────────────────────────────────

  async #init() {
    const SortableJS = await loadSortableJS();

    const options = {
      animation: 150,
      onEnd: (evt) => this.#handleEnd(evt),
    };

    const handle = this.#container.dataset.handle;
    if (handle) options.handle = handle;

    const group = this.#container.dataset.group;
    if (group) options.group = group;

    this.#instance = new SortableJS(this.#container, options);
  }

  // ── 拖曳處理 ─────────────────────────────────────────

  async #handleEnd(evt) {
    if (evt.oldIndex === evt.newIndex) return;

    const items = this.#getItems();

    // 預設 payload
    const payload = {
      data: items.map(({ id, sort }) => ({
        [this.#idKey]:   id,
        [this.#sortKey]: sort,
      })),
    };

    // sort 事件：可修改 payload.data 或 return false 取消
    const ok = await this.emit('sort', items, payload);
    if (ok === false) return;

    if (!this.#action) return;

    try {
      const result = await ajax.post(this.#action, payload.data);
      await this.emit('done', result);
    } catch (err) {
      await this.emit('error', err);
    }
  }

  // ── 工具 ─────────────────────────────────────────────

  #getItems() {
    return Array.from(this.#container.children).map((el, index) => ({
      id:   el.dataset.id ?? '',
      sort: index + 1,
      el,
    }));
  }

  // ── Public API ──────────────────────────────────────

  /** 停用拖曳 */
  disable() {
    this.#instance?.option('disabled', true);
  }

  /** 啟用拖曳 */
  enable() {
    this.#instance?.option('disabled', false);
  }

  /** 銷毀實例 */
  destroy() {
    this.#instance?.destroy();
    this.#instance = null;
  }

  /** 取得目前順序 */
  getItems() {
    return this.#getItems();
  }
}
