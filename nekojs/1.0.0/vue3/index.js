import { ref, onMounted, inject } from 'vue';
import neko from '../neko.js';

const NEKO_KEY = Symbol('neko');

/**
 * Vue 3 Plugin
 *
 * @example
 * import NekoPlugin from './vue3/index.js'
 * app.use(NekoPlugin)
 */
export default {
  install(app) {
    app.provide(NEKO_KEY, neko);
    app.config.globalProperties.$neko = neko;
  },
};

/**
 * 取得 neko 單例（Composition API）
 * @returns {import('../neko.js').default}
 *
 * @example
 * const neko = useNeko()
 * neko.use('utils/ajax.js').then(...)
 */
export function useNeko() {
  return inject(NEKO_KEY, neko);
}

/**
 * 取得模組實例的響應式狀態，等同於 <neko-vue3> 的 setup 邏輯
 *
 * @param {() => object} factory  在 onMounted 執行的工廠函式，回傳元件實例
 * @returns {{ loading, success, fail, message, data, instance }}
 *
 * @example
 * const formEl = ref(null)
 * const { loading, success, fail, message } = useNekoState(
 *   () => new Form(formEl.value)
 * )
 */
export function useNekoState(factory) {
  const loading  = ref(false);
  const success  = ref(false);
  const fail     = ref(false);
  const message  = ref('');
  const data     = ref(null);
  const instance = ref(null);

  onMounted(() => {
    const inst = typeof factory === 'function' ? factory() : factory;
    if (!inst) return;
    instance.value = inst;

    inst.on('submit', () => {
      loading.value = true;
      success.value = false;
      fail.value    = false;
      message.value = '';
    });

    inst.on('done', () => {
      loading.value = false;
    });

    inst.on('success', (res) => {
      success.value = true;
      data.value    = res ?? null;
    });

    inst.on('fail', (res) => {
      fail.value    = true;
      message.value = res?.message || '發生錯誤';
    });
  });

  return { loading, success, fail, message, data, instance };
}
