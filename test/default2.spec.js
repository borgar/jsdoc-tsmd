const test = require('./_testutil.js');

test('default2.js', async t => {
  await t.convertTS('default2.js', 'default2.d.ts');
  await t.convertMD('default2.js', 'default2.md');
  t.end();
});
