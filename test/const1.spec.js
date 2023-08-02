const test = require('./_testutil.js');

test('const1.js', async t => {
  await t.convertTS('const1.js', 'const1.d.ts');
  await t.convertMD('const1.js', 'const1.md');
  t.end();
});
