/**
 * Toggle
 * 開關元件，支援 AJAX 狀態回寫、adapter 抽換（Bootstrap / Switchery）
 *
 * 事件流程：
 * 使用者切換 → change(checked, payload) → 可修改 payload.data 或 return false 取消
 * → data-action 存在時送出 AJAX
 *
 * @example
 * import Toggle from './components/toggle.js'
 *
 * const toggle = new Toggle('#my-toggle')
 * toggle.on('change', (checked, payload) => {
 *   payload.data.extra = 'value'  // 追加欄位
 *   // return false               // 取消這次切換
 * })
 *
 * // HTML：Bootstrap（預設）
 * <input type="checkbox" id="my-toggle"
 *        data-action="/api/toggle"
 *        data-id="123" />
 *
 * // HTML：Switchery
 * <input type="checkbox" id="my-toggle"
 *        data-adapter="switchery"
 *        data-action="/api/toggle"
 *        data-id="123" />
 *
 * // 取得實例
 * const instance = document.querySelector('#my-toggle')._instance
 */

import EventsMixin from '../core/events.js';
import ajax from '../utils/ajax.js';
import loader from '../core/loader.js';

const SWITCHERY_JS  = 'https://cdnjs.cloudflare.com/ajax/libs/switchery/0.8.2/switchery.min.js';
const SWITCHERY_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/switchery/0.8.2/switchery.min.css';

// ── Adapters ──────────────────────────────────────────────────────────────────

/**
 * Bootstrap 5 form-switch adapter（不需載入額外套件）
 */
const bootstrapAdapter = {
    init(el, options = {}) {
        if (el.tagName !== 'INPUT' || el.type !== 'checkbox') {
            console.warn('[Toggle] bootstrapAdapter 需要 <input type="checkbox"> 元素');
            return null;
        }

        if (!el.closest('.form-check')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-check form-switch';
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);
        }

        el.classList.add('form-check-input');

        return {
            getValue: ()         => el.checked,
            setValue: (bool)     => { el.checked = bool; },
            onBeforeChange: (cb) => { el.addEventListener('change', () => cb(el.checked)); },
            revert: (bool)       => { el.checked = bool; },
            destroy: ()          => {},
        };
    },
};

/**
 * Switchery adapter（自動從 CDN 載入）
 */
const switcheryAdapter = {
    _loaded: false,

    async load() {
        if (!this._loaded) {
            await Promise.all([
                loader.loadScript(SWITCHERY_JS),
                loader.loadCSS(SWITCHERY_CSS),
            ]);
            this._loaded = true;
        }
    },

    async init(el, options = {}) {
        await this.load();

        const instance = new window.Switchery(el, {
            color          : options.color           || '#64bd63',
            secondaryColor : options.secondaryColor  || '#dfdfdf',
            jackColor      : options.jackColor       || '#fff',
            className      : options.className       || 'switchery',
            disabled       : options.disabled        || false,
            disabledOpacity: options.disabledOpacity || 0.5,
            speed          : options.speed           || '0.1s',
            size           : options.size            || 'default',
        });

        return {
            getValue: ()         => el.checked,
            setValue: (bool)     => {
                if (el.checked !== bool) {
                    instance.setPosition();
                    el.checked = bool;
                }
            },
            onBeforeChange: (cb) => {
                el.addEventListener('change', () => cb(el.checked));
            },
            revert: (bool) => {
                instance.setPosition();
                el.checked = bool;
            },
            destroy: () => instance.destroy(),
        };
    },
};

// ── Adapters map ──────────────────────────────────────────────────────────────

const ADAPTERS = {
    bootstrap : bootstrapAdapter,
    switchery : switcheryAdapter,
};

// ── Toggle Class ──────────────────────────────────────────────────────────────

export default class Toggle extends EventsMixin() {
    #el      = null;
    #inner   = null;
    #action  = '';
    #id      = null;
    #sending = false;

    /**
     * @param {HTMLElement|string} el  <input type="checkbox">
     * @param {object} options
     * @param {string} [options.adapter]  'bootstrap' | 'switchery'（預設 'bootstrap'）
     */
    constructor(el, options = {}) {
        super();
        this.#el = typeof el === 'string' ? document.querySelector(el) : el;

        this.#action = this.#el.dataset.action || '';
        this.#id     = this.#el.dataset.id     || null;

        // adapter 優先順序：options.adapter > data-adapter > 'bootstrap'
        const adapterKey = options.adapter || this.#el.dataset.adapter || 'bootstrap';
        const adapter    = ADAPTERS[adapterKey] || bootstrapAdapter;

        // 非同步初始化（init 可能回傳 Promise，例如 switchery 需要載入 CDN）
        Promise.resolve(adapter.init(this.#el, options)).then((inner) => {
            this.#inner = inner;
            if (inner) {
                inner.onBeforeChange((checked) => this.#handleChange(checked));
            }
        });

        // 將實例掛載到 DOM 元素
        this.#el._instance = this;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /** 目前的開關狀態 */
    get value() {
        return this.#inner?.getValue() ?? this.#el.checked;
    }

    /** 程式設定開關狀態（不觸發 change 事件） */
    set value(bool) {
        this.#inner?.setValue(bool);
    }

    /** 銷毀元件 */
    destroy() {
        this.#inner?.destroy();
        delete this.#el._instance;
    }

    // ── 切換處理 ──────────────────────────────────────────────────────────────

    async #handleChange(checked) {
        if (this.#sending) return;

        // 建立 mutable payload
        const payload = {
            data: {
                checked,
                ...(this.#id ? { id: this.#id } : {}),
            },
        };

        // 觸發 change 事件，允許修改 payload.data 或 return false 取消
        const ok = await this.emit('change', checked, payload);
        if (ok === false) {
            // 還原 UI 狀態
            this.#inner?.revert(!checked);
            return;
        }

        // 沒有 data-action 就結束
        if (!this.#action) return;

        this.#sending = true;
        try {
            await ajax.post(this.#action, payload.data);
        } catch (err) {
            console.warn('[Toggle] AJAX 失敗，還原狀態', err);
            this.#inner?.revert(!checked);
        } finally {
            this.#sending = false;
        }
    }

    // ── 靜態工廠 ──────────────────────────────────────────────────────────────

    /**
     * 初始化單一元素
     * @param {HTMLElement|string} el
     * @param {object} options
     * @returns {Toggle}
     */
    static init(el, options = {}) {
        const target = typeof el === 'string' ? document.querySelector(el) : el;
        return target._instance ?? new Toggle(target, options);
    }

    /**
     * 初始化符合 selector 的所有元素
     * @param {string|NodeList} selector
     * @param {object} options
     * @param {Function} [onEach]  每個元素初始化後的 callback(instance, el)
     * @returns {Toggle[]}
     */
    static initAll(selector, options = {}, onEach = null) {
        const els = typeof selector === 'string'
            ? document.querySelectorAll(selector)
            : selector;

        return Array.from(els).map((el) => {
            const instance = el._instance ?? new Toggle(el, options);
            if (onEach) onEach(instance, el);
            return instance;
        });
    }
}
