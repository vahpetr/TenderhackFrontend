const { override } = require('customize-cra');
// const cspHtmlWebpackPlugin = require("csp-html-webpack-plugin");

const cspConfigPolicy = {
  'default-src': "'none'",
  'object-src': "'none'",
  'base-uri': "'self'",
  'connect-src': ["'self'", "https://*.balkon.dev", "wss://*.balkon.dev"],
  'script-src': ["'self'"],
  // 'script-src-attr': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  // 'style-src-elem': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'manifest-src': ["'self'"],
  'img-src': ["'self'"],
  'frame-src': ["'self'", "https://*.balkon.dev"],
  'worker-src': ["'self'"],
  'prefetch-src': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': []
};

function addCspHtmlWebpackPlugin(config) {
  if (process.env.NODE_ENV === 'production') {
    // config.plugins.push(new cspHtmlWebpackPlugin(cspConfigPolicy));
  }

  return config;
}

module.exports = {
  webpack: override(addCspHtmlWebpackPlugin),
};
