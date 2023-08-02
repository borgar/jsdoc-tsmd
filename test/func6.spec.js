const test = require('./_testutil.js');

test('func6.js', async t => {
  await t.convertTS('func6.js', 'func6.d.ts');
  await t.convertMD('func6.js', 'func6.md');
  t.end();
});
