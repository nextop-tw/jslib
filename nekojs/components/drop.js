/**
 * Drop
 * 拖放目標區，處理外部元素拖入容器、落在特定節點的互動
 *
 * 與 Uploader 的拖曳不同：
 * - Uploader：拖檔案進來上傳
 * - Drop：拖 DOM 元素 / 資料進來，落在特定節點上觸發業務邏輯
 *
 * 事件流程：
 * dragover → node.find(target) 決定目標節點 → node.over(node) 決定是否允許
 * drop    → node.find(target) → drop(node, payload)
 *
 * dataTransfer payload 格式：任意 JSON（由拖曳來源端寫入）
 *
 * @example
 * import Drop from './components/drop.js'
 *
 * const drop = new Drop('#kanban')
 *
 * // 決定游標在哪個節點上（預設抓最近的 [data-drop-node]）
 * // 自訂目標節點（預設抓最近的 [data-drop-node]）
 * drop.setFinder((target) => target.closest('[data-column]'))
 *
 * // 是否允許放入（return false → 加 drag-over-disabled）
 * drop.on('node.over', (node) => {
 *   if (node.dataset.locked) return false
 * })
 *
 * // 放入後處理
 * drop.on('drop', (node, payload) => {
 *   console.log('放入節點：', node)
 *   console.log('payload：', payload)
 * })
 *
 * // 拖曳來源端設定 payload
 * el.addEventListener('dragstart', (e) => {
 *   e.dataTransfer.setData('payload', JSON.stringify({ id: 1, title: 'Task' }))
 * })
 */

import EventsMixin from '../core/events.js';

export default class Drop extends EventsMixin() {
  #container  = null;
  #hoverNode  = null;
  #finder     = null;

  /**
   * @param {HTMLElement|string} container
   */
  constructor(container) {
    super();
    this.#container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.#bind();
  }

  // ── 事件綁定 ─────────────────────────────────────────

  #bind() {
    this.#container.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.#handleOver(e);
    });

    this.#container.addEventListener('dragleave', (e) => {
      // 只在真正離開容器時清除（不因移到子元素而誤觸發）
      if (!this.#container.contains(e.relatedTarget)) {
        this.#clearHover();
      }
    });

    this.#container.addEventListener('drop', (e) => {
      e.preventDefault();
      this.#handleDrop(e);
    });
  }

  // ── dragover ─────────────────────────────────────────

  async #handleOver(e) {
    const node = this.#findNode(e.target);

    if (node === this.#hoverNode) return;

    this.#clearHover();
    this.#hoverNode = node;

    if (!node) return;

    const ok = await this.emit('node.over', node);
    node.classList.add(ok === false ? 'drag-over-disabled' : 'drag-over');
  }

  // ── drop ─────────────────────────────────────────────

  async #handleDrop(e) {
    const node = this.#findNode(e.target);

    this.#clearHover();

    if (!node) return;

    let payload = null;
    try {
      payload = JSON.parse(e.dataTransfer.getData('payload'));
    } catch {}

    await this.emit('drop', node, payload);

    // 非同步 cleanup，讓 drop 事件先完成
    Promise.resolve().then(() => this.emit('cleanup'));
  }

  // ── Public API ──────────────────────────────────────

  /**
   * 自訂目標節點查找邏輯
   * @param {(target: Element) => Element|null} fn
   */
  setFinder(fn) {
    this.#finder = fn;
    return this;
  }

  // ── 找目標節點 ────────────────────────────────────────

  #findNode(target) {
    if (this.#finder) return this.#finder(target) ?? null;
    // 預設：往上找最近的 [data-drop-node]
    return target.closest('[data-drop-node]') ?? null;
  }

  // ── 清除 hover 狀態 ───────────────────────────────────

  #clearHover() {
    if (this.#hoverNode) {
      this.#hoverNode.classList.remove('drag-over', 'drag-over-disabled');
      this.#hoverNode = null;
    }
  }
}
