const test = require('./_testutil.js');

test('args5.js', async t => {
  await t.convertTS('args5.js', 'args5.d.ts');
  await t.convertMD('args5.js', 'args5.md');
  t.end();
});
