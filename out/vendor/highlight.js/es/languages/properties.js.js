function emitWarning() {
    if (!emitWarning.warned) {
      emitWarning.warned = true;
      console.log(
        'Deprecation (warning): Using file extension in specifier is deprecated, use "highlight.js/lib/languages/properties" instead of "highlight.js/lib/languages/properties.js"'
      );
    }
  }
  emitWarning();
    import lang from './properties.js';
    export default lang;