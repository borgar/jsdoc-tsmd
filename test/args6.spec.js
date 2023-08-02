const test = require('./_testutil.js');

test('args6.js', async t => {
  await t.convertTS('args6.js', 'args6.d.ts');
  await t.convertMD('args6.js', 'args6.md');
  t.end();
});
