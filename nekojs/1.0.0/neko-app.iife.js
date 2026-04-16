/**
 * NekoJS IIFE Entry
 * 給普通 <script> 使用，自動掛 window.neko
 *
 * @example
 * <script src="${NEKO_CDN}/neko-app.min.js"></script>
 */

import './neko-app.js';
import neko from './neko.js';
window.neko = neko;
