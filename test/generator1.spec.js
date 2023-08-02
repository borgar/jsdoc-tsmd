const test = require('./_testutil.js');

test('generator1.js', async t => {
  await t.convertTS('generator1.js', 'generator1.d.ts');
  await t.convertMD('generator1.js', 'generator1.md');
  t.end();
});
