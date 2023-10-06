const { fixType } = require('./fixType.js');
const { Node } = require('./Node.js');

const ANCHOR = '#'; // §
const RETURN = '⇒'; // →
const ISTYPE = '='; // :

const categories = {
  package: [ 'Package', 'Packages' ],
  constant: [ 'Constant', 'Constants' ],
  class: [ 'Class', 'Classes' ],
  function: [ 'Function', 'Functions' ],
  interface: [ 'Interface', 'Interfaces' ],
  typedef: [ 'Type', 'Types' ]
};

function maybeWrap (thing) {
  if (Array.isArray(thing) && thing.length > 1) {
    return thing.join(' | ');
  }
  return thing;
}

function repValue (v) {
  if (v === undefined) {
    return '';
  }
  // Should maybe transform all '' strings to "" style?
  if (v === "''") {
    v = '""';
  }
  return '`' + v + '`';
}

const re_links = /(?:\[([^\]]+)\])?\{@link(?:code|plain)? ([^} ]+)([^}]+)?\}/g;
function fixLinks (md) {
  return md.replace(re_links, (a, preLabel, href, postLabel) => {
    const hash = /^[a-z][a-z0-9]*$/i.test(href) ? '#' : '';
    return `[${preLabel || postLabel || href}](${hash}${href})`;
  });
}

class FormatterMD {
  constructor (/* opts = {} */) {
    this.output = '';
    this.index = '';
    this.indentWidth = 0;
  }

  /**
   * Emit text to the output
   * @param {string} [line=''] The text to print
   */
  print (line = '') {
    if (line) {
      this.output += line;
      this.linebreak();
    }
  }

  /**
   * Emit a linebreak to the output
   */
  linebreak () {
    if (this.output) {
      if (!/\n\n$/.test(this.output)) {
        this.output += '\n';
      }
    }
  }

  /**
   * Format a signature for an item
   * @param {object} d
   * @param {boolean} [forIndex=false] Use a simplified version for index
   * @return {string}
   */
  formatSignature (d, forIndex = false) {
    const isConstructor = d.name === 'constructor';
    const isClass = d.kind === 'class';

    const args = (d.isCallable || isClass)
      ? this.formatArguments(d.args || [], !forIndex)
      : '';

    // does it warrant a returns?
    let rets = '';
    if (!forIndex) {
      const isTypeDef = d.kind === 'typedef';
      if (!(isConstructor || isClass) && (d.returns || d.yields || d.args)) {
        rets = ` ${RETURN} ${this.formatReturns(d)}`;
      }
      else if (d.kind === 'constant' || isTypeDef) {
        // XXX: maybe use ⇒ for returns, and something else then type? →
        if (d.defaultvalue && !d.isObject) {
          rets = ` ${ISTYPE} ${repValue(d.defaultvalue)}`;
        }
        else {
          // skip redundant object types
          const typeStr = this.formatType(d);
          const isObjectType = /^`(?:Record|Object)(<string,\s*any>)?`$/i.test(typeStr);
          if (!isTypeDef || !isObjectType) {
            rets = ` ${ISTYPE} ${typeStr}`;
          }
        }
      }
    }

    let augments = '';
    if (!forIndex && d.augments?.length) {
      // treated as a type so we don't have to duplicate linkning functionality
      const _super = this.formatType({ type: { names: d.augments } });
      augments = ` extends ${_super}`;
    }

    const prefix = [
      d.scope === 'static' && '`static`',
      d.memberof && '.'
    ].filter(Boolean).join(' ');
    return prefix + d.name + args + augments + rets;
  }

  /**
   * Format an anchor link for headings
   * @param {object} d
   */
  formatAnchor (d) {
    const id = (d.memberof ? d.memberof + '.' : '') + (d.name || '').trim();
    return `<a id="${id}" href="#${id}">${ANCHOR}</a> `;
  }

