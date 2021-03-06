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

var checkNoDifferentImportTypesCombined = require('./checkNoDifferentImportTypesCombined.js');
var createExpressionStatement = require('./createExpressionStatement.js');
var createVariableDeclarationIdentifier = require('./createVariableDeclarationIdentifier.js');
var createVariableDeclarationObjectPattern = require('./createVariableDeclarationObjectPattern.js');

const transform = (file, api, options) => {
  let j = api.jscodeshift;
  let root = j(file.source);
  let allESImportDeclarations = root.find(j.ImportDeclaration);

  if (allESImportDeclarations.length === 0) {
    // This transform doesn't need to run if there are no ES imports
    return null;
  } // https://github.com/facebook/jscodeshift/blob/main/recipes/retain-first-comment.md


  let getFirstNode = () => root.find(j.Program).get("body", 0).node;

  let oldFirstNode = getFirstNode();
  allESImportDeclarations.forEach(importDeclaration => {
    if (importDeclaration.node.importKind === "type") {
      return;
    }

    let {
      specifiers
    } = importDeclaration.node;

    if (!specifiers || specifiers.length === 0) {
      return j(importDeclaration).replaceWith(createExpressionStatement.createExpressionStatement(j, importDeclaration.node));
    }

    checkNoDifferentImportTypesCombined.checkNoDifferentImportTypesCombined(importDeclaration.node);

    if (["ImportDefaultSpecifier", "ImportNamespaceSpecifier"].includes(specifiers[0].type)) {
      return j(importDeclaration).replaceWith(createVariableDeclarationIdentifier.createVariableDeclarationIdentifier(j, importDeclaration.node));
    }

    return j(importDeclaration).replaceWith(createVariableDeclarationObjectPattern.createVariableDeclarationObjectPattern(j, importDeclaration.node));
  }); // If the first node has been modified or deleted, reattach the comments

  let newFirstNode = getFirstNode();

  if (newFirstNode !== oldFirstNode) {
    newFirstNode.comments = oldFirstNode.comments;
  }

  return root.toSource(options);
};

exports["default"] = transform;
