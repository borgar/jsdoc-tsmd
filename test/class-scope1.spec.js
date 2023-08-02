const test = require('./_testutil.js');

test('class-scope1.js', async t => {
  await t.convertTS('class-scope1.js', 'class-scope1.d.ts');
  await t.convertMD('class-scope1.js', 'class-scope1.md');
  t.end();
});
