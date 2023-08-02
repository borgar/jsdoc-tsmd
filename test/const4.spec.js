const test = require('./_testutil.js');

test('const4.js', async t => {
  await t.convertTS('const4.js', 'const4.d.ts');
  await t.convertMD('const4.js', 'const4.md');
  t.end();
});
