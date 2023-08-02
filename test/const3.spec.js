const test = require('./_testutil.js');

test('const3.js', async t => {
  await t.convertTS('const3.js', 'const3.d.ts');
  await t.convertMD('const3.js', 'const3.md');
  t.end();
});
