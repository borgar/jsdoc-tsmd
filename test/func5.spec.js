const test = require('./_testutil.js');

test('func5.js', async t => {
  await t.convertTS('func5.js', 'func5.d.ts');
  await t.convertMD('func5.js', 'func5.md');
  t.end();
});
