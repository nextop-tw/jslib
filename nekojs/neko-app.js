/**
 * NekoJS App Entry
 * 一次引入所有 prototypes、custom elements，並暴露 neko 到 window
 *
 * @example
 * <script type="module" src="${NEKO_CDN}/neko-app.js"></script>
 */

// Prototypes
import './prototypes/string.js';
import './prototypes/array.js';
import './prototypes/number.js';
import './prototypes/element.js';
import './prototypes/formdata.js';

// Custom Elements
import './elements/neko.js';
import './elements/neko-vue3.js';

