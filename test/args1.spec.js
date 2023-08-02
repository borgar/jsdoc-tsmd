const test = require('./_testutil.js');

test('args1.js', async t => {
  await t.convertTS('args1.js', 'args1.d.ts');
  await t.convertMD('args1.js', 'args1.md');
  t.end();
});
