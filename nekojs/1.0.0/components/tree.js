/**
 * Tree
 * 樹狀結構 UI 元件，從 API 或資料渲染，支援 Drop 拖移、current、breadcrumb
 *
 * Template（3 種）：
 * - data-template="root"  根節點容器
 * - data-template="node"  有子節點的節點
 * - data-template="leaf"  葉節點（無子節點）
 * 均使用 ${key} 替換資料欄位
 *
 * @example
 * import Tree from './components/tree.js'
 *
 * const tree = new Tree('#my-tree')
 *
 * tree.on('click', (node) => {
 *   // return false 阻止預設跳轉
 * })
 *
 * tree.on('drop', (el, node, payload) => {
 *   // 拖曳放入節點
 * })
 *
 * tree.load()   // 從 data-action 打 API
 *
 * <!-- HTML -->
 * <div id="my-tree" data-action="/api/categories" data-drop="true">
 *   <div data-body></div>
 *
 *   <template data-template="root">
 *     <ul data-body="children"><li>${name}</li></ul>
 *   </template>
 *
 *   <template data-template="node">
 *     <li data-node data-id="${id}">
 *       <a href="/category/${id}">${name}</a>
 *       <ul data-body="children"></ul>
 *     </li>
 *   </template>
 *
 *   <template data-template="leaf">
 *     <li data-node data-id="${id}">
 *       <a href="/category/${id}">${name}</a>
 *     </li>
 *   </template>
 * </div>
 */

import EventsMixin from '../core/events.js';
import TreeNodes from '../utils/tree-nodes.js';
import Drop from './drop.js';
import ajax from '../utils/ajax.js';

export default class Tree extends EventsMixin() {
  #container = null;
  #body      = null;
  #templates = {};
  #treeNodes = null;
  #drop      = null;

  #nodeKey   = 'id';
  #parentKey = 'parent_id';
  #selector  = '[data-node]';
  #action    = '';

