const test = require('./_testutil.js');

test('args2.js', async t => {
  await t.convertTS('args2.js', 'args2.d.ts');
  await t.convertMD('args2.js', 'args2.md');
  t.end();
});
