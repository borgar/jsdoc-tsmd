/* global Map */

const ORDER = {
  package: 1,
  class: 3,
  function: 4,
  member: 4,
  constant: 5,
  interface: 6,
  typedef: 7
};

class Node {
  constructor (data) {
    Object.assign(this, data);
    delete this.comment;
    delete this.meta;
    this.space = new Map();
  }

  add (child) {
    if (this.space.has(child.name)) {
      console.log(this.space.get(child.name));
      console.log(child);
      throw new Error(this.name + ' already contains ' + child.name);
    }
    this.space.set(child.name, child);
  }

  detach (name) {
    const item = this.find(name);
    this.space.delete(name);
    return item;
  }

  get isObject () {
    return this.space.size > 0;
  }

  get isCallable () {
    // XXX: in the parser, args should be present here if [''].kind === 'function' exists
    if (this.args || this.returns || this.yields) {
      return true;
    }
    return false;
  }

  find (name) {
    return this.space.get(name);
  }

  values () {
    const values = Array.from(this.space.values());
    // sort values to get a deterministic output
    return values.sort((a, b) => {
      // default exports go to the bottom
      if (a.isDefaultExport !== b.isDefaultExport) {
        return (a.isDefaultExport && !b.isDefaultExport) ? 1 : -1;
      }
      // then by type, alphabetical
      const a_kind = ORDER[a.kind];
      const b_kind = ORDER[b.kind];
      if (a_kind !== b_kind) {
        return a_kind - b_kind;
      }
      // statics sorted last
      if (a.scope !== b.scope) {
        return (a.scope === 'static' && b.scope !== 'static') ? 1 : -1;
      }
      // constructors are pulled up first
      const a_cnstr = a.name === 'constructor' ? 1 : 0;
      const b_cnstr = b.name === 'constructor' ? 1 : 0;
      if (a_cnstr !== b_cnstr) {
        return b_cnstr - a_cnstr;
      }
      // by name, alphabetical
      if (a.name !== b.name) {
        return a.name < b.name ? -1 : 1;
      }
      // 🤷‍♂️
      return NaN;
    });
  }
}

Node.ORDER = ORDER;

exports.Node = Node;
