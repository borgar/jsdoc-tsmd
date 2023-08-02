/* globals Promise */
/* eslint-disable no-await-in-loop */
const path = require('path');
const test = require('tape');
const Test = require('tape').Test;
const cp = require('child_process');
const fs = require('fs').promises;
const readline = require("readline");

function prompt (promptText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(promptText, input => {
      rl.close();
      resolve(input);
    });
  });
}

async function loadCompare (compareFilePath, result) {
  let expected = null;
  try {
    expected = (await fs.readFile(compareFilePath, 'utf8')).trim();
  }
  catch (err) {
    if (err.code === 'ENOENT' && result != null) {
      console.log('  ---');
      console.log(result.split('\n').map(d => '    ' + d).join('\n'));
      console.log('  ...');
      const confirm = await prompt('# "' + compareFilePath + '" not found. Would you like to save result? [Y/n] ');
      if (!confirm || /^(y|yes)$/i.test(confirm)) {
        await fs.writeFile(compareFilePath, result, 'utf8');
        return result;
      }
    }
  }
  return expected;
}

function convert (fileName, config = 'test/_md.json') {
  return new Promise((resolve, reject) => {
    const cmd = cp.spawn('jsdoc', [ '-c', config, fileName ]);
    let stdout = '';
    let stderr = '';
    cmd.stdout.on('data', data => { stdout += data; });
    cmd.stderr.on('data', data => { stderr += data; });
    cmd.on('close', code => {
      if (code) {
        reject(stderr || stdout);
      }
      resolve(stdout.trim());
    });
  });
}

Test.prototype.sameText = async function (result, expected, message) {
  if (result === expected) {
    this.pass(message);
  }
  else if (typeof result !== typeof expected) {
    this.fail(message);
  }
  else {
    // we do this line-by-line so we can report a smaller diff
    // some of the files can get quote big
    const r = result.split('\n');
    const x = expected.split('\n');
    const l = Math.max(r.length, x.length);
    for (let i = 0; i < l; i++) {
      const p = `Line ${i}: `;
      if (r[i] !== x[i]) {
        const ri = p + r[i];
        const xi = p + x[i];
        this.equal(ri, xi, message);
        break;
      }
    }
  }
};

Test.prototype.convertTS = async function (sourceFile, compareFile) {
  const result = await convert('test/fixtures/' + sourceFile, 'test/_ts.json');
  const expected = await loadCompare('test/fixtures/' + compareFile, result);
  const basename = path.basename(sourceFile);
  this.sameText(result, expected, basename + ' to TypeScript');
};

Test.prototype.convertMD = async function (sourceFile, compareFile) {
  const result = await convert('test/fixtures/' + sourceFile, 'test/_md.json');
  const expected = await loadCompare('test/fixtures/' + compareFile, result);
  const basename = path.basename(sourceFile);
  this.sameText(result, expected, basename + ' to Markdown');
};

module.exports = test;
