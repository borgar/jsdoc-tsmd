const test = require('./_testutil.js');

test('const2.js', async t => {
  await t.convertTS('const2.js', 'const2.d.ts');
  await t.convertMD('const2.js', 'const2.md');
  t.end();
});
