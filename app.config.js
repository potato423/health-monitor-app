// app.config.js — dynamic config, reads secrets from environment
// In development: set SILICONFLOW_API_KEY in .env
// In production: use EAS Secrets (eas secret:create)
const { withInfoPlist } = require('@expo/config-plugins');

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    siliconflowApiKey: process.env.SILICONFLOW_API_KEY ?? '',
  },
});
