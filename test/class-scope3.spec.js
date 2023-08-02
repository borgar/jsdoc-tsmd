const test = require('./_testutil.js');

test('class-scope3.js', async t => {
  await t.convertTS('class-scope3.js', 'class-scope3.d.ts');
  await t.convertMD('class-scope3.js', 'class-scope3.md');
  t.end();
});
