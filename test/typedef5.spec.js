const test = require('./_testutil.js');

test('typedef5.js', async t => {
  await t.convertTS('typedef5.js', 'typedef5.d.ts');
  await t.convertMD('typedef5.js', 'typedef5.md');
  t.end();
});
