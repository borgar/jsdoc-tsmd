const test = require('./_testutil.js');

test('typedef1.js', async t => {
  await t.convertTS('typedef1.js', 'typedef1.d.ts');
  await t.convertMD('typedef1.js', 'typedef1.md');
  t.end();
});
