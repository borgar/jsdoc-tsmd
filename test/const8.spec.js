const test = require('./_testutil.js');

test('const8.js', async t => {
  await t.convertTS('const8.js', 'const8.d.ts');
  await t.convertMD('const8.js', 'const8.md');
  t.end();
});
