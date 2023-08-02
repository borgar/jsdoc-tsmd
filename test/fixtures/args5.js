/**
 * Returns the sum of all numbers passed to the function.
 * @param {...number[]} nums - A sequence of positive or negative numbers.
 */
export function sum0 () {
  let i = 0;
  let t = 0;
  for (; i < arguments.length; i++) {
    // eslint-disable-next-line prefer-rest-params
    t += arguments[i];
  }
  return t;
}
