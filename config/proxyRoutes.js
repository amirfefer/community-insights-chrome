// proxyRoutes.js
const { execSync } = require('child_process');
const path = require('path');
const cookieTransform = require('./cookieTransform');

/**
 * Checks if a local app is running by issuing a curl command.
 *
 * @param {string} appName - The name of the application.
 * @param {string} hostUrl - The URL to check.
 * @returns {boolean} - True if the app responds with HTTP 200, false otherwise.
 */
const checkLocalAppHost = (appName, hostUrl) => {
  try {
    const check = execSync(
      `curl --max-time 5 --silent --head ${hostUrl} | awk '/^HTTP/{print $2}'`
    )
      .toString()
      .trim();

    if (check !== '200') {
      console.error(
        `\n${appName[0].toUpperCase()}${appName.substring(
          1
        )} is not running or available via ${hostUrl}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error checking host for ${appName} at ${hostUrl}:`, error);
    return false;
  }
};

/**
 * Build proxy route configurations from a routes object.
 *
 * @param {Object} routes - An object where keys are route substrings and values are either a proxy config object or a target string.
 * @param {string} target - The default target URL.
 * @returns {Array} - Array of proxy configuration objects.
 */
const buildRoutes = (routes = {}, target) =>
  Object.entries(routes).map(([route, redirect]) => {
    const currTarget =
      typeof redirect === 'object' ? redirect.host : redirect;
    if (typeof redirect === 'object') {
      // Remove the host property so it doesn't override later settings.
      delete redirect.host;
    }
    return {
      // Match any URL that includes the route substring.
      context: (url) => url.includes(route),
      target: currTarget || target,
      secure: false,
      changeOrigin: true,
      autoRewrite: true,
      ws: true,
      onProxyReq: cookieTransform, // Transforms cookies on proxy requests.
      ...(typeof redirect === 'object' ? redirect : {}),
    };
  });

/**
 * Build local application proxy routes.
 *
 * Expects a comma-separated string (or an array) of local apps with the following format:
 *   "appName:port~protocol"
 * where protocol is optional (defaults to "http") and port defaults to "8003".
 *
 * @param {string|string[]} localApps - Local apps configuration.
 * @param {string} defaultLocalAppHost - The default host to use for local apps.
 * @param {string} target - The default target URL.
 * @returns {Array} - Array of proxy configuration objects for local apps.
 */
const buildLocalAppRoutes = (localApps, defaultLocalAppHost, target) => {
  const apps = Array.isArray(localApps) ? localApps : localApps.split(',');
  const routes = apps.reduce((acc, curr) => {
    if (!curr) return acc;
    const [appName, appConfig = ''] = curr.split(':');
    const [appPort = '8003', protocol = 'http'] = appConfig.split('~');
    const appUrl = `${protocol}://${defaultLocalAppHost}:${appPort}`;
    if (checkLocalAppHost(appName, appUrl)) {
      console.log(`Creating app proxy route for: ${appName} → ${appUrl}`);
      acc[`/apps/${appName}`] = { host: appUrl };
    } else {
      console.error(`Local app ${appName} is not running on ${appUrl}.`);
      process.exit(1);
    }
    return acc;
  }, {});
  return buildRoutes(routes, target);
};

/**
 * Returns an array of proxy route configuration objects.
 *
 * @param {Object} options - Options for building the proxy routes.
 * @param {string} options.target - The target URL for proxy requests.
 * @param {Object} [options.routes] - An object mapping route substrings to proxy configurations.
 *                                    (Can also be nested under a "routes" key.)
 * @param {string|string[]} [options.localApps] - Local apps configuration.
 * @param {string} options.defaultLocalAppHost - The default host to use for local apps.
 * @returns {Array} - Array of proxy route configuration objects.
 */
const getProxyRoutes = ({
  target,
  routes,
  localApps,
  defaultLocalAppHost,
}) => {
  let proxyRoutes = [];

  if (routes) {
    // Support nested routes (i.e. { routes: { ... } }).
    const extractedRoutes = routes.routes || routes;
    proxyRoutes.push(...buildRoutes(extractedRoutes, target));
  }

  if (localApps) {
    proxyRoutes.push(
      ...buildLocalAppRoutes(localApps, defaultLocalAppHost, target)
    );
  }

  return proxyRoutes;
};

module.exports = { getProxyRoutes };
