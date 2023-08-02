/**
 * Types of nodes.
 *
 * @constant
 * @readonly
 * @name nodeTypes
 * @type {Object<string, number>}
 */
export const nodeTypes = Object.freeze({
  /**
   * An element node
   * @name nodeTypes~ELEMENT_NODE
   * @type {number}
   */
  ELEMENT_NODE: 1,
  /**
   * A text node
   * @name nodeTypes~TEXT_NODE
   * @type {number}
   */
  TEXT_NODE: 3,
  /**
   * A comment node
   * @name nodeTypes~COMMENT_NODE
   * @type {number}
   */
  COMMENT_NODE: 8
});
