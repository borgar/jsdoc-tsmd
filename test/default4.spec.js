const test = require('./_testutil.js');

test('default4.js', async t => {
  await t.convertTS('default4.js', 'default4.d.ts');
  await t.convertMD('default4.js', 'default4.md');
  t.end();
});
