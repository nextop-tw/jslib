/**
 * Dialog
 * 統一對話框介面，預設使用 SweetAlert2
 * 可透過 setAdapter() 抽換底層套件
 *
 * @example
 * import dialog from './components/dialog.js'
 *
 * dialog.success('儲存成功')
 * dialog.confirm('確定刪除？').then((ok) => { ... })
 * dialog.toast.success('已更新')
 */

import loader from '../core/loader.js';

const SWAL_URL  = 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert2/11.23.0/sweetalert2.all.min.js';
const IZITOAST_JS  = 'https://cdnjs.cloudflare.com/ajax/libs/izitoast/1.4.0/js/iziToast.min.js';
const IZITOAST_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/izitoast/1.4.0/css/iziToast.min.css';

// 各方法的預設 SweetAlert2 options
const PRESETS = {
  alert:   {},
  success: { icon: 'success' },
  error:   { icon: 'error' },
  warning: { icon: 'warning' },
  info:    { icon: 'info' },
  confirm: { icon: 'warning', showCancelButton: true },
};

/**
 * 組合 SweetAlert2 options
 * @param {string} type
 * @param {string|object} text
 */
function buildOptions(type, text) {
  const base = { ...PRESETS[type] };
  if (typeof text === 'object' && text !== null) return { ...base, ...text };
  return { ...base, title: '提示', text };
}

// 預設 SweetAlert2 adapter
const swalAdapter = {
  _Swal: null,

  async load() {
    if (!this._Swal) {
      await loader.loadScript(SWAL_URL);
      this._Swal = window.Swal;
    }
    return this._Swal;
  },

  async show(options) {
    const Swal = await this.load();
    return Swal.fire(options);
  },

  async confirm(options) {
    const Swal = await this.load();
    const result = await Swal.fire(options);
    return result.isConfirmed;
  },

};

// iziToast adapter（toast / notify 專用）
const iziAdapter = {
  _loaded: false,

  async load() {
    if (!this._loaded) {
      await Promise.all([
        loader.loadScript(IZITOAST_JS),
        loader.loadCSS(IZITOAST_CSS),
      ]);
      this._loaded = true;
    }
  },

  async toast({ title, icon = 'success', target, position = 'topRight', timeout = 2000, ...rest } = {}) {
    await this.load();
    const method = ['success', 'error', 'info', 'warning'].includes(icon) ? icon : 'show';
    window.iziToast[method]({
      title,
      position,
      timeout,
      ...(target ? { target, targetFirst: false } : {}),
      ...rest,
    });
  },
};

// 目前使用的 adapter
let _adapter = swalAdapter;

const dialog = {
  /**
   * 抽換底層 adapter
   * adapter 需實作 show / confirm / toast 方法
   * @param {object} adapter
   * @returns {this}
   */
  setAdapter(adapter) {
    _adapter = adapter;
    return this;
  },

  /** 一般提示 */
  alert(text) {
    return _adapter.show(buildOptions('alert', text));
  },

  /** 成功提示 */
  success(text) {
    return _adapter.show(buildOptions('success', text));
  },

  /** 錯誤提示 */
  error(text) {
    return _adapter.show(buildOptions('error', text));
  },

  /** 警告提示 */
  warning(text) {
    return _adapter.show(buildOptions('warning', text));
  },

  /** 資訊提示 */
  info(text) {
    return _adapter.show(buildOptions('info', text));
  },

  /**
   * 確認對話框
   * @returns {Promise<boolean>}
   */
  confirm(text) {
    return _adapter.confirm(buildOptions('confirm', text));
  },
};

/**
 * Toast / Notify 通知（兩者為 alias，完全相同）
 * @example
 * dialog.toast('已更新')
 * dialog.toast.success('成功')
 * dialog.notify('已更新')
 * dialog.notify.error('失敗')
 */
dialog.toast = function (text, options = {}) {
  return iziAdapter.toast({ icon: 'success', title: text, ...options });
};

['success', 'error', 'info'].forEach((type) => {
  dialog.toast[type] = (text, options = {}) =>
    dialog.toast(text, { icon: type, ...options });
});

// notify 為 toast 的 alias
dialog.notify = dialog.toast;

export default dialog;
