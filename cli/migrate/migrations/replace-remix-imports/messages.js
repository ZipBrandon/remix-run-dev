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

var colors = require('../../../../colors.js');

const detected = message => colors.gray("🕵️  I detected " + message);
const because = message => colors.gray("   ...because " + message);

exports.because = because;
exports.detected = detected;
