const test = require('./_testutil.js');

test('func4.js', async t => {
  await t.convertTS('func4.js', 'func4.d.ts');
  await t.convertMD('func4.js', 'func4.md');
  t.end();
});
