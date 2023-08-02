const test = require('./_testutil.js');

test('args3.js', async t => {
  await t.convertTS('args3.js', 'args3.d.ts');
  await t.convertMD('args3.js', 'args3.md');
  t.end();
});
