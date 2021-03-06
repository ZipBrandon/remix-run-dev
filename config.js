/**
 * @remix-run/dev v1.6.4
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var fse = require('fs-extra');
var getPort = require('get-port');
var routes = require('./config/routes.js');
var routesConvention = require('./config/routesConvention.js');
var serverModes = require('./config/serverModes.js');
var virtualModules = require('./compiler/virtualModules.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespace(path);
var fse__namespace = /*#__PURE__*/_interopNamespace(fse);
var getPort__default = /*#__PURE__*/_interopDefaultLegacy(getPort);

/**
 * Returns a fully resolved config object from the remix.config.js in the given
 * root directory.
 */
async function readConfig(remixRoot, serverMode = serverModes.ServerMode.Production) {
  if (!remixRoot) {
    remixRoot = process.env.REMIX_ROOT || process.cwd();
  }

  if (!serverModes.isValidServerMode(serverMode)) {
    throw new Error(`Invalid server mode "${serverMode}"`);
  }

  let rootDirectory = path__namespace.resolve(remixRoot);
  let configFile = path__namespace.resolve(rootDirectory, "remix.config.js");
  let appConfig;

  try {
    appConfig = require(configFile);
  } catch (error) {
    throw new Error(`Error loading Remix config in ${configFile}\n${String(error)}`);
  }

  let customServerEntryPoint = appConfig.server;
  let serverBuildTarget = appConfig.serverBuildTarget;
  let serverModuleFormat = appConfig.serverModuleFormat || "cjs";
  let serverPlatform = appConfig.serverPlatform || "node";

  switch (appConfig.serverBuildTarget) {
    case "cloudflare-pages":
    case "cloudflare-workers":
    case "deno":
      serverModuleFormat = "esm";
      serverPlatform = "neutral";
      break;
  }

  let mdx = appConfig.mdx;
  let appDirectory = path__namespace.resolve(rootDirectory, appConfig.appDirectory || "app");
  let cacheDirectory = path__namespace.resolve(rootDirectory, appConfig.cacheDirectory || ".cache");
  let entryClientFile = findEntry(appDirectory, "entry.client");

  if (!entryClientFile) {
    throw new Error(`Missing "entry.client" file in ${appDirectory}`);
  }

  let entryServerFile = findEntry(appDirectory, "entry.server");

  if (!entryServerFile) {
    throw new Error(`Missing "entry.server" file in ${appDirectory}`);
  }

  let serverBuildPath = "build/index.js";

  switch (serverBuildTarget) {
    case "arc":
      serverBuildPath = "server/index.js";
      break;

    case "cloudflare-pages":
      serverBuildPath = "functions/[[path]].js";
      break;

    case "netlify":
      serverBuildPath = ".netlify/functions-internal/server.js";
      break;

    case "vercel":
      serverBuildPath = "api/index.js";
      break;
  }

  serverBuildPath = path__namespace.resolve(rootDirectory, serverBuildPath); // retain deprecated behavior for now

  if (appConfig.serverBuildDirectory) {
    serverBuildPath = path__namespace.resolve(rootDirectory, path__namespace.join(appConfig.serverBuildDirectory, "index.js"));
  }

  if (appConfig.serverBuildPath) {
    serverBuildPath = path__namespace.resolve(rootDirectory, appConfig.serverBuildPath);
  }

  let assetsBuildDirectory = path__namespace.resolve(rootDirectory, appConfig.assetsBuildDirectory || appConfig.browserBuildDirectory || path__namespace.join("public", "build"));
  let devServerPort = Number(process.env.REMIX_DEV_SERVER_WS_PORT) || (await getPort__default["default"]({
    port: Number(appConfig.devServerPort) || 8002
  })); // set env variable so un-bundled servers can use it

  process.env.REMIX_DEV_SERVER_WS_PORT = `${devServerPort}`;
  let devServerBroadcastDelay = appConfig.devServerBroadcastDelay || 0;
  let defaultPublicPath = "/build/";

  switch (serverBuildTarget) {
    case "arc":
      defaultPublicPath = "/_static/build/";
      break;
  }

  let publicPath = addTrailingSlash(appConfig.publicPath || defaultPublicPath);
  let rootRouteFile = findEntry(appDirectory, "root");

  if (!rootRouteFile) {
    throw new Error(`Missing "root" route file in ${appDirectory}`);
  }

  let routes$1 = {
    root: {
      path: "",
      id: "root",
      file: rootRouteFile
    }
  };

  if (fse__namespace.existsSync(path__namespace.resolve(appDirectory, "routes"))) {
    let conventionalRoutes = routesConvention.defineConventionalRoutes(appDirectory, appConfig.ignoredRouteFiles);

    for (let key of Object.keys(conventionalRoutes)) {
      let route = conventionalRoutes[key];
      routes$1[route.id] = { ...route,
        parentId: route.parentId || "root"
      };
    }
  }

  if (appConfig.routes) {
    let manualRoutes = await appConfig.routes(routes.defineRoutes);

    for (let key of Object.keys(manualRoutes)) {
      let route = manualRoutes[key];
      routes$1[route.id] = { ...route,
        parentId: route.parentId || "root"
      };
    }
  }

  let watchPaths = [];

  if (typeof appConfig.watchPaths === "function") {
    let directories = await appConfig.watchPaths();
    watchPaths = watchPaths.concat(Array.isArray(directories) ? directories : [directories]);
  } else if (appConfig.watchPaths) {
    watchPaths = watchPaths.concat(Array.isArray(appConfig.watchPaths) ? appConfig.watchPaths : [appConfig.watchPaths]);
  }

  let rebuildFinishedCallbacks = appConfig.rebuildFinishedCallbacks || [];
  let serverBuildTargetEntryModule = `export * from ${JSON.stringify(virtualModules.serverBuildVirtualModule.id)};`;
  let serverDependenciesToBundle = appConfig.serverDependenciesToBundle || [];
  return {
    appDirectory,
    cacheDirectory,
    entryClientFile,
    entryServerFile,
    devServerPort,
    devServerBroadcastDelay,
    assetsBuildDirectory,
    publicPath,
    rootDirectory,
    routes: routes$1,
    serverBuildPath,
    serverMode,
    serverModuleFormat,
    serverPlatform,
    serverBuildTarget,
    serverBuildTargetEntryModule,
    serverEntryPoint: customServerEntryPoint,
    serverDependenciesToBundle,
    mdx,
    watchPaths,
    rebuildFinishedCallbacks
  };
}

function addTrailingSlash(path) {
  return path.endsWith("/") ? path : path + "/";
}

const entryExts = [".js", ".jsx", ".ts", ".tsx"];

function findEntry(dir, basename) {
  for (let ext of entryExts) {
    let file = path__namespace.resolve(dir, basename + ext);
    if (fse__namespace.existsSync(file)) return path__namespace.relative(dir, file);
  }

  return undefined;
}

exports.readConfig = readConfig;
