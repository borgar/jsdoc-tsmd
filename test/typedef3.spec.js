const test = require('./_testutil.js');

test('typedef3.js', async t => {
  await t.convertTS('typedef3.js', 'typedef3.d.ts');
  await t.convertMD('typedef3.js', 'typedef3.md');
  t.end();
});
