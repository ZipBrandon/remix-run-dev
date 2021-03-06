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

const createExpressionStatement = (j, {
  source
}) => {
  let callExpression = j.callExpression(j.identifier("require"), [source]);
  return j.expressionStatement(callExpression);
};

exports.createExpressionStatement = createExpressionStatement;
