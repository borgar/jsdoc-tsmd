const { fixType } = require('./fixType.js');
const { validateTS } = require('./validateTS.js');

function maybeWrap (thing) {
  if (Array.isArray(thing) && thing.length > 1) {
    return '(' + thing.join(' | ') + ')';
  }
  return thing;
}

class FormatterTS {
  constructor (opts) {
    this.opts = opts || {};
    this.output = '';
    this.index = '';
    this.indentWidth = 0;
  }

  get indent () {
    return '    '.repeat(this.indentWidth);
  }

  withIndent (cb) {
    const prevIndent = this.indentWidth;
    this.indentWidth = prevIndent + 1;
    cb();
    this.indentWidth = prevIndent;
  }

  print (line = '') {
    if (line) {
      this.output += line;
      this.linebreak();
    }
  }

  linebreak () {
    if (this.output) {
      this.output += '\n';
    }
  }

  format (node) {
    for (const d of node.values()) {
      if (d.ignore) {
        continue;
      }
      this.linebreak();
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
        console.log(d);
        console.log(d.kind);
      }
    }

    // ensure that we don't just emit broken TS without knowing
    const errors = (this.opts.validate !== false)
      ? validateTS(this.output)
      : [];
    if (errors.length) {
      console.error('FATAL ERROR: Invalid TypeScript produced!');
      errors.forEach(err => console.error(err));
      process.exit(1);
    }