  /**
   * Format a collection of data objects as a markdown table
   * @param {Array<object>} data
   */
  formatTable (data) {
    // find the columns
    const widths = [];
    const normalize = (text, index) => {
      const r = (text == null)
        ? ''.padEnd(widths[index])
        : String(text)
          .trim()
          .replace(/\n/, ' ')
          .replace(/(`.*?`|\|)/g, a => ((a === '|') ? '\\|' : a));
      return r.padEnd(widths[index]);
    };
    // get used keys in order
    const keyUse = {};
    data.forEach(d => {
      Object.entries(d).forEach(([ k, v ]) => {
        keyUse[k] = (keyUse[k] || 0) + ((v != null && v.length) ? 1 : 0);
      });
    });
    const keys = Object.entries(keyUse).filter(d => d[1]).map(d => d[0]);
    // get column widths
    data.forEach(d => {
      Object
        .entries(d)
        .forEach(([ k, v ]) => {
          const widx = keys.indexOf(k);
          widths[widx] = Math.max(k.length, widths[widx] ?? 0, normalize(v).length);
        });
    });
    // print column headers
    this.print(`| ${keys.map(normalize).join(' | ')} |`);
    // print separators
    this.print(`| ${keys.map((_, i) => '-'.repeat(widths[i])).join(' | ')} |`);
    // print rows
    data.forEach(d => {
      const r = keys.map(k => d[k]).map(normalize);
      this.print(`| ${r.join(' | ')} |`);
    });
  }

  /**
   * Format a list of (static) properties as a table
   * @param {Array<object>} list
   */
  formatPropList (list) {
    const data = [];
    const addArgs = (items, namePrefix = '', optionalParent = false) => {
      items.forEach(d => {
        if (d.kind === 'function' && !d.name) {
          return;
        }
        // XXX: maybe disable optionality when prefix is present?
        const name = (!optionalParent && d.optional) ? `[${d.name}]` : d.name;
        const longname = [ namePrefix, name ].filter(Boolean).join('.');
        let returns;
        let args = '';
        if (d.isCallable) {
          args = this.formatArguments(d.args);
          returns = this.formatReturns(d);
        }
        const type = this.formatType(d.isCallable ? { type: { names: [ 'function' ] } } : d);
        data.push({
          Name: (d.variable ? '...' : '') + longname + args,
          Type: type,
          Returns: returns,
          Default: d.defaultvalue != null ? repValue(d.defaultvalue) : null,
          Description: this.formatDescription(d, false)
        });
        if (d.isObject) {
          const arr = d.isArrayOf ? '[]' : '';
          addArgs(d.values(), longname + arr, optionalParent || d.optional);
        }
      });
    };
    addArgs(list);
    this.formatTable(data);
    this.linebreak();
  }

  /**
   * Format a `@see` tag
   * @param {object} d
   * @returns {string}
   */
  formatSee (d) {
    if (d.see) {
      let see = d.see;
      if (/^[a-z][a-z0-9]*$/i.test(see)) {
        see = `{@link ${see}}`;
      }
      return `**See also:** ${fixLinks(see)}.`;
    }
    return '';
  }

  /**
   * Format a heading block
   * @param {object} d
   * @param {boolean} [level=3]
   */
  formatHeading (text, level = 3) {
    this.print('#'.repeat(level) + ' ' + text);
    this.linebreak();
  }

  /**
   * Format a description block
   * @param {object} d
   */
  formatDescriptionBlock (d) {
    this.print(this.formatDescription(d));
    this.linebreak();
    if (d.see) {
      this.print(this.formatSee(d));
      this.linebreak();
    }
  }

  /**
   * Format an item to be included in the documentation index
   * @param {object} d
   * @return {string}
   */
  formatIndexItem (d) {
    const id = (d.memberof ? d.memberof + '.' : '') + (d.name || '').trim();
    const text = this.formatSignature(d, true);
    const escapedText = text.replace(/([[\]])/g, '\\$1');
    return `- [${escapedText}](#${id})`;
  }

