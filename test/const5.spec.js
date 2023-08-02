const test = require('./_testutil.js');

test('const5.js', async t => {
  await t.convertTS('const5.js', 'const5.d.ts');
  await t.convertMD('const5.js', 'const5.md');
  t.end();
});
