const test = require('./_testutil.js');

test('default3.js', async t => {
  await t.convertTS('default3.js', 'default3.d.ts');
  await t.convertMD('default3.js', 'default3.md');
  t.end();
});
