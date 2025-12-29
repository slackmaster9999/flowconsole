module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},
    "postcss-prefix-selector": {
      prefix: '.preview-landing',  // обёртка вокруг компонента
      includeFiles: [/preview-landing\.css$/],
      excludeSelectors: [/^html$/, /^body$/, /^:root$/],
    },
    autoprefixer: {}
  }
}
