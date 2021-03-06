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
var glob = require('fast-glob');
var babel = require('@babel/core');
var babelPluginSyntaxJSX = require('@babel/plugin-syntax-jsx');
var babelPresetTypeScript = require('@babel/preset-typescript');
var prettier = require('prettier');

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

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var glob__default = /*#__PURE__*/_interopDefaultLegacy(glob);
var babel__namespace = /*#__PURE__*/_interopNamespace(babel);
var babelPluginSyntaxJSX__default = /*#__PURE__*/_interopDefaultLegacy(babelPluginSyntaxJSX);
var babelPresetTypeScript__default = /*#__PURE__*/_interopDefaultLegacy(babelPresetTypeScript);
var prettier__default = /*#__PURE__*/_interopDefaultLegacy(prettier);

function convertToJavaScript(filename, source, projectDir) {
  let result = babel__namespace.transformSync(source, {
    filename,
    presets: [[babelPresetTypeScript__default["default"], {
      jsx: "preserve"
    }]],
    plugins: [babelPluginSyntaxJSX__default["default"]],
    compact: false,
    retainLines: true,
    cwd: projectDir
  });

  if (!result || !result.code) {
    throw new Error("Could not parse typescript");
  }
  /*
    Babel's `compact` and `retainLines` options are both bad at formatting code.
    Use Prettier for nicer formatting.
  */


  return prettier__default["default"].format(result.code, {
    parser: "babel"
  });
}

async function convertTemplateToJavaScript(projectDir) {
  // 1. Convert all .ts files in the template to .js
  let entries = glob__default["default"].sync("**/*.+(ts|tsx)", {
    cwd: projectDir,
    absolute: true,
    ignore: ["**/node_modules/**"]
  });

  for (let entry of entries) {
    if (entry.endsWith(".d.ts")) {
      fse__default["default"].removeSync(entry);
      continue;
    }

    let contents = fse__default["default"].readFileSync(entry, "utf8");
    let filename = path__default["default"].basename(entry);
    let javascript = convertToJavaScript(filename, contents, projectDir);
    fse__default["default"].writeFileSync(entry, javascript, "utf8");

    if (entry.endsWith(".tsx")) {
      fse__default["default"].renameSync(entry, entry.replace(/\.tsx?$/, ".jsx"));
    } else {
      fse__default["default"].renameSync(entry, entry.replace(/\.ts?$/, ".js"));
    }
  } // 2. Rename the tsconfig.json to jsconfig.json


  if (fse__default["default"].existsSync(path__default["default"].join(projectDir, "tsconfig.json"))) {
    fse__default["default"].renameSync(path__default["default"].join(projectDir, "tsconfig.json"), path__default["default"].join(projectDir, "jsconfig.json"));
  } // 3. Remove @types/* and typescript from package.json


  let packageJsonPath = path__default["default"].join(projectDir, "package.json");

  if (!fse__default["default"].existsSync(packageJsonPath)) {
    throw new Error("Could not find package.json");
  }

  let pkg = JSON.parse(fse__default["default"].readFileSync(packageJsonPath, "utf8"));
  let devDeps = pkg.devDependencies || {};
  devDeps = Object.fromEntries(Object.entries(devDeps).filter(([name]) => {
    return !name.startsWith("@types/") && name !== "typescript";
  }));
  pkg.devDependencies = devDeps;
  fse__default["default"].writeJSONSync(packageJsonPath, pkg, {
    spaces: 2
  });
}

exports.convertTemplateToJavaScript = convertTemplateToJavaScript;
