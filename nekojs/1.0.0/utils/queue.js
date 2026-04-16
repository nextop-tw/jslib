/**
 * Queue
 * 依序執行一組 function，支援同步與 async
 * - return false 或 reject → 中止並 reject
 * - 收集每個 function 的回傳值
 *
 * @example
 * const q = new Queue()
 * q.append(() => validate())
 * q.append(() => fetch('/api/save'))
 * q.run().then((results) => { ... }).catch((e) => { ... })
 */
export default class Queue {
  #tasks = [];

  /**
   * 加入一個任務
   * @param {Function} fn
   * @returns {this}
   */
  append(fn) {
    this.#tasks.push(fn);
    return this;
  }

  /**
   * 依序執行所有任務
   * @returns {Promise<any[]>}
   */
  run() {
    const tasks = [...this.#tasks];
    const results = [];

    const next = async (index) => {
      if (index >= tasks.length) return results;

      const fn = tasks[index];
      const result = typeof fn === 'function' ? await fn() : fn;

      if (result === false) throw new Error('Queue cancelled');

      results.push(result);
      return next(index + 1);
    };

    return next(0);
  }

  /**
   * 清空所有任務
   * @returns {this}
   */
  clear() {
    this.#tasks = [];
    return this;
  }
}
