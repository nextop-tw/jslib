/**
 * Browser
 * 瀏覽器 / 裝置偵測工具
 *
 * @example
 * import browser from './utils/browser.js'
 *
 * browser.isMobile    // true / false
 * browser.isIOS       // true / false
 * browser.isAndroid   // true / false
 * browser.isTouch     // true / false（支援觸控）
 * browser.device      // 'mobile' | 'tablet' | 'desktop'
 * browser.name        // 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'
 * browser.userAgent   // navigator.userAgent
 */

const ua  = navigator.userAgent;
const ual = ua.toLowerCase();

// ── 裝置類型 ─────────────────────────────────────────

const isIOS     = /iphone|ipad|ipod/i.test(ua);
const isAndroid = /android/i.test(ua);
const isIPad    = /ipad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isIPhone  = /iphone/i.test(ua);
const isMobile  = isIPhone || isAndroid && !/tablet|ipad/i.test(ua);
const isTablet  = isIPad   || isAndroid && /tablet/i.test(ua);
const isTouch   = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

// ── 瀏覽器名稱 ────────────────────────────────────────

function detectName() {
  if (/edg\//i.test(ua))               return 'edge';
  if (/opr\//i.test(ua))               return 'opera';
  if (/chrome\//i.test(ua))            return 'chrome';
  if (/firefox\//i.test(ua))           return 'firefox';
  if (/version\/.*safari/i.test(ua))   return 'safari';
  return 'unknown';
}

const name = detectName();

// ── 匯出 ─────────────────────────────────────────────

export default {
  userAgent: ua,
  isMobile,
  isTablet,
  isIOS,
  isAndroid,
  isIPad,
  isIPhone,
  isTouch,
  device,
  name,
};
