/**
 * Table
 * 資料表元件，支援 AJAX 載入、分頁、排序、搜尋
 * 適用任何容器，不限於 <table>
 *
 * 模式：
 * - server（預設）：每次操作重新打 API
 * - client：載入一次，前端處理分頁/排序/搜尋
 *
 * API Response 格式（API Guidelines）：
 * {
 *   "status": true,
 *   "results": {
 *     "list": [...],
 *     "meta": { "results": 100, "limit": 10, "total": 10, "page": 1 }
 *   }
 * }
 *
 * Template 渲染使用 ${key} 替換：
 * <template>
 *   <tr>
 *     <td>${name}</td>
 *     <td>${email}</td>
 *   </tr>
 * </template>
 *
 * @example
 * import Table from './components/table.js'
 *
 * const table = new Table('#my-table')
 * table.on('beforeFetch', (params) => {
 *   params.keyword = params.search
 *   delete params.search
 * })
 * table.on('render', (el, data) => { ... })
 */

import EventsMixin from '../core/events.js';
import ajax from '../utils/ajax.js';
import Loading from '../utils/loading.js';

export default class Table extends EventsMixin() {
  #container  = null;
  #body       = null;
  #template   = null;
  #emptyEl    = null;
  #paginationEl = null;
  #searchEl   = null;
  #perPageEl  = null;

  #mode    = 'server';
  #action  = '';
  #page    = 1;
  #limit   = 10;
  #sort    = '';
  #order   = 'asc';
  #search  = '';

  // client-side 全量資料
  #allData      = [];
  #filteredData = [];

