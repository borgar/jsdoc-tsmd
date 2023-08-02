const { Node } = require('./Node.js');

// XXX: args should be nodes
// XXX: redo this to allow deeper nesting?
function prepFunctionArgs (args) {
  const params = [];
  args?.forEach(param => {
    const path = param.name.split(/\./);
    if (path.length > 2) {
      throw new Error('Unsupported argument nesting level');
    }
    else if (path.length === 2) {
      const [ parentName, childName ] = path;
      const parentArg = params.find(d => (
        (d.name === parentName) || (d.name + '[]' === parentName && d.isArrayOf)
      ));
      parentArg.add(new Node({
        ...param,
        kind: 'member',
        name: childName
      }));
    }
    else {
      const root = new Node({
        type: { names: [ '*' ] },
        kind: 'argument', // 🤔
        // XXX: this is a terrible way to hack this in 🙈
        isArrayOf: /^Array\b/i.test(param.type?.names?.[0]),
        ...param
      });
      params.push(root);
    }
  });
  return params;
}

function addPropsAsMembers (destination, properties) {
  if (properties) {
    properties.forEach(p => {
      destination.add(new Node({
        // XXX: member kind should be function|constant|...
        kind: 'member',
        scope: 'static',
        ...p
      }));
    });
  }
}

class Parser {
  constructor (opts) {
    this.opts = opts;
    // xxx: currently this only works for single modules, and global is equal to
    //      the modules, but we could expand this by having global = package
    this.global = new Node({
      name: 'module',
      root: true
    });
  }

  parse (docs) {
    const global = this.global;

    // let's see if there is a module present
    let remaining = docs.filter(d => {
      if (d.kind === 'module') {
        this.global.name = d.name;
        return false;
      }
      if (d.kind === 'package') {
        return false;
      }
      return true;
    });

    remaining = remaining.filter(d => {
      if (d.name === 'disconnect') {
        console.log(d);
      }
      const isDefault = (
        (d.longname === 'module.exports' && d.memberof === 'module') ||
        (d.name === 'module:' + global.name)
      );
      if (isDefault) {
        // fix the doclet here
        d.name = global.name;
        d.longname = global.name + ':default';
        d.scope = global.name;
        delete d.memberof;
        d.isDefaultExport = true;
      }

      if (d.params) {
        d.args = prepFunctionArgs(d.params);
        delete d.params;
      }

      // - Does @borrows need handling or is it automatic?
      // XXX: d.mixes[] ... find all mixes objects and fold into parents?

      // a constant without a type? -- assign "any"
      if (d.kind === 'constant' && !d.type) {
        d.type = { names: [ '*' ] };
      }

      if (
        (d.scope === global.name || d.scope === 'global') ||
        (d.memberof === global.name && isDefault) ||
        (d.kind === 'constant' && isDefault)
      ) {
        // fix class
        if (d.kind === 'class') {
          let class_desc = d.classdesc;
          let constructor_desc = d.description;
          if (!class_desc) {
            // JSDoc is somewhat flaky in where it assigns the comment
            class_desc = constructor_desc;
            constructor_desc = '';
          }
          const cls = new Node({
            kind: 'class',
            name: d.name,
            scope: d.scope,
            description: class_desc,
            augments: d.augments,
            args: d.args, // same args as the contstructor
            longname: d.longname,
            isDefaultExport: d.isDefaultExport
          });
          // .properties on a class are static, so we can simply convert them
          // to members here as a property is the same as a static member.
          //
          // From docs:
          //
          // > The @property tag is a way to easily document a list of static
          // > properties of a class, namespace or other object.
          addPropsAsMembers(cls, d.properties);

          if (cls.args) {
            // not all classes have a defined constructor method
            // they are only really relevant if they have arguments
            cls.add(new Node({
              kind: 'function',
              name: 'constructor',
              scope: 'instance',
              description: constructor_desc,
              memberof: d.name,
              longname: d.name + '#constructor',
              args: cls.args
            }));
          }
          global.add(cls);
        }
        else {
          const item = new Node(d);
          addPropsAsMembers(item, d.properties);
          delete d.properties;

          if (d.kind === 'typedef' && d.type.names[0] === 'function') {
            // convert args to a blank callable member
            item.add(new Node({
              kind: 'function',
              name: '',
              scope: 'instance',
              description: '',
              returns: d.returns,
              memberof: d.name,
              longname: d.name + '#()',
              args: d.args,
              isDefaultExport: d.isDefaultExport
            }));
          }

          global.add(item);
        }
        return false;
      }
      return true;
    });

    // console.log('non globals', remainCount);
    while (remaining.length) {
      const remainCount = remaining.length;
      remaining = remaining.filter(d => {
        if (d.kind === 'package') {
          // no support for this yet
          return false;
        }
        if (d.scope === 'inner' && d.name === 'root') {
          // ignore inner type assertions
          return false;
        }
        if (d.kind === 'class' && d.inherited && !!global.find(d.name)) {
          // ignore overwritten constructors from super-classes
          // https://github.com/jsdoc/jsdoc/issues/1775
          return false;
        }
        if ((d.scope === 'instance' || d.scope === 'static' || d.scope === 'inner') &&
            (d.kind === 'member' || d.kind === 'function' || d.kind === 'typedef')) {
          const parent = global.find(d.memberof);
          if (parent) {
            parent.add(new Node(d));
            // remove from the remaining pool!
            return false;
          }
          else {
            console.log(`no parent "${d.memberof}" for ${d.name}`);
          }
        }
        // is this a weirdly tagged constructor?
        if (d.kind === 'class' && d.name === d.memberof && d.scope === 'instance') {
          const parent = global.find(d.memberof);
          if (parent) {
            // remove placeholder constructor
            const oldc = parent.detach('constructor');
            if (!parent.description) {
              // move the existing constructor desc to class if it doesn't have one
              // XXX: of oldc has params, then we're in some strange state
              if (oldc.params?.length) {
                console.log(`Conflict in ${parent.name} constructor`);
                process.exit(1);
              }
              parent.description = oldc.description;
            }
            // attach new constructor
            parent.add(new Node({
              kind: 'function',
              name: 'constructor',
              scope: 'instance',
              description: d.description,
              memberof: d.name,
              longname: d.name + '#constructor',
              args: d.args
            }));
            return false;
          }
        }
        // else {
        //   console.log(d);
        //   console.log('Unknown kind ' + d.kind + ' @' + d.longname);
        //   process.exit(1);
        // }
        // keep the element for next round
        return true;
      });
      // did we at least link some items?
      if (remainCount === remaining.length) {
        console.log(`FAILED: Unable to link ${remainCount} items!`);
        console.log(remaining);
        process.exit(1);
      }
    }
  }
}

exports.Parser = Parser;
