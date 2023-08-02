const test = require('./_testutil.js');

test('const7.js', async t => {
  await t.convertTS('const7.js', 'const7.d.ts');
  await t.convertMD('const7.js', 'const7.md');
  t.end();
});
