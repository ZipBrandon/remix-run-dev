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
var virtualModules = require('../virtualModules.js');

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

/**
 * Creates a virtual module called `@remix-run/dev/server-build` that exports the
 * compiled server build for consumption in remix request handlers. This allows
 * for you to consume the build in a custom server entry that is also fed through
 * the compiler.
 */

function serverEntryModulePlugin(config) {
  let filter = virtualModules.serverBuildVirtualModule.filter;
  return {
    name: "server-entry-module",

    setup(build) {
      build.onResolve({
        filter
      }, ({
        path
      }) => {
        return {
          path,
          namespace: "server-entry-module"
        };
      });
      build.onLoad({
        filter
      }, async () => {
        return {
          resolveDir: config.appDirectory,
          loader: "js",
          contents: `
import * as entryServer from ${JSON.stringify(path__namespace.resolve(config.appDirectory, config.entryServerFile))};
${Object.keys(config.routes).map((key, index) => {
            let route = config.routes[key];
            return `import * as route${index} from ${JSON.stringify(path__namespace.resolve(config.appDirectory, route.file))};`;
          }).join("\n")}
  export { default as assets } from ${JSON.stringify(virtualModules.assetsManifestVirtualModule.id)};
  export const entry = { module: entryServer };
  export const routes = {
    ${Object.keys(config.routes).map((key, index) => {
            let route = config.routes[key];
            return `${JSON.stringify(key)}: {
      id: ${JSON.stringify(route.id)},
      parentId: ${JSON.stringify(route.parentId)},
      path: ${JSON.stringify(route.path)},
      index: ${JSON.stringify(route.index)},
      caseSensitive: ${JSON.stringify(route.caseSensitive)},
      module: route${index}
    }`;
          }).join(",\n  ")}
  };`
        };
      });
    }

  };
}

exports.serverEntryModulePlugin = serverEntryModulePlugin;
