/* globals Promise */

/**
 * Returns the sum of a and b
 *
 * @param {number} a
 * @param {number} b
 * @returns {Promise<number>} Promise object represents the sum of a and b
 */
export function sumAsync2 (a, b) {
  return new Promise(function (resolve) {
    resolve(a + b);
  });
}
