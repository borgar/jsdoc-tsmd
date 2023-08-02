/**
 * Types used to identify operations.
 *
 * @readonly
 * @constant {Object<string>} operationTypes
 * @property {string} UNARY - A unary operation (`a%`)
 * @property {string} BINARY - A binary operation (`a+b`)
 * @property {string} TERNARY - A ternary operation (`a?b:c`)
 */
export const operationTypes = Object.freeze({
  UNARY: 'unary',
  BINARY: 'binary',
  TERNARY: 'ternary'
});
