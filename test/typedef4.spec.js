const test = require('./_testutil.js');

test('typedef4.js', async t => {
  await t.convertTS('typedef4.js', 'typedef4.d.ts');
  await t.convertMD('typedef4.js', 'typedef4.md');
  t.end();
});
