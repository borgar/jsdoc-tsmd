const test = require('./_testutil.js');

test('args4.js', async t => {
  await t.convertTS('args4.js', 'args4.d.ts');
  await t.convertMD('args4.js', 'args4.md');
  t.end();
});
