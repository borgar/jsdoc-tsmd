# jsdoc-tsmd

A [JSDoc](https://jsdoc.app/) template for small projects that can emit Markdown docs or TypeScript types.

Not really recommended for use as it only implements the few parts of JSDoc that the author has use for. Likely the project will die as TS tooling gets better over time.


## Setting up

Set this up like any other JSDoc template. Start by installing the package:

```sh
npm i -D @borgar/jsdoc-tsmd
```

Then add a config file, which it might look something like this:

```json
{
  "source": {
    "includePattern": ".+\\.js(doc|x)?$",
    "excludePattern": "((^|\\/|\\\\)_|spec\\.js$)"
  },
  "opts": {
    "template": "node_modules/@borgar/jsdoc-tsmd",
    "destination": "console",
  }
}
```

Running `jsdoc -c myconfig.json src` should then emit some Markdown docs (given that the sources have valid jsdoc comments in them). See the options below for how do produce TypeScript type declarations.

#### Options:

https://jsdoc.app/about-configuring-jsdoc.html

* `destination` - Where to save the emitted text, using `"console"` will log the output to the console.
* `output` - Set this to `"typescript"` to emit TypeScript type declarations rather than Markdown docs.
* `validate` - When producing type declarations, the output will be run through TypeScript to validate it, if you like living on the edge, you can set this to `false` to skip this step.


## License

[MIT](LICENSE)
