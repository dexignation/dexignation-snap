import type { CaipChainId } from '@metamask/snaps-sdk';

export const API_BASE = 'https://www.dexignation.com/api/v1';

export const PROTOCOL_NAME = 'DEXignation';

export const RPC_METHOD_TEST_NAME_LOOKUP = 'test-name-lookup';

export const DEFAULT_TEST_CHAIN_ID: CaipChainId = 'eip155:137';

export const API_PATHS = {
  nameByDomain: (domain: string) => `/names/${encodeURIComponent(domain)}`,
  primaryByAddress: (address: string) =>
    `/addresses/${encodeURIComponent(address)}/primary`,
} as const;

const CHAIN_TO_SYMBOL_MAP = {
  'eip155:1': 'ETH',
  'eip155:10': 'OP',
  'eip155:56': 'BNB',
  'eip155:137': 'POL',
  'eip155:8453': 'BASE',
  'eip155:42161': 'ARB',
  'bip122:000000000019d6689c085ae165831e93': 'BTC',
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'SOL',
  'tron:728126428': 'TRX',
} as const satisfies Record<CaipChainId, string>;

export type SupportedChainId = keyof typeof CHAIN_TO_SYMBOL_MAP;
export type SupportedSymbol = (typeof CHAIN_TO_SYMBOL_MAP)[SupportedChainId];

export const CHAIN_TO_SYMBOL: Readonly<typeof CHAIN_TO_SYMBOL_MAP> =
  CHAIN_TO_SYMBOL_MAP;

export const getChainSymbol = (
  chainId: CaipChainId,
): SupportedSymbol | undefined =>
  (CHAIN_TO_SYMBOL_MAP as Readonly<Record<string, SupportedSymbol>>)[chainId];
