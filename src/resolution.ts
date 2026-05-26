// SPDX-License-Identifier: MIT
//
// Name resolution logic for the Snap. Reads directly from the on-chain
// resolver via viem; no API server dependency.
//
// Snap의 이름 해결 로직. API 서버에 의존하지 않고 viem으로 온체인 리졸버에
// 직접 접근한다.

import {
  createPublicClient,
  http,
  getAddress,
  type Address,
} from "viem";
import { namehash } from "viem/ens";

import { DEFAULT_NETWORK, viemChainFor } from "./config.js";

const COIN_TYPE_DEFAULT = 1n << 31n;
const COIN_TYPES = {
  ethereum: 60n,
  polygon: COIN_TYPE_DEFAULT | 137n,
  bnbChain: COIN_TYPE_DEFAULT | 56n,
  base: COIN_TYPE_DEFAULT | 8453n,
  arbitrum: COIN_TYPE_DEFAULT | 42161n,
  optimism: COIN_TYPE_DEFAULT | 10n,
  anyEVM: COIN_TYPE_DEFAULT,
  bitcoin: 0n,
  solana: 501n,
} as const;

type CoinName = keyof typeof COIN_TYPES;

const registryAbi = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "resolver",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "isExpired",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ type: "bool" }],
  },
] as const;

const resolverAbi = [
  {
    type: "function",
    name: "addr",
    stateMutability: "view",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "coinType", type: "uint256" },
    ],
    outputs: [{ type: "bytes" }],
  },
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ type: "string" }],
  },
] as const;

const client = createPublicClient({
  chain: viemChainFor(DEFAULT_NETWORK),
  transport: http(DEFAULT_NETWORK.rpcUrl),
});

/**
 * Validate a `.dex` name. Returns `true` for syntactically valid names.
 *
 * `.dex` 이름 유효성 검증. 문법적으로 유효하면 `true`.
 */
export function isValidDexName(name: string): boolean {
  if (typeof name !== "string") return false;
  const lower = name.toLowerCase();
  if (!lower.endsWith(".dex")) return false;
  const label = lower.slice(0, -4);
  if (label.length < 3) return false;
  if (label.includes(".")) return false;
  if (label.startsWith("-") || label.endsWith("-")) return false;
  return true;
}

export interface ResolutionResult {
  name: string;
  node: `0x${string}`;
  owner: Address | null;
  expired: boolean;
  addresses: Partial<Record<CoinName, string>>;
}

export async function resolveName(name: string): Promise<ResolutionResult> {
  if (!DEFAULT_NETWORK.registryAddress || !DEFAULT_NETWORK.resolverAddress) {
    throw new Error(
      "Snap not yet configured for this network. Contract addresses missing.",
    );
  }

  const node = namehash(name);
  const registryAddr = getAddress(DEFAULT_NETWORK.registryAddress);
  const resolverAddr = getAddress(DEFAULT_NETWORK.resolverAddress);

  const [owner, expired] = await Promise.all([
    client.readContract({
      address: registryAddr,
      abi: registryAbi,
      functionName: "owner",
      args: [node],
    }),
    client.readContract({
      address: registryAddr,
      abi: registryAbi,
      functionName: "isExpired",
      args: [node],
    }),
  ]);

  if (owner === "0x0000000000000000000000000000000000000000") {
    return { name, node, owner: null, expired: false, addresses: {} };
  }
  if (expired) {
    return { name, node, owner: owner as Address, expired: true, addresses: {} };
  }

  const entries = Object.entries(COIN_TYPES) as Array<[CoinName, bigint]>;
  const reads = await Promise.allSettled(
    entries.map(([, coinType]) =>
      client.readContract({
        address: resolverAddr,
        abi: resolverAbi,
        functionName: "addr",
        args: [node, coinType],
      }),
    ),
  );

  const addresses: Partial<Record<CoinName, string>> = {};
  reads.forEach((read, idx) => {
    if (read.status !== "fulfilled") return;
    const raw = read.value as `0x${string}`;
    if (!raw || raw === "0x" || raw === "0x00") return;

    const [coinName, coinType] = entries[idx]!;
    const isEVM =
      coinType === COIN_TYPE_DEFAULT ||
      coinType === 60n ||
      (coinType & COIN_TYPE_DEFAULT) === COIN_TYPE_DEFAULT;
    if (isEVM && raw.length === 42) {
      try {
        addresses[coinName] = getAddress(raw);
      } catch {
        addresses[coinName] = raw;
      }
    } else {
      addresses[coinName] = raw;
    }
  });

  return {
    name,
    node,
    owner: owner as Address,
    expired: false,
    addresses,
  };
}

export async function reverseResolve(
  addr: Address,
): Promise<string | null> {
  if (!DEFAULT_NETWORK.resolverAddress) {
    throw new Error("Snap resolver address not configured.");
  }
  const lowerHex = addr.toLowerCase().slice(2);
  const reverseName = `${lowerHex}.addr.reverse`;
  const node = namehash(reverseName);

  try {
    const name = await client.readContract({
      address: getAddress(DEFAULT_NETWORK.resolverAddress),
      abi: resolverAbi,
      functionName: "name",
      args: [node],
    });
    return name && (name as string).length > 0 ? (name as string) : null;
  } catch {
    return null;
  }
}