  /**
   * @param {HTMLElement|string} container
   */
  constructor(container) {
    super();
    this.#container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.#action    = this.#container.dataset.action    || '';
    this.#nodeKey   = this.#container.dataset.nodeKey   || 'id';
    this.#parentKey = this.#container.dataset.parentKey || 'parent_id';
    this.#selector  = this.#container.dataset.selector  || '[data-node]';

    this.#body      = this.#container.querySelector('[data-body]');
    this.#templates = this.#loadTemplates();

    this.#treeNodes = new TreeNodes({
      nodeKey:   this.#nodeKey,
      parentKey: this.#parentKey,
    });

    if (this.#container.dataset.drop === 'true') {
      this.#initDrop();
    }

    // 綁定已存在的靜態 DOM 節點
    this.#bindNodes();
  }

  // ── Public API ──────────────────────────────────────

  /**
   * 從 API 載入並渲染
   * @param {string} [url]  不傳則用 data-action
   */
  async load(url = '') {
    const endpoint = url || this.#action;
    if (!endpoint) return;

    const response = await ajax.get(endpoint);
    const result   = response?.results ?? response?.result ?? response;
    const list     = Array.isArray(result) ? result : (result?.list ?? []);

    this.render(list);
    await this.emit('done', list);
  }

  /**
   * 載入資料並渲染
   * @param {object[]} nodes
   */
  render(nodes) {
    this.#treeNodes.load(nodes);
    const tree = this.#treeNodes.toTree();
    this.#body.innerHTML = '';

    const roots = Array.isArray(tree) ? tree : [tree];
    roots.forEach((root) => {
      const rootEl = this.#addRoot(root);
      this.#appendChildren(rootEl, root.children ?? []);
    });

    this.#bindNodes();
  }

  /**
   * 取得節點資料
   * @param {string|number} id
   */
  node(id) {
    return this.#treeNodes.get(id);
  }

  /**
   * 取得節點 DOM 元素
   * @param {string|number} id
   */
  nodeEl(id) {
    return this.#container.querySelector(`[data-${this.#nodeKey}="${id}"]`);
  }

  /**
   * 設定 / 取得當前節點，同步更新 DOM class
   * @param {string|number} [id]
   */
  current(id = null) {
    if (id === null) return this.#treeNodes.current();

    this.#treeNodes.current(id);
    this.#container.querySelectorAll(this.#selector).forEach((el) => {
      el.classList.toggle('is-current', el.dataset[this.#nodeKey] === String(id));
    });
    return this;
  }

  /**
   * 取得麵包屑路徑（由根到自身）
   * @param {string|number} [id]  不傳則用當前節點
   * @returns {object[]}
   */
  breadcrumb(id = null) {
    const targetId = id ?? this.#treeNodes.current()?.[this.#nodeKey];
    if (!targetId) return [];
    return this.#treeNodes.ancestors(targetId);
  }

  /** 是否為葉節點 */
  isLeaf(id) {
    return this.#treeNodes.isLeaf(id);
  }

  /** 取得直接子節點 */
  children(id) {
    return this.#treeNodes.children(id);
  }

  // ── 渲染 ─────────────────────────────────────────────

  #loadTemplates() {
    const map = {};
    this.#container.querySelectorAll('template[data-template]').forEach((t) => {
      map[t.dataset.template] = t;
    });
    return map;
  }

  #cloneTemplate(name, data = {}) {
    const tpl = this.#templates[name];
    if (!tpl) return null;

    const html = tpl.innerHTML.replace(
      /\$\{(\w+)\}/g,
      (_, key) => data[key] ?? '',
    );
    const wrap = document.createElement('template');
    wrap.innerHTML = html;
    const el = wrap.content.firstElementChild;

    // 寫入 data 屬性供後續查找
    Object.entries(data).forEach(([k, v]) => {
      el.dataset[k] = v;
    });

    return el;
  }

  #addRoot(root) {
    const el = this.#cloneTemplate('root', root) ?? this.#body;
    if (el !== this.#body) this.#body.appendChild(el);
    return el;
  }

  #appendChildren(parentEl, nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) return;
    const childBody = parentEl.querySelector('[data-body="children"]') ?? parentEl;

    nodes.forEach((node) => {
      const isLeaf = !Array.isArray(node.children) || node.children.length === 0;
      const el = this.#cloneTemplate(isLeaf ? 'leaf' : 'node', node);
      if (!el) return;
      childBody.appendChild(el);
      if (!isLeaf) this.#appendChildren(el, node.children);
    });
  }

  // ── 節點事件綁定 ──────────────────────────────────────

  #bindNodes() {
    this.#container.querySelectorAll(this.#selector).forEach((el) => {
      if (el.dataset._bound) return;
      el.dataset._bound = '1';

      const node = this.#treeNodes.get(el.dataset[this.#nodeKey]);
      if (node?.current) el.classList.add('is-current');

      this.emit('node.ready', el, node);

      const link = el.tagName.toLowerCase() === 'a' ? el : el.querySelector('a');
      if (!link) return;

      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const ok = await this.emit('click', node, el);
        if (ok !== false && link.href) location.href = link.href;
      });
    });
  }

  // ── Drop 整合 ─────────────────────────────────────────

  #initDrop() {
    this.#drop = new Drop(this.#container);

    this.#drop.setFinder((target) => target.closest(this.#selector));

    this.#drop.on('node.over', async (el) => {
      const node = this.#treeNodes.get(el.dataset[this.#nodeKey]);
      return this.emit('drop.over', el, node);
    });

    this.#drop.on('drop', async (el, payload) => {
      const node = this.#treeNodes.get(el.dataset[this.#nodeKey]);
      return this.emit('drop', el, node, payload);
    });

    this.#drop.on('cleanup', () => this.emit('drop.cleanup'));
  }
}
