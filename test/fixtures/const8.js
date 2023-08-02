/**
 * Types of nodes.
 *
 * @constant
 * @readonly
 * @name nodeTypes
 * @type {Object<string, number>}
 * @property {number} ELEMENT_NODE An element node
 * @property {number} TEXT_NODE A text node
 * @property {number} COMMENT_NODE A comment node
 */
export const nodeTypes = Object.freeze({
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8
});
