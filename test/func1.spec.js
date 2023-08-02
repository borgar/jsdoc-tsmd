const test = require('./_testutil.js');

test('func1.js', async t => {
  await t.convertTS('func1.js', 'func1.d.ts');
  await t.convertMD('func1.js', 'func1.md');
  t.end();
});
