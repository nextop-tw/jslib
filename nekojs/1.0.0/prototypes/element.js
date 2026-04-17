/**
 * Element prototype 擴充
 *
 * @example
 * import './src/prototypes/element.js'
 *
 * // 用物件填入表單欄位
 * document.querySelector('#my-form').fill({ name: 'John', age: 30 })
 *
 * // 元素內欄位轉成 FormData
 * const fd = document.querySelector('#my-form').toFormData()
 *
 * // 元素內欄位轉成物件
 * const obj = document.querySelector('#my-form').toObject()
 */

// ── fill / populate ──────────────────────────────────────

function applyFill(container, source, attr = '[name]') {
  if (!source) return;

  // FormData 轉 object
  let data = source;
  if (source instanceof FormData) {
    data = {};
    source.forEach((value, key) => {
      if (data[key] === undefined) {
        data[key] = value;
      } else if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    });
  }

  const attrSelector = attr.startsWith('[') ? attr : `[${attr}]`;
  const attrName = attrSelector.replace(/^\[|\]$/g, '');

  // 依 name 分組
  const groups = {};
  container.querySelectorAll(attrSelector).forEach((el) => {
    const key = el.getAttribute(attrName);
    if (!key) return;
    if (!groups[key]) groups[key] = [];
    groups[key].push(el);
  });

  for (const key of Object.keys(groups)) {
    if (data[key] === undefined) continue;
    const elements = groups[key];
    const value = data[key];

    elements.forEach((el, index) => {
      if (el instanceof HTMLInputElement) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          const values = Array.isArray(value) ? value.map(String) : [String(value)];
          el.checked = values.includes(el.value);
        } else {
          el.value = Array.isArray(value) ? (value[index] ?? '') : value;
        }
      } else if (el instanceof HTMLTextAreaElement) {
        el.value = Array.isArray(value) ? value.join('\n') : value;
      } else if (el instanceof HTMLSelectElement) {
        if (el.multiple && Array.isArray(value)) {
          Array.from(el.options).forEach((opt) => {
            opt.selected = value.includes(opt.value);
          });
        } else {
          el.value = value;
        }
      } else {
        el.innerHTML = Array.isArray(value) ? value.join('\n') : value;
      }
    });
  }
}

Element.prototype.fill = function (source, attr = '[name]') {
  applyFill(this, source, attr);
  return this;
};

// ── toFormData ───────────────────────────────────────────

Element.prototype.toFormData = function (attr = '[name]') {
  const attrSelector = attr.startsWith('[') ? attr : `[${attr}]`;
  const attrName = attrSelector.replace(/^\[|\]$/g, '');

  const form = document.createElement('form');

  this.querySelectorAll(attrSelector).forEach((input) => {
    if (input.disabled || input.classList.contains('disabled')) return;

    const name = input.getAttribute(attrName);
    if (!name) return;

    let clone;
    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) {
      clone = input.cloneNode(true);
    } else {
      clone = document.createElement('input');
      clone.value = input.innerHTML;
    }
    clone.name = name;
    form.appendChild(clone);
  });

  const fd = new FormData(form);
  form.remove();
  return fd;
};

// ── toObject ─────────────────────────────────────────────

Element.prototype.toObject = function (attr = '[name]') {
  return this.toFormData(attr).toObject();
};
