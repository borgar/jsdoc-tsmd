/* globals delayedOperation */

/**
 * Returns the sum of a and b
 *
 * @param {number} a
 * @param {number} b
 * @returns {Promise<number>} Promise object represents the sum of a and b
 */
export async function sumAsync3 (a, b) {
  return await delayedOperation(a) + b;
}
