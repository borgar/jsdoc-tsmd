const test = require('./_testutil.js');

test('typedef2.js', async t => {
  await t.convertTS('typedef2.js', 'typedef2.d.ts');
  await t.convertMD('typedef2.js', 'typedef2.md');
  t.end();
});
