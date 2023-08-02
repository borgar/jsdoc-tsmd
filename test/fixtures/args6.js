/**
 * Returns the sum of all numbers passed to the function.
 * @param {...number[]} nums - A sequence of positive or negative numbers.
 */
export function sum1 (...nums) {
  let i = 0;
  let t = 0;
  for (; i < nums.length; i++) {
    t += nums[i];
  }
  return t;
}
