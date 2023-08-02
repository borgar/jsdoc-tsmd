const test = require('./_testutil.js');

test('class-scope2.js', async t => {
  await t.convertTS('class-scope2.js', 'class-scope2.d.ts');
  await t.convertMD('class-scope2.js', 'class-scope2.md');
  t.end();
});
