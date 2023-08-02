const test = require('./_testutil.js');

test('class3.js', async t => {
  await t.convertTS('class3.js', 'class3.d.ts');
  await t.convertMD('class3.js', 'class3.md');
  t.end();
});
