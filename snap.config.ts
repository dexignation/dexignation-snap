// SPDX-License-Identifier: MIT
//
// MetaMask Snap CLI configuration.
// MetaMask Snap CLI 설정.

import type { SnapConfig } from "@metamask/snaps-cli";

const config: SnapConfig = {
  bundler: "webpack",
  input: "./src/index.ts",
  server: {
    port: 8080,
  },
  polyfills: {
    buffer: true,
  },
  stats: {
    builtIns: {
      ignore: ["events"],
    },
  },
};

export default config;
