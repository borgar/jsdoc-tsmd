const test = require('./_testutil.js');

test('class1.js', async t => {
  await t.convertTS('class1.js', 'class1.d.ts');
  await t.convertMD('class1.js', 'class1.md');
  t.end();
});
