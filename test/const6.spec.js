const test = require('./_testutil.js');

test('const6.js', async t => {
  await t.convertTS('const6.js', 'const6.d.ts');
  await t.convertMD('const6.js', 'const6.md');
  t.end();
});