  // API 參數名稱（可透過 data-param-* 自訂）
  #params = {
    page:   'page',
    limit:  'limit',
    sort:   'sort',
    order:  'order',
    search: 'search',
  };

  #loading = null;

  /**
   * @param {HTMLElement|string} container
   */
  constructor(container) {
    super();
    this.#container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.#action = this.#container.dataset.action || '';
    this.#mode   = this.#container.dataset.mode   || 'server';
    this.#limit  = parseInt(this.#container.dataset.limit || 10);

    // 自訂參數名稱：data-param-page, data-param-limit...
    for (const key of Object.keys(this.#params)) {
      const attr = `param${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      if (this.#container.dataset[attr]) {
        this.#params[key] = this.#container.dataset[attr];
      }
    }

    this.#body         = this.#container.querySelector('[data-body]');
    this.#template     = this.#container.querySelector('template');
    this.#emptyEl      = this.#container.querySelector('[data-empty]');
    this.#paginationEl = this.#container.querySelector('[data-pagination]');
    this.#searchEl     = this.#container.querySelector('[data-search]');
    this.#perPageEl    = this.#container.querySelector('[data-per-page]');

    this.#loading = new Loading(this.#container);

    this.#bindSort();
    this.#bindSearch();
    this.#bindPerPage();

    if (this.#action) this.fetch();
  }

  // ── Public API ──────────────────────────────────────

  /**
   * 載入資料
   * @param {object} [extra] 額外參數，會合併到請求參數
   */
  async fetch(extra = {}) {
    if (!this.#action) return;

    const params = this.#buildParams(extra);

    // beforeFetch：可直接修改 params 物件
    await this.emit('beforeFetch', params);

    this.#loading.show();

    try {
      const qs       = new URLSearchParams(params).toString();
      const response = await ajax.get(`${this.#action}?${qs}`);
      await this.#handleResponse(response);
    } catch (err) {
      this.#loading.hide();
      await this.emit('error', err);
    }
  }

  /** 用目前條件重新載入 */
  reload() {
    return this.fetch();
  }

  /**
   * 跳至指定頁碼
   * @param {number} page
   */
  setPage(page) {
    this.#page = page;
    this.#mode === 'client' ? this.#renderPage() : this.fetch();
  }

  // ── 回應處理 ─────────────────────────────────────────

  async #handleResponse(response) {
    this.#loading.hide();

    const result = response?.results ?? response?.result ?? response;
    const list   = result?.list ?? [];
    const meta   = result?.meta ?? null;

    await this.emit('afterFetch', result);

    if (this.#mode === 'client') {
      this.#allData      = list;
      this.#filteredData = [...list];
      this.#renderPage();
    } else {
      this.#render(list);
      if (meta && this.#paginationEl) this.#renderPagination(meta);
    }

    await this.emit('done', result);
  }

  // ── 渲染 ─────────────────────────────────────────────

  #render(list) {
    if (!this.#body) return;
    this.#body.innerHTML = '';

    if (list.length === 0) {
      if (this.#emptyEl) this.#emptyEl.style.display = '';
      return;
    }

    if (this.#emptyEl) this.#emptyEl.style.display = 'none';

    list.forEach((data, index) => {
      const el = this.#renderRow(data, index);
      if (el) this.#body.appendChild(el);
    });
  }

  #renderRow(data, index) {
    if (!this.#template) return null;

    const html = this.#template.innerHTML.replace(
      /\$\{(\w+)\}/g,
      (_, key) => data[key] ?? '',
    );

    const wrap = document.createElement('template');
    wrap.innerHTML = html;
    const el = wrap.content.firstElementChild;

    this.emit('render', el, data, index);
    return el;
  }

  // ── Client-side 處理 ─────────────────────────────────

  #renderPage() {
    let data = [...this.#filteredData];

    // 排序
    if (this.#sort) {
      data.sort((a, b) => {
        const cmp = String(a[this.#sort] ?? '').localeCompare(
          String(b[this.#sort] ?? ''),
          undefined,
          { numeric: true },
        );
        return this.#order === 'asc' ? cmp : -cmp;
      });
    }

    // 分頁
    const totalResults = data.length;
    const totalPages   = Math.ceil(totalResults / this.#limit) || 1;
    const start        = (this.#page - 1) * this.#limit;

    this.#render(data.slice(start, start + this.#limit));

    if (this.#paginationEl) {
      this.#renderPagination({
        page:    this.#page,
        total:   totalPages,
        results: totalResults,
        limit:   this.#limit,
      });
    }
  }

  // ── 分頁 UI ──────────────────────────────────────────

  #renderPagination(meta) {
    if (!this.#paginationEl) return;

    const { page, total } = meta;
    let html = '';

    if (page > 1)     html += `<a data-page="${page - 1}">&laquo;</a> `;

    for (let i = 1; i <= total; i++) {
      html += i === page
        ? `<span data-page-active>${i}</span> `
        : `<a data-page="${i}">${i}</a> `;
    }

    if (page < total) html += `<a data-page="${page + 1}">&raquo;</a>`;

    this.#paginationEl.innerHTML = html;
    this.#paginationEl.querySelectorAll('[data-page]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.setPage(parseInt(el.dataset.page));
      });
    });
  }

  // ── 參數組建 ─────────────────────────────────────────

  #buildParams(extra = {}) {
    const p = {};
    p[this.#params.page]  = this.#page;
    p[this.#params.limit] = this.#limit;
    if (this.#sort)   p[this.#params.sort]   = this.#sort;
    if (this.#sort)   p[this.#params.order]  = this.#order;
    if (this.#search) p[this.#params.search] = this.#search;
    return { ...p, ...extra };
  }

  // ── 事件綁定 ─────────────────────────────────────────

  #bindSort() {
    this.#container.querySelectorAll('[data-sort]').forEach((th) => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (this.#sort === col) {
          this.#order = this.#order === 'asc' ? 'desc' : 'asc';
        } else {
          this.#sort  = col;
          this.#order = 'asc';
        }

        // 更新 UI 標記
        this.#container.querySelectorAll('[data-sort]').forEach((el) => {
          el.dataset.sortOrder = el.dataset.sort === this.#sort ? this.#order : '';
        });

        this.#page = 1;
        this.#mode === 'client' ? this.#renderPage() : this.fetch();
      });
    });
  }

  #bindSearch() {
    if (!this.#searchEl) return;
    let timer = null;
    this.#searchEl.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.#search = this.#searchEl.value.trim();
        this.#page   = 1;

        if (this.#mode === 'client') {
          const q = this.#search.toLowerCase();
          this.#filteredData = q
            ? this.#allData.filter((row) =>
                Object.values(row).some((v) => String(v).toLowerCase().includes(q)),
              )
            : [...this.#allData];
          this.#renderPage();
        } else {
          this.fetch();
        }
      }, 300);
    });
  }

  #bindPerPage() {
    if (!this.#perPageEl) return;
    this.#perPageEl.addEventListener('change', () => {
      this.#limit = parseInt(this.#perPageEl.value);
      this.#page  = 1;
      this.#mode === 'client' ? this.#renderPage() : this.fetch();
    });
  }
}
