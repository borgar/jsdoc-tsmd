const test = require('./_testutil.js');

test('default1.js', async t => {
  await t.convertTS('default1.js', 'default1.d.ts');
  await t.convertMD('default1.js', 'default1.md');
  t.end();
});
