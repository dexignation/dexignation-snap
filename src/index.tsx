import type {
  CaipChainId,
  OnNameLookupHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import { MethodNotFoundError } from '@metamask/snaps-sdk';

import {
  API_BASE,
  API_PATHS,
  DEFAULT_TEST_CHAIN_ID,
  PROTOCOL_NAME,
  RPC_METHOD_TEST_NAME_LOOKUP,
  getChainSymbol,
} from './constants';

type CoinAddressEntry = {
  coinType: number;
  symbol: string;
  address: string | null;
};

type NameRecord = {
  name: string;
  exists: boolean;
  owner: string | null;
  addresses: CoinAddressEntry[];
};

type PrimaryDomain = {
  address: string;
  name: string | null;
};

export const onNameLookup: OnNameLookupHandler = async ({
  chainId,
  domain,
  address,
}) => {
  const symbol = getChainSymbol(chainId);
  if (!symbol) {
    return null;
  }

  if (domain) {
    try {
      const res = await fetch(`${API_BASE}${API_PATHS.nameByDomain(domain)}`);
      if (!res.ok) {
        return null;
      }
      const json = (await res.json()) as { data?: NameRecord };
      const resolvedAddr = json.data?.addresses?.find(
        (entry) => entry.symbol === symbol,
      )?.address;
      if (!resolvedAddr) {
        return null;
      }
      return {
        resolvedAddresses: [
          {
            resolvedAddress: resolvedAddr,
            protocol: PROTOCOL_NAME,
            domainName: domain,
          },
        ],
      };
    } catch {
      return null;
    }
  }

  if (address) {
    try {
      const res = await fetch(
        `${API_BASE}${API_PATHS.primaryByAddress(address)}`,
      );
      if (!res.ok) {
        return null;
      }
      const json = (await res.json()) as { data?: PrimaryDomain };
      if (!json.data?.name) {
        return null;
      }
      return {
        resolvedDomains: [
          {
            resolvedDomain: json.data.name,
            protocol: PROTOCOL_NAME,
          },
        ],
      };
    } catch {
      return null;
    }
  }

  return null;
};

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  if (request.method === RPC_METHOD_TEST_NAME_LOOKUP) {
    const params = (request.params ?? {}) as {
      chainId?: string;
      domain?: string;
      address?: string;
    };

    const chainId = (params.chainId ?? DEFAULT_TEST_CHAIN_ID) as CaipChainId;

    if (params.domain) {
      return onNameLookup({ chainId, domain: params.domain });
    }

    if (params.address) {
      return onNameLookup({ chainId, address: params.address });
    }

    return null;
  }

  throw new MethodNotFoundError({ method: request.method });
};
