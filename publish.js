const path = require('path');
const fs = require('fs');
const { Parser } = require('./Parser.js');
const { FormatterTS } = require('./FormatterTS.js');
const { FormatterMD } = require('./FormatterMD.js');

/**
 * @param {TAFFY} data - The TaffyDB containing the data that jsdoc parsed.
 * @param {*} opts - Options passed into jsdoc.
 */
exports.publish = function publish (data, opts) {
  const outOpt = (opts.output || '').toLowerCase();
  const emitTSD = (outOpt === 'ts' || outOpt === 'typescript');

  // remove undocumented
  data({ undocumented: true }).remove();

  // get the doc list and filter out inherited non-overridden members
  const docs = data().get().filter(d => !d.inherited || d.overrides);

  // create a parser to parse the docs
  const parser = new Parser(opts);
  parser.parse(docs);

  // output option specifies whetehr we should emit typescript or markdown
  const formatter = emitTSD
    ? new FormatterTS(opts)
    : new FormatterMD(opts);

  const output = formatter.format(parser.global);

  // emit the output
  if (opts.destination === 'console') {
    console.log(output);
  }
  else {
    try {
      fs.mkdirSync(opts.destination);
    }
    catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
    }
    const pkgArray = data({ kind: 'package' }).get() || [];
    const pkg = pkgArray[0];
    let definitionName = 'types';
    if (pkg && pkg.name) {
      definitionName = pkg.name.split('/').pop() || definitionName;
    }
    const ext = emitTSD ? '.d.ts' : '.md';
    const out = path.join(opts.destination, opts.outFile || `${definitionName}${ext}`);
    fs.writeFileSync(out, output);
  }
};
