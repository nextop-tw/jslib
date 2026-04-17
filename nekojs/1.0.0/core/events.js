/**
 * EventsMixin
 * 提供事件系統給任何 class 使用
 * 用法：class Foo extends EventsMixin(Base) { ... }
 *      或 class Foo extends EventsMixin() { ... }
 */
const EventsMixin = (Base = class {}) =>
  class extends Base {
    // key: event, val: { fired: boolean, args: any[], handlers: [{handler, once}] }
    #events = new Map();

    #getRecord(event) {
      if (!this.#events.has(event)) {
        this.#events.set(event, { fired: false, args: [], handlers: [] });
      }
      return this.#events.get(event);
    }

    /**
     * 註冊事件
     * 若事件已觸發過，立即以上次的 args 呼叫 handler
     * @param {string} event
     * @param {Function} handler
     * @returns {this}
     */
    on(event, handler) {
      if (typeof handler !== 'function') return this;
      const rec = this.#getRecord(event);
      rec.handlers.push({ handler, once: false });
      if (rec.fired) {
        Promise.resolve().then(() => handler(...rec.args));
      }
      return this;
    }

    /**
     * 註冊一次性事件，觸發後自動移除
     * 若事件已觸發過，立即以上次的 args 呼叫一次，不加入 handlers
     * @param {string} event
     * @param {Function} handler
     * @returns {this}
     */
    once(event, handler) {
      if (typeof handler !== 'function') return this;
      const rec = this.#getRecord(event);
      if (rec.fired) {
        Promise.resolve().then(() => handler(...rec.args));
        return this;
      }
      rec.handlers.push({ handler, once: true });
      return this;
    }

    /**
     * 移除事件
     * 不傳 handler 則移除該事件所有監聽器
     * @param {string} event
     * @param {Function} [handler]
     * @returns {this}
     */
    off(event, handler) {
      if (!this.#events.has(event)) return this;
      if (!handler) {
        this.#events.delete(event);
        return this;
      }
      const rec = this.#events.get(event);
      rec.handlers = rec.handlers.filter((l) => l.handler !== handler);
      return this;
    }

    /**
     * 依序觸發事件，支援 async handler
     * 記錄 fired 狀態，讓晚訂閱的 handler 也能收到
     *
     * - handler return false → 停止，resolve false
     * - handler return true / 無回傳 / 其他值 → 繼續，resolve true
     * - handler throw / reject → reject，.catch() 接住
     *
     * @param {string} event
     * @param {...any} args
     * @returns {Promise<boolean>}
     */
    async emit(event, ...args) {
      const rec = this.#getRecord(event);
      rec.fired = true;
      rec.args = args;

      const handlers = [...rec.handlers];
      for (const { handler, once } of handlers) {
        if (once) this.off(event, handler);
        const result = await handler(...args);
        if (result === false) return false;
      }
      return true;
    }

    /**
     * 等待事件觸發一次，回傳 Promise
     * 若事件已觸發，立即 resolve
     * @param {string} event
     * @returns {Promise<any>}
     *
     * @example
     * await neko.waitFor('ready')
     */
    waitFor(event) {
      return new Promise((resolve) => {
        this.once(event, (...args) => resolve(args.length <= 1 ? args[0] : args));
      });
    }

    /**
     * 移除某事件的所有監聽器（保留 fired 狀態）
     * @param {string} event
     * @returns {this}
     */
    offAll(event) {
      this.#events.delete(event);
      return this;
    }

    /**
     * 是否有監聽某事件
     * @param {string} event
     * @returns {boolean}
     */
    has(event) {
      return this.#events.has(event);
    }
  };

export default EventsMixin;
