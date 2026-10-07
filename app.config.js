// Keep local development at /; project sites such as GitHub Pages use a prefix.
module.exports = ({ config }) => {
  const baseUrl = process.env.FELTED_WEB_BASE_PATH?.trim().replace(/\/+$/, '');
  if (baseUrl && (!baseUrl.startsWith('/') || baseUrl.startsWith('//'))) {
    throw new Error('FELTED_WEB_BASE_PATH must be a path such as /felted.');
  }
  return {
    ...config,
    ...(baseUrl ? { experiments: { ...config.experiments, baseUrl } } : {}),
  };
};