    return this.output;
  }

  declare (d) {
    const decl = d.isDefaultExport ? 'default' : 'declare';
    return (d.access === 'private' ? '' : 'export ') + decl + ' ';
  }

  /**
   * Format a constant definition
   */
  formatConstant (d) {
    // XXX: use d.defaultvalue (@defaultvalue) if it is a literal?
    this.print(this.formatDescription(d));
    if (d.isDefaultExport) {
      this.print(`declare const _default: ${this.formatType(d)};`);
      this.print(`export default _default;`);
    }
    else {
      this.print(`${this.declare(d)}const ${d.name}: ${this.formatType(d)};`);
    }
  }

  /**
   * Format a class definition
   */
  formatClass (d) {
    const ext = d.augments?.length ? ` extends ${d.augments[0]}` : '';
    // we don't want arguments and return descriptions on the class
    // those are emitted with the constructor
    this.print(this.formatDescription({ description: d.description }));
    this.print(`${this.declare(d)}class ${d.name}${ext} {`);
    this.withIndent(() => {
      d.values().forEach(s => {
        const stat = (s.scope === 'static') ? 'static ' : '';
        if (s.kind === 'member') {
          // XXX: static props? optional props? read-only props?
          this.print(this.formatDescription(s));
          this.print(`${this.indent}${stat}${s.readonly ? 'readonly ' : ''}${s.name}: ${this.formatType(s)};`);
        }
        else if (s.kind === 'function') {
          const ret = (s.name !== 'constructor') ? `: ${this.formatReturns(s)}` : '';
          this.print(this.formatDescription(s));
          this.print(`${this.indent}${stat}${s.name}(${this.formatArguments(s.args)})${ret};`);
        }
        else {
          console.log(s);
          console.log('FAIL 1');
          process.exit(1);
        }
      });
    });
    this.print('}');
  }

  /**
   * Format a function definition
   */
  formatFunction (d) {
    this.print(this.formatDescription(d));
    const ret = this.formatReturns(d);
    const args = this.formatArguments(d.args);
    const name = d.isDefaultExport ? '' : d.name;
    this.print(`${this.declare(d)}function ${name}(${args}): ${ret};`);
  }

  /**
   * Format a type definition
   */
  formatTypedef (d) {
    // can a JSDoc typedef extend another typedef?
    this.print(this.formatDescription(d));
    this.print(`${this.declare(d)}type ${d.name} = ${this.formatType(d)};`);
  }

  formatMember (d) {
    const isCallable = d.args || d.type === 'function';
    let r = '';
    // xxx: if s is private (etc), should we inline it?
    if (d.description || isCallable) {
      r += this.formatDescription(d) + '\n';
    }
    const readonly = d.readonly ? 'readonly ' : '';
    const optional = d.optional ? '?' : '';
    let callSig = '';
    if (isCallable) {
      const args = this.formatArguments(d.args);
      callSig = '(' + args + ')';
    }
    const typeOrReturn = isCallable ? this.formatReturns(d) : this.formatType(d);
    r += `${this.indent}${readonly}${d.name}${optional}${callSig}: ${typeOrReturn};\n`;
    return r;
  }

  /**
   * Format a type
   */
  formatType (d) {
    let r = 'void';
    if (d && d.type) {
      const type = d.type;
      if (d.isObject) {
        r = `{\n`;
        this.withIndent(() => {
          for (const value of d.values()) {
            r += this.formatMember(value);
          }
        });
        r += `}`;
        if (d.isArrayOf) {
          r = `Array<${r}>`;
        }
      }
      else if (type.names?.length === 1) {
        r = fixType(type.names[0]);
      }
      else if (type.names?.length > 1) {
        r = '(' + type.names.map(fixType).join(' | ') + ')';
      }
      if (d.readonly) {
        // `Readonly<Array<${r}>>` => ReadonlyArray<T>
        r = `Readonly<${r}>`;
      }
    }
    return r;
  }

  /**
   * Format a set of function arguments
   */
  formatArguments (args) {
    if (!args || !args.length) {
      return '';
    }
    return args.reduce((a, d, i) => {
      if (i) { a += ', '; }
      a += `${d.variable ? '...' : ''}${d.name}${d.optional ? '?' : ''}: ${this.formatType(d)}`;
      return a;
    }, '');
  }

  /**
   * Format a function returns type
   */
  formatReturns (d) {
    const isGenerator = !!d.yields;
    let returns = d.returns || d.yields;

    if (!returns || returns.length === 0) {
      return 'void';
    }
    // convert to strings
    returns = returns.map(d => this.formatType(d));

    if (isGenerator) {
      // filter out potential void and unknown
      // then ensure both are there
      returns = returns
        .filter(d => d !== 'void' && d !== 'unknown')
        .concat([ 'void', 'unknown' ]);
      return `Generator<${maybeWrap(returns)}>`;
    }
    return maybeWrap(returns);
  }

  /**
   * Format description text as a comment block
   */
  formatDescription (d) {
    let out = '';
    if (!d) { return ''; }

    const desc = d?.description;
    const hasReturnDesc = !!d.returns?.[0]?.description;
    const hasArgDesc = d.args?.some(a => a.description);
    const lines = desc?.split('\n') ?? [];
    let foo = '';
    if (!desc && !hasReturnDesc && !hasArgDesc) {
      return '';
    }
    else if (lines.length === 1 && !(hasReturnDesc || hasArgDesc)) {
      // allow one-liners
      out += `${this.indent}/** ${desc} */`;
    }
    else {
      out += `${this.indent}/**\n`;
      for (const line of lines) {
        if (line.trim()) {
          foo = 'desc';
          out += `${this.indent} * ${line}\n`;
        }
      }
      if (hasArgDesc) {
        if (foo) {
          foo = 'args';
          out += `${this.indent} *\n`;
        }
        const addLine = (a, namePrefix = '') => {
          const longname = [ namePrefix, a.name ].filter(Boolean).join('.');
          let decl = `${this.indent} * @param `;
          if (a.optional) { decl += '['; }
          decl += longname;
          if (a.defaultvalue !== undefined) {
            decl += '=' + a.defaultvalue;
          }
          if (a.optional) { decl += ']'; }
          decl += a.description ? ` ${a.description}\n` : '\n';
          if (a.isObject) {
            // name[] is not used unless it is followed by members?
            const arr = a.isArrayOf ? '[]' : '';
            a.values().forEach(b => { decl += addLine(b, longname + arr); });
          }
          return decl;
        };
        d.args.forEach(arg => {
          out += addLine(arg);
        });
      }
      if (hasReturnDesc) {
        if (foo === 'desc') {
          out += `${this.indent} *\n`;
        }
        out += `${this.indent} * @returns ${d.returns[0].description}\n`;
      }
      out += `${this.indent} */`;
    }
    return out;
  }
}

exports.FormatterTS = FormatterTS;
