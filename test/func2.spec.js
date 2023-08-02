const test = require('./_testutil.js');

test('func2.js', async t => {
  await t.convertTS('func2.js', 'func2.d.ts');
  await t.convertMD('func2.js', 'func2.md');
  t.end();
});
