/**
 * <neko-vue3> Custom Element
 * 動態載入指定模組，並以 Vue 3 掛載，提供響應式狀態給 template 使用
 *
 * 自動提供的響應式變數：
 * - loading  {boolean} — AJAX 送出中
 * - success  {boolean} — 送出成功
 * - fail     {boolean} — 送出失敗
 * - message  {string}  — 失敗訊息
 * - data     {object}  — 回應資料
 *
 * @example
 * <neko-vue3 data-import="form.js">
 *   <form action="/api/save" data-ajax="1">
 *     <input name="title" required />
 *     <button :disabled="loading">
 *       {{ loading ? '送出中...' : '送出' }}
 *     </button>
 *     <p v-if="fail" style="color:red">{{ message }}</p>
 *     <p v-if="success" style="color:green">送出成功！</p>
 *   </form>
 * </neko-vue3>
 */

import loader from '../core/loader.js';

const VUE_URL = 'https://unpkg.com/vue@3/dist/vue.global.js';

customElements.define('neko-vue3', class extends HTMLElement {
  async connectedCallback() {
    const src = this.dataset.import;
    if (!src) return;

    // 同時載入 Vue 與指定模組
    const [, mod] = await Promise.all([
      loader.loadScript(VUE_URL),
      loader.loadModule(src),
    ]);

    const Cls = mod?.default ?? mod;

    if (typeof Cls !== 'function') {
      console.warn(`[neko-vue3] ${src} 匯出的不是 class 或 function`);
      return;
    }

    const { createApp, ref, onMounted } = window.Vue;

    // 保存原始 HTML 作為 template，再清空讓 Vue 接管
    const template = this.innerHTML;
    this.innerHTML = '';

    const el = this;

    const app = createApp({
      template,
      setup() {
        const loading = ref(false);
        const success = ref(false);
        const fail    = ref(false);
        const message = ref('');
        const data    = ref(null);

        onMounted(() => {
          const instance = new Cls(el);
          el._instance = instance;

          instance.on('submit', () => {
            loading.value = true;
            success.value = false;
            fail.value    = false;
            message.value = '';
          });

          instance.on('done', () => {
            loading.value = false;
          });

          instance.on('success', (res) => {
            success.value = true;
            data.value    = res ?? null;
          });

          instance.on('fail', (res) => {
            fail.value    = true;
            message.value = res?.message || '發生錯誤';
          });
        });

        return { loading, success, fail, message, data };
      },
    });

    this._app = app;
    app.mount(this);
  }

  disconnectedCallback() {
    this._app?.unmount();
    this._app     = null;
    this._instance = null;
  }
});
