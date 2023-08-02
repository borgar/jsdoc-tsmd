const test = require('./_testutil.js');

test('class2.js', async t => {
  await t.convertTS('class2.js', 'class2.d.ts');
  await t.convertMD('class2.js', 'class2.md');
  t.end();
});