  /**
   * Format a tree of definitons and return the output as markdown text
   * @param {object} node A root (global) node in a definitions tress
   * @returns {string} Markdown formatted documentation
   */
  format (node) {
    this._names = [];
    this.output = '';
    this.index = '';

    // pick up global names for links
    for (const d of node.values()) {
      this._names.push(d.name);
    }
    Object
      .entries(categories)
      .sort((a, b) => Node.ORDER[a[0]] - Node.ORDER[b[0]])
      .forEach(([ cat, titles ]) => {
        const items = node.values().filter(d => d.kind === cat && !d.ignore);
        if (!items.length) {
          return;
        }
        // category heading
        const title = titles[items.length === 1 ? 0 : 1];
        this.index += '**' + title + '**\n\n';
        this.formatHeading(title, 2);
        // items
        for (const d of items) {
          this.index += this.formatIndexItem(d) + '\n';

          if (d.kind === 'typedef') {
            this.formatTypedef(d);
          }
          else if (d.kind === 'function') {
            this.formatFunction(d);
          }
          else if (d.kind === 'constant') {
            this.formatConstant(d);
          }
          else if (d.kind === 'class') {
            this.formatClass(d);
          }
          else {
            throw new Error('unknown type: ' + d);
          }
          this.print('---');
          this.linebreak();
        }
        this.index += '\n';
      });

    this.output = this.index + this.output;
    return this.output;
  }

  /**
   * Format a constant definition
   * @param {object} d
   */
  formatConstant (d) {
    this.formatHeading(this.formatAnchor(d) + this.formatSignature(d), 3);
    this.formatDescriptionBlock(d);
    // if (d.isDefaultExport) {
    //   this.print(`declare const _default: ${this.formatType(d)};`);
    //   this.print(`export default _default;`);
    // }
    // else {
    //   this.print(`${this.declare(d)}const ${d.name}: ${this.formatType(d)};`);
    // }
    if (d.isObject) {
      // print a props table
      this.print('##### Properties');
      this.linebreak();
      this.formatPropList(d.values());
    }
  }

  /**
   * Format an object member
   * @param {object} d
   */
  formatMember (d) {
    this.formatHeading(this.formatAnchor(d) + this.formatSignature(d), 4);
    this.formatDescriptionBlock(d);
    if (d.args?.length) {
      this.formatHeading('Parameters', 5);
      this.formatPropList(d.args);
    }
    if (d.returns || d.yields) {
      this.formatHeading(d.yields ? 'Yields' : 'Returns', 5);
      this.formatReturnsBlock(d);
    }
    // XXX: what about nested members?
  }

  /**
   * Format a class definition
   * @param {object} d
   */
  formatClass (d) {
    this.formatHeading(this.formatAnchor(d) + this.formatSignature(d), 3);
    this.formatDescriptionBlock(d);
    // render all immediate members
    d.values().forEach(child => {
      this.index += '  ' + this.formatIndexItem(child) + '\n';

      this.print('---');
      this.linebreak();
      this.formatMember(child, 4);
    });
  }

  /**
   * Format a function definition
   * @param {object} d
   */
  formatFunction (d) {
    // default exports?
    this.formatHeading(this.formatAnchor(d) + this.formatSignature(d), 3);
    this.formatDescriptionBlock(d);
    if (d.args && d.args.length) {
      this.formatHeading('Parameters', 5);
      this.formatPropList(d.args);
    }
    if (d.returns || d.yields) {
      this.formatHeading(d.yields ? 'Yields' : 'Returns', 5);
      this.formatReturnsBlock(d);
    }
  }

  /**
   * Format a type definition
   * @param {object} d
   */
  formatTypedef (d) {
    // can a JSDoc typedef extend another typedef?
    this.formatHeading(this.formatAnchor(d) + this.formatSignature(d), 3);
    this.formatDescriptionBlock(d);
    // is callable?
    if (d.args?.length) {
      this.linebreak();
      this.formatHeading('Parameters', 5);
      this.linebreak();
      this.formatPropList(d.args);
    }
    // has static members?
    // XXX: determine that all props are static?
    if (d.isObject) {
      // print a props table
      this.linebreak();
      this.print('##### Properties');
      this.linebreak();
      this.formatPropList(d.values());
    }
  }

