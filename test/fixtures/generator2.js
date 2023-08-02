/**
 * Generates an infinite stream of numbers
 *
 * @param {number=} start The number to begin the count on.
 * @yields {number}
 */
export function* infinite (start = 0) {
  let index = start;

  while (true) {
    yield index++;
  }
}
