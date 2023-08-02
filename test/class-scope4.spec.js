const test = require('./_testutil.js');

test('class-scope4.js', async t => {
  await t.convertTS('class-scope4.js', 'class-scope4.d.ts');
  await t.convertMD('class-scope4.js', 'class-scope4.md');
  t.end();
});
