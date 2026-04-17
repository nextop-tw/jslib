/**
 * Array prototype 擴充
 *
 * @example
 * import './src/prototypes/array.js'
 *
 * [1, 2, 3, 4, 5].shuffle()  // [3, 1, 5, 2, 4]（隨機）
 */

/**
 * 隨機排列陣列，回傳新陣列，不修改原陣列（Fisher-Yates 演算法）
 * @returns {Array}
 */
Array.prototype.shuffle = function () {
  const arr = [...this];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
