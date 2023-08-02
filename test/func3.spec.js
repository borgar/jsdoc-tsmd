const test = require('./_testutil.js');

test('func3.js', async t => {
  await t.convertTS('func3.js', 'func3.d.ts');
  await t.convertMD('func3.js', 'func3.md');
  t.end();
});