  /**
   * Format a type
   * @param {object} d
   */
  formatType (d) {
    // XXX: use d.defaultvalue (@defaultvalue) if it is a literal?
    let r = 'void';
    if (d && d.type) {
      const roS = d.readonly ? 'Readonly<' : '';
      const roE = d.readonly ? '>' : '';

      const tx = t0 => {
        const t1 = fixType(t0);
        if (this._names.includes(t1)) {
          return `[\`${roE}${t1}${roE}\`](#${t1})`;
        }
        return '`' + roS + t1 + roE + '`';
      };

      const type = d.type;
      if (type.names?.length === 1) {
        r = tx(type.names[0]);
      }
      else if (type.names?.length > 1) {
        r = type.names.map(tx).join(' | ');
      }
    }
    return r;
  }

  /**
   * Format a set of function arguments
   * @param {Array<object>} args
   * @param {boolean} [showDefaults=true]
   * @returns {string}
   */
  formatArguments (args, showDefaults = true) {
    if (!args) {
      return '';
    }
    if (!args.length) {
      return '()';
    }
    let inOpt = false;
    let r = args.reduce((a, d, i) => {
      if (d.name.includes('.')) { return a; }
      if (inOpt && !d.optional) {
        a += ']_';
        inOpt = false;
      }
      if (i) {
        a += ', ';
      }
      if (!inOpt && d.optional) {
        a += '_[';
        inOpt = true;
      }
      a += `${d.variable ? '...' : ''}${d.name}`;
      if (showDefaults && d.defaultvalue) {
        a += ' = ' + repValue(d.defaultvalue);
      }
      return a;
    }, '');
    if (inOpt) {
      r += ']_';
    }
    return '(\u00A0' + r + '\u00A0)';
  }

  /**
   * Format a returns block
   * @param {object} d
   */
  formatReturnsBlock (d) {
    const ret = (d.returns || d.yields);
    const returnDesc = this.formatDescription(ret[0], false);
    this.print(
      this.formatReturns(d) +
      (returnDesc ? ' – ' + returnDesc : '')
    );
    this.linebreak();
  }

  /**
   * Format a function returns type
   * @param {object} d
   * @returns {string}
   */
  formatReturns (d) {
    let returns = d.returns || d.yields;
    if (!returns || returns.length === 0) {
      return '`void`';
    }
    // convert to strings
    returns = returns.map(d => this.formatType(d));

    const isGenerator = !!d.yields;
    if (isGenerator) {
      // filter out potential void and unknown
      // then ensure both are there
      returns = returns
        .filter(d => d !== 'void' && d !== 'unknown')
        .concat([ '`void`', '`unknown`' ]);
      return `\`Generator<\`(${maybeWrap(returns)})\`>\``;
    }
    return maybeWrap(returns);
  }

  /**
   * Format description text as a comment block
   * @param {object} d
   * @param {boolean} [allowLinebreaks=true]
   * @returns {string}
   */
  formatDescription (d, allowLinebreaks = true) {
    // XXX: transformLinks
    if (!d || !d.description) { return ''; }
    let out = '';
    if (allowLinebreaks) {
      out = d.description.trim().replace(
        /(?:```([^\0]*?)```|(\S)\n(?!\n))/g,
        (a, b, c) => {
          return (c ? (c + ' ') : a);
        }
      );
    }
    else {
      out = d?.description
        // XXX: warn or throw if ``` exists in the desc?
        .replace(/```([^\0]*?)```/, '') // remove code blocks
        .replace(/\n/g, ' '); // collapse lines
    }
    return fixLinks(out);
  }
}

exports.FormatterMD = FormatterMD;
