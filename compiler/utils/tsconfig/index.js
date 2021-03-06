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

var tsConfigPaths = require('tsconfig-paths');
var writeConfigDefaults = require('./write-config-defaults.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var tsConfigPaths__default = /*#__PURE__*/_interopDefaultLegacy(tsConfigPaths);

function createMatchPath() {
  let configLoaderResult = tsConfigPaths__default["default"].loadConfig();

  if (configLoaderResult.resultType === "failed") {
    if (configLoaderResult.message === "Missing baseUrl in compilerOptions") {
      throw new Error(`🚨 Oops! No baseUrl found, please set compilerOptions.baseUrl in your tsconfig or jsconfig`);
    }

    return undefined;
  }

  writeConfigDefaults.writeConfigDefaults(configLoaderResult.configFileAbsolutePath);
  return tsConfigPaths__default["default"].createMatchPath(configLoaderResult.absoluteBaseUrl, configLoaderResult.paths, configLoaderResult.mainFields, configLoaderResult.addMatchAll);
}

exports.createMatchPath = createMatchPath;
