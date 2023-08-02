const { parse, publish, createDefaultPublisher, NodeType } = require('jsdoctypeparser');

const { ANY, NAME, GENERIC } = NodeType;

const nameFixes = {
  string: 'string',
  boolean: 'boolean',
  object: 'object',
  number: 'number',
  array: 'Array',
  date: 'Date',
  promise: 'Promise',
  function: 'Function'
};

function quote (str) {
  return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function maybeQuote (name) {
  const isPlain = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
  return isPlain ? name : quote(name);
}

function addTypeArgs (node) {
  if (node.type === NAME && /^array|promise$/i.test(node.name)) {
    // arguments are required
    return {
      type: GENERIC,
      subject: node,
      objects: [ { type: ANY } ]
    };
  }
  else if (node.type === GENERIC && /^object$/i.test(node.subject.name)) {
    // has 2 arguments?
    if (!node.objects.length) {
      node.objects.unshift({ type: NAME, name: 'string' }, { type: ANY });
    }
    else if (node.objects.length === 1) {
      node.objects.unshift({ type: NAME, name: 'string' });
    }
  }
  else if (node.objects) {
    node.objects = node.objects.map(addTypeArgs);
  }
  return node;
}

const publisher = Object.assign(createDefaultPublisher(), {
  ANY: () => 'any',
  NAME: n => nameFixes[n.name.toLowerCase()] || n.name,
  GENERIC: (n, recurse) => {
    let name = recurse(n.subject);
    const nested = n.objects.map(recurse);
    if (name === 'object') {
      name = 'Record';
    }
    return name + '<' + nested.join(', ') + '>';
  },
  NOT_NULLABLE: (n, recurse) => `NonNullable<${recurse(n.value)}>`,
  NULLABLE: (n, recurse) => `Nullable<${recurse(n.value)}>`,
  OPTIONAL: (n, recurse) => recurse(n.value),
  RECORD: (n, recurse) => `{ ${n.entries.map(recurse).join(', ')} }`,
  RECORD_ENTRY: (n, recurse) => {
    const { value, key } = n;
    const readonly = n.readonly ? 'readonly ' : '';
    const keySuffix = value?.type === 'OPTIONAL' ? '?' : '';
    return `${readonly}${maybeQuote(key)}${keySuffix}: ${value ? recurse(value) : 'any'}`;
  },
  STRING_VALUE: n => quote(n.string),
  TUPLE: (n, recurse) => `[ ${n.entries.map(recurse).join(', ')} ]`,
  UNKNOWN: () => 'unknown'

  // INNER_MEMBER
  // INSTANCE_MEMBER
});

function fixType (typeString) {
  const ast = addTypeArgs(parse(typeString));
  return publish(ast, publisher);
}

exports.fixType = fixType;
