module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},
    "postcss-prefix-selector": {
      prefix: '.preview-landing',  // wrapper
      includeFiles: [/preview-landing\.css$/],
      excludeSelectors: [/^html$/, /^body$/, /^:root$/],
    },
    autoprefixer: {}
  }
}
