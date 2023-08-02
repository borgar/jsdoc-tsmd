const test = require('tape');
const { Test } = require('tape');
const { fixType } = require('../fixType.js');

Test.prototype.fixesTo = function (source, expect) {
  const result = fixType(source);
  this.equal(result, expect, source);
};

test('Type normalization', t => {
  t.fixesTo('*', 'any');
  t.fixesTo('?', 'unknown');
  t.fixesTo('String', 'string');
  t.fixesTo('Boolean', 'boolean');
  t.fixesTo('Number', 'number');
  t.fixesTo('date', 'Date');
  t.fixesTo('function', 'Function');
  t.fixesTo('null', 'null');
  t.fixesTo('undefined', 'undefined');

  t.fixesTo('array', 'Array<any>');
  t.fixesTo('Array<Array>', 'Array<Array<any>>');

  t.fixesTo('Object', 'object');
  t.fixesTo('Object<*>', 'Record<string, any>');
  t.fixesTo('Object<*>', 'Record<string, any>');

  t.fixesTo('promise', 'Promise<any>');

  t.fixesTo('?number', 'Nullable<number>');

  t.fixesTo('123.45', '123.45');
  t.fixesTo('true', 'true');
  t.fixesTo('true|false', 'true | false');
  t.fixesTo('"\\\\//"', '"\\\\//"');
  t.fixesTo('"lorem\\"ipsum"', '"lorem\\"ipsum"');
  t.fixesTo("'lorem\\'ipsum'", '"lorem\'ipsum"');

  t.fixesTo('array<String>', 'Array<string>');
  t.fixesTo('String[]', 'Array<string>');
  t.fixesTo('Array.<Object.<string, number>>', 'Array<Record<string, number>>');

  t.fixesTo('[number]', '[ number ]');

  t.fixesTo('Array<{length}>', 'Array<{ length: any }>');

  t.fixesTo('{foo}', '{ foo: any }');
  t.fixesTo('{num: number=}', '{ num?: number }');
  t.fixesTo('{num?: number}', '{ num?: number }');
  t.fixesTo("{'num': number, 'myObject'}", '{ num: number, myObject: any }');
  t.fixesTo("{'num%': number, 'myObject'}", '{ "num%": number, myObject: any }');

  t.end();
});
