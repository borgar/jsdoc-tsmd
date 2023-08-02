const test = require('./_testutil.js');

test('default5.js', async t => {
  await t.convertTS('default5.js', 'default5.d.ts');
  await t.convertMD('default5.js', 'default5.md');
  t.end();
});
