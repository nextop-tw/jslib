/**
 * Loader
 * 動態載入資源，支援：
 * - ES Module (.js，使用 import())
 * - 一般 JS (.js，使用 <script> tag，透過 options.type = 'classic' 指定)
 * - CSS (.css，使用 <link> tag)
 *
 * 自動依副檔名判斷載入方式
 */

const loaded = new Map(); // 快取已載入的資源

/**
 * 判斷副檔名
 * @param {string} url
 * @returns {'module'|'classic'|'css'|'unknown'}
 */
function detectType(url) {
  const clean = url.split('?')[0].split('#')[0];
  if (clean.endsWith('.css')) return 'css';
  if (clean.endsWith('.js') || clean.endsWith('.mjs')) return 'module';
  return 'unknown';
}

/**
 * 載入 CSS
 * @param {string} url
 * @returns {Promise<void>}
 */
function loadCSS(url) {
  return new Promise((resolve, reject) => {
    if (loaded.has(url)) return resolve();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => {
      loaded.set(url, true);
      resolve();
    };
    link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
    document.head.appendChild(link);
  });
}

/**
 * 載入 ES Module
 * @param {string} url
 * @returns {Promise<any>}
 */
function loadModule(url) {
  if (loaded.has(url)) return Promise.resolve(loaded.get(url));

  return import(/* @vite-ignore */ url).then((mod) => {
    loaded.set(url, mod);
    return mod;
  });
}

/**
 * 載入一般 JS（classic script tag）
 * @param {string} url
 * @returns {Promise<void>}
 */
function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (loaded.has(url)) return resolve();

    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      loaded.set(url, true);
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

/**
 * 載入單一資源
 * @param {string} url
 * @param {{ type?: 'module'|'classic'|'css' }} [options]
 * @returns {Promise<any>}
 */
function loadOne(url, options = {}) {
  const type = options.type ?? detectType(url);

  switch (type) {
    case 'css':     return loadCSS(url);
    case 'classic': return loadScript(url);
    case 'module':
    default:        return loadModule(url);
  }
}

/**
 * 載入一或多個資源
 * @param {string|string[]} urls
 * @param {{ type?: 'module'|'classic'|'css' }} [options]
 * @returns {Promise<any|any[]>}
 */
function load(urls, options = {}) {
  if (Array.isArray(urls)) {
    return Promise.all(urls.map((url) => loadOne(url, options)));
  }
  return loadOne(urls, options);
}

export default { load, loadOne, loadCSS, loadModule, loadScript };
