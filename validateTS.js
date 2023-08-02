const ts = require('typescript');

/**
 * Validate TypeScript code for syntax errors
 */
function validateTS (inputCode) {
  const NEWLINE = '\n';
  const fakeName = 'test.ts';
  const opts = {
    noEmit: true,
    noEmitOnError: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS
  };
  const compilerHost = ts.createCompilerHost(opts);
  const program = ts.createProgram([ fakeName ], opts, {
    ...compilerHost,
    getSourceFile: (fn, ...args) => {
      return (fn === fakeName)
        ? ts.createSourceFile(fn, inputCode)
        : compilerHost.getSourceFile(fn, ...args);
    }
  });
  return ts
    .getPreEmitDiagnostics(program)
    .map(d => {
      if (d.file && d.file.fileName === fakeName) {
        const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
        const message = ts.flattenDiagnosticMessageText(d.messageText, NEWLINE);
        return {
          line,
          col: character + 1,
          message
        };
      }
      return null;
    })
    .filter(Boolean);
}

exports.validateTS = validateTS;
