/**
 * TreeNodes
 * 樹狀節點資料結構，處理平坦陣列 ↔ 樹狀結構轉換
 * 可獨立使用，也可搭配 Tree 元件
 *
 * @example
 * import TreeNodes from './utils/tree-nodes.js'
 *
 * const nodes = new TreeNodes()
 * nodes.load([
 *   { id: 1, parent_id: 0, name: '根節點' },
 *   { id: 2, parent_id: 1, name: '子節點 A' },
 *   { id: 3, parent_id: 1, name: '子節點 B' },
 * ])
 *
 * nodes.toTree()
 * // [{ id: 1, ..., children: [{ id: 2, ... }, { id: 3, ... }] }]
 *
 * nodes.get(2)          // { id: 2, parent_id: 1, name: '子節點 A' }
 * nodes.ancestors(3)    // [根節點, 子節點 B] （由根到自身）
 */

export default class TreeNodes {
  #nodes   = {};
  #nodeKey = 'id';
  #parentKey = 'parent_id';

  /**
   * @param {object} [options]
   * @param {string} [options.nodeKey='id']        節點 ID 欄位名稱
   * @param {string} [options.parentKey='parent_id'] 父節點 ID 欄位名稱
   */
  constructor({ nodeKey = 'id', parentKey = 'parent_id' } = {}) {
    this.#nodeKey   = nodeKey;
    this.#parentKey = parentKey;
  }

  // ── Public API ──────────────────────────────────────

  /**
   * 載入節點（支援平坦陣列、巢狀陣列、物件 map）
   * @param {object[]|object} nodes
   */
  load(nodes) {
    this.#nodes = this.#flatten(nodes);
    return this;
  }

  /**
   * 取得單一節點
   * @param {string|number} id
   * @returns {object|null}
   */
  get(id) {
    return this.#nodes[id] ?? null;
  }

  /** 取得所有節點（flat map） */
  all() {
    return { ...this.#nodes };
  }

  /** 節點總數 */
  get size() {
    return Object.keys(this.#nodes).length;
  }

  /**
   * 轉成巢狀樹狀結構
   * @returns {object[]}  根節點陣列（若只有一個根則回傳該根物件）
   */
  toTree() {
    const nodeKey   = this.#nodeKey;
    const parentKey = this.#parentKey;
    const map   = {};
    const roots = [];

    Object.values(this.#nodes).forEach((n) => {
      map[n[nodeKey]] = { ...n, children: [] };
    });

    Object.values(this.#nodes).forEach((n) => {
      const pid = n[parentKey];
      if (pid && map[pid]) {
        map[pid].children.push(map[n[nodeKey]]);
      } else {
        roots.push(map[n[nodeKey]]);
      }
    });

    return roots.length === 1 ? roots[0] : roots;
  }

  /**
   * 取得某節點的所有子孫（平坦陣列）
   * @param {string|number} id
   * @returns {object[]}
   */
  descendants(id) {
    const nodeKey   = this.#nodeKey;
    const parentKey = this.#parentKey;
    const result = [];
    const collect = (pid) => {
      Object.values(this.#nodes).forEach((n) => {
        if (String(n[parentKey]) === String(pid)) {
          result.push(n);
          collect(n[nodeKey]);
        }
      });
    };
    collect(id);
    return result;
  }

  /**
   * 取得某節點到根的路徑（由根到自身）
   * @param {string|number} id
   * @returns {object[]}
   */
  ancestors(id) {
    const path = [];
    let node = this.get(id);
    while (node) {
      path.unshift(node);
      const pid = node[this.#parentKey];
      node = (pid && pid !== '0') ? this.get(pid) : null;
    }
    return path;
  }

  /**
   * 是否為葉節點（無子節點）
   * @param {string|number} id
   * @returns {boolean}
   */
  isLeaf(id) {
    const nodeKey   = this.#nodeKey;
    const parentKey = this.#parentKey;
    return !Object.values(this.#nodes).some(
      (n) => String(n[parentKey]) === String(id),
    );
  }

  /**
   * 取得直接子節點
   * @param {string|number} id
   * @returns {object[]}
   */
  children(id) {
    return Object.values(this.#nodes).filter(
      (n) => String(n[this.#parentKey]) === String(id),
    );
  }

  /**
   * 設定 / 取得當前節點
   * @param {string|number} [id]  不傳則為 getter
   * @returns {object|null|this}
   */
  current(id = null) {
    if (id === null) {
      return Object.values(this.#nodes).find((n) => n._current) ?? null;
    }
    Object.values(this.#nodes).forEach((n) => { n._current = false; });
    const node = this.get(id);
    if (node) node._current = true;
    return this;
  }

  // ── 內部 ─────────────────────────────────────────────

  /**
   * 將任意格式正規化為 flat map
   * 支援：平坦陣列、巢狀陣列（含 children）、物件 map
   */
  #flatten(input) {
    const nodeKey = this.#nodeKey;
    const result  = {};

    const add = (node) => {
      const n = { ...node };
      const children = n.children;
      delete n.children;
      result[n[nodeKey]] = n;
      if (Array.isArray(children)) children.forEach(add);
    };

    if (Array.isArray(input)) {
      input.forEach(add);
    } else if (input && typeof input === 'object') {
      Object.values(input).forEach(add);
    }

    return result;
  }
}
