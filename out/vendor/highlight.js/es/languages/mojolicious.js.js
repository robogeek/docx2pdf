function emitWarning() {
    if (!emitWarning.warned) {
      emitWarning.warned = true;
      console.log(
        'Deprecation (warning): Using file extension in specifier is deprecated, use "highlight.js/lib/languages/mojolicious" instead of "highlight.js/lib/languages/mojolicious.js"'
      );
    }
  }
  emitWarning();
    import lang from './mojolicious.js';
    export default lang;