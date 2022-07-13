#!/usr/bin/env node
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

var index = require('./index');

index.cli.run().then(() => {
  process.exit(0);
}, error => {
  console.error(error);
  process.exit(1);
});
