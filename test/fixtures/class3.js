/**
 * This class describes a tester.
 */
export class Tester {
  /**
   * The XXX of Tester
   * @static
   * @type {number}
   * @param {number} [arg=1] Some number
   * @return {number} A multiplier of the number
   */
  static xxx (arg = 1) {
    return 123 * arg;
  }

  /**
   * Constructs a new instance.
   *
   * @param {string} name The name
   */
  constructor (name) {
    this._name = name;
  }

  /**
   * Gets the name.
   *
   * @return {string} The name.
   */
  getName () {
    return this._name;
  }

  /**
   * The name of the instance
   *
   * @type {string}
   */
  get name () {
    return this._name;
  }

  set name (n) {
    this._name = n;
  }
}
