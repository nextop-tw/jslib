/**
 * Number prototype 擴充
 *
 * @example
 * import './src/prototypes/number.js'
 *
 * (5).between(1, 10)        // true
 * (5).between(1, 10, false) // true（不含邊界）
 * (1).between(1, 10, false) // false（不含邊界）
 */

/**
 * 判斷數字是否在範圍內
 * @param {number} min
 * @param {number} max
 * @param {boolean} [inclusive=true] 是否包含邊界值
 * @returns {boolean}
 */
Number.prototype.between = function (min, max, inclusive = true) {
  return inclusive
    ? this >= min && this <= max
    : this > min && this < max;
};
