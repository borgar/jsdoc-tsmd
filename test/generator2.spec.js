const test = require('./_testutil.js');

test('generator2.js', async t => {
  await t.convertTS('generator2.js', 'generator2.d.ts');
  await t.convertMD('generator2.js', 'generator2.md');
  t.end();
});
