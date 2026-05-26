// SPDX-License-Identifier: MIT
//
// Snap configuration. Contract addresses and RPC endpoint are bundled
// at build time. To support multiple networks, switch on chain id at
// runtime — the Snap can query MetaMask for the active chain.
//
// Snap 설정. 컨트랙트 주소와 RPC 엔드포인트는 빌드 시점에 번들된다.
// 다중 네트워크 지원이 필요하면 런타임에 chain id로 분기 — Snap은
// MetaMask에서 활성 체인을 질의할 수 있다.

import { defineChain } from "viem";

export interface NetworkConfig {
  id: number;
  name: string;
  rpcUrl: string;
  registryAddress: `0x${string}` | "";
  resolverAddress: `0x${string}` | "";
}

const POLYGON_MAINNET: NetworkConfig = {
  id: 137,
  name: "Polygon Mainnet",
  rpcUrl: "https://polygon-rpc.com",
  // Fill in after the mainnet deployment of dexignation-contracts.
  // dexignation-contracts 메인넷 배포 후 채우세요.
  registryAddress: "",
  resolverAddress: "",
};

const POLYGON_AMOY: NetworkConfig = {
  id: 80002,
  name: "Polygon Amoy",
  rpcUrl: "https://rpc-amoy.polygon.technology",
  // Fill in after the Amoy deployment.
  registryAddress: "",
  resolverAddress: "",
};

export const DEFAULT_NETWORK: NetworkConfig = POLYGON_MAINNET;

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  137: POLYGON_MAINNET,
  80002: POLYGON_AMOY,
};

export const SNAP_VERSION = "0.1.0";

export function snapInfo() {
  return {
    version: SNAP_VERSION,
    network: DEFAULT_NETWORK,
    supportedNetworks: Object.values(SUPPORTED_NETWORKS),
  };
}

/**
 * Build a viem chain object from a NetworkConfig.
 * NetworkConfig로부터 viem chain 객체 생성.
 */
export function viemChainFor(net: NetworkConfig) {
  return defineChain({
    id: net.id,
    name: net.name,
    nativeCurrency: {
      name: "POL",
      symbol: "POL",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [net.rpcUrl] },
    },
  });
}
