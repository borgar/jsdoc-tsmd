/**
 * @param name
 * @param {string} [title=Mr]
 * @param {string} [somebody] A suffix.
 * @param {*} [meta] Attached as .meta on the return.
 */
export function concat (name, title, suffix, meta) {
  const r = [ name, title, suffix ];
  r.meta = meta;
  return r;
}
