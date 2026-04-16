/**
 * NekoJS Vue 3 Plugin
 *
 * 主要用法請使用 <neko-vue3 data-import="..."> Custom Element，
 * 它會自動提供響應式狀態（loading / success / fail / message / data）。
 *
 * @example
 * <neko-vue3 data-import="components/form.js">
 *   <form action="/api/save" data-ajax="1">
 *     <button :disabled="loading">{{ loading ? '送出中...' : '送出' }}</button>
 *     <p v-if="success">送出成功！</p>
 *     <p v-if="fail">{{ message }}</p>
 *   </form>
 * </neko-vue3>
 */
