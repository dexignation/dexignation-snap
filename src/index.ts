// SPDX-License-Identifier: MIT
//
// MetaMask Snap entry point. Exposes JSON-RPC methods that dApps can
// invoke via `window.ethereum.request({ method: "wallet_invokeSnap", ... })`.
//
// Methods exposed:
//   - "resolve"        — { name: string } → { address: 0x..., ... }
//   - "reverseResolve" — { address: 0x... } → { name: string | null }
//   - "info"           — () → { version, network, registry, resolver }
//
// MetaMask Snap 엔트리. dApp이 `wallet_invokeSnap`으로 호출할 수 있는
// JSON-RPC 메서드를 노출한다.

import type {
  OnRpcRequestHandler,
  OnHomePageHandler,
} from "@metamask/snaps-sdk";
import { panel, text, heading, divider } from "@metamask/snaps-sdk";

import {
  resolveName,
  reverseResolve,
  isValidDexName,
} from "./resolution.js";
import { snapInfo, DEFAULT_NETWORK } from "./config.js";

/**
 * Type guard for an object that has a string `name` field.
 *
 * `name`이 문자열인지 보장하는 type guard.
 */
function hasStringName(p: unknown): p is { name: string } {
  return (
    typeof p === "object" &&
    p !== null &&
    "name" in p &&
    typeof (p as { name: unknown }).name === "string"
  );
}

/**
 * Type guard for an object that has a 0x-prefixed `address` field.
 *
 * `address`가 0x 접두사가 있는 문자열인지 보장하는 type guard.
 */
function hasAddressField(p: unknown): p is { address: `0x${string}` } {
  return (
    typeof p === "object" &&
    p !== null &&
    "address" in p &&
    typeof (p as { address: unknown }).address === "string" &&
    ((p as { address: string }).address.startsWith("0x"))
  );
}

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case "resolve": {
      const params = request.params;
      if (!hasStringName(params)) {
        throw new Error("Missing or invalid `name` parameter.");
      }
      if (!isValidDexName(params.name)) {
        throw new Error(
          `Invalid .dex name. Names must be 3+ chars and end in .dex.`,
        );
      }
      return resolveName(params.name);
    }

    case "reverseResolve": {
      const params = request.params;
      if (!hasAddressField(params)) {
        throw new Error("Missing or invalid `address` parameter.");
      }
      const result = await reverseResolve(params.address);
      return { name: result };
    }

    case "info": {
      return snapInfo();
    }

    default:
      throw new Error(`Method not found: ${request.method}`);
  }
};

/**
 * Home page rendered when the user opens the Snap from MetaMask.
 *
 * 사용자가 MetaMask에서 Snap을 열면 보여지는 홈 페이지.
 */
export const onHomePage: OnHomePageHandler = async () => {
  const info = snapInfo();
  return {
    content: panel([
      heading("DEXignation Name Service"),
      text(
        `**Resolve .dex names** to chain-specific addresses, directly in MetaMask.`,
      ),
      text(`**.dex 이름**을 MetaMask에서 바로 해결합니다.`),
      divider(),
      text(`**Network**: ${DEFAULT_NETWORK.name} (chain id ${DEFAULT_NETWORK.id})`),
      text(`**Version**: ${info.version}`),
      divider(),
      text(`Visit [dexignation.com](https://dexignation.com) for more.`),
    ]),
  };
};
